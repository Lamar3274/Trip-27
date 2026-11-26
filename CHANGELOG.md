# Changelog

## 2026-11-26: itinerary planner (Trip HQ triphq-v5, Adventure List adv-v3)
Trip HQ
- The itinerary is now the home screen: a "Next up" countdown, month shortcuts, stays grouped by month and country, nights per stay, and Booked / Planned / Idea labels.
- A stay only shows as Booked when a booking with a confirmation number is linked to it. It can't be set to Booked by hand.
- Warnings for overlapping stays, nights with nowhere planned, overlapping hotel bookings, and side trips over nights you've already paid for.
- Tap a stay to see its bookings, flights in and out, side trips, ideas, and the bucket-list items for that place (read from and saved to the Adventure List).
- Your new route from the brief is loaded as Planned. The old route is kept under More › Data › Itinerary versions.
- Philippines or more Thailand (30 Jan – 17 Feb) is a switch; the option you're not using is kept, not deleted.
- Pai is a 19–21 Dec side-trip idea under Chiang Mai. The Chiang Mai hotel is unchanged.
- Chaba Loft: confirmation number, Booking.com, payment scheduled, free cancellation until 11 Dec, price kept at £190.
- Editing a stay's dates can move every later planned stay with it. Booked stays never move.
- New Bookings tab: things to check, deadlines (free cancellation, scheduled payments, tasks due soon), and Needs booking (stays without accommodation plus "book ahead" activities).
- New Ideas tab: type "Maybe visit Pai for two nights" and it works out the place, region, nights, suggested dates and starter activities. Then add it to the itinerary or bucket list, edit it, or dismiss it.
- ChatGPT / Claude import: copy a prompt, paste the reply, then preview and tick what to apply. Booked stays are protected, duplicates are skipped, bookings are never imported, and a version is saved first.
- Search across stays, bookings, bucket list, ideas and checklist. The map shows your route in order.
- Budget: syncs spending with a Google Sheet tab ("Trip spending") through a small Apps Script, in both directions; the newest change wins. CSV download added.
- Fixed: the bookings merge used to overwrite and blank fields you'd typed. It now only fills empty fields.
- Fixed: on the public (redacted) copy, a fresh install only created one of the four bookings.

The Adventure List
- Statuses: Idea, Interested, Planned, Booked (needs a reference), Done, Skipped. Old ones carry over.
- New fields: booking needed, duration, suggested time, booking reference and date, price. New categories: Shopping, Working base.
- Place dates now come from the Trip HQ itinerary, so moving a stay moves its activities' dates too.
- About 40 bucket-list items from the brief added (Pai, Bohol, Cebu, Siargao, Similan, Maya Bay, Ha Long cruise and more), with no duplicates. Mae Kampong is now a day trip.
- A "Completed experiences" section on the home screen.

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
