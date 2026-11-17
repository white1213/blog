"""同步心跳状态文件维护。

每个同步脚本跑完（无论是否有数据变化）都调用 mark("源名")，
把本次检查时间写入 assets/data/sync-status/<源名>.json。

**每个源一个文件**：并发运行的多个同步任务各自只改自己的文件，
不会在 git rebase 时互相冲突（此前共用一个 sync-status.json 会撞车）。

文件内容就是一个 ISO 时间字符串（带 +08:00），Hugo 读出来直接格式化。
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

STATUS_DIR = Path("assets/data/sync-status")

TZ_CN = timezone(timedelta(hours=8))


def mark(source):
    STATUS_DIR.mkdir(parents=True, exist_ok=True)
    path = STATUS_DIR / "{}.json".format(source)
    stamp = datetime.now(TZ_CN).strftime("%Y-%m-%dT%H:%M:%S+08:00")
    path.write_text(json.dumps(stamp) + "\n", encoding="utf-8")
    print("💓 已记录 {} 检查时间 -> {}".format(source, stamp))
