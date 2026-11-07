// 本地一键部署：拉齐 main -> hugo 构建 -> 推 gh-pages 分支 -> 触发 Pages 构建
// 用途：GitHub Actions runner 队列拥堵时，双击 tools\deploy-local.bat 即可 2 分钟上线
// 凭据从本机 git credential 动态获取，不含明文 token
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HUGO = 'D:/ai/bin/hugo.exe'; // 本机 hugo 位置

const step = m => console.log('\n== ' + m);
const run = (cmd, opts = {}) => execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
const wait = ms => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }; // 同步 sleep，Windows 可用

const toPosix = p => p.split(path.sep).join('/');
function walk(d, base, out) {
  for (const n of fs.readdirSync(d)) {
    const full = path.join(d, n);
    const rel = base ? base + '/' + n : n;
    if (fs.statSync(full).isDirectory()) walk(full, rel, out);
    else out.push({ rel: toPosix(rel), full });
  }
}

function getToken() {
  const out = execSync('git credential fill', {
    cwd: ROOT,
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
  });
  const m = out.match(/^password=(.*)$/m);
  if (!m) throw new Error('git credential 中找不到 token');
  return m[1];
}

const O = 'white1213', R = 'blog';
const api = p => 'https://api.github.com/repos/' + O + '/' + R + p;
async function req(p, o = {}, token) {
  const H = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'User-Agent': 'deploy-local' };
  const r = await fetch(api(p), { ...o, headers: { ...H, ...(o.headers || {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error(p + ' ' + r.status + ' ' + t.slice(0, 200));
  return t ? JSON.parse(t) : {};
}

(async () => {
  step('1/4 拉齐远端 main（尽力而为，失败不阻塞部署）');
  let pulled = false;
  for (let i = 1; i <= 4 && !pulled; i++) {
    try { run('git pull --rebase origin main'); pulled = true; }
    catch (e) {
      console.log('pull 失败（第 ' + i + ' 次）: ' + e.message.split('\n')[0]);
      if (i < 4) wait(20000);
    }
  }
  if (!pulled) {
    const localHead = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
    const token0 = getToken();
    const remote = await req('/commits/main', {}, token0).catch(() => null);
    if (remote && remote.sha === localHead) {
      console.log('本地已与远端 main 一致，继续部署');
    } else {
      console.log('⚠️ 远端 main 有未拉取的新提交，本次部署的是本地内容（可能缺最新数据）。稍后可重跑一次。');
    }
  }

  step('2/4 hugo 构建');
  run('"' + HUGO + '" --minify --gc');

  const files = [];
  walk(path.join(ROOT, 'public'), '', files);
  console.log('产物文件:', files.length);

  step('3/4 推送 gh-pages 分支');
  const token = getToken();
  const tree = [];
  for (const f of files) {
    const b = await req('/git/blobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: fs.readFileSync(f.full).toString('base64'), encoding: 'base64' }),
    }, token);
    tree.push({ path: f.rel, mode: '100644', type: 'blob', sha: b.sha });
  }
  const t = await req('/git/trees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tree }) }, token);
  const c = await req('/git/commits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'deploy: ' + new Date().toISOString() + ' (local)', tree: t.sha, parents: [] }),
  }, token);
  await req('/git/refs/heads/gh-pages', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: c.sha, force: true }),
  }, token);
  console.log('✅ gh-pages:', c.sha.slice(0, 10));

  step('4/4 触发 Pages 构建');
  const b2 = await req('/pages/builds', { method: 'POST' }, token);
  console.log('Pages 构建:', b2.status);

  console.log('\n🎉 完成，约 1-2 分钟后线上生效（CDN 缓存约 10 分钟，硬刷新 Ctrl+Shift+R 可见）');
  console.log('提示：如果本地 main 还有未推送的提交，记得 git push origin main 保持两端一致');
})().catch(e => { console.error('\n❌ FAIL:', e.message); process.exit(1); });
