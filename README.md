# Rewind Tile Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories/)
[![Release](https://img.shields.io/github/v/release/PyritF/rewind-tile-card)](https://github.com/PyritF/rewind-tile-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sparkline tiles for Home Assistant that show a **live value**, can be **rewound to any day**, and open a **details dialog** with day, 7‑day and 30‑day views.

The package contains two cards:

| Card | What it does |
|---|---|
| `custom:rewind-tile-card` | A tile with name, icon, big value, a short summary line and a sparkline. Live by default; shows a whole past day when you pick one. A click opens the details dialog. |
| `custom:rewind-date-bar` | A date bar with a **Now** button, previous/next day and a calendar. It switches every Rewind tile on the dashboard, and also Home Assistant's own energy cards. |

## Features

- **Live mode**: the current value, updated as the entity changes, with the last few hours as a line and a pulsing dot at "now".
- **Rewind**: pick any day in the date bar and every tile shows that day from 00:00 to 24:00, with a matching day value (peak, average, end of day or total).
- **Three tile kinds**, detected automatically:
  - `power`: live value, peak of the day with time.
  - `measurement`: anything else that is numeric, such as battery level, temperature or humidity.
  - `energy`: cumulative energy since midnight from a `total`/`total_increasing` sensor, optionally with a second entity (import/export, charge/discharge) and the solar forecast of the Energy dashboard.
- **Details dialog** (click a tile):
  - Day view with "show previous day" comparison.
  - 7‑ and 30‑day views: a continuous line for power and measurements, one bar per day for energy. Click a day or a bar to jump to that day.
  - Key figures such as peak with time, average, minimum, totals, best hour and best day.
- **Works with the Energy dashboard date picker**: switching the day in the Rewind date bar also switches Home Assistant's `energy-date-selection` card (and all energy cards that follow it), and the other way round.
- **Animations**: the fill fades in, the line draws itself, values blur in, tiles enter in a gentle wave. Turn them off per tile; *reduce motion* in the operating system is respected.
- **Theme aware**: built on `ha-card` and Home Assistant's theme variables, so it follows light and dark themes and works with card-mod.
- **English and German**, following the language of your Home Assistant user profile.
- **No dependencies**: one JavaScript file, no external libraries.

## Requirements

- Home Assistant 2024.1 or newer.
- The [recorder](https://www.home-assistant.io/integrations/recorder/) (enabled by default).
- For past days and the 7/30‑day views: entities with **long-term statistics**, which means a `state_class` (`measurement`, `total` or `total_increasing`). Entities without statistics still work in live mode and for days that are still in the recorder history (10 days by default).

## Installation

### HACS (recommended)

The card is not in the HACS default store yet, so add it as a custom repository:

1. Open **HACS** in Home Assistant.
2. Open the menu (⋮) in the top right corner and choose **Custom repositories**.
3. Enter `https://github.com/PyritF/rewind-tile-card`, choose the type **Dashboard** and click **Add**.
4. Search for **Rewind Tile Card**, open it and click **Download**.
5. Reload the browser (on the companion app: clear the frontend cache in its settings).

HACS adds the dashboard resource for you.

### Manual

1. Download `rewind-tile-card.js` from the [latest release](https://github.com/PyritF/rewind-tile-card/releases/latest).
2. Copy it to `<config>/www/rewind-tile-card.js`.
3. Go to **Settings → Dashboards → ⋮ → Resources** and add `/local/rewind-tile-card.js` as a **JavaScript module**.
4. Reload the browser.

## Quick start

A date bar and two tiles:

```yaml
type: vertical-stack
cards:
  - type: custom:rewind-date-bar
  - type: grid
    columns: 2
    square: false
    cards:
      - type: custom:rewind-tile-card
        entity: sensor.solar_power
        name: Solar
      - type: custom:rewind-tile-card
        entity: sensor.battery_level
        name: Battery
        min: 0
        max: 100
        day_value: last
```

In a **sections** dashboard, put the date bar at the top of a section (it spans the full width) and add the tiles below it. Tiles default to half the section width; change it with `grid_options`, as with any card.

## Tile options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | string | **required** | The entity to show. |
| `name` | string | friendly name | Title of the tile. |
| `icon` | string | entity icon | Any `mdi:` icon. Without it the card uses the entity's icon or a default for its device class. |
| `color` | string | by device class | Line, fill and icon color. Any CSS color, also `var(--my-color)`. |
| `kind` | `power` · `measurement` · `energy` | detected | How the value is treated. `energy` for `device_class: energy` or `total`/`total_increasing` sensors in Wh/kWh/MWh, `power` for `device_class: power`, otherwise `measurement`. |
| `live_hours` | number | `3` (power), `24` (measurement) | Length of the line in live mode. Not used by `energy` tiles, which always show today since midnight. |
| `day_value` | `max` · `min` · `mean` · `last` | `max` (power), `mean` (measurement) | Big value for a past day. Not used by `energy` tiles, which show the day total. |
| `decimals` | number | entity display precision | Decimal places of the big value. |
| `min` / `max` | number | automatic | Fixed lower or upper bound of the line, for example `0` and `100` for a percentage. |
| `fill` | boolean | `true` | Fill the area below the line. |
| `show_ticks` | boolean | `true` | Show the time labels under the line. |
| `animate` | boolean | `true` | Play the animations. |
| `tap_action` | `details` · `more-info` · `none` | `details` | What a click does: the Rewind details dialog, Home Assistant's more-info dialog, or nothing. |

### Energy tiles

| Option | Type | Default | Description |
|---|---|---|---|
| `secondary_entity` | string | – | A second energy entity shown next to the first, such as export next to import. |
| `primary_label` | string | friendly name | Label of the first value when a second entity is set. |
| `secondary_label` | string | friendly name | Label of the second value. |
| `secondary_color` | string | `#ffb74d` | Color of the second line. |
| `forecast` | boolean | `false` | Show the solar forecast of the Energy dashboard as a dashed line, and "forecast today · tomorrow" as summary. Needs a forecast integration (for example Forecast.Solar) configured in the Energy dashboard. Only for tiles without `secondary_entity`. |
| `forecast_color` | string | `#ffd54f` | Color of the forecast line. |

### Linking options

These work on both cards.

| Option | Type | Default | Description |
|---|---|---|---|
| `collection_key` | string | per dashboard | Cards with the same key share the selected day. By default every dashboard has its own. Use different keys for independent groups on one dashboard. |
| `energy_sync` | boolean | `true` | Keep the selected day in sync with Home Assistant's energy date picker on the same dashboard. |
| `energy_collection_key` | string | `energy_<dashboard>` | The key of the energy date picker to sync with. Only needed if you set `collection_key` on Home Assistant's energy cards; it must start with `energy_`. |

## Date bar options

The date bar has no required options: `type: custom:rewind-date-bar` is enough. It accepts the linking options above.

## Examples

### Solar and battery overview

```yaml
type: grid
columns: 4
square: false
cards:
  - type: custom:rewind-tile-card
    entity: sensor.solar_power
    name: Solar power
    icon: mdi:solar-power-variant
    color: '#ff9800'
  - type: custom:rewind-tile-card
    entity: sensor.house_power
    name: House consumption
    icon: mdi:home-lightning-bolt
    color: '#26a69a'
  - type: custom:rewind-tile-card
    entity: sensor.battery_level
    name: Battery level
    min: 0
    max: 100
    day_value: last
  - type: custom:rewind-tile-card
    entity: sensor.battery_temperature
    name: Battery temperature
  - type: custom:rewind-tile-card
    entity: sensor.solar_energy_total
    name: Solar yield
    icon: mdi:solar-panel
    forecast: true
  - type: custom:rewind-tile-card
    entity: sensor.house_energy_total
    name: Consumption
    color: '#26a69a'
  - type: custom:rewind-tile-card
    entity: sensor.grid_import_total
    secondary_entity: sensor.grid_export_total
    name: Grid
    primary_label: Import
    secondary_label: Export
    icon: mdi:transmission-tower
    color: '#42a5f5'
  - type: custom:rewind-tile-card
    entity: sensor.battery_charge_total
    secondary_entity: sensor.battery_discharge_total
    name: Battery energy
    primary_label: Charged
    secondary_label: Discharged
    icon: mdi:battery-sync
    color: '#e91e63'
    secondary_color: '#ce93d8'
```

### Room climate

```yaml
type: custom:rewind-tile-card
entity: sensor.living_room_temperature
name: Living room
live_hours: 12
day_value: mean
```

### Keep Home Assistant's more-info dialog

```yaml
type: custom:rewind-tile-card
entity: sensor.solar_power
tap_action: more-info
```

## How it works

**Live mode** ("Now")
- **Power and measurement tiles**: they load the recorder history of the last `live_hours` (5‑minute statistics for windows longer than 6 hours). New states are appended as they arrive, and the history is reloaded every 5 minutes.
- **Energy tiles**: they add up the 5‑minute `change` statistics since midnight and extend the line with the live state since the last statistics period.

**A past day**
- **Power and measurement tiles**: they read the 5‑minute mean statistics of that day, falling back to hourly statistics and then to the raw history.
- **Peak and low values**: they come from the 5‑minute means, so they match the line and are not thrown off by single spikes.
- **Energy tiles**: they use the same `change` statistics as the Energy dashboard, so the day totals match it.

**Details dialog**
- **7- and 30-day views**: hourly statistics for lines, daily statistics for bars.
- **Today in the bar views**: shown as a lighter bar with the total so far.

**Sync with the Energy dashboard date picker**
- If Home Assistant's `energy-date-selection` card (or another energy card) is on the same dashboard, the Rewind cards follow its day and set it when you switch the day in the date bar.
- Week, month and year selections of Home Assistant's picker are ignored, because the tiles always show one day.

**Day boundaries** use the time zone of the browser.

## Troubleshooting

| Problem | What to check |
|---|---|
| "No long-term statistics for this entity" | The entity has no `state_class`. Add one (for template sensors in YAML, or through a customization), or use an entity that has statistics. Past days then fill up from the moment statistics exist. |
| Old days are empty, recent ones work | 5‑minute statistics are kept as long as the recorder history (10 days by default); older days fall back to hourly statistics. If those are empty too, the entity had no statistics back then. |
| The card does not show up after installing | Reload the browser without cache. On the companion app, clear the frontend cache in its settings. Check that the resource `/hacsfiles/rewind-tile-card/rewind-tile-card.js` is listed under **Settings → Dashboards → Resources**. |
| Home Assistant's energy cards do not follow the date bar | They have to be on the same dashboard. If you gave them a `collection_key`, set the same value as `energy_collection_key` on the Rewind cards. |
| The forecast line is missing | Forecasts are read from the Energy dashboard configuration (**Settings → Dashboards → Energy → Solar panels → Forecast**). Only today and later can be shown, Home Assistant does not keep old forecasts. |

## Development

The card is plain JavaScript without a build step: [`dist/rewind-tile-card.js`](dist/rewind-tile-card.js) is the source and the file HACS installs.

To try changes, serve the repository folder over HTTP and add the file as a dashboard resource of a test dashboard, or copy it to `<config>/www/` and add `/local/rewind-tile-card.js?v=<n>` (raise `<n>` to bust the cache).

A release is created by pushing a tag such as `v0.1.0`. The release workflow attaches the JavaScript file, and HACS offers the update.

Bug reports and pull requests are welcome.

## License

[MIT](LICENSE)
