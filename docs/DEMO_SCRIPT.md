# Campus Planner – Live demo walkthrough

**Goal:** Demonstrate the installed PWA experience, offline task management, and the browser features that support them. The walkthrough corresponds to the demo section of the Developing PWAs presentation.

## Before the demo

- Open the application over HTTPS, or from `http://localhost:8000/` for local testing.
- Use Chrome or Edge and make sure the application is installable in the selected browser profile.
- Load the page online and verify that the Service Worker is active and controlling it.
- Check that the app shell files are present in **Application → Cache storage**.
- Set browser zoom to a comfortable level for the screen being used.
- Use the reset button only when the current task data is no longer needed.
- Keep a screen recording of a previously verified run as a backup, and identify it as a recording if played.

## Aida – Using and installing Campus Planner (5 minutes)

**0:00–1:15 – Task management**

Open Campus Planner, add a task named `Test the PWA offline`, set its category to **Assignment** and its priority to **High**, and demonstrate a task action. Explain that tasks are stored locally in the browser.

**1:15–2:30 – Installation**

Use Chrome or Edge's install option. Open Campus Planner in its own window and point out the standalone experience. If the installation option is unavailable, use the manifest information in DevTools to explain the difference without claiming that an installation occurred.

**2:30–5:00 – Offline test**

Return to a browser tab with DevTools available. In **Network**, select **Offline** and reload. Show that the interface and saved tasks remain available. Create a task named `Offline-created task` and refresh again. Confirm the task persists, then return Network to **No throttling**.

Key distinction: the Service Worker enables offline access to cached application files; `localStorage` preserves task data in the same browser profile. This is not cross-device synchronization.

## Maria – Inspecting the PWA (2 minutes)

Open **Application** in DevTools and inspect:

1. **Manifest:** name, icons, start URL, scope, and standalone display mode.
2. **Service workers:** registered worker, current state, and scope.
3. **Cache storage:** cached HTML, CSS, JavaScript, and icon files.
4. **Local storage:** task data under `campus-planner-tasks-v1`.

Summarize the distinct roles of the manifest, Service Worker, cache, and local task storage.

## Backup materials

The files in `docs/screenshots/` show UI previews only. Browser installation and offline behavior should be demonstrated with a live run or a clearly identified recording of a verified run.
