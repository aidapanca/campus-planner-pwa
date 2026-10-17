# Campus Planner

Campus Planner is a simple task management app built with HTML, CSS, and JavaScript. Users can organize their tasks, install the app on supported devices, and use it offline.

**Authors:** Aida-Gabriela Pâncă and Maria Ciorâțanu  
**Course:** Web Application Development (WADe)  
**Year:** 2026

## Features

- Add tasks with a category, priority, and optional due date
- Mark tasks as completed or delete them
- Filter tasks and track progress
- Save tasks locally in the browser
- Install the app on supported devices
- Use the app offline after its files have been cached

## Getting started

Open the project folder in a terminal and run:

```powershell
py -m http.server 8000
```

Then open `http://localhost:8000/` in Chrome or Edge.

If `py` is unavailable, use `python -m http.server 8000`.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | Design and layout |
| `app.js` | Task management and browser storage |
| `manifest.webmanifest` | App name, icons, and installation settings |
| `service-worker.js` | Caching and offline support |
| `icons/` | App icons |
| `docs/` | Project documentation |
| `tests/` | Test scripts |

## Offline support

The Service Worker saves the main application files in Cache Storage so they can be used without an internet connection.

Tasks are saved separately in `localStorage`. They remain available after refreshing the page, but they do not automatically sync between devices.

## Testing

To run the main tests:

```powershell
py tests/test_static.py
node tests/test_service_worker.cjs
```

Installation, offline loading, and task storage can also be checked manually in Chrome DevTools.

## License

The application code is licensed under [MIT](LICENSE). Project documentation and screenshots are licensed under [CC BY 4.0](CONTENT_LICENSE.md). See [ATTRIBUTION.md](ATTRIBUTION.md) for sources and references.
