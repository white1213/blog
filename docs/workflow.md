# 博客工作流

本文说明这个博客是怎么运转的：内容放在哪、怎么发布、哪些是自动的、坏了怎么查。

- 线上地址：<https://white1213.github.io/blog/>
- GitHub 仓库：<https://github.com/white1213/blog>
- 本地目录：`my-jingzhe/`（仓库根目录）
- 技术栈：Hugo Extended + 惊蛰主题 + GitHub Actions + GitHub Pages

## 快速入口

| 用途 | 地址 |
| --- | --- |
| 博客首页 | <https://white1213.github.io/blog/> |
| **网页写作** | <https://white1213.github.io/blog/write/> |
| 仓库 | <https://github.com/white1213/blog> |
| 部署状态 | <https://github.com/white1213/blog/actions> |

> **写作页怎么进**：建议存书签或加到手机主屏。
> - 电脑（Edge）：打开写作页 → `Ctrl + D` → 存到「收藏夹栏」；也可 `…` → 应用 → 安装为应用。
> - iPhone：Safari 打开 → 分享 → 添加到主屏幕。
> - Android：Chrome 打开 → 菜单 → 添加到主屏幕。
> - 首次使用需粘贴 GitHub Token（只存在本机浏览器，手机与电脑各自存一次）。

---

## 一、总览

```
你写 Markdown / 改数据（本地编辑器或 GitHub 网页）
        │
        ▼
   git push 到 main
        │
        ▼
┌──────────────────────────────┐
│ GitHub Actions（deploy.yml） │
│  Hugo 严格构建 → 上传产物     │
└──────────────────────────────┘
        │
        ▼
GitHub Pages  →  white1213.github.io/blog/
```

没有服务器、没有数据库。整个站点由仓库里的文件决定，任何人拿到仓库都能完整重建。

---

## 二、四条工作流

### 1. deploy.yml —— 部署

| 项目 | 说明 |
| --- | --- |
| 触发 | push 到 `main`（但纯 `data/exercise/activities.json` 的提交会跳过）；也可手动 |
| 步骤 | checkout → 安装 Hugo Extended（latest）→ `hugo --minify --panicOnWarning` → 上传 Pages 产物 → 发布 |
| 产出 | 站点上线 |

构建命令带 `--panicOnWarning`，任何模板警告都会让构建失败——宁可不上线，也不发布有问题的页面。

### 2. douban-sync.yml —— 豆瓣观影同步

| 项目 | 说明 |
| --- | --- |
| 触发 | 每天北京时间 **04:23**（UTC cron `23 20 * * *`）；也可手动 |
| 前置 | 仓库变量 `DOUBAN_ID`（Settings → Variables） |
| 步骤 | checkout → 校验 DOUBAN_ID → `python sync_movies.py` → 有变化才提交 → 调用 API 触发 deploy |
| 提交内容 | `assets/data/movies.json`、`static/movies-covers/*` |
| 产出 | 观影墙自动更新（含海报） |

`sync_movies.py` 会顺便抓取并下载每部电影的海报到 `static/movies-covers/`，避免豆瓣图床外链失效。

### 3. exercise-process.yml —— 运动数据处理

| 项目 | 说明 |
| --- | --- |
| 触发 | `data/exercise/activities.json` 有变化；也可手动 |
| 步骤 | checkout → Python → 安装 requests → 跑 4 个契约测试文件（共 29 个测试）→ `python process_activities.py` → 有变化才提交 → 触发 deploy |
| 提交内容 | `assets/data/exercise/activities.json`、`assets/data/exercise/monthly-insights.json` |
| 产出 | 运动页更新（趣味标题、月度统计、月报） |

测试不过就不处理，避免坏数据上线。

### 4. playlist-sync.yml —— 歌单同步

| 项目 | 说明 |
| --- | --- |
| 触发 | 每天北京时间 **04:37**；也可手动（可填歌单链接） |
| 步骤 | checkout → Python → `python -I sync_playlists.py` → 有变化才提交 → 触发 deploy |
| 提交内容 | `assets/data/playlists.json`、`static/playlist-covers/*` |
| 产出 | 已导入歌单里的新歌自动出现 |

不带参数运行时，脚本会读取 `assets/data/playlists.json` 里已有的歌单 ID 全部刷新一遍。手动运行时可以填一个歌单链接来添加新歌单。

---

## 三、关键设计

### 为什么不需要 PAT

GitHub 默认的 `GITHUB_TOKEN` 推送后**不会**触发其他工作流（防止死循环）。所以豆瓣/运动工作流提交数据后，会直接调用 GitHub API 的 `workflow_dispatch` 主动「点燃」部署：

```
提交数据 → POST /actions/workflows/deploy.yml/dispatches
```

