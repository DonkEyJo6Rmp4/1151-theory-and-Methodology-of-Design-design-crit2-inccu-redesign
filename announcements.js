/* 政大焦點輪播：讀取官方校園新聞標題與圖片，保留 announcements 資料介面。 */
(() => {
  'use strict';

  const link = document.querySelector('#news-link');
  const heading = document.querySelector('#news-heading');
  const image = document.querySelector('#news-image');
  const dots = document.querySelector('#news-dots');
  const position = document.querySelector('#news-position');
  const previous = document.querySelector('#news-prev');
  const next = document.querySelector('#news-next');
  let activeIndex = 0;

  // 只接受校方 HTTPS 網址；遠端文字一律用 textContent，不能當 HTML 執行。
  function officialUrl(value) {
    if (typeof value !== 'string') return '';
    try {
      const url = new URL(value);
      const isOfficial = url.hostname === 'nccu.edu.tw' || url.hostname.endsWith('.nccu.edu.tw');
      return url.protocol === 'https:' && isOfficial && !url.username && !url.password ? url.href : '';
    } catch {
      return '';
    }
  }

  // announcements-data.js 由 scripts/update_announcements.py 產生。
  // 資料跟網站一起部署，避免跨網域抓官方 HTML 的 CORS 限制，也支援直接開啟檔案。
  const source = window.NCCU_ANNOUNCEMENTS;
  const announcements = (Array.isArray(source?.items) ? source.items : [])
    .filter(item => item && typeof item.title === 'string' && item.title.trim() && officialUrl(item.url))
    .map(item => ({ title: item.title, url: officialUrl(item.url), image: officialUrl(item.image) }));

  // 圖片載入失敗只隱藏圖片，標題及官方連結仍然可以使用。
  image.addEventListener('error', () => { image.hidden = true; });
  image.addEventListener('load', () => { image.hidden = false; });

  function renderAnnouncement() {
    const announcement = announcements[activeIndex];
    link.href = announcement.url;
    heading.textContent = announcement.title;
    image.hidden = !announcement.image;
    // 同一張卡片已有標題，因此圖片用空 alt，避免螢幕閱讀器重複朗讀。
    if (announcement.image) image.src = announcement.image;
    else image.removeAttribute('src');
    position.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(announcements.length).padStart(2, '0')}`;
    Array.from(dots.children).forEach((button, index) => {
      button.setAttribute('aria-current', String(index === activeIndex));
    });
  }

  // 沒有可用資料時維持 HTML 的官方入口；不顯示虛構內容或無效頁碼。
  if (!announcements.length) return;

  announcements.forEach((announcement, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `第 ${index + 1} 則：${announcement.title}`);
    dot.addEventListener('click', () => {
      activeIndex = index;
      renderAnnouncement();
    });
    dots.append(dot);
  });

  function moveAnnouncement(direction) {
    activeIndex = (activeIndex + direction + announcements.length) % announcements.length;
    renderAnnouncement();
  }

  previous.disabled = next.disabled = announcements.length < 2;
  previous.addEventListener('click', () => moveAnnouncement(-1));
  next.addEventListener('click', () => moveAnnouncement(1));
  renderAnnouncement();
})();
