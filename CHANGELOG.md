# Changelog

## 0.1.1

- Fix: a picked day was reset to today when Home Assistant recreated its energy date picker (for example right after the dashboard reloaded).
- Date bar stays on one line on phones.
- Details dialog shows fewer time labels on narrow screens so they no longer overlap.

## 0.1.0

First release.

- `custom:rewind-tile-card`: sparkline tile with live value, rewind to any past day and a details dialog (day with previous-day comparison, 7 days, 30 days).
- Tile kinds `power`, `measurement` and `energy`, detected from the entity; energy tiles with an optional second entity and the Energy dashboard solar forecast.
- `custom:rewind-date-bar`: date bar with Now button, previous/next day and calendar, synced with Home Assistant's energy date picker.
- Animations, theme support, English and German.
