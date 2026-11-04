/* 原生 JavaScript：資料在 data.js，視覺在 styles.css，互動集中於此。 */
(() => {
  'use strict';

  const data = window.PORTAL_DATA;
  const toolsById = new Map(data.tools.map(tool => [tool.id, tool]));
  const grid = document.querySelector('#tool-grid');
  const editButton = document.querySelector('#edit-tools');
  const dialog = document.querySelector('#add-dialog');
  const servicesDialog = document.querySelector('#services-dialog');
  const search = document.querySelector('#tool-search');
  const images = window.PortalImages;
  const homeImages = images.createLoader();
  const catalogImages = images.createLoader(dialog);
  let servicesOpener = null;
  let favorites = readFavorites();
  let editing = false;
  let draggedId = null;
  let activeCalendarMonth = data.calendar.month;
  let toastTimer;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function screenshotUrl(filename) {
    // 截圖只提供連結，使用者點選後才下載；所有入口共用最佳化版本。
    return images.url(`assets/screenshots/${filename}`);
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

  // 一般工具另開目的地；群組工具開啟文字選單。首頁與其他功能共用此入口。
  function toolLauncher(tool, className, isShortcut = false) {
    const launcher = element(tool.children ? 'button' : 'a', className);
    launcher.draggable = false;
    if (tool.children) {
      launcher.type = 'button';
      launcher.setAttribute('aria-haspopup', 'dialog');
      launcher.setAttribute('aria-controls', 'services-dialog');
    } else {
      externalLink(launcher, destination(tool));
    }
    launcher.addEventListener('click', event => {
      if (isShortcut && editing) {
        event.preventDefault();
        return;
      }
      if (tool.children) openServices(tool, launcher);
    });
    return launcher;
  }

  function openServices(tool, opener) {
    servicesOpener = opener;
    document.querySelector('#services-title').textContent = tool.name;
    const close = document.querySelector('#close-services');
    close.setAttribute('aria-label', `關閉${tool.name}`);
    close.title = `關閉${tool.name}`;
    const links = document.querySelector('#service-links');
    links.replaceChildren();
    tool.children.forEach(service => {
      const item = element('li');
      const link = externalLink(element('a', '', service.name), destination(service));
      link.title = `${service.name}（在新分頁開啟）`;
      item.append(link);
      links.append(item);
    });
    servicesDialog.showModal();
    links.querySelector('a').focus();
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
      // 已儲存於此瀏覽器：首頁暫不顯示儲存狀態說明。
    } catch {
      // 瀏覽器無法儲存，設定僅保留於本次瀏覽：首頁暫不顯示儲存狀態說明。
    }
  }

  function announce(message) {
    const toast = document.querySelector('#toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
  }

  // DOM 順序就是由左至右、再由上至下的順序；其他功能固定在最後。
  function toolColumnCount() {
    const width = grid.clientWidth;
    return width >= 590 ? 4 : width >= 410 ? 3 : 2;
  }

  function updateGridLayout() {
    const columns = toolColumnCount();
    grid.style.setProperty('--tool-columns', columns);
    grid.style.setProperty('--tool-rows', Math.ceil((favorites.length + 1) / columns));
  }

  function renderTools() {
    homeImages.reset();
    grid.replaceChildren();
    const firstRowCount = toolColumnCount();
    favorites.forEach((id, index) => {
      const tool = toolsById.get(id);
      const item = element('li', 'tool-item');
      item.dataset.id = id;
      item.draggable = editing;

      const link = toolLauncher(tool, 'tool-link', true);
      link.setAttribute('aria-describedby', `tip-${id}`);
      if (editing) link.setAttribute('aria-label', `${tool.name}，編輯模式，請使用前移或後移按鈕排序`);
      const art = element('span', 'tool-art');
      const image = element('img');
      // 第一排立即載入，其餘圖示進入畫面附近才開始下載。
      homeImages.prepare(image, `assets/icons/${tool.icon}`, index < firstRowCount);
      image.alt = '';
      image.draggable = false;
      art.append(image);
      link.append(art, element('span', 'tool-name', tool.name));
      const actionHint = tool.children ? '（開啟服務選單）' : tool.screenshot ? '（開啟系統截圖）' : '（另開網站）';
      const tip = element('span', 'tool-tooltip', `${tool.tip}${actionHint}`);
      tip.id = `tip-${id}`;
      tip.setAttribute('role', 'tooltip');

      const remove = element('button', 'remove-tool');
      remove.type = 'button';
      remove.setAttribute('aria-label', `移除${tool.name}`);
      remove.title = `移除${tool.name}（可從其他功能重新加入）`;
      remove.addEventListener('click', () => {
        favorites = favorites.filter(value => value !== id);
        saveFavorites();
        renderTools();
        const nextItem = grid.children[Math.min(index, favorites.length)];
        (nextItem.querySelector('.remove-tool') || nextItem.querySelector('button')).focus();
        announce(`已移除「${tool.name}」，可從其他功能重新加入。`);
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
    addButton.setAttribute('aria-label', '其他功能');
    addButton.title = '瀏覽其他功能，直接開啟服務或加入快捷';
    const addArt = element('span', 'tool-art add-art');
    addArt.setAttribute('aria-hidden', 'true');
    addArt.append(element('span', 'add-symbol', '+'));
    addButton.append(addArt, element('span', 'tool-name', '其他功能'));
    addButton.setAttribute('aria-haspopup', 'dialog');
    addButton.addEventListener('click', () => {
      search.value = '';
      renderCatalog();
      dialog.showModal();
      catalogImages.observe();
      search.focus();
    });
    addItem.append(addButton);
    grid.append(addItem);
    // `${favorites.length} 個常用工具`：首頁暫不顯示工具數量。
    updateGridLayout();
    homeImages.observe();
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
    catalogImages.reset();
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
        const launcher = toolLauncher(tool, 'catalog-launch');
        launcher.title = tool.children ? '開啟服務選單' : '在新分頁開啟';
        const image = element('img');
        catalogImages.prepare(image, `assets/icons/${tool.icon}`);
        image.alt = '';
        const copy = element('div', 'catalog-copy');
        copy.append(element('strong', '', tool.name), element('p', '', tool.tip));
        const added = favorites.includes(tool.id);
        const button = element('button', 'catalog-add', added ? '已加入' : '＋ 快捷');
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
        launcher.append(image, copy);
        row.append(launcher, button);
        section.append(row);
      });
      catalog.append(section);
    });
    if (!resultCount) catalog.append(element('p', 'empty-search', '找不到符合的工具，請試試其他關鍵字。'));
    if (dialog.open) catalogImages.observe();
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
  dialog.addEventListener('close', () => {
    catalogImages.reset();
    document.querySelector('#add-tool').focus();
  });
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

  document.querySelector('#close-services').addEventListener('click', () => servicesDialog.close());
  servicesDialog.addEventListener('close', () => {
    // 從其他功能開啟時，關閉子選單只返回原視窗，不關閉其他功能。
    if (servicesOpener?.isConnected) servicesOpener.focus();
    servicesOpener = null;
  });
  servicesDialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      servicesDialog.close();
    }
  });
  servicesDialog.addEventListener('click', event => {
    const bounds = servicesDialog.getBoundingClientRect();
    if (event.target === servicesDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) servicesDialog.close();
  });

  // 找到滑鼠最近的格子，讓圖示間的空隙也能接收拖放。
  // boundary 是原清單的插入間隙（0 到 length），不是交換兩個工具。
  function insertionAt(clientX, clientY) {
    let nearest = null;
    let nearestDistance = Infinity;
    Array.from(grid.children).forEach((item, index) => {
      const bounds = item.getBoundingClientRect();
      const dx = Math.max(bounds.left - clientX, 0, clientX - bounds.right);
      const dy = Math.max(bounds.top - clientY, 0, clientY - bounds.bottom);
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        const after = Boolean(item.dataset.id) && clientX >= bounds.left + bounds.width / 2;
        nearest = { item, boundary: index + (after ? 1 : 0), after };
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function clearInsertionMarker() {
    grid.querySelectorAll('.insert-before, .insert-after').forEach(item => item.classList.remove('insert-before', 'insert-after'));
  }

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
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    clearInsertionMarker();
    const insertion = insertionAt(event.clientX, event.clientY);
    if (insertion) insertion.item.classList.add(insertion.after ? 'insert-after' : 'insert-before');
  });
  grid.addEventListener('drop', event => {
    if (!editing || !draggedId) return;
    event.preventDefault();
    const insertion = insertionAt(event.clientX, event.clientY);
    if (insertion) {
      const sourceIndex = favorites.indexOf(draggedId);
      // 先移除來源後，其右側的插入間隙索引會少一。
      const targetIndex = insertion.boundary - (sourceIndex < insertion.boundary ? 1 : 0);
      moveTool(draggedId, targetIndex);
    }
    clearDragState();
  });
  function clearDragState() {
    draggedId = null;
    clearInsertionMarker();
    grid.querySelectorAll('.is-dragging').forEach(item => item.classList.remove('is-dragging'));
  }
  grid.addEventListener('dragleave', event => {
    if (!grid.contains(event.relatedTarget)) clearInsertionMarker();
  });
  grid.addEventListener('dragend', clearDragState);

  function renderCalendar() {
    const calendar = data.calendar;
    const month = activeCalendarMonth;
    const monthConfig = calendar.months?.[month];
    const events = monthConfig?.events ?? calendar.events;
    const firstWeek = monthConfig?.firstWeek ?? calendar.firstWeek;
    const table = document.querySelector('#month-calendar');
    document.querySelector('.month-number').textContent = month;
    document.querySelector('.year-label').textContent = calendar.year;
    document.querySelector('.semester-label').textContent = calendar.semester;
    table.querySelector('caption').textContent = `${calendar.year} 年 ${month} 月學校行事曆，左欄為學期週次`;
    table.querySelectorAll('thead, tbody').forEach(section => section.remove());
    const previousMonth = document.querySelector('#month-prev');
    const nextMonth = document.querySelector('#month-next');
    // 顯示月份可跨年；可否切換仍由目前已提供的月份資料決定。
    const previousLabel = month === 1 ? 12 : month - 1;
    const nextLabel = month === 12 ? 1 : month + 1;
    previousMonth.textContent = `${previousLabel}月`;
    nextMonth.textContent = `${nextLabel}月`;
    previousMonth.disabled = !calendar.months?.[month - 1];
    nextMonth.disabled = !calendar.months?.[month + 1];
    previousMonth.setAttribute('aria-label', `切換至 ${previousLabel} 月`);
    nextMonth.setAttribute('aria-label', `切換至 ${nextLabel} 月`);
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
    const firstDay = new Date(calendar.year, month - 1, 1).getDay();
    const dayCount = new Date(calendar.year, month, 0).getDate();
    const today = new Date();
    const eventRows = new Map();
    const eventDays = new Map();
    const holidayDays = new Set();
    const examDays = new Set();
    const markedDays = new Set();
    events.forEach((event, index) => {
      const rowId = event.id || `event-${event.day}${events.filter(item => item.day === event.day).length > 1 ? `-${index}` : ''}`;
      eventRows.set(event, rowId);
      const lastDay = event.endDay || event.day;
      for (let day = event.day; day <= lastDay; day++) {
        if (event.holiday) holidayDays.add(day);
        // 一般區間只標首尾；考試期間每天顯示深色底。
        if (!event.exam && day !== event.day && day !== lastDay) continue;
        if (!eventDays.has(day)) eventDays.set(day, []);
        eventDays.get(day).push(event);
        if (event.exam) examDays.add(day);
        else markedDays.add(day);
      }
    });
    for (let row = 0; row < Math.ceil((firstDay + dayCount) / 7); row++) {
      const weekRow = element('tr');
      const week = element('th', 'week-number', firstWeek + row);
      week.scope = 'row';
      week.setAttribute('aria-label', `第 ${firstWeek + row} 週`);
      weekRow.append(week);
      for (let column = 0; column < 7; column++) {
        const day = row * 7 + column - firstDay + 1;
        const cell = element('td');
        if (day > 0 && day <= dayCount) {
          const dayEvents = eventDays.get(day) || [];
          const hasEvent = dayEvents.length > 0;
          const date = element(hasEvent ? 'button' : 'span', 'day-number', day);
          if (column === 0 || column === 6) date.classList.add('is-weekend');
          if (holidayDays.has(day)) date.classList.add('is-holiday');
          if (examDays.has(day)) date.classList.add('is-exam');
          if (markedDays.has(day)) date.classList.add('has-event-dot');
          if (today.getFullYear() === calendar.year && today.getMonth() + 1 === month && today.getDate() === day) date.setAttribute('aria-current', 'date');
          if (hasEvent) {
            date.type = 'button';
            date.setAttribute('aria-label', `${month} 月 ${day} 日，查看重要日程`);
            date.setAttribute('aria-pressed', 'false');
            date.setAttribute('aria-controls', dayEvents.map(event => eventRows.get(event)).join(' '));
            date.addEventListener('click', () => {
              const select = date.getAttribute('aria-pressed') !== 'true';
              table.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', 'false'));
              document.querySelectorAll('.agenda > li').forEach(item => item.classList.remove('is-highlighted'));
              date.setAttribute('aria-pressed', String(select));
              dayEvents.forEach(event => document.getElementById(eventRows.get(event)).classList.toggle('is-highlighted', select));
              if (select) {
                const agenda = document.querySelector('#agenda');
                const firstMatch = document.getElementById(eventRows.get(dayEvents[0]));
                agenda.scrollTop = firstMatch.offsetTop - 5;
              }
              if (select) announce(`${month} 月 ${day} 日：${dayEvents.flatMap(event => event.items.map(item => item.text)).join('、')}`);
            });
          }
          cell.append(date);
        }
        weekRow.append(cell);
      }
      body.append(weekRow);
    }
    table.append(body);
    const agenda = document.querySelector('#agenda');
    agenda.replaceChildren();
    agenda.scrollTop = 0;
    events.forEach(event => {
      const row = element('li');
      row.id = eventRows.get(event);
      if (event.holiday) row.classList.add('is-holiday');
      const endDay = event.endDay || event.day;
      const dateText = `${month}.${String(event.day).padStart(2, '0')}（${event.weekday}）${endDay !== event.day ? `～${month}.${String(endDay).padStart(2, '0')}（${event.endWeekday}）` : ''}`;
      // 三個獨立欄位共用 CSS gap，避免文字空白與 margin 造成間距不一致。
      const date = element('div', 'agenda-date');
      date.append(element('span', 'agenda-date-label', dateText), element('span', 'agenda-week', `第 ${event.week} 週`));
      if (event.deadline) {
        const deadline = element('span', 'deadline-tag', '截止');
        deadline.title = `${month} 月 ${endDay} 日截止`;
        date.append(deadline);
      }
      const items = element('div', 'agenda-items');
      event.items.forEach(item => {
        const link = destination(item) || (item.toolId ? destination(toolsById.get(item.toolId)) : null);
        items.append(link ? externalLink(element('a', '', `${item.text} ↗`), link) : element('span', '', item.text));
      });
      row.append(date, items);
      agenda.append(row);
    });
    document.querySelector('#google-calendar').href = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendar.calendarId)}`;
    document.querySelector('#google-calendar').title = '在 Google 日曆訂閱政大校曆，需登入 Google 帳號';
    document.querySelector('#official-calendar').href = calendar.officialUrl;
  }

  document.querySelector('#month-prev').addEventListener('click', () => {
    if (data.calendar.months?.[activeCalendarMonth - 1]) {
      activeCalendarMonth--;
      renderCalendar();
    }
  });
  document.querySelector('#month-next').addEventListener('click', () => {
    if (data.calendar.months?.[activeCalendarMonth + 1]) {
      activeCalendarMonth++;
      renderCalendar();
    }
  });

  renderTools();
  renderCalendar();
  // 公告輪播移至 announcements.js，資料載入失敗不影響其他區塊。
  new ResizeObserver(updateGridLayout).observe(grid);
})();
