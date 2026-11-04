"""在 webpage 執行 python3 scripts/optimize_images.py 產生網站使用的圖片版本。

需先安裝 Google WebP 的 cwebp。只讀取原始 PNG；WebP、容量報告及
image-assets.js 都是可重新產生的檔案，需跟網站一起提交，不在新聞排程轉檔。
"""

import json
import shutil
import struct
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "optimized"


def png_dimensions(path):
    """PNG 的 IHDR 記錄原始寬高，不額外安裝影像處理套件。"""
    with path.open("rb") as source:
        header = source.read(24)
    if header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise ValueError(f"不是有效的 PNG：{path.name}")
    return struct.unpack(">II", header[16:24])


def optimize(cwebp, source, category):
    width, height = png_dimensions(source)
    target_width, target_height = width, height
    options = ["-quiet", "-m", "6", "-metadata", "none"]
    if category == "screenshots":
        # 保留所有文字像素與原始解析度；無損圖片不犧牲課表、成績可讀性。
        options += ["-lossless", "-q", "100"]
    else:
        # 工具最大顯示 120px，提供 2 倍解析度；標誌最大顯示寬度 202px。
        limit = 404 if source.name == "iNCCUicon.png" else 240
        scale = min(1, limit / max(width, height))
        target_width = max(1, round(width * scale))
        target_height = max(1, round(height * scale))
        options += ["-q", "85", "-alpha_q", "100"]
        if (width, height) != (target_width, target_height):
            options += ["-resize", str(target_width), str(target_height)]

    destination = OUTPUT / category / source.with_suffix(".webp").name
    destination.parent.mkdir(parents=True, exist_ok=True)
    # 先完成轉檔，再替換自己產生的 WebP；原始 PNG 永不覆寫。
    with tempfile.TemporaryDirectory(prefix="image-encode-", dir=OUTPUT) as temporary:
        candidate = Path(temporary) / "image.webp"
        subprocess.run([cwebp, *options, str(source), "-o", str(candidate)], check=True)
        candidate.replace(destination)

    original_bytes = source.stat().st_size
    webp_bytes = destination.stat().st_size
    use_webp = webp_bytes < original_bytes
    selected = destination if use_webp else source
    dimensions = (target_width, target_height) if use_webp else (width, height)
    return {
        "src": selected.relative_to(ROOT).as_posix(),
        "width": dimensions[0],
        "height": dimensions[1],
    }, {
        "original": source.relative_to(ROOT).as_posix(),
        "selected": selected.relative_to(ROOT).as_posix(),
        "originalBytes": original_bytes,
        "webpBytes": webp_bytes,
        "selectedBytes": min(original_bytes, webp_bytes),
    }


def main():
    cwebp = shutil.which("cwebp")
    if not cwebp:
        raise SystemExit("找不到 cwebp，請先安裝 WebP 工具（macOS：brew install webp）。")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    report = {}
    for category in ("icons", "screenshots"):
        entries = []
        for source in sorted((ROOT / "assets" / category).glob("*.png")):
            # favicon 只有 16px，維持原 PNG 及既有網址。
            if category == "icons" and source.name == "browsericon.png":
                continue
            asset, sizes = optimize(cwebp, source, category)
            manifest[source.relative_to(ROOT).as_posix()] = asset
            entries.append(sizes)
        before = sum(entry["originalBytes"] for entry in entries)
        after = sum(entry["selectedBytes"] for entry in entries)
        report[category] = {"originalBytes": before, "selectedBytes": after, "files": entries}
        saving = 100 * (1 - after / before) if before else 0
        print(f"{category}: {len(entries)} 張，{before:,} → {after:,} bytes，減少 {saving:.1f}%")

    # 對照表保留 data.js 原始檔名，既有工具、截圖網址及瀏覽器排序都不必遷移。
    payload = json.dumps(manifest, ensure_ascii=False, indent=2).replace("<", "\\u003c")
    (ROOT / "image-assets.js").write_text(
        "// 自動產生；請用 scripts/optimize_images.py 更新。\n"
        + "window.PORTAL_IMAGE_ASSETS = " + payload + ";\n", encoding="utf-8"
    )
    (OUTPUT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
