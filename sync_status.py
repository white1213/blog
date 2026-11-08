"""同步心跳状态文件维护。

每个同步脚本跑完（无论是否有数据变化）都调用 mark("源名")，
把本次检查时间写入 assets/data/sync-status.json。

首页据此显示"数据更新于 <各源最新变化时间>"和"今日已自动同步"。
用北京时间（+08:00）写 ISO 字符串，Hugo time.AsTime 解析后直接按该时区格式化。
"""
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

STATUS_FILE = Path("assets/data/sync-status.json")

TZ_CN = timezone(timedelta(hours=8))


def mark(source):
    STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
    status = {}
    if STATUS_FILE.exists():
        try:
            status = json.loads(STATUS_FILE.read_text(encoding="utf-8"))
        except Exception:
            status = {}
    if not isinstance(status, dict):
        status = {}
    status[source] = datetime.now(TZ_CN).strftime("%Y-%m-%dT%H:%M:%S+08:00")
    STATUS_FILE.write_text(
        json.dumps(status, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print("💓 已记录 {} 检查时间 -> {}".format(source, status[source]))
