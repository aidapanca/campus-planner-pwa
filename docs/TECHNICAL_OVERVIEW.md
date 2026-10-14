# Campus Planner: Technical overview

This is a study-oriented technical explanation designed for the WADe **Developing PWAs** presentation.

## 1. Regular website

`index.html` provides a semantic application shell. `styles.css` makes it responsive. `app.js` manages task data and browser interactions. This is ordinary web application development, independent of any framework.

## 2. Manifest = app identity and display

`index.html` links `manifest.webmanifest` using `<link rel="manifest">`. Its main members are:

- `id`: stable application identity within the installation scope.
- `name` / `short_name`: human-readable names.
- `start_url`: the URL opened when the installed PWA launches.
- `scope`: the area of the website intended to belong to the application.
- `display: "standalone"`: asks supporting systems to show the app in a dedicated window.
- `icons`: 192px, 512px and a maskable 512px icon.
- `screenshots`: desktop (`wide`) and mobile (`narrow`) interface previews for supporting browsers' expanded install dialogs. These screenshots do not affect offline behavior.
- `theme_color` / `background_color`: install/display hints for supporting browsers.

The manifest **does not implement offline mode**. A Service Worker is **not always mandatory for installability**, but browser-specific conditions still apply. HTTPS (or localhost for development) is required to use the relevant secure-context features.

MDN: [Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [Web app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Reference).

## 3. Service Worker = independently running event handler

`app.js` registers `./service-worker.js`, using relative URLs so the app works in a repository subpath. The Service Worker cannot directly edit the DOM and is not a continuously running thread. The browser controls its lifetime.

| Event | Implementation |
| --- | --- |
| `install` | `caches.open(CACHE_NAME)`, `cache.addAll(APP_SHELL)`, and `skipWaiting()` |
| `activate` | Delete obsolete `campus-planner-shell-*` caches, then `clients.claim()` |
| `fetch` (navigation) | Try network; fall back to the cached `index.html` if the network fails |
| `fetch` (static assets) | Try cache first; fall back to network if missing |

The **first visit must be online** so the app shell can be cached. Offline refresh is reliable only after the Service Worker is active and controlling the page.

MDN: [Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation).

## 4. Cache Storage is not task storage

- **Cache Storage:** stores the app shell: HTML, CSS, JS, manifest and icons. In this demo it is managed by the Service Worker.
- **localStorage:** stores an array of task objects as JSON. A new task or completion change is saved synchronously to browser storage. Unlike a remote database, this is **not synchronized between devices**.
- **IndexedDB:** a more suitable browser database for large/complex structured data; not required for this simple app.

MDN: [Caching](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching).

## 5. Task data model

Example (illustrative, not real student data):

```json
{
  "id": "unique-task-id",
  "title": "Prepare WADe presentation",
  "category": "Assignment",
  "due": "2026-10-13",
  "priority": "High",
  "completed": false,
  "createdAt": 1790000000000
}
```

The app renders titles using `textContent`, not by inserting untrusted HTML into the DOM. This avoids interpretation of user-entered task names as HTML markup.

## 6. Performance, accessibility, progressive enhancement

- The interface has semantic headings, labels, a skip link, focus indicators, meaningful buttons and an accessible install dialog.
- The layout adapts to desktop and mobile widths.
- No fonts, libraries or images are downloaded from third-party servers.
- The app remains usable as an ordinary website even if Service Workers are unsupported; offline support will then be unavailable.
- The native install prompt is optional; a generic instruction dialog provides a fallback.

This project is intentionally limited in scope. Background Sync, Push, Notifications, Web Share, Badging, file handling and several other features are documented in MDN but not implemented in Campus Planner.

## 7. Cache updates

Cache-first assets are served from the old shell until a new Service Worker version installs. Update `CACHE_VERSION` in `service-worker.js` whenever the files being precached change. The new worker deletes older caches during activation.

`skipWaiting()` and `clients.claim()` simplify a classroom demo but can cause an update to start controlling an already open tab. A production application should carefully coordinate app-shell updates with its active sessions.