这样既不用维护 Personal Access Token，也不会形成循环。

### 顺序保护

`deploy.yml` 对 `data/exercise/activities.json` 设置了 `paths-ignore`：

- 原始运动数据提交时**不**直接部署
- 等处理产物（`assets/data/exercise/*.json`）提交后才构建

保证线上永远是「已处理」的数据，而不是裸的原始事实。

### 失败保护

- 豆瓣抓取失败：保留旧 `movies.json`，不覆盖
- 运动测试失败：不进入处理步骤
- Hugo 构建有警告：直接失败，不发布

### 并发锁

每个工作流都有 `concurrency` 组，同一时间只跑一个，避免两次运行互相覆盖提交。

---

## 四、目录结构

```
my-jingzhe/
├── content/
│   ├── _index.md              首页
│   ├── posts/                 长篇随笔（Markdown）
│   ├── laodao/年/月/          短动态（唠叨）
│   └── pages/                 固定页：观影.md / 锻炼.md / 音乐.md
├── assets/
│   ├── data/
│   │   ├── movies.json        观影数据（自动同步，可手改）
│   │   ├── playlists.json     歌单数据（脚本导入）
│   │   └── exercise/
│   │       ├── activities.json        运动处理产物（勿手改）
│   │       ├── monthly-insights.json  月报（勿手改）
│   │       └── landmark-routes.json   换算/轨迹库（可扩写）
│   └── css / js               主题样式与脚本
├── data/
│   ├── exercise/activities.json   运动原始事实（这里才是手改入口）
│   └── jingzhe/                   运动契约、功能注册表
├── static/
│   ├── movies-covers/         海报（自动下载）
│   ├── playlist-covers/       歌单封面（自动下载）
│   └── manifest.webmanifest   PWA 清单
├── themes/jingzhe_v3/          主题 + 本站定制
├── sync_movies.py              豆瓣观影同步
├── sync_playlists.py           QQ 音乐歌单导入
├── process_activities.py       运动处理入口
├── monthly_coach.py            月报入口
├── tests/                      运动契约测试
└── .github/workflows/          四条工作流
```

---

## 五、日常操作

### 写文章

**方式一：网页写作（推荐日常）**

打开 <https://white1213.github.io/blog/write/>：

1. 首次进入粘贴 GitHub Token（`github_pat_...`，只存在本机浏览器）
2. 选「写随笔」或「发唠叨」
3. 写内容，右侧实时预览
4. 点「发布」→ 自动提交到仓库 → 1–2 分钟上线

**删除文章**：写作页切到「管理」页签，会列出所有随笔和唠叨，点每篇右侧的「删除」并确认即可（删除后不可恢复，但 Git 历史里还能找回）。

写作页直接调用 GitHub API，不经过任何第三方服务器。Token 需要 `white1213/blog` 仓库的 **Contents: Read and write** 权限；失效了去 GitHub 重新生成即可。

**方式二：手动写 Markdown**

1. 在 `content/posts/` 新建 `xxx.md`
2. 开头写 front matter：

```yaml
---
title: '文章标题'
date: 2026-11-05T20:00:00+08:00
description: '一句话摘要'
tags: ['随笔']
---
```

3. 正文用 Markdown
4. push 即上线

> **注意**：`date` 不要写未来时间（尤其是北京凌晨写「今天」）。Hugo 把无时区的日期按 UTC 零点算，可能被判定为未来内容而**静默不渲染**。保险起见写昨天或明确带 `+08:00`。

### 发唠叨

在 `content/laodao/年/月/` 下新建 md，只需要 `date`：

```yaml
---
date: 2026-11-05T20:00:00+08:00
---
今天跑了 3 公里。
```

### 看电影

**什么都不用做。** 每天 04:23 自动同步豆瓣观影记录并部署。

### 加跑步数据

**方式一：写作页（推荐）**

打开 <https://white1213.github.io/blog/write/> → 切到「**记运动**」页签 → 填类型、开始时间、距离、时长（可选卡路里/心率）→ 点「记一笔」。1–2 分钟后运动页更新。

**方式二：直接改文件**

1. 编辑 `data/exercise/activities.json`（格式见下节）
2. push —— 工作流会自动跑测试、处理、部署

### 加歌单

- **新歌自动出现**：已导入的歌单每天 04:37 自动刷新，歌单里新增的歌会自动同步。
- **添加新歌单**：GitHub 仓库 → Actions → **Playlist Sync** → Run workflow → 在 `playlist_url` 填歌单链接（也可以本地跑 `python -I sync_playlists.py "链接"` 后 push）。

---

## 六、数据格式

### 运动原始事实（`data/exercise/activities.json`）

遵循 `exercise-sync-store-v1`：

