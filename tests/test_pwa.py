from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import shutil

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
PARENT = ROOT.parent
SHOTS = ROOT / 'docs' / 'screenshots'
SHOTS.mkdir(parents=True, exist_ok=True)

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(PARENT)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
url = f'http://127.0.0.1:{server.server_port}/{ROOT.name}/'
results = []


def assert_equal(a, b):
    assert a == b, f'{a!r} != {b!r}'


def check(label, fn):
    fn()
    results.append(f'PASS: {label}')

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=shutil.which('chromium') or shutil.which('chromium-browser') or None, args=['--no-sandbox'] if shutil.which('chromium') else [])
        ctx = browser.new_context(viewport={'width': 1440, 'height': 1050}, device_scale_factor=1)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        response = page.goto(url, wait_until='networkidle')
        check('nested-path page returns 200', lambda: assert_equal(response.status, 200))
        check('page title', lambda: expect(page).to_have_title('Campus Planner · A simpler study day'))
        check('sample tasks appear', lambda: expect(page.get_by_text('Prepare WADe presentation')).to_be_visible())
        check('local starter count', lambda: expect(page.locator('#totalCount')).to_have_text('4'))
        page.wait_for_function('navigator.serviceWorker.controller !== null', timeout=15000)
        check('service worker controls page', lambda: assert_equal(page.evaluate('!!navigator.serviceWorker.controller'), True))
        cache_info = page.evaluate('async () => ({keys: await caches.keys(), entries: await (await caches.open("campus-planner-shell-v3")).keys().then(keys=>keys.map(x=>x.url))})')
        check('offline shell cached', lambda: assert_equal(len(cache_info['entries']) >= 9, True))
        manifest_response = page.request.get(url + 'manifest.webmanifest')
        manifest = manifest_response.json()
        check('web manifest served and has required icons', lambda: assert_equal({'192x192','512x512'}.issubset({i['sizes'] for i in manifest['icons']}), True))

        page.locator('#taskTitle').fill('Try offline testing')
        page.locator('#taskCategory').select_option('Assignment')
        page.locator('#taskPriority').select_option('High')
        page.get_by_role('button', name='Add task').click()
        check('new task is rendered', lambda: expect(page.get_by_text('Try offline testing')).to_be_visible())
        check('task total increments', lambda: expect(page.locator('#totalCount')).to_have_text('5'))
        page.reload(wait_until='networkidle')
        check('new task persists through reload', lambda: expect(page.get_by_text('Try offline testing')).to_be_visible())
        page.get_by_role('button', name='Complete task: Try offline testing').click()
        check('completion changes statistics', lambda: expect(page.locator('#doneCount')).to_have_text('2'))
        page.get_by_role('button', name='Completed', exact=True).click()
        check('completed filter shows completed task', lambda: expect(page.get_by_text('Try offline testing')).to_be_visible())
        check('completed filter hides unfinished task', lambda: expect(page.get_by_text('Review lecture notes')).to_have_count(0))
        page.get_by_role('button', name='All tasks', exact=True).click()
        page.get_by_role('button', name='Delete task: Try offline testing').click()
        check('deleting task removes it', lambda: expect(page.get_by_text('Try offline testing')).to_have_count(0))
        check('deleting returns total to four', lambda: expect(page.locator('#totalCount')).to_have_text('4'))

        page.screenshot(path=str(SHOTS/'campus-planner-desktop.png'), full_page=True)
        ctx.set_offline(True)
        page.reload(wait_until='domcontentloaded')
        check('app loads while offline', lambda: expect(page.get_by_text('Little steps.')).to_be_visible())
        check('sample tasks available offline', lambda: expect(page.get_by_text('Review lecture notes')).to_be_visible())
        page.locator('#taskTitle').fill('Offline-created task')
        page.get_by_role('button', name='Add task').click()
        page.reload(wait_until='domcontentloaded')
        check('new offline task survives reload', lambda: expect(page.get_by_text('Offline-created task')).to_be_visible())
        page.screenshot(path=str(SHOTS/'campus-planner-offline.png'), full_page=True)
        ctx.set_offline(False)
        page.reload(wait_until='networkidle')
        check('offline-created task remains after reconnecting', lambda: expect(page.get_by_text('Offline-created task')).to_be_visible())
        check('no uncaught JavaScript errors', lambda: assert_equal(errors, []))
        ctx.close()

        mobile = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
        mobile_page = mobile.new_page()
        mobile_page.goto(url, wait_until='networkidle')
        check('mobile layout has no horizontal overflow', lambda: assert_equal(mobile_page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), True))
        check('mobile add-task form visible', lambda: expect(mobile_page.locator('#taskTitle')).to_be_visible())
        mobile_page.screenshot(path=str(SHOTS/'campus-planner-mobile.png'), full_page=True)
        mobile.close()
        browser.close()
finally:
    server.shutdown()

print('\n'.join(results))
print(f'Completed {len(results)} browser checks against {url}')
