"""同步官方「政大新聞」列表，供首頁「政大焦點」輪播使用；只用 Python 標準函式庫。

在 webpage 執行 python3 scripts/update_announcements.py 可更新本機資料。
GitHub Actions 會執行同一支程式後部署，瀏覽器不用跨網域抓取 HTML。
來源結構若改版，優先維護 NEWS_URL、OfficialPageParser 的 mtitle／圖片規則。
保留原 announcements 檔名與資料介面，避免影響既有載入及更新排程。
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


HOME_URL = "https://www.nccu.edu.tw/index.php?Lang=zh-tw"
# 使用指定的校園新聞列表，不再讀取校園公告模組。
NEWS_URL = "https://www.nccu.edu.tw/p/412-1000-87.php?Lang=zh-tw"
OUTPUT = Path(__file__).resolve().parents[1] / "announcements-data.js"
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


def official_url(value, base=HOME_URL):
    """只輸出校方 HTTPS 網址，不接受 javascript:、外站或含帳密的網址。"""
    if not value:
        return ""
    url = urljoin(base, value)
    parts = urlparse(url)
    host = parts.hostname or ""
    official = host == "nccu.edu.tw" or host.endswith(".nccu.edu.tw")
    return url if parts.scheme == "https" and official and not parts.username and not parts.password else ""


def read_page(url):
    """新聞列表與文章皆使用 GET 讀取。"""
    request = Request(url, headers={
        "User-Agent": "iNCCU-Coursework-Announcements/1.0",
        "Referer": HOME_URL,
        "Accept-Language": "zh-TW,zh;q=0.9",
    })
    with urlopen(request, timeout=25) as response:
        if not official_url(response.url):
            raise ValueError("來源重新導向到非校方網站")
        # 避免把錯誤頁或意外的大型附件當作 HTML。
        if "text/html" not in response.headers.get("Content-Type", ""):
            raise ValueError("來源不是 HTML 頁面")
        content = response.read(2_000_001)
        if len(content) > 2_000_000:
            raise ValueError("來源頁面超過 2 MB")
        return content.decode("utf-8")


class OfficialPageParser(HTMLParser):
    """只取清單標題、文章配圖；不複製內文、腳本或校方版面。"""

    def __init__(self, base):
        super().__init__(convert_charrefs=True)
        self.base = base
        self.stack = []
        self.current_link = None
        self.links = []
        self.images = []
        self.share_image = ""
        self.image_link = ""
        self.list_images = {}

    def inside(self, class_name):
        return any(class_name in classes for _, classes in self.stack)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "a" and self.inside("d-img"):
            self.image_link = official_url(attrs.get("href"), self.base)
        elif tag == "img" and self.inside("d-img") and self.image_link:
            self.list_images[self.image_link] = official_url(attrs.get("src"), self.base)
        elif tag == "a" and self.inside("mtitle") and self.inside("d-item"):
            self.current_link = {"url": official_url(attrs.get("href"), self.base), "text": []}
        elif tag == "meta" and attrs.get("property") == "og:image":
            candidate = official_url(attrs.get("content"), self.base)
            # 校方無配圖時 og:image 可能是網站 favicon，不能當新聞圖片。
            if "/pictures/" in urlparse(candidate).path:
                self.share_image = candidate
        elif tag == "img" and self.inside("module-detail"):
            if self.inside("figBS") or self.inside("meditor"):
                image = official_url(attrs.get("src"), self.base)
                if image:
                    self.images.append(image)
        if tag not in VOID_TAGS:
            self.stack.append((tag, (attrs.get("class") or "").split()))

    def handle_data(self, text):
        if self.current_link is not None:
            self.current_link["text"].append(text)

    def handle_endtag(self, tag):
        if tag == "a":
            self.image_link = ""
        if tag == "a" and self.current_link is not None:
            link = self.current_link
            # 只收斂 HTML 排版空白，保留官方標點與全形空格，不重新撰寫標題。
            title = re.sub(r"[\t\r\n ]+", " ", "".join(link["text"])).strip()
            if title and link["url"]:
                self.links.append({"title": title, "url": link["url"]})
            self.current_link = None
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break


def collect_announcements():
    listing = OfficialPageParser(NEWS_URL)
    listing.feed(read_page(NEWS_URL))
    if not listing.links:
        # 來源停機或改版時中止更新，不能用空清單覆蓋已部署的新聞。
        raise ValueError("沒有取得校園新聞，請確認校方列表結構是否改版")

    items = []
    seen = set()
    for announcement in listing.links:
        if announcement["url"] in seen:
            continue
        seen.add(announcement["url"])
        # 優先使用新聞列表同一篇文章的配圖與原標題，維持官方顯示順序。
        image = listing.list_images.get(announcement["url"], "")
        if not image:
            article = OfficialPageParser(announcement["url"])
            article.feed(read_page(announcement["url"]))
            image = article.share_image or next(iter(article.images), "")
        items.append({**announcement, "image": image})

    return {
        "source": NEWS_URL,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "items": items,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stdout", action="store_true", help="只輸出取得的資料，不寫入檔案")
    arguments = parser.parse_args()
    data = collect_announcements()
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    payload = payload.replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    script = "// 政大焦點：官方校園新聞快照；請以 scripts/update_announcements.py 更新。\n"
    script += "window.NCCU_ANNOUNCEMENTS = " + payload + ";\n"
    if arguments.stdout:
        print(script, end="")
    else:
        # 全部取得成功才原子替換；失敗時保留原檔，也讓排程停止部署。
        temporary = OUTPUT.with_suffix(".tmp")
        temporary.write_text(script, encoding="utf-8")
        temporary.replace(OUTPUT)
        print(f"已同步 {len(data['items'])} 則校園新聞：{OUTPUT.name}")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"新聞更新失敗，原資料保持不變：{error}", file=sys.stderr)
        sys.exit(1)
