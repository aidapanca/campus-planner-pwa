# Campus Planner – Progressive Web App

A lightweight study task planner built with HTML, CSS, and JavaScript. Campus Planner can be installed on supported devices and works with cached application resources when a network connection is unavailable.

**Authors:** Aida-Gabriela Pâncă and Maria Ciorâțanu  
**Course:** Web Application Development (WADe)  
**Year:** 2026

## Features

- Add tasks with a category, optional due date, and priority.
- Mark tasks as completed, delete tasks, and filter tasks by status.
- Display task counts and completion progress.
- Store task data in the current browser using `localStorage`.
- Adapt the layout to desktop and mobile screens.
- Install the app on supported devices using a Web App Manifest.
- Cache core application resources with a Service Worker for offline use.
- Restore the four example tasks using the reset button.

No account, backend, build process, or third-party dependencies are required.

## Getting started

Open the project directory in a terminal and run:

```powershell
py -m http.server 8000
```

Then open **http://localhost:8000/** in Chrome or Edge. If the `py` command is unavailable, use `python -m http.server 8000`.

The application should be accessed through `localhost` or HTTPS rather than a `file://` URL, because Service Workers require a secure context.

For installation, offline tests, and browser checks, see [INSTRUCTIONS.md](INSTRUCTIONS.md).

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Interface markup and manifest link |
| `styles.css` | Styling and responsive layout |
| `app.js` | Task management, browser storage, installation support, and Service Worker registration |
| `manifest.webmanifest` | Application identity, icons, and display settings |
| `service-worker.js` | Offline resource caching and cache updates |
| `icons/` | Application icons |
| `docs/` | Technical notes, demo walkthrough, test plan, and screenshots |
| `tests/` | Static checks, Service Worker tests, and browser test scripts |

## How offline support works

The Web App Manifest provides metadata for installation. The Service Worker caches the application shell and can serve cached files when the server is unreachable. Task data is stored separately in `localStorage` and remains available in the same browser profile after refresh.

The application does not sync tasks across devices. Background Sync, push notifications, file handling, and other advanced PWA APIs are not implemented in this project.

The `Online`/`Offline mode` indicator reflects the browser's reported connection state; it does not independently test access to the server.

## Testing

The project includes automated checks and a manual browser test plan:

```powershell
py tests/test_static.py
node tests/test_service_worker.cjs
```

Additional browser tests use Playwright; their setup is described in [docs/TEST_PLAN.md](docs/TEST_PLAN.md).

The manual Windows checks performed on October 11, 2026 confirmed that the app can be installed, opens in its own window, and remains usable when the local HTTP server is stopped. Browser Developer Tools checks and tests of the public HTTPS deployment are documented separately as remaining verification steps. See [docs/TEST_PLAN.md](docs/TEST_PLAN.md) for the exact scope of the results.

The images in `docs/screenshots/` are previews of the application interface and are not presented as proof of installation or offline behavior.

## Hosting with GitHub Pages

Campus Planner can be served as a static website through GitHub Pages:

1. Create a public GitHub repository.
2. Place the **contents** of the project folder at the repository root, including `index.html` and `service-worker.js`.
3. In **Settings → Pages**, select **Deploy from a branch**, then choose `main` and `/(root)`.
4. Open the HTTPS URL provided in the repository's Pages settings.
5. Test installation, offline loading, and task persistence using the deployed URL.

The application uses relative paths, so it can run from a repository subdirectory without changing its asset URLs.

## Updating cached files

When changing files listed in the Service Worker's `APP_SHELL` array, increment `CACHE_VERSION` in `service-worker.js`. This allows a new app shell to be cached and obsolete application caches to be removed.

Clearing all browser site storage also removes locally saved tasks.

## Documentation

- [Instructions](INSTRUCTIONS.md)
- [Technical overview](docs/TECHNICAL_OVERVIEW.md)
- [Demo walkthrough](docs/DEMO_SCRIPT.md)
- [MDN topic map](docs/MDN_MAP.md)
- [Test plan](docs/TEST_PLAN.md)
- [Sources and attribution](ATTRIBUTION.md)

## Licenses

Application source code is licensed under [MIT](LICENSE). Original written documentation and interface screenshots are available under [CC BY 4.0](CONTENT_LICENSE.md). See [ATTRIBUTION.md](ATTRIBUTION.md) for technical references and third-party licensing notes.
