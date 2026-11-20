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
    return 0


if __name__ == "__main__":
    sys.exit(main())
