"""每月 1 号快照：把 Steam/歌单的当前数据存入 assets/data/snapshots/。

用途：steam.json 和 playlists.json 没有逐条的时间维度，
按月存快照后，明年的年度报告才能回答"这一年你新增了什么"。
幂等：快照已存在则跳过，重复运行无副作用。
"""
import json
import shutil
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

TZ_CN = timezone(timedelta(hours=8))
ROOT = Path(__file__).resolve().parent
SNAP_DIR = ROOT / "assets" / "data" / "snapshots"

SOURCES = {
    "steam": ROOT / "assets" / "data" / "steam.json",
    "playlists": ROOT / "assets" / "data" / "playlists.json",
}


def update_delta():
    """生成 assets/data/steam-delta.json：最早快照 vs 当前 steam.json 的时长差分。

    Steam 不提供"今年玩了多久"，靠快照差分得到"快照开启以来新增时长"。
    每次 steam 同步后调用（快照每月一份，delta 每天刷新）。
    """
    steam = ROOT / "assets" / "data" / "steam.json"
    if not steam.exists():
        return
    try:
        current = json.loads(steam.read_text(encoding="utf-8"))
    except Exception as exc:
        print("跳过 delta: steam.json 不合法 ({})".format(exc))
        return

    snaps = sorted(SNAP_DIR.glob("steam-*.json"))
    if not snaps:
        print("跳过 delta: 还没有 steam 快照")
        return
    earliest = snaps[0]
    since = earliest.stem.replace("steam-", "")
    try:
        baseline = json.loads(earliest.read_text(encoding="utf-8"))
    except Exception as exc:
        print("跳过 delta: 快照不合法 ({})".format(exc))
        return
    old = {int(g["appid"]): int(g.get("minutes") or 0) for g in baseline if g.get("appid")}

    games = []
    for g in current:
        appid = int(g["appid"])
        added = int(g.get("minutes") or 0) - old.get(appid, 0)
        if added > 0:
            games.append({"name": g.get("name", ""), "hours_added": round(added / 60, 1)})
    games.sort(key=lambda x: -x["hours_added"])

    out = {"since": since, "games": games}
    dest = ROOT / "assets" / "data" / "steam-delta.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("📈 已更新 steam-delta.json: since={} 新增游戏 {} 款".format(since, len(games)))


def main():
    month = datetime.now(TZ_CN).strftime("%Y-%m")
    SNAP_DIR.mkdir(parents=True, exist_ok=True)
    written = 0
    for name, src in SOURCES.items():
        if not src.exists():
            print("跳过 {}: 源文件不存在".format(name))
            continue
        dest = SNAP_DIR / "{}-{}.json".format(name, month)
        if dest.exists():
            print("跳过 {}: 本月快照已存在".format(name))
            continue
        # 校验 JSON 合法且非空再拷贝，防止把坏数据固化进历史
        try:
            payload = json.loads(src.read_text(encoding="utf-8"))
        except Exception as exc:
            print("跳过 {}: 源文件不是合法 JSON ({})".format(name, exc))
            continue
        if not payload:
            print("跳过 {}: 源数据为空".format(name))
            continue
        shutil.copyfile(src, dest)
        written += 1
        print("📦 已存快照 {} ({} 条)".format(dest.name, len(payload) if isinstance(payload, list) else "dict"))
    print("本月共写入 {} 份快照 ({})".format(written, month))
    update_delta()
    update_monthly()
    return 0


def update_monthly():
    """生成 assets/data/steam-monthly.json：相邻快照差分得到的逐月游玩明细。

    时间点序列 = 各月快照 + 当前数据；相邻两点的 minutes 差分即该月游玩时长。
    最后一段（本月至今）会随每天 steam 同步自动刷新。
    """
    steam = ROOT / "assets" / "data" / "steam.json"
    if not steam.exists():
        return
    try:
        current = json.loads(steam.read_text(encoding="utf-8"))
    except Exception:
        return
    snaps = sorted(SNAP_DIR.glob("steam-*.json"))
    if not snaps:
        return

    points = []
    for s in snaps:
        try:
            data = json.loads(s.read_text(encoding="utf-8"))
        except Exception:
            continue
        label = s.stem.replace("steam-", "")
        points.append((label, {int(g["appid"]): int(g.get("minutes") or 0) for g in data if g.get("appid")}))
    points.append((datetime.now(TZ_CN).strftime("%Y-%m"),
                   {int(g["appid"]): int(g.get("minutes") or 0) for g in current if g.get("appid")}))
    name_of = {int(g["appid"]): g.get("name", "") for g in current}

    months = []
    for i in range(len(points) - 1):
        label, cur_map = points[i + 1]
        games = []
        total = 0
        for appid, minutes in cur_map.items():
            d = minutes - points[i][1].get(appid, 0)
            if d > 0:
                games.append({"name": name_of.get(appid, str(appid)), "hours": round(d / 60, 1)})
                total += d
        if games:
            games.sort(key=lambda x: -x["hours"])
            months.append({"month": label, "hours_total": round(total / 60, 1), "games": games})
    months.sort(key=lambda x: x["month"], reverse=True)

    out = {"updated": datetime.now(TZ_CN).strftime("%Y-%m-%d"), "months": months}
    dest = ROOT / "assets" / "data" / "steam-monthly.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("📊 已更新 steam-monthly.json: {} 个月有游玩记录".format(len(months)))


if __name__ == "__main__":
    sys.exit(main())
