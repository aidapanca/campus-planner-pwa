/* Campus Planner service worker. Change CACHE_VERSION when updating app-shell files. */
const CACHE_VERSION = 'v3';
const CACHE_NAME = `campus-planner-shell-${CACHE_VERSION}`;
const CACHE_PREFIX = 'campus-planner-shell-';

// All URLs are relative to this service worker's location, so GitHub Pages
// project subpaths (https://user.github.io/repository/) work without edits.
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Installation fails rather than silently delivering an incomplete offline shell.
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Only cache requests inside this app's own scope.
  if (!url.href.startsWith(self.registration.scope)) return;

  if (request.mode === 'navigate') {
    // NETWORK FIRST: fresh HTML online, cached app shell offline.
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put('./index.html', response.clone());
        }
        return response;
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
        return Response.error();
      }
    })());
    return;
  }

  // CACHE FIRST: app-shell static assets; refresh by bumping CACHE_VERSION.
  // Unrecognized requests remain network-only rather than filling the cache.
  const pathname = url.pathname;
  const isStatic = /\.(?:css|js|webmanifest|svg|png)$/i.test(pathname);
  if (!isStatic) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
