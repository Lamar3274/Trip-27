# Changelog

## 2026-11-25
Trip HQ (service worker triphq-v3)
- Unreadable saved data is now copied aside (key triphq-corrupt-<time>) instead of overwritten; a message tells you to restore a backup.
- A snapshot (triphq-snap) is saved before any migration runs.
- Visible warning if saving fails.
- More > Data: Download full backup (JSON, includes Wallet photos), Restore from file, last-backup date.
- "Update ready" banner (Reload / Later); never reloads on its own.

The Adventure List (service worker adv-v1)
- Now an installable offline PWA: manifest, service worker, icons. Only deletes its own adv- caches.
- Google Font cached after first online visit, with system-font fallback.
- Same safe-load, snapshot (adv-snap), backup file (includes journal photos), restore-from-file and update banner.
- today() now uses the local calendar date (it used the UTC date before).

Not yet done: real iPhone test; Home-screen backup reminder; Adventure List photos still live inside localStorage (about 5 MB limit).

## 2026-11-25 (later): one site, two apps
- New landing page (index.html) with buttons for both apps; small "switch app" link at the top of each app.
- Service workers bumped: triphq-v4, adv-v2 (existing installs will show the Update ready banner).
- Merge import now also matches bookings by title + date, so real booking details update a redacted placeholder instead of duplicating it. Verified: merging twice changes nothing.
- Seeded flight item title no longer contains the booking reference.
