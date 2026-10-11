"""UI smoke tests/preview without network access.

Uses real index.html, styles.css and app.js source injected into an about:blank page.
This tests the DOM/UI and creates previews. It does NOT test actual Service Workers,
manifest-based installation, HTTP hosting or true offline network behavior.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT/'docs'/'screenshots'
SHOTS.mkdir(exist_ok=True,parents=True)
html=(ROOT/'index.html').read_text(encoding='utf8')
html=re.sub(r'<script src="\./app\.js" defer></script>','',html)
html=re.sub(r'<link rel="stylesheet" href="\./styles\.css">','',html)
css=(ROOT/'styles.css').read_text(encoding='utf8')
js=(ROOT/'app.js').read_text(encoding='utf8')
MOCK_STORE='''() => {
 const data = new Map();
 Object.defineProperty(window, 'localStorage', { configurable: true, value: {
   getItem: key => data.has(key) ? data.get(key) : null,
   setItem: (key, value) => data.set(key, String(value)),
   removeItem: key => data.delete(key),
   clear: () => data.clear()
 }});
}'''

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for label, viewport in [('desktop',{'width':1440,'height':1050}),('mobile',{'width':390,'height':844})]:
        page=browser.new_page(viewport=viewport, device_scale_factor=1)
        page.set_content(html,wait_until='domcontentloaded')
        page.add_style_tag(content=css)
        page.evaluate(MOCK_STORE)
        page.add_script_tag(content=js)
        expect(page.locator('#totalCount')).to_have_text('4')
        expect(page.get_by_text('Prepare WADe presentation')).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'horizontal overflow'
        print('PASS',label,'initial view, counts, responsive layout')
        page.screenshot(path=str(SHOTS/f'campus-planner-{label}-preview.png'), full_page=True)
        page.locator('#taskTitle').fill('Build our PWA')
        page.get_by_role('button',name='Add task').click()
        expect(page.get_by_text('Build our PWA')).to_be_visible()
        expect(page.locator('#totalCount')).to_have_text('5')
        page.get_by_role('button',name='Complete task: Build our PWA').click()
        expect(page.locator('#doneCount')).to_have_text('2')
        page.get_by_role('button',name='Completed', exact=True).click()
        expect(page.get_by_text('Build our PWA')).to_be_visible()
        expect(page.get_by_text('Review lecture notes')).to_have_count(0)
        page.get_by_role('button',name='All tasks',exact=True).click()
        page.get_by_role('button',name='Delete task: Build our PWA').click()
        expect(page.locator('#totalCount')).to_have_text('4')
        print('PASS',label,'add, complete, filter, delete (in-memory mocked storage)')
        assert page.evaluate('JSON.parse(localStorage.getItem("campus-planner-tasks-v1")).length') == 4
        print('PASS',label,'storage writes through mock')
        page.close()
    browser.close()
print('PASS UI preview checks; not a live PWA or offline test')
