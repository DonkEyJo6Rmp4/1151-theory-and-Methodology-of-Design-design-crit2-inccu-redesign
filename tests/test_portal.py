"""瀏覽器驗收：先啟動靜態網站，再以 python tests/test_portal.py 執行。

環境：pip install playwright && playwright install chromium
可用 PORTAL_URL 指定預覽網址；預設 http://127.0.0.1:4173/。
"""
import os
from pathlib import Path
from urllib.parse import unquote

from playwright.sync_api import expect, sync_playwright


URL = os.environ.get('PORTAL_URL', 'http://127.0.0.1:4173/')
ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / 'test-results'
RESULTS.mkdir(exist_ok=True)


def order(page):
    return page.locator('#tool-grid > [data-id]').evaluate_all(
        '(items) => items.map(item => item.dataset.id)'
    )


def no_horizontal_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'頁面產生橫向捲動：{page.viewport_size}'


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, locale='zh-TW')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL, wait_until='networkidle')
    expect(page.locator('#tool-grid > [data-id]')).to_have_count(11)
    no_horizontal_overflow(page)
    assert page.locator('img').evaluate_all('(images) => images.every(image => image.complete && image.naturalWidth > 0)'), '圖片載入失敗'

    # 每一個設定的圖示、截圖都有實體檔案，外部網址保留 HTTPS。
    for tool in page.evaluate('PORTAL_DATA.tools'):
        assert (ROOT / 'assets/icons' / tool['icon']).is_file()
        if 'screenshot' in tool:
            image_url = 'assets/screenshots/' + tool['screenshot']
            assert (ROOT / image_url).is_file()
        elif 'children' in tool:
            for child in tool['children']:
                if 'screenshot' in child:
                    assert (ROOT / 'assets/screenshots' / child['screenshot']).is_file()
                else:
                    assert child['url'].startswith('https://')
        else:
            assert tool['url'].startswith('https://')
    for event in page.evaluate('PORTAL_DATA.calendar.events'):
        for item in event['items']:
            if 'screenshot' in item:
                assert (ROOT / 'assets/screenshots' / item['screenshot']).is_file()

    # 先往右排列，再往下；灰色其他功能位於最後。
    boxes = page.locator('#tool-grid > li').evaluate_all('(items) => items.map(item => { const r = item.getBoundingClientRect(); return {x:r.x,y:r.y}; })')
    columns = int(page.locator('#tool-grid').evaluate('(grid) => getComputedStyle(grid).getPropertyValue("--tool-columns")'))
    assert boxes[0]['x'] < boxes[1]['x'] and boxes[0]['y'] == boxes[1]['y']
    assert boxes[columns]['x'] == boxes[0]['x'] and boxes[columns]['y'] > boxes[0]['y']
    expect(page.locator('#tool-grid > li').last).to_have_class('tool-item add-tool')
    page.screenshot(path=str(RESULTS / 'desktop.png'), full_page=True)

    # 滑鼠與鍵盤提示、真正開啟系統截圖。
    page.locator('[data-id="grades"] .tool-link').hover()
    expect(page.locator('#tip-grades')).to_be_visible()
    with page.expect_popup() as popup_info:
        page.locator('[data-id="grades"] .tool-link').click()
    popup = popup_info.value
    popup.wait_for_load_state()
    assert unquote(popup.url).endswith(page.evaluate('PORTAL_DATA.tools.find(tool => tool.id === "grades").screenshot'))
    popup.close()

    # 新增、搜尋、分類、避免重複新增，以及重新整理後仍保留。
    page.get_by_role('button', name='其他功能', exact=True).click()
    expect(page.locator('#add-dialog')).to_be_visible()
    expect(page.locator('#tool-catalog h3')).to_have_text(['校務入口', '學術服務', '財務服務', '資訊服務'])
    page.screenshot(path=str(RESULTS / 'add-tools.png'), full_page=True)
    page.get_by_role('searchbox').fill('不利處境')
    page.get_by_role('button', name='新增不利處境學生助學金申請', exact=True).click()
    expect(page.get_by_role('button', name='已加入不利處境學生助學金申請', exact=True)).to_be_disabled()
    page.keyboard.press('Escape')
    expect(page.locator('#add-tool')).to_be_focused()
    expect(page.locator('[data-id="aid"]')).to_have_count(1)
    page.reload(wait_until='networkidle')
    assert order(page)[-1] == 'aid'

    # 目錄的圖文可直接開啟，不必先加入快捷；已加入的服務仍能開啟。
    page.locator('#add-tool').click()
    page.get_by_role('searchbox').fill('校務建言')
    launch = page.locator('#tool-catalog .catalog-launch')
    expect(launch.locator('img')).to_have_count(1)
    expect(launch.locator('strong')).to_have_text('校務建言')
    with page.expect_popup() as popup_info:
        launch.locator('img').click()
    popup = popup_info.value
    popup.wait_for_load_state()
    assert unquote(popup.url).endswith('校務建言截圖.png')
    popup.close()
    assert 'feedback' not in order(page)

    # 宿舍文字選單可從目錄或首頁開啟，關閉後回到原入口。
    page.get_by_role('searchbox').fill('宿舍')
    dorm_launch = page.locator('#tool-catalog .catalog-launch')
    dorm_launch.locator('strong').click()
    expect(page.locator('#services-dialog')).to_be_visible()
    expect(page.locator('#service-links a')).to_have_count(5)
    expect(page.locator('#service-links img')).to_have_count(0)
    children = page.evaluate('PORTAL_DATA.tools.find(tool => tool.id === "dorm").children')
    for index, child in enumerate(children):
        assert unquote(page.locator('#service-links a').nth(index).get_attribute('href')).endswith(child['screenshot'])
    page.keyboard.press('Escape')
    expect(page.locator('#services-dialog')).not_to_be_visible()
    expect(page.locator('#add-dialog')).to_be_visible()
    expect(dorm_launch).to_be_focused()
    page.get_by_role('button', name='新增宿舍統一入口', exact=True).click()
    page.keyboard.press('Escape')
    page.locator('[data-id="dorm"] .tool-link').click()
    page.get_by_role('button', name='關閉宿舍統一入口', exact=True).click()
    expect(page.locator('[data-id="dorm"] .tool-link')).to_be_focused()

    # 編輯、搖晃、前移／後移、拖曳及移除。
    page.get_by_role('button', name='調整排序').click()
    expect(page.locator('#edit-tools')).to_have_attribute('aria-pressed', 'true')
    expect(page.get_by_role('button', name='移除我的課表', exact=True)).to_be_visible()
    assert page.locator('[data-id="timetable"] .tool-art').evaluate('(e) => getComputedStyle(e).animationName') == 'jiggle'
    page.get_by_role('button', name='前移我的課表', exact=True).click()
    assert order(page)[0] == 'timetable'
    target_box = page.locator('[data-id="grades"]').bounding_box()
    page.locator('[data-id="web"]').drag_to(page.locator('[data-id="grades"]'), target_position={'x': target_box['width'] * .75, 'y': 50})
    assert order(page)[:3] == ['timetable', 'grades', 'web']
    page.screenshot(path=str(RESULTS / 'edit-tools.png'), full_page=True)
    page.get_by_role('button', name='移除不利處境學生助學金申請', exact=True).click()
    expect(page.locator('[data-id="aid"]')).to_have_count(0)
    page.get_by_role('button', name='完成編輯').click()
    expect(page.get_by_role('button', name='移除我的課表', exact=True)).to_be_hidden()
    page.reload(wait_until='networkidle')
    assert order(page)[:3] == ['timetable', 'grades', 'web']

    # 月曆日期、週次、重要事項以及 Google 訂閱連結。
    expect(page.locator('.week-number')).to_have_text(['9', '10', '11', '12', '13'])
    expect(page.locator('.day-number')).to_have_count(30)
    page.get_by_role('button', name='11 月 13 日，查看重要日程').click()
    expect(page.locator('#event-13')).to_have_class('is-highlighted')
    expect(page.locator('#event-13 a').first).to_have_attribute('href', 'https://selectcourse.nccu.edu.tw/regcourse/')
    assert '輔系雙主修申請修讀放棄修讀系統截圖.png' in unquote(page.locator('#event-20 a').get_attribute('href'))
    assert 'cid=acanccu%40gmail.com' in page.locator('#google-calendar').get_attribute('href')

    # 新聞前後切換、圓點切頁及整張卡片連結。
    page.get_by_role('button', name='下一則資訊').click()
    expect(page.locator('#news-position')).to_have_text('02 / 03')
    page.get_by_role('button', name='上一則資訊').click()
    expect(page.locator('#news-position')).to_have_text('01 / 03')
    page.get_by_role('button', name='上一則資訊').click()
    expect(page.locator('#news-position')).to_have_text('03 / 03')
    page.get_by_role('button', name='第 2 則：重要資訊').click()
    expect(page.locator('#news-position')).to_have_text('02 / 03')
    page.locator('#news-image').click()
    expect(page.locator('#article-title')).to_have_text('重要的消息，不再錯過。')
    page.get_by_role('link', name='← 回到首頁').click()

    # 各個響應式斷點，確保月份與工具區沒有超出頁面。
    for width in [1766, 1280, 1024, 850, 768, 390, 320]:
        page.set_viewport_size({'width': width, 'height': 900})
        page.wait_for_timeout(120)
        no_horizontal_overflow(page)
    page.set_viewport_size({'width': 390, 'height': 844})
    page.screenshot(path=str(RESULTS / 'mobile.png'), full_page=True)
    page.get_by_role('button', name='其他功能', exact=True).click()
    page.get_by_role('searchbox').fill('VPN')
    page.get_by_role('button', name='新增VPN', exact=True).click()
    page.get_by_role('button', name='關閉其他功能').click()
    expect(page.locator('[data-id="vpn"]')).to_have_count(1)

    # 減少動態效果、空清單、未知 ID、儲存損毀與儲存被封鎖。
    page.emulate_media(reduced_motion='reduce')
    page.get_by_role('button', name='調整排序').click()
    assert page.locator('[data-id="web"] .tool-art').evaluate('(e) => getComputedStyle(e).animationName') == 'none'
    page.evaluate('localStorage.setItem(PORTAL_DATA.storageKey, "[]")')
    page.reload(wait_until='networkidle')
    expect(page.locator('#tool-grid > li')).to_have_count(1)
    page.evaluate('localStorage.setItem(PORTAL_DATA.storageKey, JSON.stringify(["web", "web", "missing"]))')
    page.reload(wait_until='networkidle')
    assert order(page) == ['web']
    page.evaluate('localStorage.setItem(PORTAL_DATA.storageKey, "broken-json")')
    page.reload(wait_until='networkidle')
    assert len(order(page)) == 11

    blocked = context.new_page()
    blocked.add_init_script("Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };")
    blocked.goto(URL, wait_until='networkidle')
    blocked.get_by_role('button', name='其他功能', exact=True).click()
    blocked.get_by_role('searchbox').fill('VPN')
    blocked.get_by_role('button', name='新增VPN', exact=True).click()
    expect(blocked.locator('#save-state')).to_contain_text('設定僅保留於本次瀏覽')
    blocked.close()

    # 真正的觸控瀏覽器情境，使用可點擊的排序按鈕。
    touch_context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    touch = touch_context.new_page()
    touch.goto(URL, wait_until='networkidle')
    touch.get_by_role('button', name='調整排序').tap()
    touch.get_by_role('button', name='前移我的課表', exact=True).tap()
    assert order(touch)[0] == 'timetable'
    touch_context.close()

    assert not errors, errors
    browser.close()
    print('PASS: 素材、截圖、新增、排序、拖曳、移除、儲存、月曆、輪播、7 種寬度、觸控與減少動態效果。')
    print(f'畫面截圖：{RESULTS}')