```json
{
  "schema_version": 1,
  "sources": {
    "keep": [
      {
        "external_id": "keep-20261102221607",
        "type": "Run",
        "started_at": "2026-11-02T22:16:07+08:00",
        "duration_seconds": 901,
        "distance_km": 3.0,
        "calories_kcal": 179,
        "is_indoor": false,
        "route_status": "unavailable"
      }
    ]
  }
}
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `external_id` | ✅ | 唯一 ID，建议 `keep-年月日时分秒` |
| `type` | ✅ | `Run` / `TrailRun` / `Treadmill` / `Ride` / `Walk` / `Hike` / `Swim` 等 |
| `started_at` | ✅ | ISO 时间，**必须带时区** |
| `duration_seconds` | ✅ | 整数秒 |
| `distance_km` | ✅ | 公里 |
| `is_indoor` | ✅ | 室内为 `true` |
| `route_status` | ✅ | 有真实轨迹用 `available` + `summary_polyline`；没有就用 `unavailable` |
| `average_heartrate_bpm` | ❌ | 平均心率 |
| `calories_kcal` | ❌ | 卡路里 |
| `summary_polyline` | ❌ | Google 编码折线（只有 `available` 时才画地图） |

### 歌单（`assets/data/playlists.json`）

由 `sync_playlists.py` 生成，结构：

```json
[
  {
    "id": "9061797457",
    "name": "本人用",
    "cover": "playlist-covers/9061797457.jpg",
    "creator": "归心.",
    "song_count": 513,
    "source_url": "https://y.qq.com/n/ryqq/playlist/9061797457",
    "songs": [
      {
        "name": "我还想她",
        "singers": "林俊杰",
        "album": "JJ陆",
        "interval": 247,
        "songmid": "002g6zv02X7SNi",
        "cover": "https://y.gtimg.cn/music/photo_new/T002R300x300M000002g6zv02X7SNi.jpg"
      }
    ]
  }
]
```

---

## 七、本地预览

```bash
cd my-jingzhe
hugo server
# 打开 http://localhost:1313/blog/
```

改文件会自动刷新。确认没问题再 push。

生产构建自检（和 CI 一致）：

```bash
hugo --minify --panicOnWarning
```

---

## 八、手动触发

GitHub 仓库 → **Actions** → 左侧选工作流 → 右上 **Run workflow** → 选 `main`。

也可以命令行（需要已配置凭据）：

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/white1213/blog/actions/workflows/deploy.yml/dispatches \
  -d '{"ref":"main"}'
```

---

## 九、排障手册

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 改完页面没变化 | GitHub Pages CDN 缓存约 10 分钟 | `Ctrl + Shift + R` 硬刷新，或等几分钟 |
| 新页面不显示 | front matter `date` 是未来时间 | 改成过去日期，或写完整 `+08:00` 时区 |
| 运动页数字不对 | 改错了「处理产物」 | 只改 `data/exercise/activities.json`，产物由脚本生成 |
| 豆瓣同步失败 | 豆瓣接口限流/风控 | 稍后手动重跑；旧数据不会被覆盖 |
| 海报不显示 | 图床需要 Referer | 海报已自托管；若新增失败检查 `sync_movies.py` 的 Referer |
| 时长显示成小数 | Hugo `div` 返回浮点 | 模板里用 `int (div ...)` 转换 |
| 中文输出乱码（本地） | Windows 控制台 GBK | 脚本已 `sys.stdout.reconfigure(encoding='utf-8')` |
| Keep FIT 没有轨迹 | Keep 导出的是精简 FIT，无 GPS 点 | 需要轨迹图或 GPX，见下 |

### 关于跑步地图

Keep 导出的 `.fit` 文件只含 `file_id / sport / session / activity`，**没有 `record`（GPS 采样）**，所以无法绘制真实地图。要显示路线需要：

1. Keep 导出的「运动轨迹」图片链接（`static1.keepcdn.com`），或
2. 带真实坐标的 GPX 文件

有坐标后，把 `route_status` 改成 `available`、填入 `summary_polyline`，并在 `config/_default/params.toml` 配置 Mapbox token 即可显示交互地图。

---

## 十、改动边界

| 文件 | 能不能手改 |
| --- | --- |
| `content/**` | ✅ 随便改 |
| `data/exercise/activities.json` | ✅ 手改运动数据 |
| `assets/data/movies.json` / `playlists.json` | ✅ 可改，但下次同步会覆盖对应来源 |
| `assets/data/exercise/*.json` | ❌ 处理产物，改原始数据后重新生成 |
| `themes/jingzhe_v3/**` | ⚠️ 可以改，但升级主题时注意合并 |
| `.github/workflows/**` | ⚠️ 改之前想清楚触发路径 |

---

<sub>最后更新：2026-11-04</sub>
