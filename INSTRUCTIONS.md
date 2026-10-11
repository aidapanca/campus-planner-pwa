# Campus Planner – Instructions

Campus Planner is a small Progressive Web App (PWA) built with HTML, CSS, and JavaScript. It lets you manage study tasks, install the app on supported devices, and use previously cached resources without a network connection.

## 1. Run locally

1. Open the `CampusPlanner_PWA` folder in VS Code.
2. Open **Terminal → New Terminal**.
3. From the project folder, run:

   ```powershell
   py -m http.server 8000
   ```

   If `py` is unavailable, use `python -m http.server 8000`.

4. Open **http://localhost:8000/** in Chrome or Edge.
5. Add a task, mark one as completed, or try the task filters.

Keep the terminal open while using the local server. Press **Ctrl + C** in the terminal to stop it.

Use `http://localhost:8000/` rather than opening `index.html` directly. Service Workers require a secure context, such as HTTPS or `localhost`.

## 2. Install the app

1. Open Campus Planner in Chrome or Edge.
2. Use the browser's **Install** option (usually in the address bar or browser menu).
3. Confirm the installation.
4. Open **Campus Planner – Study Task Manager** from the Windows Start menu.
5. Check that it opens in its own window.

Installation options vary by browser and operating system.

## 3. Check the PWA files in DevTools

1. Open the app in a normal browser tab and press **F12**.
2. Under **Application → Manifest**, check the app name, icons, start URL, and display mode.
3. Under **Application → Service workers**, check that the Service Worker is activated and controlling the page. Reload after the first visit if needed.
4. Under **Application → Cache storage**, check that the app's HTML, CSS, JavaScript, manifest, and icons are cached.
5. Under **Application → Local storage → http://localhost:8000**, look for the saved task data (`campus-planner-tasks-v1`).

## 4. Test offline functionality

**Method A – Simulate offline mode in DevTools**

1. Load the app online and allow the Service Worker to activate.
2. In **DevTools → Network**, select **Offline**.
3. Reload the page. The app should still open.
4. Add a task called `Offline test` and reload again.
5. Check that the new task is still there.
6. Set the network option back to **No throttling**.

**Method B – Stop the local server**

1. Load the app while the Python server is running, so its files can be cached.
2. Stop the server with **Ctrl + C** in PowerShell.
3. Reload the app in the same browser profile, or open the installed version.
4. Add, complete, and delete a task, reloading between actions to check that changes persist.
5. Restart the server when finished.

Stopping the local server tests whether the app can load without that server. It does not disconnect the laptop from the internet. For a public HTTPS deployment, the same test can be done with the device's Wi-Fi turned off after the app has been cached.

## 5. How the main files work

| File | Purpose |
| --- | --- |
| `index.html` | App layout and elements |
| `styles.css` | Styles and responsive layout |
| `app.js` | Task actions, filters, local storage, and Service Worker registration |
| `manifest.webmanifest` | App name, icons, start URL, and standalone display settings |
| `service-worker.js` | Cache setup, updates, and offline responses |
| `icons/` | Icons for the installed app |

**Cache Storage** keeps app resources available for offline use. **Local Storage** keeps tasks in the current browser profile. Tasks are not automatically synchronized to other devices.

## 6. Additional checks

- Add a task and reload to verify that it is saved.
- Mark a task completed and check the counters and filters.
- Delete a task and reload to verify that it stays deleted.
- Test the interface at desktop and mobile screen widths.
- Test the main buttons and form using the keyboard.
- Check how the app behaves after restarting the browser.
- Open the app in a new browser profile to confirm the first-load behavior.

For the full test checklist, see [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md). For more technical details, see [`docs/TECHNICAL_OVERVIEW.md`](docs/TECHNICAL_OVERVIEW.md).

## 7. After changing app files

Update `CACHE_VERSION` in `service-worker.js` whenever cached HTML, CSS, JavaScript, manifest, or icon files change. Reload online and confirm that the new Service Worker has activated.

If you clear all site storage while troubleshooting, locally saved tasks will also be deleted.
