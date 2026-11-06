"""从 Steam 同步游戏库到博客。

用法:
    python sync_steam.py <凭据文件>

凭据文件格式(两行):
    STEAM_API_KEY=xxxxxxxx
    STEAM_ID=7656119xxxxxxxxxx   (17 位 SteamID64)

只同步"玩过"的游戏(游玩时长 > 0)，下载封面到 static/steam-covers/，
写入 assets/data/steam.json。
"""
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

API = "https://api.steampowered.com"
DATA_FILE = Path("assets/data/steam.json")
COVERS_DIR = Path("static/steam-covers")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def load_credentials(path):
    values = {}
    with open(path, "r", encoding="utf-8-sig") as f:
        for line in f.read().splitlines():
            if "=" in line:
                k, v = line.split("=", 1)
                values[k.strip().lstrip("\ufeff").strip()] = v.strip()
    key = values.get("STEAM_API_KEY", "")
    steam_id = values.get("STEAM_ID", "")
    if not key or not steam_id:
        raise SystemExit("凭据文件缺少 STEAM_API_KEY 或 STEAM_ID")
    return key, steam_id


def get_json(url, retries=3):
    last = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as exc:
            last = exc
            if attempt < retries:
                print("  ⚠️ 请求失败，{} 秒后重试：{}".format(attempt, exc))
                time.sleep(attempt * 2)
    raise RuntimeError("Steam 接口请求失败: {}".format(last))


def download_cover(appid):
    path = COVERS_DIR / "{}.jpg".format(appid)
    if path.exists():
        return "steam-covers/{}.jpg".format(appid)
    url = "https://cdn.akamai.steamstatic.com/steam/apps/{}/header.jpg".format(appid)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=25) as r:
            data = r.read()
        if not data.startswith(b"\xff\xd8") and not data.startswith(b"\x89PNG"):
            return ""
        COVERS_DIR.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return "steam-covers/{}.jpg".format(appid)
    except Exception as exc:
        print("  ⚠️ 封面失败 {}: {}".format(appid, exc))
        return ""


def main(cred_path):
    key, steam_id = load_credentials(cred_path)

    print("🎮 拉取游戏库…")
    owned = get_json(
        API + "/IPlayerService/GetOwnedGames/v1/?key={}&steamid={}"
        "&include_appinfo=1&include_played_free_games=1&format=json".format(key, steam_id)
    )
    games = owned.get("response", {}).get("games", [])
    print("  共 {} 款游戏".format(len(games)))

    print("🕹️ 拉取最近游玩…")
    recent_ids = set()
    try:
        recent = get_json(
            API + "/IPlayerService/GetRecentlyPlayedGames/v1/?key={}&steamid={}&format=json".format(key, steam_id)
        )
        for g in recent.get("response", {}).get("games", []):
            if g.get("playtime_2weeks"):
                recent_ids.add(int(g["appid"]))
        print("  最近两周玩过 {} 款".format(len(recent_ids)))
    except Exception as exc:
        print("  ⚠️ 最近游玩拉取失败（不影响主流程）：{}".format(exc))

    played = [g for g in games if int(g.get("playtime_forever") or 0) > 0]
    played.sort(key=lambda g: int(g.get("playtime_forever") or 0), reverse=True)
    print("  其中玩过的 {} 款".format(len(played)))

    out = []
    for i, g in enumerate(played, 1):
        appid = int(g["appid"])
        minutes = int(g.get("playtime_forever") or 0)
        cover = download_cover(appid)
        out.append({
            "appid": appid,
            "name": g.get("name") or "App {}".format(appid),
            "minutes": minutes,
            "hours": round(minutes / 60, 1),
            "recent": appid in recent_ids,
            "cover": cover
        })
        if i % 10 == 0:
            print("  已处理 {}/{}".format(i, len(played)))
        time.sleep(0.25)

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    total_hours = sum(x["hours"] for x in out)
    with_cover = sum(1 for x in out if x["cover"])
    print("💾 完成：{} 款游戏，总时长 {:.0f} 小时，封面 {} 张".format(len(out), total_hours, with_cover))
    print("   已写入 {}".format(DATA_FILE))
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    sys.exit(main(sys.argv[1]))
