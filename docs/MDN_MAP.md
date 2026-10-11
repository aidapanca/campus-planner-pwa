# MDN documentation → Campus Planner / WADe presentation mapping

Primary official entry point: <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps>

This document is a **coverage map**, not a claim that Campus Planner implements every API in MDN. The presentation focuses on core PWAs and uses the official MDN tutorials as learning resources.

## Guides (six main concepts)

| MDN guide | Presentation | Demo |
| --- | --- | --- |
| [What is a PWA?](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/What_is_a_progressive_web_app) | Slides 4–6 | Website vs installed experience |
| [Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) | Slides 7–9 | Manifest and installation |
| [Installing and uninstalling](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing) | Slide 9 | Browser install flow, if supported |
| [Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) | Slides 10–12, 15 | Active Service Worker |
| [Caching](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching) | Slides 13–14, 16 | Offline refresh, Cache Storage |
| [Best practices](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices) | Slides 20, 22 | Responsive/accessibility evaluation |

## How-to (nine MDN topics)

- [Create a standalone app](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Create_a_standalone_app): implemented via `display: standalone`.
- [Define app icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons): 192px, 512px and maskable 512px PNGs.
- [Customize app colors](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Customize_your_app_colors): manifest theme/background colors.
- [Display badges](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Display_badges): slide 21 only, not implemented.
- [Expose app actions as shortcuts](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Expose_common_actions_as_shortcuts): slide 21 only, not implemented.
- [Share data between apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Share_data_between_apps): slide 21 only, not implemented.
- [Trigger installation from your PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_installation_from_your_PWA): optional `beforeinstallprompt` handler and fallback instructions in app; browser support varies.
- [Associate files with your PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Associate_files_with_your_PWA): slide 21 only, not implemented.
- [Localize a web app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Localize_a_web_app_manifest): slide 21 only, not implemented.

## Tutorials (two walkthroughs)

- [CycleTracker](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/CycleTracker) – five lessons: HTML/CSS foundation, secure connection, JavaScript task logic/local storage, manifest/icons, and Service Worker with offline support. **Main teaching model** for Campus Planner, but the application is original rather than a copy.
- [js13kGames](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames) – five lessons: PWA structure, offline, installability, notifications/push, and progressive loading. Used as optional deeper research for the presentation.

## Reference topics

The slides use selected manifest members, Service Worker lifecycle and `FetchEvent`, Cache API, and `localStorage` (an ordinary Web Storage API). For Q&A, consult the [MDN PWA Reference](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Reference), including:

- Web app manifest members and `id`, `scope`, `start_url`, `icons`, `display`.
- `Client.postMessage()` and Broadcast Channel for client–Service Worker communication.
- `Cache`, `Clients`, `FetchEvent`.
- Background Synchronization, Periodic Background Synchronization, Background Fetch.
- IndexedDB, Badging, Notifications, Web Share and Window Controls Overlay.

Not all features are supported uniformly by browsers and operating systems. Avoid describing advanced APIs as universally available.
