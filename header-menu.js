/* 頁首功能：設定及登入歷史均為模擬，只有電話複製與資訊連結執行實際操作。
   不呼叫帳號服務、不寫入瀏覽器儲存空間；重新整理後恢復預設狀態。 */
(() => {
  'use strict';

  const personalDialog = document.querySelector('#personal-dialog');
  const emergencyDialog = document.querySelector('#emergency-dialog');
  const passwordForm = document.querySelector('#header-password-form');
  const feedbackTimers = new Map();

  function clearFeedback(dialog) {
    clearTimeout(feedbackTimers.get(dialog));
    feedbackTimers.delete(dialog);
    const status = dialog.querySelector('.header-feedback');
    if (!status) return;
    status.textContent = '';
    status.classList.remove('is-visible', 'is-error');
  }

  function showFeedback(dialog, message, isError = false) {
    clearFeedback(dialog);
    if (!dialog.open) return;
    const status = dialog.querySelector('.header-feedback');
    status.textContent = message;
    status.classList.toggle('is-error', isError);
    status.classList.add('is-visible');
    feedbackTimers.set(dialog, setTimeout(() => clearFeedback(dialog), 3000));
  }

  // 原生 dialog 處理焦點限制及 Escape；關閉時回到對應頁首按鈕。
  document.querySelectorAll('[data-header-dialog]').forEach(opener => {
    const dialog = document.getElementById(opener.dataset.headerDialog);
    opener.addEventListener('click', () => {
      clearFeedback(dialog);
      dialog.showModal();
    });
    dialog.querySelector('[data-header-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      clearFeedback(dialog);
      if (dialog === personalDialog) passwordForm.reset();
      opener.focus();
    });
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      const outside = event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (event.target === dialog && outside) dialog.close();
    });
  });

  // 密碼只比較兩個欄位，不保存輸入值；完成或關閉視窗便清空。
  passwordForm.addEventListener('submit', event => {
    event.preventDefault();
    const password = document.querySelector('#header-new-password');
    const confirmation = document.querySelector('#header-confirm-password');
    if (!password.value) {
      showFeedback(personalDialog, '請輸入新密碼', true);
      password.focus();
      return;
    }
    if (password.value !== confirmation.value) {
      showFeedback(personalDialog, '兩次輸入的密碼不一致', true);
      confirmation.focus();
      return;
    }
    passwordForm.reset();
    showFeedback(personalDialog, '已完成操作');
  });

  // 下拉選單保留本次頁面的選擇，不切換真實語言或啟動登出計時器。
  document.querySelector('#header-apply-settings').addEventListener('click', () => {
    showFeedback(personalDialog, '已套用');
  });

  document.querySelector('#header-account-form').addEventListener('submit', event => {
    event.preventDefault();
    const account = document.querySelector('#header-workspace-account');
    const button = document.querySelector('#header-link-account');
    const linked = button.getAttribute('aria-pressed') === 'true';
    if (!linked && !account.value.trim()) {
      showFeedback(personalDialog, '請輸入工作區帳號', true);
      account.focus();
      return;
    }
    account.readOnly = !linked;
    button.setAttribute('aria-pressed', String(!linked));
    button.textContent = linked ? '連結帳號' : '解除連結';
    showFeedback(personalDialog, '已完成操作');
  });

  // 使用文件示例用的網路位址，避免把模擬資料誤設為真實使用者紀錄。
  const historyExamples = [
    { daysAgo: 0, hour: 9, minute: 18, address: '192.0.2.18' },
    { daysAgo: 1, hour: 14, minute: 32, address: '198.51.100.24' },
    { daysAgo: 3, hour: 8, minute: 45, address: '192.0.2.18' },
    { daysAgo: 9, hour: 16, minute: 10, address: '203.0.113.12' },
    { daysAgo: 18, hour: 10, minute: 26, address: '198.51.100.24' },
    { daysAgo: 38, hour: 11, minute: 5, address: '192.0.2.18' }
  ];
  const historyRange = document.querySelector('#header-history-range');
  const historyRows = document.querySelector('#header-history-rows');
  const pad = value => String(value).padStart(2, '0');

  function renderHistory() {
    historyRows.replaceChildren();
    historyExamples.filter(item => historyRange.value === 'all' || item.daysAgo < Number(historyRange.value))
      .forEach(item => {
        const date = new Date();
        date.setDate(date.getDate() - item.daysAgo);
        date.setHours(item.hour, item.minute, 0, 0);
        const row = document.createElement('tr');
        const time = document.createElement('td');
        const address = document.createElement('td');
        time.textContent = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        address.textContent = item.address;
        row.append(time, address);
        historyRows.append(row);
      });
  }
  historyRange.addEventListener('change', renderHistory);
  renderHistory();

  async function copyPhoneNumber(number) {
    // HTTPS 優先使用 Clipboard API；直接開啟本機檔案時提供相容方式。
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(number);
        return true;
      } catch {
        // 瀏覽器拒絕時，繼續嘗試使用者點擊觸發的傳統複製方式。
      }
    }
    // textarea 必須放在目前的 dialog 內，否則會被原生模態視窗禁止聚焦。
    if (!emergencyDialog.open) return false;
    const buffer = document.createElement('textarea');
    buffer.className = 'header-copy-buffer';
    buffer.value = number;
    buffer.readOnly = true;
    buffer.setAttribute('aria-label', '複製電話號碼');
    emergencyDialog.append(buffer);
    try {
      buffer.focus();
      buffer.select();
      buffer.setSelectionRange(0, number.length);
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      buffer.remove();
    }
  }

  emergencyDialog.querySelectorAll('[data-copy-number]').forEach(button => {
    button.addEventListener('click', async () => {
      const copied = await copyPhoneNumber(button.dataset.copyNumber);
      showFeedback(emergencyDialog, copied ? '已複製號碼' : '無法複製，請選取號碼後手動複製', !copied);
      if (emergencyDialog.open) button.focus({ preventScroll: true });
    });
  });
})();
