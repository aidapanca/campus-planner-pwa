# Campus Planner – Test plan

This document records automated checks and the manual browser tests for the PWA. A result is marked as passed only when the described check was carried out.

## 1. Automated tests

| Check | Test | Result |
| --- | --- | --- |
| HTML references and required assets | `python tests/test_static.py` | Passed |
| Manifest fields and PNG dimensions | `python tests/test_static.py` | Passed |
| Static files served from a repository-style subpath | `python tests/test_static.py` | Passed |
| JavaScript syntax | `node --check app.js`, `node --check service-worker.js` | Passed |
| Service Worker precaching, cache cleanup, and fetch strategies | `node tests/test_service_worker.cjs` | Passed (simulated events) |
| Desktop/mobile UI previews and basic task interactions | `python tests/test_ui_preview.py` | Passed in earlier preview test |

The Service Worker unit tests simulate browser events and do not replace browser installation and offline tests. The screenshots in `docs/screenshots/` are interface previews and are not proof of offline functionality.

## 2. Manual browser checks

**Environment:** Windows laptop, Chrome, local Python HTTP server on `http://localhost:8000/`.  
**Date:** October 11, 2026.

| ID | Test | Result | Notes |
| --- | --- | --- | --- |
| T01 | Start local server and load the app | Passed | Interface loaded from localhost. |
| T02 | Add a new task | Passed | Task appeared in the list. |
| T03 | Reload and confirm that a task remains saved | Passed | New task persisted after reload. |
| T04 | Complete a task and reload | Passed | Completed state persisted; separate filter interaction still needs a specific check. |
| T05 | Delete a task and reload | Passed | Deleted task did not return. |
| T06 | Inspect manifest in DevTools | Passed | Name, standalone display, start URL, theme colors, and icons were visible. The optional screenshot warnings are addressed by a subsequent manifest update. |
| T07 | Inspect Service Worker in DevTools | Passed | Chrome showed `service-worker.js` as activated and running, with the localhost page listed as a client. |
| T08 | Inspect Cache Storage in DevTools | Passed | DevTools listed nine cached app-shell entries (HTML, JS, CSS, manifest, and icons). |
| T09 | Stop the local server and reload | Passed | Page reloaded without the local Python server. |
| T10 | Add, complete, and delete tasks without the local server | Passed | Changes persisted after refresh. |
| T11 | Network tab → Offline → reload | Not checked | Separate DevTools network simulation. |
| T12 | Install and open the app standalone | Passed | App appeared in the Windows Start menu and opened in a separate window. |
| T13 | Check mobile-sized layout in a browser | Not checked manually | Automated preview exists; verify on a real browser/device. |
| T14 | Keyboard navigation and accessible names | Not checked | Use Tab, Shift+Tab, Enter, Space, and inspect form labels. |
| T15 | Fresh browser profile installation and offline test | Not checked | Confirm behavior without existing browser data. |
| T16 | Public HTTPS deployment | Passed | GitHub Pages site loaded, displayed the interface, and registered an active Service Worker over HTTPS. |

The local-server shutdown test demonstrates offline availability of the application shell with the server unreachable. It does **not** by itself demonstrate an internet disconnection or cross-device synchronization.

## 3. Public deployment – manual browser checks

**Environment:** Windows laptop, Google Chrome, `https://aidapanca.github.io/campus-planner-pwa/`.  
**Date:** October 11, 2026.

| ID | Test | Result | Notes |
| --- | --- | --- | --- |
| P01 | Open public HTTPS site | Passed | Campus Planner and its styles/assets loaded from GitHub Pages. |
| P02 | Inspect the public Service Worker | Passed | DevTools showed `service-worker.js` activated and running under `/campus-planner-pwa/`, with the deployed page as client. |
| P03 | Turn off Wi-Fi and reload public site | Passed | App loaded without internet access after an initial online visit. |
| P04 | Edit tasks with Wi-Fi off and reload | Passed | Task modifications persisted after refresh. |
| P05 | Install the public site on Windows | Passed | A separate Campus Planner app appeared in Windows alongside the earlier localhost installation, and was reported working. |
| P06 | Confirm updated manifest screenshots in DevTools | Pending | Confirm both `wide` and `narrow` previews after the updated files are published. |
| P07 | Mobile browser PWA install and offline use | Not checked | Test on an actual compatible mobile device if available. |
| P08 | Keyboard and screen-reader accessibility | Not checked | Perform dedicated accessibility checks before claiming compliance. |

The two screenshots registered in the updated manifest are **visual previews**, not evidence of offline functionality. The update has been validated with automated static checks but still needs a browser check after redeployment.

## 4. Running the test scripts

From the project root:

```powershell
py tests/test_static.py
node --check app.js
node --check service-worker.js
node tests/test_service_worker.cjs
```

Optional Playwright browser test:

```powershell
py -m pip install playwright
py -m playwright install chromium
py tests/test_pwa.py
```

The Playwright script runs an HTTP-based browser test, but installation through the browser UI still requires manual verification.

## 5. Browser evidence checklist

Useful screenshots for technical documentation:

- The running app in a browser tab.
- Application → Manifest (app name and icons).
- Application → Service workers (active worker and scope).
- Application → Cache storage (cached app resources).
- Network → Offline after a successful page reload.
- The installed app in a standalone window.

For each new manual test, note the browser, operating system, date, and result. Distinguish the local version from the public HTTPS deployment.
