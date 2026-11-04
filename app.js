/* 原生 JavaScript：資料在 data.js，視覺在 styles.css，互動集中於此。 */
(() => {
  'use strict';

  const data = window.PORTAL_DATA;
  const toolsById = new Map(data.tools.map(tool => [tool.id, tool]));
  const grid = document.querySelector('#tool-grid');
  const editButton = document.querySelector('#edit-tools');
  const dialog = document.querySelector('#add-dialog');
  const search = document.querySelector('#tool-search');
  let favorites = readFavorites();
  let editing = false;
  let draggedId = null;
  let newsIndex = 0;
  let toastTimer;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function screenshotUrl(filename) {
    return `assets/screenshots/${encodeURIComponent(filename)}`;
  }

  function destination(item) {
    return item.screenshot ? screenshotUrl(item.screenshot) : item.url;
  }

  function externalLink(link, url) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function readFavorites() {
    try {
      const stored = JSON.parse(localStorage.getItem(data.storageKey));
      // 空陣列代表使用者確實移除了所有工具，不應回復預設。
      if (Array.isArray(stored)) return [...new Set(stored)].filter(id => toolsById.has(id));
    } catch {
      // 無法讀取或 JSON 損毀時，仍可使用原型。
    }
    return [...data.defaultFavorites];
  }

  function saveFavorites() {
    try {
      localStorage.setItem(data.storageKey, JSON.stringify(favorites));
      document.querySelector('#save-state').textContent = '已儲存於此瀏覽器';
    } catch {
      document.querySelector('#save-state').textContent = '瀏覽器無法儲存，設定僅保留於本次瀏覽';
    }
  }

  function announce(message) {
    const toast = document.querySelector('#toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
  }

  // 根據實際區塊寬度計算欄數，確保新增按鈕總在排序最後。
  function updateGridLayout() {
    const width = grid.clientWidth;
    const columns = width >= 590 ? 4 : width >= 410 ? 3 : 2;
    grid.style.setProperty('--tool-columns', columns);
    grid.style.setProperty('--tool-rows', Math.ceil((favorites.length + 1) / columns));
  }

  function renderTools() {
    grid.replaceChildren();
    favorites.forEach((id, index) => {
      const tool = toolsById.get(id);
      const item = element('li', 'tool-item');
      item.dataset.id = id;
      item.draggable = editing;

      const link = externalLink(element('a', 'tool-link'), destination(tool));
      link.setAttribute('aria-describedby', `tip-${id}`);
      if (editing) link.setAttribute('aria-label', `${tool.name}，編輯模式，請使用前移或後移按鈕排序`);
      const art = element('span', 'tool-art');
      const image = element('img');
      image.src = `assets/icons/${tool.icon}`;
      image.alt = '';
      image.draggable = false;
      art.append(image);
      link.append(art, element('span', 'tool-name', tool.name));
      link.addEventListener('click', event => { if (editing) event.preventDefault(); });
      const tip = element('span', 'tool-tooltip', `${tool.tip}${tool.screenshot ? '（開啟系統截圖）' : '（另開網站）'}`);
      tip.id = `tip-${id}`;
      tip.setAttribute('role', 'tooltip');

      const remove = element('button', 'remove-tool', '×');
      remove.type = 'button';
      remove.setAttribute('aria-label', `移除${tool.name}`);
      remove.addEventListener('click', () => {
        favorites = favorites.filter(value => value !== id);
        saveFavorites();
        renderTools();
        const nextItem = grid.children[Math.min(index, favorites.length)];
        (nextItem.querySelector('.remove-tool') || nextItem.querySelector('button')).focus();
        announce(`已移除「${tool.name}」，可從新增工具重新加入。`);
      });

      const controls = element('div', 'move-controls');
      [-1, 1].forEach(offset => {
        const label = offset < 0 ? '前移' : '後移';
        const button = element('button', '', label);
        button.type = 'button';
        button.dataset.direction = offset;
        button.disabled = index + offset < 0 || index + offset >= favorites.length;
        button.setAttribute('aria-label', `${label}${tool.name}`);
        button.addEventListener('click', () => {
          moveTool(id, index + offset);
          const moved = grid.querySelector(`[data-id="${id}"]`);
          const sameButton = moved.querySelector(`[data-direction="${offset}"]`);
          (sameButton.disabled ? moved.querySelector('.tool-link') : sameButton).focus();
        });
        controls.append(button);
      });
      item.append(link, tip, remove, controls);
      grid.append(item);
    });

    const addItem = element('li', 'tool-item add-tool');
    const addButton = element('button', 'tool-link');
    addButton.id = 'add-tool';
    addButton.type = 'button';
    addButton.setAttribute('aria-label', '新增工具');
    addButton.append(element('span', 'tool-art add-art', '+'), element('span', 'tool-name', '新增工具'));
    addButton.setAttribute('aria-haspopup', 'dialog');
    addButton.addEventListener('click', () => {
      search.value = '';
      renderCatalog();
      dialog.showModal();
      search.focus();
    });
    addItem.append(addButton);
    grid.append(addItem);
    document.querySelector('#tool-count').textContent = `${favorites.length} 個常用工具`;
    updateGridLayout();
  }

  function moveTool(id, targetIndex) {
    const sourceIndex = favorites.indexOf(id);
    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= favorites.length || sourceIndex === targetIndex) return;
    favorites.splice(sourceIndex, 1);
    favorites.splice(targetIndex, 0, id);
    saveFavorites();
    renderTools();
    announce(`「${toolsById.get(id).name}」已移至第 ${targetIndex + 1} 個位置。`);
  }

  function renderCatalog(focusId) {
    const catalog = document.querySelector('#tool-catalog');
    catalog.replaceChildren();
    const query = search.value.trim().toLocaleLowerCase();
    let resultCount = 0;
    data.categories.forEach(category => {
      const matches = data.tools.filter(tool => tool.category === category && `${tool.name} ${tool.tip}`.toLocaleLowerCase().includes(query));
      if (!matches.length) return;
      const section = element('section');
      section.append(element('h3', '', category));
      matches.forEach(tool => {
        resultCount++;
        const row = element('div', 'catalog-row');
        const image = element('img');
        image.src = `assets/icons/${tool.icon}`;
        image.alt = '';
        const copy = element('div', 'catalog-copy');
        copy.append(element('strong', '', tool.name), element('p', '', tool.tip));
        const added = favorites.includes(tool.id);
        const button = element('button', '', added ? '已加入' : '＋ 新增');
        button.type = 'button';
        button.disabled = added;
        button.dataset.addId = tool.id;
        button.setAttribute('aria-label', `${added ? '已加入' : '新增'}${tool.name}`);
        button.addEventListener('click', () => {
          if (favorites.includes(tool.id)) return;
          favorites.push(tool.id);
          saveFavorites();
          renderTools();
          renderCatalog(tool.id);
          announce(`已將「${tool.name}」加入首頁。`);
        });
        row.append(image, copy, button);
        section.append(row);
      });
      catalog.append(section);
    });
    if (!resultCount) catalog.append(element('p', 'empty-search', '找不到符合的工具，請試試其他關鍵字。'));
    // 新增後按鈕已停用，將焦點移到搜尋欄，保留原搜尋內容。
    if (focusId) search.focus();
  }

  editButton.addEventListener('click', () => {
    editing = !editing;
    editButton.setAttribute('aria-pressed', String(editing));
    editButton.querySelector('span').textContent = editing ? '完成編輯' : '調整排序';
    document.querySelector('.systems-panel').classList.toggle('is-editing', editing);
    document.querySelector('#edit-hint').hidden = !editing;
    renderTools();
    if (!editing) announce('已完成常用工具編輯。');
  });
  search.addEventListener('input', () => renderCatalog());
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.querySelector('#add-tool').focus());
  dialog.addEventListener('keydown', event => {
    // 搜尋欄原生 Escape 會先清除文字；在對話框中統一為關閉並歸還焦點。
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });

  // 桌機原生拖曳；鍵盤與觸控使用同一組前移／後移操作。
  grid.addEventListener('dragstart', event => {
    const item = event.target.closest('[data-id]');
    if (!editing || !item) { event.preventDefault(); return; }
    draggedId = item.dataset.id;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedId);
    item.classList.add('is-dragging');
  });
  grid.addEventListener('dragover', event => {
    if (!editing || !draggedId) return;
    const target = event.target.closest('.tool-item');
    if (!target) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    grid.querySelectorAll('.drop-target').forEach(item => item.classList.remove('drop-target'));
    target.classList.add('drop-target');
  });
  grid.addEventListener('drop', event => {
    if (!editing || !draggedId) return;
    event.preventDefault();
    const target = event.target.closest('.tool-item');
    if (target) moveTool(draggedId, target.dataset.id ? favorites.indexOf(target.dataset.id) : favorites.length - 1);
    clearDragState();
  });
  function clearDragState() {
    draggedId = null;
    grid.querySelectorAll('.is-dragging, .drop-target').forEach(item => item.classList.remove('is-dragging', 'drop-target'));
  }
  grid.addEventListener('dragend', clearDragState);

  function renderCalendar() {
    const calendar = data.calendar;
    const table = document.querySelector('#month-calendar');
    document.querySelector('.month-number').textContent = calendar.month;
    document.querySelector('.month-label').replaceChildren(document.createTextNode('月 '), element('span', '', calendar.year));
    document.querySelector('.semester-label').textContent = calendar.semester;
    table.querySelector('caption').textContent = `${calendar.year} 年 ${calendar.month} 月學校行事曆，左欄為學期週次`;
    const header = element('thead');
    const headerRow = element('tr');
    ['週', '日', '一', '二', '三', '四', '五', '六'].forEach(label => {
      const cell = element('th', '', label);
      cell.scope = 'col';
      headerRow.append(cell);
    });
    header.append(headerRow);
    table.append(header);
    const body = element('tbody');
    const firstDay = new Date(calendar.year, calendar.month - 1, 1).getDay();
    const dayCount = new Date(calendar.year, calendar.month, 0).getDate();
    const today = new Date();
    const eventDays = new Set(calendar.events.map(event => event.day));
    for (let row = 0; row < Math.ceil((firstDay + dayCount) / 7); row++) {
      const weekRow = element('tr');
      const week = element('th', 'week-number', calendar.firstWeek + row);
      week.scope = 'row';
      week.setAttribute('aria-label', `第 ${calendar.firstWeek + row} 週`);
      weekRow.append(week);
      for (let column = 0; column < 7; column++) {
        const day = row * 7 + column - firstDay + 1;
        const cell = element('td');
        if (day > 0 && day <= dayCount) {
          const hasEvent = eventDays.has(day);
          const date = element(hasEvent ? 'button' : 'span', 'day-number', day);
          if (today.getFullYear() === calendar.year && today.getMonth() + 1 === calendar.month && today.getDate() === day) date.setAttribute('aria-current', 'date');
          if (hasEvent) {
            date.type = 'button';
            date.setAttribute('aria-label', `${calendar.month} 月 ${day} 日，查看重要日程`);
            date.setAttribute('aria-pressed', 'false');
            date.setAttribute('aria-controls', `event-${day}`);
            date.addEventListener('click', () => {
              const select = date.getAttribute('aria-pressed') !== 'true';
              table.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', 'false'));
              document.querySelectorAll('.agenda > li').forEach(item => item.classList.remove('is-highlighted'));
              date.setAttribute('aria-pressed', String(select));
              document.querySelector(`#event-${day}`).classList.toggle('is-highlighted', select);
              if (select) announce(`${calendar.month} 月 ${day} 日：${calendar.events.find(event => event.day === day).items.map(item => item.text).join('、')}`);
            });
          }
          cell.append(date);
        }
        weekRow.append(cell);
      }
      body.append(weekRow);
    }
    table.append(body);
    calendar.events.forEach(event => {
      const row = element('li');
      row.id = `event-${event.day}`;
      const date = element('div', 'agenda-date', `${calendar.month}.${String(event.day).padStart(2, '0')}（${event.weekday}）`);
      date.append(element('span', '', `第 ${event.week} 週`));
      if (event.important) date.append(element('span', 'deadline-tag', '截止'));
      const items = element('div', 'agenda-items');
      event.items.forEach(item => {
        const link = destination(item);
        items.append(link ? externalLink(element('a', '', `${item.text} ↗`), link) : element('span', '', item.text));
      });
      row.append(date, items);
      document.querySelector('#agenda').append(row);
    });
    document.querySelector('#google-calendar').href = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendar.calendarId)}`;
    document.querySelector('#google-calendar').title = '在 Google 日曆訂閱政大校曆，需登入 Google 帳號';
    document.querySelector('#official-calendar').href = calendar.officialUrl;
  }

  function renderNews() {
    const news = data.news[newsIndex];
    document.querySelector('#news-link').href = `news.html?article=${encodeURIComponent(news.id)}`;
    document.querySelector('#news-image-label').textContent = news.label;
    document.querySelector('#news-category').textContent = news.category;
    document.querySelector('#news-heading').textContent = news.title;
    document.querySelector('#news-summary').textContent = news.summary;
    document.querySelector('#news-position').textContent = `${String(newsIndex + 1).padStart(2, '0')} / ${String(data.news.length).padStart(2, '0')}`;
    document.querySelector('#news-image').alt = `${news.label}建置中的校園插畫`;
    document.querySelectorAll('#news-dots button').forEach((button, index) => button.setAttribute('aria-current', String(index === newsIndex)));
  }
  data.news.forEach((news, index) => {
    const dot = element('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `第 ${index + 1} 則：${news.label}`);
    dot.addEventListener('click', () => { newsIndex = index; renderNews(); });
    document.querySelector('#news-dots').append(dot);
  });
  document.querySelector('#news-prev').addEventListener('click', () => { newsIndex = (newsIndex - 1 + data.news.length) % data.news.length; renderNews(); });
  document.querySelector('#news-next').addEventListener('click', () => { newsIndex = (newsIndex + 1) % data.news.length; renderNews(); });

  renderTools();
  renderCalendar();
  renderNews();
  new ResizeObserver(updateGridLayout).observe(grid);
})();
