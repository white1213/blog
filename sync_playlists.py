"""从 QQ 音乐导入歌单到惊蛰博客。

用法:
    python sync_playlists.py <歌单链接或ID> [更多链接或ID ...]

支持粘贴的链接形式:
    https://y.qq.com/n/ryqq/playlist/8661471028
    https://i.y.qq.com/n2/m/share/details/taoge.html?id=8661471028&...
    https://c6.y.qq.com/base/fcgi-bin/u?__=xxxx (短链,需先打开取 id)
    直接给纯数字 ID 也可以

数据写入 assets/data/playlists.json,封面下载到 static/playlist-covers/。
重复导入同一歌单会更新内容而不是重复添加。
"""
import json
import random
import re
import sys
import time
import urllib.request
from pathlib import Path

# Windows 控制台默认 GBK,提前切到 UTF-8,避免中文/符号输出报错。
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

API = (
    "https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg"
    "?type=1&json=1&utf8=1&disstid={}&format=json&song_begin=0&song_num=1000"
)
DATA_FILE = Path("assets/data/playlists.json")
COVERS_DIR = Path("static/playlist-covers")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://y.qq.com/",
}


def parse_playlist_id(text):
    text = text.strip()
    if text.isdigit():
        return text
    for pattern in (r"[?&]id=(\d+)", r"/playlist/(\d+)", r"/taoge/(\d+)", r"(\d{6,})"):
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    raise ValueError("无法从输入中识别歌单 ID: " + text)


def fetch_playlist(playlist_id):
    request = urllib.request.Request(API.format(playlist_id), headers=HEADERS)
    with urllib.request.urlopen(request, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))
    cdlist = payload.get("cdlist") or []
    if not cdlist:
        raise RuntimeError("接口未返回歌单(可能是私密歌单或 ID 错误): " + playlist_id)
    return cdlist[0]


def normalize_playlist(cd):
    playlist_id = str(cd.get("disstid") or "").strip()
    songs = []
    for song in cd.get("songlist") or []:
        singers = " / ".join(
            s.get("name", "") for s in (song.get("singer") or []) if s.get("name")
        )
        albummid = (song.get("albummid") or "").strip()
        # 专辑封面走 CDN 直链(已实测任意 Referer 均可访问),不占仓库空间。
        song_cover = (
            "https://y.gtimg.cn/music/photo_new/T002R300x300M000{}.jpg".format(albummid)
            if albummid else ""
        )
        songs.append({
            "name": (song.get("songname") or song.get("songorig") or "").strip(),
            "singers": singers,
            "album": (song.get("albumname") or "").strip(),
            "interval": int(song.get("interval") or 0),
            "songmid": (song.get("songmid") or "").strip(),
            "cover": song_cover,
        })
    return {
        "id": playlist_id,
        "name": (cd.get("dissname") or "").strip() or "未命名歌单",
        "cover": "",
        "desc": (cd.get("desc") or "").strip(),
        "creator": (cd.get("nickname") or "").strip(),
        "song_count": len(songs),
        "source_url": "https://y.qq.com/n/ryqq/playlist/" + playlist_id,
        "songs": songs,
    }


def download_cover(playlist_id, cover_url):
    """封面自托管,避免外链失效。失败则留空,页面回退到渐变封面。"""
    if not cover_url:
        return ""
    relative = "playlist-covers/{}.jpg".format(playlist_id)
    local_path = COVERS_DIR / "{}.jpg".format(playlist_id)
    if not local_path.exists():
        try:
            request = urllib.request.Request(cover_url, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=20) as response:
                payload = response.read()
            if not payload.startswith((b"\xff\xd8", b"\x89PNG")):
                raise ValueError("不是图片数据")
            COVERS_DIR.mkdir(parents=True, exist_ok=True)
            temporary = local_path.with_suffix(".tmp")
            temporary.write_bytes(payload)
            temporary.replace(local_path)
        except Exception as exc:
            print("  ⚠️ 封面下载失败({}):{}".format(playlist_id, exc))
            return ""
    return relative


def load_existing():
    if not DATA_FILE.exists():
        return []
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return data if isinstance(data, list) else []


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 1

    playlists = load_existing()
    by_id = {str(p.get("id")): p for p in playlists}

    for raw in argv[1:]:
        playlist_id = parse_playlist_id(raw)
        print("📥 正在抓取歌单 {} ...".format(playlist_id))
        cd = fetch_playlist(playlist_id)
        playlist = normalize_playlist(cd)
        cover_url = cd.get("logo") or ""
        playlist["cover"] = download_cover(playlist_id, cover_url)
        if not playlist["cover"] and playlist_id in by_id:
            playlist["cover"] = by_id[playlist_id].get("cover", "")
        by_id[playlist_id] = playlist
        print("  ✅《{}》{} 首{}".format(
            playlist["name"],
            playlist["song_count"],
            "(封面已保存)" if playlist["cover"] else "",
        ))
        time.sleep(random.uniform(0.6, 1.2))

    ordered = sorted(by_id.values(), key=lambda p: str(p.get("id")))
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(
        json.dumps(ordered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print("💾 已写入 {} 个歌单 -> {}".format(len(ordered), DATA_FILE))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
