"""从 Keep API 拉取跑步记录(含 GPS 轨迹和心率),更新博客运动数据。

用法:
    python -I sync_keep_tracks.py <凭据文件>

凭据文件格式(两行):
    KEEP_PHONE=手机号
    KEEP_PASSWORD=密码

流程:登录 Keep API → 拉全部跑步 ID → 逐条解密 geoPoints(AES+zlib)→
GCJ02 转 WGS84(Mapbox 坐标系)→ 编码 polyline → 与现有数据合并 → 写入
data/exercise/activities.json。合并规则:保留 manual-* 手动记录,其余以
API 数据为准(按开始时间去重)。

凭据:running_page (MIT) 的 keep_sync.py 同款接口实现。
"""
import base64
import json
import re
import sys
import time
import zlib
from datetime import datetime, timedelta, timezone

import eviltransform
import polyline
import requests
from Crypto.Cipher import AES

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

LOGIN_API = "https://api.gotokeep.com/v1.1/users/login"
STATS_API = "https://api.gotokeep.com/pd/v3/stats/detail?dateUnit=all&type={sport_type}&lastDate={last_date}"
LOG_API = "https://api.gotokeep.com/pd/v3/{sport_type}log/{run_id}"

AES_KEY = "NTZmZTU5OzgyZzpkODczYw=="
AES_IV = "MjM0Njg5MjQzMjkyMDMwMA=="

DATA_FILE = "data/exercise/activities.json"
SPORT_TYPES = ["running", "hiking", "cycling"]
TYPE_MAP = {
    "outdoorRunning": "Run",
    "indoorRunning": "Treadmill",
    "outdoorWalking": "Walk",
    "outdoorCycling": "Ride",
    "mountaineering": "Hike",
}
UA = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0"


def decode_payload(text, is_geo=False):
    raw = base64.b64decode(text)
    cipher = AES.new(base64.b64decode(AES_KEY), AES.MODE_CBC, base64.b64decode(AES_IV))
    raw = cipher.decrypt(raw)
    return json.loads(zlib.decompress(raw, 16 + zlib.MAX_WBITS))


def load_credentials(path):
    values = {}
    with open(path, "r", encoding="utf-8-sig") as f:
        for line in f.read().splitlines():
            if "=" in line:
                k, v = line.split("=", 1)
                values[k.strip().lstrip("﻿").strip()] = v.strip()
    phone = values.get("KEEP_PHONE", "")
    password = values.get("KEEP_PASSWORD", "")
    if not phone or not password:
        raise SystemExit("凭据文件缺少 KEEP_PHONE 或 KEEP_PASSWORD")
    return phone, password


def login(session, mobile, password):
    r = session.post(
        LOGIN_API,
        headers={"User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"},
        data={"mobile": mobile, "password": password},
    )
    r.raise_for_status()
    token = r.json()["data"]["token"]
    session.headers["Authorization"] = "Bearer " + token
    print("✅ Keep 登录成功")


def fetch_all_run_ids(session, sport_type):
    ids, last_date = [], 0
    while True:
        r = session.get(STATS_API.format(sport_type=sport_type, last_date=last_date), headers={"User-Agent": UA})
        r.raise_for_status()
        data = r.json()["data"]
        for day in data.get("records", []):
            for log in day.get("logs", []):
                st = log.get("stats", {})
                if st.get("id") and not st.get("isDoubtful"):
                    ids.append((sport_type, st["id"]))
        last_date = data.get("lastTimestamp") or 0
        if not last_date:
            break
        time.sleep(1)
    return ids


def fetch_log(session, sport_type, run_id):
    r = session.get(LOG_API.format(sport_type=sport_type, run_id=run_id), headers={"User-Agent": UA})
    r.raise_for_status()
    return r.json()["data"]


def build_record(data):
    d = data
    dtype = d.get("dataType", "")
    run_type = TYPE_MAP.get(dtype)
    if not run_type:
        return None
    keep_id = d["id"].split("_")[1]
    start_ms = d["startTime"]

    # 心率(均值即可,明细不用于博客)
    avg_hr = None
    if d.get("heartRate"):
        avg_hr = d["heartRate"].get("averageHeartRate")
        if isinstance(avg_hr, int) and avg_hr < 0:
            avg_hr = None

    # 轨迹:geoPoints 是 AES+zlib 加密的 JSON,且是 GCJ02 坐标,需转 WGS84
    polyline_str = ""
    has_geo = bool(d.get("geoPoints"))
    points = []
    if has_geo:
        pts = decode_payload(d["geoPoints"], True)
        for p in pts:
            lat, lng = eviltransform.gcj2wgs(p["latitude"], p["longitude"])
            points.append([round(lat, 6), round(lng, 6)])
        polyline_str = polyline.encode(points) if points else ""

    started = datetime.fromtimestamp(start_ms // 1000, tz=timezone(timedelta(hours=8)))
    started_at = started.strftime("%Y-%m-%dT%H:%M:%S+08:00")
    date_key = started.strftime("%Y%m%d%H%M")

    rec = {
        "external_id": "keep-" + keep_id,
        "type": run_type,
        "started_at": started_at,
        "duration_seconds": int(d.get("duration") or 0),
        "distance_km": round((d.get("distance") or 0) / 1000, 3),
        "is_indoor": dtype.startswith("indoor"),
        "route_status": "available" if polyline_str else "unavailable",
    }
    if polyline_str:
        rec["summary_polyline"] = polyline_str
    if avg_hr:
        rec["average_heartrate_bpm"] = int(avg_hr)
    if d.get("calorie"):
        rec["calories_kcal"] = int(d["calorie"])
    return rec, date_key


def main(cred_path):
    phone, password = load_credentials(cred_path)
    session = requests.Session()
    login(session, phone, password)

    api_records = {}
    for sport_type in SPORT_TYPES:
        ids = fetch_all_run_ids(session, sport_type)
        print("type={} 共 {} 条待处理".format(sport_type, len(ids)))
        for i, (stype, run_id) in enumerate(ids):
            try:
                data = fetch_log(session, stype, run_id)
                rec, date_key = build_record(data)
                if rec is None:
                    continue
                if rec["external_id"] in api_records:
                    continue
                api_records[date_key] = rec
                print("  [{}/{}] {} {} {}km {}".format(
                    i + 1, len(ids), rec["started_at"][:10],
                    rec["type"], rec["distance_km"],
                    "有轨迹" if rec["route_status"] == "available" else "无轨迹"))
            except Exception as exc:
                print("  ⚠️ 解析失败 {}: {}".format(run_id, exc))
            time.sleep(0.8)

    # 合并:保留 manual-* 手动记录,keep-* 以 API 数据为准(按开始时间去重)
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        store = json.load(f)
    sources = store.get("sources", {})
    manual = []
    for src_records in sources.values():
        for r in src_records:
            if str(r.get("external_id", "")).startswith("manual-"):
                manual.append(r)

    new_sources = {"keep": list(api_records.values())}
    if manual:
        new_sources["manual"] = manual

    out = {"schema_version": 1, "sources": new_sources}
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    with_geo = sum(1 for r in api_records.values() if r["route_status"] == "available")
    with_hr = sum(1 for r in api_records.values() if r.get("average_heartrate_bpm"))
    total_km = sum(r["distance_km"] for r in api_records.values())
    print("💾 完成:共 {} 条(轨迹 {} 条,心率 {} 条,总 {:.1f} km),已写入 {}".format(
        len(api_records), with_geo, with_hr, total_km, DATA_FILE))
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    sys.exit(main(sys.argv[1]))
