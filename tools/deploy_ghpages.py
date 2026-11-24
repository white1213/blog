"""Python 版本地部署:public/ -> gh-pages 分支 -> 触发 Pages 构建。

用途:GitHub Actions 队列拥堵或 node 的 fetch 通道抖动时,作为 tools/deploy-local.js 的备用。
用法:先运行 hugo 构建(或本脚本会自己构建),然后:
    python -I tools/deploy_ghpages.py
凭据从 git credential 动态读取,不含明文 token。
"""
import base64
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.github.com/repos/white1213/blog"
PUBLIC = ROOT / "public"
HUGO = "D:/ai/bin/hugo.exe"


def token():
    out = subprocess.run(["git", "credential", "fill"], input="protocol=https\nhost=github.com\n\n",
                         capture_output=True, text=True, cwd=str(ROOT)).stdout
    pwd = [l.split("=", 1)[1] for l in out.splitlines() if l.startswith("password=")]
    if not pwd:
        raise SystemExit("git credential 中找不到 token")
    return pwd[0]


TOKEN = token()


def req(path, payload=None, method="GET", tries=4):
    r = urllib.request.Request(API + path,
        headers={"Authorization": "Bearer " + TOKEN, "Accept": "application/vnd.github+json",
                 "User-Agent": "deploy-ghpages"},
        data=json.dumps(payload).encode() if payload is not None else None, method=method)
    for i in range(1, tries + 1):
        try:
            with urllib.request.urlopen(r, timeout=40) as resp:
                body = resp.read()
                return json.loads(body) if body else {}
        except Exception as exc:
            print("  请求失败({}/{}): {}".format(i, tries, exc))
            if i == tries:
                raise
            time.sleep(i * 5)


def blob_sha(data):
    return hashlib.sha1(b"blob %d\x00" % len(data) + data).hexdigest()


def sync_data_from_remote():
    """用远端 main 的数据文件覆盖本地，再做构建。

    本地仓库经常落后（git 走代理不通时只能靠 API），
    若直接用本地旧数据构建，会把线上数据回滚——2026-11-10 实际发生过。
    这里只同步数据/封面（不碰模板代码），保证部署内容的数据是最新的。
    """
    refs = req("/git/refs/heads/main")
    ref = refs[0] if isinstance(refs, list) else refs
    head = req("/git/commits/" + ref["object"]["sha"])
    tree = req("/git/trees/" + head["tree"]["sha"] + "?recursive=1")

    synced = 0
    for node in tree.get("tree", []):
        if node["type"] != "blob":
            continue
        path = node["path"]
        is_data = path.startswith("assets/data/")
        is_new_cover = path.startswith("static/") and path.endswith((".jpg", ".png", ".webp"))
        if not is_data and not (is_new_cover and not (ROOT / path).exists()):
            continue
        target = ROOT / path
        target.parent.mkdir(parents=True, exist_ok=True)
        b = req("/git/blobs/" + node["sha"])
        target.write_bytes(base64.b64decode(b["content"]))
        synced += 1
    print("已从远端同步 {} 个数据/封面文件".format(synced))


def main():
    print("== 1/4 同步远端数据 ==")
    sync_data_from_remote()

    print("== 2/4 hugo 构建 ==")
    subprocess.run([HUGO, "--minify", "--gc"], cwd=str(ROOT), check=True, capture_output=True, timeout=180)
    if not PUBLIC.exists():
        raise SystemExit("public/ 不存在,构建失败")

    files = []
    for dirpath, _, names in os.walk(PUBLIC):
        for n in names:
            full = Path(dirpath) / n
            files.append((full.relative_to(PUBLIC).as_posix(), full))
    print("产物文件:", len(files))

    print("== 3/4 推送 gh-pages(增量) ==")
    grefs = req("/git/refs/heads/gh-pages")
    gobj = grefs[0] if isinstance(grefs, list) else grefs
    gp_commit = req("/git/commits/" + gobj["object"]["sha"])
    old_tree = req("/git/trees/" + gp_commit["tree"]["sha"] + "?recursive=1")
    old_sha = {t["path"]: t["sha"] for t in old_tree.get("tree", []) if t["type"] == "blob"}

    entries = []
    uploaded = 0
    for rel, full in files:
        data = full.read_bytes()
        sha = blob_sha(data)
        if old_sha.get(rel) != sha:
            b = req("/git/blobs", {"content": base64.b64encode(data).decode(), "encoding": "base64"}, "POST")
            sha = b["sha"]
            uploaded += 1
        entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": sha})
    print("上传新 blob:", uploaded)

    tree = req("/git/trees", {"tree": entries}, "POST")
    commit = req("/git/commits", {
        "message": "deploy: " + time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) + " (local)",
        "tree": tree["sha"], "parents": [],
    }, "POST")
    req("/git/refs/heads/gh-pages", {"sha": commit["sha"], "force": True}, "PATCH")
    print("✅ gh-pages:", commit["sha"][:7])

    print("== 4/4 触发 Pages 构建 ==")
    b = req("/pages/builds", None, "POST")
    print("Pages 构建:", b.get("status"))
    print("🎉 完成,约 1-2 分钟后线上生效(CDN 缓存约 10 分钟)")


if __name__ == "__main__":
    main()
