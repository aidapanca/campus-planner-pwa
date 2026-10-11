"""Dependency-free static and HTTP serving checks for Campus Planner.
Run: python tests/test_static.py
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from urllib.request import urlopen
from html.parser import HTMLParser
import json
import struct
import urllib.parse

ROOT=Path(__file__).resolve().parents[1]

class AssetLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('script','link'):
            url=a.get('src') or a.get('href')
            if url and url.startswith('./'):
                self.assets.append(url)

page=(ROOT/'index.html').read_text(encoding='utf8')
parser=AssetLinks();parser.feed(page)
all_urls=parser.assets+['./service-worker.js']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf8'))
all_urls.extend(icon['src'] for icon in manifest['icons'])
for link in all_urls:
    assert (ROOT/link).exists(), f'Missing local asset: {link}'
print('PASS referenced HTML and manifest assets exist:',len(all_urls))
assert manifest['display']=='standalone'
assert manifest['start_url']=='./'
assert manifest['scope']=='./'
assert {'192x192','512x512'}.issubset({i['sizes'] for i in manifest['icons']})
print('PASS manifest main values and icons')
for icon in manifest['icons']:
    data=(ROOT/icon['src']).read_bytes()
    assert data[:8]==b'\x89PNG\r\n\x1a\n'
    dims=struct.unpack('>II',data[16:24])
    requested=tuple(int(x) for x in icon['sizes'].split('x'))
    assert dims==requested, (icon['src'],dims,requested)
print('PASS PNG binary dimensions match manifest')

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),lambda *args,**kwargs:QuietHandler(*args,directory=str(ROOT.parent),**kwargs))
Thread(target=server.serve_forever,daemon=True).start()
try:
    base=f'http://127.0.0.1:{server.server_port}/{ROOT.name}/'
    for asset in ['']+all_urls:
        link=urllib.parse.urljoin(base,asset)
        with urlopen(link,timeout=5) as r:
            assert r.status==200, (link,r.status)
            assert len(r.read())>0, link
    print('PASS built-in Python HTTP server serves nested-path app and all referenced assets:',len(all_urls)+1)
finally:
    server.shutdown()
