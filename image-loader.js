/* 共用圖片網址與按需載入。對照表缺少某張圖片時，直接使用原始 PNG。
   工具保留原檔名；修改素材後執行 scripts/optimize_images.py 更新最佳化版本。 */
(() => {
  'use strict';

  const assets = window.PORTAL_IMAGE_ASSETS || {};
  const encodePath = path => path.split('/').map(encodeURIComponent).join('/');

  function url(original) {
    return encodePath(assets[original]?.src || original);
  }

  // 首頁與工具目錄各有自己的觀察器；目錄以 dialog 的捲動範圍判斷可見位置。
  function createLoader(root = null) {
    const pending = new Map();
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const source = pending.get(entry.target);
          if (!entry.isIntersecting || !source) return;
          observer.unobserve(entry.target);
          pending.delete(entry.target);
          entry.target.src = source;
        });
      }, { root, rootMargin: '200px 0px' })
      : null;

    function prepare(image, original, eager = false) {
      const asset = assets[original];
      const source = url(original);
      const fallback = encodePath(original);
      // 寬高先佔位，再載入圖；實際顯示尺寸仍交給既有 CSS。
      image.width = asset?.width || 240;
      image.height = asset?.height || 240;
      image.decoding = 'async';
      image.loading = eager || observer ? 'eager' : 'lazy';
      if (source !== fallback) {
        image.addEventListener('error', () => { image.src = fallback; }, { once: true });
      }
      if (eager || !observer) image.src = source;
      else pending.set(image, source);
    }

    function observe() {
      // 在 DOM 建立完成、視窗開啟後呼叫，避免隱藏目錄提前發出圖片請求。
      if (observer) pending.forEach((_, image) => observer.observe(image));
    }

    function reset() {
      observer?.disconnect();
      pending.clear();
    }

    return { prepare, observe, reset };
  }

  // 靜態頁首使用 picture，讓瀏覽器直接選 WebP，不先下載 PNG 再替換。
  // 若選中的來源載入失敗，移除 source 後只嘗試一次原 PNG。
  document.querySelectorAll('picture img[data-original-src]').forEach(image => {
    let retried = false;
    function fallback() {
      if (retried) return;
      retried = true;
      image.parentElement.querySelectorAll('source').forEach(source => source.remove());
      image.src = encodePath(image.dataset.originalSrc);
    }
    image.addEventListener('error', fallback, { once: true });
    // defer 執行前圖片可能已失敗，因此也處理已完成但沒有像素的圖片。
    if (image.complete && image.currentSrc && !image.naturalWidth) fallback();
  });

  window.PortalImages = { url, createLoader };
})();
