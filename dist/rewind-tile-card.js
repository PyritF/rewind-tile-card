/*!
 * Rewind Tile Card for Home Assistant
 * Sparkline tiles with a live value that can be rewound to any day,
 * a shared date bar and a details dialog with day, 7-day and 30-day views.
 *
 * https://github.com/PyritF/rewind-tile-card
 * MIT License
 */
(() => {
  'use strict';

  const VERSION = '0.1.1';
  const DOCS_URL = 'https://github.com/PyritF/rewind-tile-card';
  const HOUR = 3600e3;
  const DAY = 24 * HOUR;
  const PERIOD_MS = { '5minute': 5 * 60e3, hour: HOUR, day: DAY };

  // ---------------------------------------------------------------------------
  // Translations
  // ---------------------------------------------------------------------------

  const STRINGS = {
    en: {
      now: 'Now',
      live: 'Live',
      pick_date: 'Pick a date',
      prev_day: 'Previous day',
      next_day: 'Next day',
      prev_month: 'Previous month',
      next_month: 'Next month',
      back_to_now: 'Back to now',
      close: 'Close',
      loading: 'Loading…',
      no_data: 'No data for this period',
      no_stats: 'No long-term statistics for this entity',
      entity_missing: 'Entity not found: {entity}',
      open_details: 'Show details for {name}',
      peak_today: 'Peak today {value} at {time}',
      peak_at: 'Peak at {time} · avg {value}',
      range_hours: 'Last {hours} h: {min} – {max}',
      day_mean: 'Daily average · {min} – {max}',
      day_last: 'End of day · {min} – {max}',
      day_max: 'Daily maximum at {time} · avg {value}',
      day_min: 'Daily minimum at {time} · avg {value}',
      vs_yesterday: 'Yesterday {value}',
      vs_previous: 'Previous day {value}',
      dual_yesterday: 'Yesterday {a} / {b}',
      dual_previous: 'Previous day {a} / {b}',
      forecast_today_tomorrow: 'Forecast today {today} · tomorrow {tomorrow}',
      range_day: 'Day',
      range_7: '7 days',
      range_30: '30 days',
      period: 'Period',
      prev_n_days: 'Previous {n} days',
      next_n_days: 'Next {n} days',
      compare_prev: 'Show previous day',
      previous_day: 'Previous day',
      forecast: 'Forecast',
      stat_peak: 'Peak',
      stat_low: 'Low',
      stat_avg: 'Average',
      stat_min: 'Minimum',
      stat_max: 'Maximum',
      stat_current: 'Current',
      stat_end: 'End of day',
      stat_best_hour: 'Best hour',
      stat_best_day: 'Best day',
      stat_net: 'Difference',
      stat_prev: 'Previous day',
      at_time: 'at {time}',
      until_now: 'so far',
      whole_day: 'whole day',
      per_day: 'avg {value} per day',
      over_days: 'over {n} days',
      hint_cols: 'Click a day to view it on its own',
      hint_bars: 'Click a bar to view that day',
      so_far: '(so far)',
      show_day: 'Show {date}'
    },
    de: {
      now: 'Jetzt',
      live: 'Live',
      pick_date: 'Datum wählen',
      prev_day: 'Vorheriger Tag',
      next_day: 'Nächster Tag',
      prev_month: 'Vorheriger Monat',
      next_month: 'Nächster Monat',
      back_to_now: 'Zurück zu jetzt',
      close: 'Schließen',
      loading: 'Lädt …',
      no_data: 'Keine Daten für diesen Zeitraum',
      no_stats: 'Keine Langzeitstatistik für diese Entität',
      entity_missing: 'Entität nicht gefunden: {entity}',
      open_details: 'Details zu {name} anzeigen',
      peak_today: 'Spitze heute {value} um {time}',
      peak_at: 'Spitze um {time} · Ø {value}',
      range_hours: 'Letzte {hours} Std.: {min} – {max}',
      day_mean: 'Tagesmittel · {min} – {max}',
      day_last: 'Tagesende · {min} – {max}',
      day_max: 'Tageshöchstwert um {time} · Ø {value}',
      day_min: 'Tagestiefstwert um {time} · Ø {value}',
      vs_yesterday: 'Gestern {value}',
      vs_previous: 'Vortag {value}',
      dual_yesterday: 'Gestern {a} / {b}',
      dual_previous: 'Vortag {a} / {b}',
      forecast_today_tomorrow: 'Prognose heute {today} · morgen {tomorrow}',
      range_day: 'Tag',
      range_7: '7 Tage',
      range_30: '30 Tage',
      period: 'Zeitraum',
      prev_n_days: 'Vorherige {n} Tage',
      next_n_days: 'Nächste {n} Tage',
      compare_prev: 'Vortag einblenden',
      previous_day: 'Vortag',
      forecast: 'Prognose',
      stat_peak: 'Spitze',
      stat_low: 'Tief',
      stat_avg: 'Ø',
      stat_min: 'Minimum',
      stat_max: 'Maximum',
      stat_current: 'Aktuell',
      stat_end: 'Tagesende',
      stat_best_hour: 'Beste Stunde',
      stat_best_day: 'Bester Tag',
      stat_net: 'Differenz',
      stat_prev: 'Vortag',
      at_time: 'um {time}',
      until_now: 'bis jetzt',
      whole_day: 'ganzer Tag',
      per_day: 'Ø {value} pro Tag',
      over_days: 'über {n} Tage',
      hint_cols: 'Auf einen Tag klicken, um ihn einzeln anzusehen',
      hint_bars: 'Auf einen Balken klicken, um den Tag einzeln anzusehen',
      so_far: '(bis jetzt)',
      show_day: '{date} anzeigen'
    }
  };

  function language(hass) {
    return String((hass && ((hass.locale && hass.locale.language) || hass.language)) || 'en');
  }

  function tr(hass, key, vars) {
    const lang = language(hass).split('-')[0];
    let s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------

  const BLANK_BEFORE_PERCENT = ['cs', 'de', 'fi', 'fr', 'sk', 'sv'];

  function numberLocale(hass) {
    const nf = hass && hass.locale && hass.locale.number_format;
    if (nf === 'comma_decimal') return 'en-US';
    if (nf === 'decimal_comma') return 'de';
    if (nf === 'space_comma') return 'fr';
    if (nf === 'system') return undefined;
    return language(hass);
  }

  function fmtNum(hass, v, dec) {
    if (v == null || !isFinite(v)) return '–';
    const useGrouping = !(hass && hass.locale && hass.locale.number_format === 'none');
    return Number(v).toLocaleString(numberLocale(hass), { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping });
  }

  function unitSuffix(hass, unit) {
    if (!unit) return '';
    if (unit === '%') return BLANK_BEFORE_PERCENT.includes(language(hass).split('-')[0]) ? ' %' : '%';
    return ' ' + unit;
  }

  // Value with unit; large watt values are shown in kW to stay short.
  function fmtSmart(hass, v, unit, dec) {
    if (v == null || !isFinite(v)) return '–';
    if (unit === 'W' && Math.abs(v) >= 1000) return fmtNum(hass, v / 1000, 1) + ' kW';
    return fmtNum(hass, v, dec) + unitSuffix(hass, unit);
  }

  function timeOptions(hass) {
    const o = { hour: '2-digit', minute: '2-digit' };
    const tf = hass && hass.locale && hass.locale.time_format;
    if (tf === '12') o.hour12 = true;
    else if (tf === '24') o.hour12 = false;
    return o;
  }

  function fmtTime(hass, ms) {
    return new Date(ms).toLocaleTimeString(language(hass), timeOptions(hass));
  }

  function fmtDate(hass, d, opts) {
    return d.toLocaleDateString(language(hass), opts);
  }

  // ---------------------------------------------------------------------------
  // Dates and math
  // ---------------------------------------------------------------------------

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function atHour(d, h) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h); }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parseYmd(s) { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function todayYmd() { return ymd(new Date()); }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function r2(n) { return Math.round(n * 100) / 100; }
  function pct(n) { return r2(n) + '%'; }
  function minOf(a) { let m = Infinity; for (const v of a) if (v < m) m = v; return m; }
  function maxOf(a) { let m = -Infinity; for (const v of a) if (v > m) m = v; return m; }
  function avgOf(a) { if (!a.length) return null; let s = 0; for (const v of a) s += v; return s / a.length; }
  function toMs(x) { return typeof x === 'number' ? x : Date.parse(x); }

  function niceTicks(lo, hi, count) {
    if (!(hi - lo > 1e-9)) hi = lo + 1;
    const raw = (hi - lo) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const r = raw / mag;
    const step = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
    const a = Math.floor(lo / step + 1e-9) * step;
    const b = Math.ceil(hi / step - 1e-9) * step;
    const ticks = [];
    for (let v = a; v <= b + step * 0.01; v += step) ticks.push(Math.abs(v) < step * 1e-6 ? 0 : v);
    return { lo: a, hi: b, ticks, step };
  }

  // ---------------------------------------------------------------------------
  // SVG paths
  // ---------------------------------------------------------------------------

  function scaleXY(pts, dom, yr, w, h, top, bottom) {
    const dx = dom[1] - dom[0] || 1;
    const dy = yr[1] - yr[0] || 1;
    return pts.map((p) => [(p[0] - dom[0]) / dx * w, top + (1 - (p[1] - yr[0]) / dy) * (h - top - bottom)]);
  }

  // Smooth line through the points (Catmull-Rom as cubic Béziers), control points clamped
  // so the curve never overshoots below the baseline.
  function linePath(xy, minY, maxY) {
    if (!xy.length) return '';
    let d = 'M' + r2(xy[0][0]) + ' ' + r2(xy[0][1]);
    for (let i = 0; i < xy.length - 1; i++) {
      const p0 = xy[i - 1] || xy[i];
      const p1 = xy[i];
      const p2 = xy[i + 1];
      const p3 = xy[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6, minY, maxY);
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6, minY, maxY);
      d += 'C' + r2(c1x) + ' ' + r2(c1y) + ' ' + r2(c2x) + ' ' + r2(c2y) + ' ' + r2(p2[0]) + ' ' + r2(p2[1]);
    }
    return d;
  }

  function areaPath(xy, minY, maxY, base) {
    if (xy.length < 2) return '';
    const a = xy[0];
    const z = xy[xy.length - 1];
    return linePath(xy, minY, maxY) + 'L' + r2(z[0]) + ' ' + base + 'L' + r2(a[0]) + ' ' + base + 'Z';
  }

  function nearestIndex(pts, t) {
    let lo = 0;
    let hi = pts.length - 1;
    if (hi < 0) return -1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid][0] < t) lo = mid; else hi = mid;
    }
    return Math.abs(pts[lo][0] - t) <= Math.abs(pts[hi][0] - t) ? lo : hi;
  }

  // ---------------------------------------------------------------------------
  // Shared period store (which day the cards on a dashboard show)
  // ---------------------------------------------------------------------------

  const STORE = window.__rewindTileStore || (window.__rewindTileStore = { periods: {}, subs: {}, energy: {} });

  function dashboardPath() {
    return (window.location.pathname.split('/')[1] || 'lovelace');
  }

  function periodKey(cfg) {
    return (cfg && cfg.collection_key) || 'rewind_' + dashboardPath();
  }

  function energyKey(cfg) {
    return (cfg && cfg.energy_collection_key) || 'energy_' + dashboardPath();
  }

  // null means "now" (today, live); otherwise a YYYY-MM-DD string of a past day.
  function getPeriod(key) {
    const p = STORE.periods[key];
    if (p == null || p >= todayYmd()) return null;
    return p;
  }

  function setPeriod(key, p, source) {
    if (p != null && p >= todayYmd()) p = null;
    if ((STORE.periods[key] == null ? null : STORE.periods[key]) === p) return;
    STORE.periods[key] = p;
    (STORE.subs[key] || []).slice().forEach((fn) => {
      try { fn(p, source); } catch (e) { console.error('rewind-tile-card:', e); }
    });
  }

  function subscribePeriod(key, fn) {
    (STORE.subs[key] = STORE.subs[key] || []).push(fn);
    return () => {
      const list = STORE.subs[key] || [];
      const i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    };
  }

  // Keeps the period in sync with Home Assistant's own energy date picker (and the energy
  // cards that follow it), if such a collection exists on the current dashboard.
  function ensureEnergySync(hass, pKey, eKey, enabled) {
    if (!enabled || !hass || !hass.connection) return;
    const coll = hass.connection['_' + eKey];
    const current = STORE.energy[pKey];
    if (current && current.coll === (coll || null)) return;
    if (current) {
      if (current.unsubColl) current.unsubColl();
      if (current.unsubStore) current.unsubStore();
    }
    if (!coll || typeof coll.subscribe !== 'function' || typeof coll.setPeriod !== 'function') {
      STORE.energy[pKey] = { coll: coll || null };
      return;
    }
    const push = (p) => {
      const day = p == null ? startOfDay(new Date()) : parseYmd(p);
      const cs = coll.start;
      const ce = coll.end;
      if (cs instanceof Date && ymd(cs) === ymd(day) && ce instanceof Date && ce.getTime() - cs.getTime() < 25 * HOUR) return;
      try {
        coll.setPeriod(day, new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999));
        coll.refresh();
      } catch (err) {
        console.warn('rewind-tile-card: could not sync the energy date picker', err);
      }
    };
    const entry = { coll };
    // A collection that appears (or is recreated) after a day was picked starts at "today":
    // hand it the picked day instead of letting it reset the cards.
    if (getPeriod(pKey) != null) push(getPeriod(pKey));
    entry.unsubColl = coll.subscribe(() => {
      const s = coll.start;
      if (!(s instanceof Date)) return;
      const e = coll.end instanceof Date ? coll.end : addDays(s, 1);
      if (e.getTime() - s.getTime() > 25 * HOUR) return; // week/month selected: ignore
      setPeriod(pKey, ymd(s) >= todayYmd() ? null : ymd(s), 'energy');
    });
    entry.unsubStore = subscribePeriod(pKey, (p, source) => {
      if (source !== 'energy') push(p);
    });
    STORE.energy[pKey] = entry;
  }

  // ---------------------------------------------------------------------------
  // Data access
  // ---------------------------------------------------------------------------

  const WS_CACHE = new Map();

  function cachedWS(hass, msg, ttl) {
    const key = JSON.stringify(msg);
    const hit = WS_CACHE.get(key);
    const now = Date.now();
    if (hit && now - hit.t < hit.ttl) return hit.p;
    const p = hass.callWS(msg).catch((e) => { WS_CACHE.delete(key); throw e; });
    WS_CACHE.set(key, { t: now, ttl, p });
    if (WS_CACHE.size > 400) WS_CACHE.delete(WS_CACHE.keys().next().value);
    return p;
  }

  async function getStats(hass, id, start, end, period, types, units, ttl) {
    const msg = {
      type: 'recorder/statistics_during_period',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      statistic_ids: [id],
      period,
      types
    };
    if (units) msg.units = units;
    let res;
    try { res = await cachedWS(hass, msg, ttl); } catch (e) { return []; }
    const rows = (res && res[id]) || [];
    return rows.map((r) => {
      const s = toMs(r.start);
      const e = r.end != null ? toMs(r.end) : s + PERIOD_MS[period];
      return { start: s, end: e, mean: r.mean, min: r.min, max: r.max, change: r.change, state: r.state };
    });
  }

  async function getHistory(hass, id, start, end, ttl) {
    const msg = {
      type: 'history/history_during_period',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      entity_ids: [id],
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: false
    };
    let res;
    try { res = await cachedWS(hass, msg, ttl); } catch (e) { return []; }
    const out = [];
    ((res && res[id]) || []).forEach((s) => {
      const v = parseFloat(s.s !== undefined ? s.s : s.state);
      let t = s.lu !== undefined ? s.lu * 1000 : (s.lc !== undefined ? s.lc * 1000 : Date.parse(s.last_updated || s.last_changed));
      if (!isFinite(v) || !isFinite(t)) return;
      if (t < start.getTime()) t = start.getTime();
      out.push([t, v]);
    });
    return out;
  }

  // Time-weighted average of a step function per bucket.
  function resample(points, start, end, step) {
    const out = [];
    if (!points.length) return out;
    let i = 0;
    let cur = null;
    while (i < points.length && points[i][0] <= start) { cur = points[i][1]; i++; }
    for (let b = start; b < end; b += step) {
      const be = Math.min(b + step, end);
      let acc = 0;
      let dur = 0;
      let t0 = b;
      while (i < points.length && points[i][0] < be) {
        if (cur !== null) { acc += cur * (points[i][0] - t0); dur += points[i][0] - t0; }
        cur = points[i][1];
        t0 = points[i][0];
        i++;
      }
      if (cur !== null) { acc += cur * (be - t0); dur += be - t0; }
      if (dur > 0) out.push([b + (be - b) / 2, acc / dur]);
    }
    return out;
  }

  // Mean line for a time range: 5-minute statistics, then hourly, then raw history.
  async function lineData(hass, info, start, end, ttl) {
    for (const period of ['5minute', 'hour']) {
      const rows = await getStats(hass, info.id, start, end, period, ['mean', 'min', 'max'], info.units, ttl);
      const usable = rows.filter((r) => r.mean != null && isFinite(r.mean));
      if (usable.length) {
        return { pts: usable.map((r) => [(r.start + r.end) / 2, r.mean]), rows: usable, period };
      }
    }
    const raw = await getHistory(hass, info.id, start, end, ttl);
    if (!raw.length) return { pts: [], rows: [], period: null };
    const step = 5 * 60e3;
    const pts = resample(raw, start.getTime(), Math.min(end.getTime(), Date.now()), step);
    return { pts, rows: pts.map((p) => ({ start: p[0] - step / 2, end: p[0] + step / 2, mean: p[1], min: p[1], max: p[1] })), period: 'raw' };
  }

  function extreme(rows, field, wantMax) {
    let best = null;
    rows.forEach((r) => {
      const v = r[field] != null && isFinite(r[field]) ? r[field] : r.mean;
      if (v == null || !isFinite(v)) return;
      if (!best || (wantMax ? v > best.v : v < best.v)) best = { v, t: (r.start + r.end) / 2 };
    });
    return best;
  }

  function liveTail(hass, info, base) {
    const cur = stateValue(hass, info);
    if (cur == null || base == null || base.lastState == null) return null;
    const d = cur - base.lastState;
    return d >= 0 && d < 1e5 ? d : null;
  }

  // Cumulative energy since the start of the range, from the "change" statistics.
  async function energyData(hass, info, start, end, live, ttl) {
    let rows = [];
    for (const period of ['5minute', 'hour']) {
      rows = await getStats(hass, info.id, start, end, period, ['change', 'state'], info.units, ttl);
      if (rows.length) break;
    }
    const pts = [[start.getTime(), 0]];
    let acc = 0;
    rows.forEach((r) => {
      if (r.change == null || !isFinite(r.change)) return;
      acc += r.change;
      pts.push([r.end, acc]);
    });
    const last = rows[rows.length - 1];
    const base = { acc, lastState: last && last.state != null ? last.state : null, lastEnd: last ? last.end : start.getTime() };
    if (live) {
      const tail = liveTail(hass, info, base);
      if (tail != null) pts.push([Date.now(), acc + tail]);
    }
    return { pts, total: pts[pts.length - 1][1], base, rows };
  }

  async function dayTotals(hass, info, start, n, ttl) {
    const rows = await getStats(hass, info.id, start, addDays(start, n), 'day', ['change'], info.units, ttl);
    const map = {};
    rows.forEach((r) => { map[ymd(new Date(r.start))] = r.change; });
    const out = [];
    for (let i = 0; i < n; i++) {
      const v = map[ymd(addDays(start, i))];
      out.push(v != null && isFinite(v) ? v : null);
    }
    return out;
  }

  async function getForecast(hass) {
    let res;
    try { res = await cachedWS(hass, { type: 'energy/solar_forecast' }, 10 * 60e3); } catch (e) { return []; }
    const map = {};
    Object.values(res || {}).forEach((f) => {
      Object.entries((f && f.wh_hours) || {}).forEach(([iso, wh]) => {
        const t = Date.parse(iso);
        if (isFinite(t) && isFinite(wh)) map[t] = (map[t] || 0) + wh;
      });
    });
    return Object.keys(map).map(Number).sort((a, b) => a - b).map((t) => [t, map[t] / 1000]);
  }

  function forecastFor(fc, day) {
    const s = day.getTime();
    const e = addDays(day, 1).getTime();
    const hours = fc.filter((p) => p[0] >= s && p[0] < e);
    const pts = [[s, 0]];
    let acc = 0;
    hours.forEach((p) => { acc += p[1]; pts.push([Math.min(p[0] + HOUR, e), acc]); });
    if (hours.length) pts.push([e, acc]);
    return { pts: hours.length ? pts : [], total: acc };
  }

  // ---------------------------------------------------------------------------
  // Entity helpers
  // ---------------------------------------------------------------------------

  const ENERGY_FACTORS = { Wh: 0.001, kWh: 1, MWh: 1000, GWh: 1e6 };
  const POWER_UNITS = ['W', 'kW', 'MW', 'GW'];
  const DEFAULT_COLORS = { battery: '#e91e63', temperature: '#ef5350', humidity: '#42a5f5', energy: '#ff9800', power: '#ff9800' };

  function detectKind(stateObj) {
    const a = (stateObj && stateObj.attributes) || {};
    if (a.device_class === 'energy') return 'energy';
    if (['total', 'total_increasing'].includes(a.state_class) && /Wh$/.test(a.unit_of_measurement || '')) return 'energy';
    if (a.device_class === 'power') return 'power';
    return 'measurement';
  }

  function entityInfo(hass, id, kind) {
    const so = hass.states[id];
    const unit = (so && so.attributes.unit_of_measurement) || '';
    const info = { id, unit, factor: 1, units: undefined };
    if (kind === 'energy' && ENERGY_FACTORS[unit] !== undefined) {
      info.unit = 'kWh';
      info.factor = ENERGY_FACTORS[unit];
      info.units = { energy: 'kWh' };
    } else if (kind === 'power' && POWER_UNITS.includes(unit)) {
      info.units = { power: unit };
    }
    return info;
  }

  function stateValue(hass, info) {
    const so = hass.states[info.id];
    if (!so) return null;
    const v = parseFloat(so.state);
    return isFinite(v) ? v * info.factor : null;
  }

  function friendlyName(hass, id) {
    const so = hass.states[id];
    return (so && so.attributes.friendly_name) || id;
  }

  function defaultDecimals(hass, id, unit, kind) {
    if (kind === 'energy') return 1;
    const ent = hass.entities && hass.entities[id];
    if (ent && typeof ent.display_precision === 'number') return ent.display_precision;
    if (unit === 'W' || unit === '%' || unit === 'ppm') return 0;
    if (unit === 'kW') return 2;
    return 1;
  }

  function dayTicks(hass, day) {
    return [0, 6, 12, 18, 24].map((h) => {
      const t = h === 24 ? addDays(day, 1).getTime() : atHour(day, h).getTime();
      let label = fmtTime(hass, t);
      if (h === 24 && /^0?0[:.]00/.test(label)) label = '24' + label.replace(/^0?0/, '');
      return { t, label };
    });
  }

  function liveTicks(hass, start, end) {
    const midnight = startOfDay(end).getTime();
    const mid = midnight > start.getTime() && midnight < end.getTime() ? midnight : (start.getTime() + end.getTime()) / 2;
    return [
      { t: start.getTime(), label: fmtTime(hass, start.getTime()) },
      { t: mid, label: fmtTime(hass, mid) },
      { t: end.getTime(), label: tr(hass, 'now') }
    ];
  }

  function yRange(series, kind, cfg) {
    const vs = [];
    series.forEach((s) => s.pts.forEach((p) => vs.push(p[1])));
    let lo;
    let hi;
    if (!vs.length) { lo = 0; hi = 1; } else {
      lo = minOf(vs);
      hi = maxOf(vs);
      if (kind === 'energy' || kind === 'power') {
        lo = Math.min(0, lo * 1.12);
        hi = hi > 0 ? hi * 1.12 : 1;
      } else {
        const pad = Math.max((hi - lo) * 0.15, Math.abs(hi) * 0.02, 0.5);
        lo -= pad;
        hi += pad;
      }
    }
    if (cfg.min != null && cfg.min !== '') lo = Number(cfg.min);
    if (cfg.max != null && cfg.max !== '') hi = Number(cfg.max);
    if (!(hi - lo > 1e-9)) hi = lo + 1;
    return [lo, hi];
  }

  function positionTicks(ticks, dom) {
    return ticks.map((tk) => {
      const lp = (tk.t - dom[0]) / ((dom[1] - dom[0]) || 1) * 100;
      const tf = lp < 1 ? 'none' : (lp > 99 ? 'translateX(-100%)' : 'translateX(-50%)');
      return '<span class="tick" style="left:' + pct(lp) + ';transform:' + tf + '">' + esc(tk.label) + '</span>';
    }).join('');
  }

  function motionAllowed() {
    return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  const DEVICE_CLASS_ICONS = {
    power: 'mdi:flash',
    energy: 'mdi:lightning-bolt',
    temperature: 'mdi:thermometer',
    humidity: 'mdi:water-percent',
    voltage: 'mdi:sine-wave',
    current: 'mdi:current-ac',
    pressure: 'mdi:gauge',
    illuminance: 'mdi:brightness-5',
    carbon_dioxide: 'mdi:molecule-co2',
    gas: 'mdi:meter-gas',
    water: 'mdi:water',
    speed: 'mdi:speedometer',
    wind_speed: 'mdi:weather-windy'
  };

  // Icon from the card config, the entity registry, the state attributes or the device class;
  // null lets Home Assistant's own <ha-state-icon> decide.
  function resolveIcon(hass, cfg, id) {
    if (cfg.icon) return cfg.icon;
    const ent = hass.entities && hass.entities[id];
    if (ent && ent.icon) return ent.icon;
    const so = hass.states[id];
    if (!so) return null;
    if (so.attributes.icon) return so.attributes.icon;
    const dc = so.attributes.device_class;
    if (dc === 'battery') {
      const v = parseFloat(so.state);
      if (!isFinite(v)) return 'mdi:battery-unknown';
      if (v >= 95) return 'mdi:battery';
      if (v < 5) return 'mdi:battery-outline';
      return 'mdi:battery-' + Math.round(v / 10) * 10;
    }
    return DEVICE_CLASS_ICONS[dc] || null;
  }

  function renderIcon(container, hass, cfg, id) {
    const icon = resolveIcon(hass, cfg, id);
    const key = icon || '#state';
    if (container.dataset.icon !== key) {
      container.dataset.icon = key;
      container.innerHTML = icon ? '<ha-icon icon="' + esc(icon) + '"></ha-icon>' : '<ha-state-icon></ha-state-icon>';
    }
    const si = container.querySelector('ha-state-icon');
    if (si) {
      si.hass = hass;
      si.stateObj = hass.states[id];
    }
  }

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  const SHARED_CSS = `
    @keyframes rw-ping { 0% { transform: scale(.6); opacity: .9; } 100% { transform: scale(2.2); opacity: 0; } }
    @keyframes rw-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes rw-draw { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
    @keyframes rw-val { from { opacity: 0; filter: blur(4px); transform: translateY(4px); } to { opacity: 1; filter: none; transform: none; } }
    @keyframes rw-pop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
    @keyframes rw-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
    @keyframes rw-bar { from { transform: scaleY(0); } to { transform: none; } }
    .ln { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    .ln.dash { stroke-width: 1.6; stroke-dasharray: 4 4; opacity: .85; }
    .ln.dot { stroke-width: 2; stroke-dasharray: 0.5 4; opacity: .7; }
    .end { position: absolute; display: none; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: currentColor; pointer-events: none; }
    .end.on { display: block; }
    .end::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid currentColor; animation: rw-ping 1.8s cubic-bezier(0, 0, .2, 1) infinite; }
    .xh { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--secondary-text-color, #9e9e9e); opacity: .55; pointer-events: none; }
    .hd { position: absolute; display: none; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; border: 2px solid var(--card-background-color, #1c1c1c); pointer-events: none; }
    .hd.on { display: block; }
    .tip { position: absolute; top: 2px; z-index: 4; display: flex; flex-direction: column; gap: 1px; padding: 6px 9px; border-radius: 8px;
      background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 92%, var(--primary-text-color, #e1e1e1));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, .12)); box-shadow: 0 4px 16px rgba(0, 0, 0, .3);
      font-size: 12px; line-height: 1.4; white-space: nowrap; pointer-events: none; color: var(--primary-text-color, #e1e1e1); }
    .tip-t { font-size: 11px; color: var(--secondary-text-color, #9e9e9e); }
    .tip-r { display: flex; align-items: center; gap: 6px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
    .livetag { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500;
      letter-spacing: .06em; text-transform: uppercase; color: var(--success-color, #4caf50);
      background: color-mix(in srgb, var(--success-color, #4caf50) 16%, transparent); }
    .pulse { position: relative; width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
    .pulse::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; border: 2px solid currentColor; animation: rw-ping 1.8s cubic-bezier(0, 0, .2, 1) infinite; }
    .iconbtn { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%;
      background: transparent; color: var(--primary-text-color, #e1e1e1); cursor: pointer; transition: background .15s; --mdc-icon-size: 22px; }
    .iconbtn:hover:not(:disabled) { background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 8%, transparent); }
    .iconbtn:disabled { opacity: .35; cursor: default; }
    button:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { *, *::after { animation: none !important; transition: none !important; } }
  `;

  const TILE_CSS = `
    :host { display: block; height: 100%; }
    ha-card { height: 100%; overflow: hidden; }
    .tile { position: relative; display: flex; flex-direction: column; height: 100%; min-height: 188px; box-sizing: border-box;
      container-type: inline-size; color: var(--rw-color); outline: none; cursor: pointer; }
    .tile.no-tap { cursor: default; }
    .tile:focus-visible { box-shadow: inset 0 0 0 2px var(--primary-color, #03a9f4); border-radius: var(--ha-card-border-radius, 12px); }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 14px 16px 0; }
    .name { overflow: hidden; font-size: 14px; font-weight: 500; color: var(--secondary-text-color, #9e9e9e); white-space: nowrap; text-overflow: ellipsis; }
    .icon { flex: none; color: var(--rw-color); --mdc-icon-size: 22px; }
    .val { display: flex; align-items: baseline; gap: 4px; min-height: 44px; padding: 6px 16px 0; }
    .big { font-size: 36px; font-weight: 300; line-height: 1.1; letter-spacing: -.5px; color: var(--primary-text-color, #e1e1e1); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .unit { font-size: 16px; color: var(--secondary-text-color, #9e9e9e); white-space: nowrap; }
    .duals { display: none; gap: 18px; padding: 8px 16px 0; }
    .dual-mode .val { display: none; }
    .dual-mode .duals { display: flex; }
    .dual { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .dl { display: flex; align-items: center; gap: 6px; overflow: hidden; font-size: 12px; color: var(--secondary-text-color, #9e9e9e); white-space: nowrap; text-overflow: ellipsis; }
    .dv { font-size: 26px; font-weight: 300; line-height: 1.15; color: var(--primary-text-color, #e1e1e1); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .dv .unit { font-size: 13px; }
    .sub { min-height: 15px; overflow: hidden; padding: 3px 16px 0; font-size: 12px; color: var(--secondary-text-color, #9e9e9e); white-space: nowrap; text-overflow: ellipsis; }
    @container (max-width: 230px) { .big { font-size: 28px; } .duals { flex-direction: column; gap: 4px; } .dv { font-size: 20px; } }
    .chart { position: relative; height: 76px; margin-top: auto; }
    .chart svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; overflow: visible; }
    .msg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 0 16px; font-size: 12px;
      color: var(--secondary-text-color, #9e9e9e); text-align: center; pointer-events: none; }
    .ticks { position: relative; height: 18px; margin: 0 12px 4px; }
    .ticks.hidden { display: none; }
    .tick { position: absolute; top: 3px; font-size: 10px; color: var(--secondary-text-color, #9e9e9e); white-space: nowrap; }
    .hover { display: none; }
    .hover.on { display: block; }
    .warning { padding: 16px; color: var(--error-color, #db4437); font-size: 14px; }
    .loading .chart svg, .loading .val, .loading .duals, .loading .sub { opacity: .35; transition: opacity .2s; }
    .anim { animation: rw-in .5s cubic-bezier(.2, .7, .2, 1) both; animation-delay: var(--rw-delay, 0ms); }
    .anim .area { animation: rw-fade .7s ease-out both; animation-delay: calc(var(--rw-delay, 0ms) + 100ms); }
    .anim .lines { animation: rw-draw 1.2s cubic-bezier(.35, .6, .2, 1) both; animation-delay: calc(var(--rw-delay, 0ms) + 420ms); }
    .anim .val, .anim .duals, .anim .sub { animation: rw-val .6s ease both; animation-delay: var(--rw-delay, 0ms); }
    .anim .end.on { animation: rw-pop .45s cubic-bezier(.2, .8, .3, 1.4) both; animation-delay: calc(var(--rw-delay, 0ms) + 1650ms); }
  `;

  const BAR_CSS = `
    :host { display: block; container-type: inline-size; }
    ha-card { display: flex; flex-wrap: nowrap; align-items: center; gap: 2px; padding: 6px; box-sizing: border-box; }
    .date { display: flex; flex: 1 1 auto; align-items: center; gap: 10px; min-width: 0; min-height: 44px; margin-right: auto; padding: 0 12px; border: 0; border-radius: 10px;
      background: transparent; color: var(--primary-text-color, #e1e1e1); font: inherit; font-size: 16px; font-weight: 500; text-align: left; cursor: pointer;
      transition: background .15s; --mdc-icon-size: 20px; }
    .date:hover { background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 6%, transparent); }
    .long, .short { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .date ha-icon { flex: none; }
    .chev { transition: transform .2s; }
    .date[aria-expanded="true"] .chev { transform: rotate(180deg); }
    .short { display: none; }
    @container (max-width: 520px) { .long { display: none; } .short { display: inline; } }
    @container (max-width: 400px) {
      .date { gap: 8px; padding: 0 8px; }
      .chev { display: none; }
      .now { margin-right: 0; padding: 0 10px; }
      .iconbtn { width: 40px; height: 40px; }
    }
    .now { display: inline-flex; flex: none; align-items: center; gap: 8px; min-height: 36px; margin-right: 4px; padding: 0 14px; border-radius: 18px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, .18)); background: transparent; color: var(--primary-text-color, #e1e1e1);
      font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; transition: background .25s, border-color .25s, color .25s; }
    .now:hover { background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 6%, transparent); }
    .now .pulse { width: 8px; height: 8px; opacity: .45; }
    .now .pulse::after { display: none; }
    .now.on { border-color: transparent; color: var(--primary-color, #03a9f4); background: color-mix(in srgb, var(--primary-color, #03a9f4) 18%, transparent); }
    .now.on .pulse { opacity: 1; }
    .now.on .pulse::after { display: block; }
  `;

  const CAL_CSS = `
    :host { position: fixed; z-index: 10000; font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, sans-serif)); }
    .cal { width: 332px; max-width: calc(100vw - 16px); box-sizing: border-box; padding: 12px; border-radius: 14px;
      background: var(--card-background-color, #262626); color: var(--primary-text-color, #e1e1e1);
      border: 1px solid var(--divider-color, rgba(255, 255, 255, .1)); box-shadow: 0 12px 32px rgba(0, 0, 0, .45);
      transform-origin: top left; animation: rw-cal .18s cubic-bezier(.2, .8, .2, 1) both; }
    @keyframes rw-cal { from { opacity: 0; transform: scale(.96) translateY(-4px); } to { opacity: 1; transform: none; } }
    .h { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; font-size: 15px; font-weight: 500; }
    .g { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
    .wd { padding: 6px 0; font-size: 11px; color: var(--secondary-text-color, #9e9e9e); text-align: center; }
    .day { height: 44px; border: 0; border-radius: 50%; background: transparent; color: inherit; font: inherit; font-size: 13px; cursor: pointer; transition: background .15s; }
    .day:hover:not(:disabled) { background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 8%, transparent); }
    .day:disabled { opacity: .35; cursor: default; }
    .day.today { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-text-color, #e1e1e1) 40%, transparent); }
    .day.sel { background: var(--primary-color, #03a9f4); color: var(--text-primary-color, #fff); font-weight: 500; }
    .back { width: 100%; min-height: 44px; margin-top: 8px; border: 0; border-radius: 10px; color: inherit; font: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
      background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 6%, transparent); }
    .back:hover { background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 10%, transparent); }
  `;

  const DIALOG_CSS = `
    :host { position: fixed; inset: 0; z-index: 9999; font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, sans-serif)); }
    .wrap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; }
    .bd { position: absolute; inset: 0; background: rgba(0, 0, 0, .6); backdrop-filter: blur(3px); transition: opacity .32s ease; }
    .dlg { position: relative; display: flex; flex-direction: column; width: min(960px, 100%); max-height: calc(100vh - 32px); overflow-x: hidden; overflow-y: auto; box-sizing: border-box;
      border-radius: 20px; background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color, #e1e1e1);
      border: 1px solid var(--divider-color, rgba(255, 255, 255, .08)); box-shadow: 0 24px 64px rgba(0, 0, 0, .5);
      transition: transform .42s cubic-bezier(.2, .85, .25, 1), opacity .26s ease; will-change: transform; }
    .head { display: flex; align-items: center; gap: 12px; padding: 16px 12px 6px 20px; }
    .ic { display: flex; flex: none; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; color: var(--rw-color);
      background: color-mix(in srgb, var(--rw-color) 18%, transparent); --mdc-icon-size: 22px; }
    .title { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
    .name { overflow: hidden; font-size: 18px; font-weight: 500; white-space: nowrap; text-overflow: ellipsis; }
    .period { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 13px; color: var(--secondary-text-color, #9e9e9e); }
    .period .livetag { display: none; }
    .period.live .livetag { display: inline-flex; }
    .ctl { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 6px 20px; }
    .seg { display: inline-flex; padding: 3px; border-radius: 12px; border: 1px solid var(--divider-color, rgba(255, 255, 255, .08));
      background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 4%, transparent); }
    .seg button { min-height: 38px; padding: 0 14px; border: 0; border-radius: 9px; background: transparent; color: var(--secondary-text-color, #9e9e9e);
      font: inherit; font-size: 14px; cursor: pointer; transition: background .2s, color .2s; }
    .seg button:hover { color: var(--primary-text-color, #e1e1e1); }
    .seg button.on { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color, #e1e1e1); box-shadow: 0 1px 3px rgba(0, 0, 0, .3); }
    .nav { display: inline-flex; align-items: center; }
    .sp { flex: 1 1 auto; }
    .cmp { display: inline-flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 12px; border-radius: 19px; border: 1px solid var(--divider-color, rgba(255, 255, 255, .14));
      background: transparent; color: var(--secondary-text-color, #9e9e9e); font: inherit; font-size: 13px; cursor: pointer; }
    .cmp[hidden] { display: none; }
    .sw { position: relative; width: 28px; height: 16px; border-radius: 8px; background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 22%, transparent); transition: background .2s; }
    .sw::after { content: ''; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: #fff; transition: transform .2s; }
    .cmp.on { color: var(--primary-text-color, #e1e1e1); }
    .cmp.on .sw { background: var(--primary-color, #03a9f4); }
    .cmp.on .sw::after { transform: translateX(12px); }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; padding: 8px 20px; }
    .stat { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 12px; background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 5%, transparent); }
    .st-l { font-size: 12px; color: var(--secondary-text-color, #9e9e9e); }
    .st-v { font-size: 22px; font-weight: 300; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .st-s { min-height: 14px; font-size: 11px; color: var(--secondary-text-color, #9e9e9e); }
    .chart { position: relative; height: 300px; margin: 10px 20px 0; cursor: crosshair; }
    .yl { position: absolute; left: 56px; right: 0; height: 0; border-top: 1px dashed var(--divider-color, rgba(255, 255, 255, .1)); }
    .ylab { position: absolute; left: -56px; top: -8px; width: 48px; font-size: 11px; color: var(--secondary-text-color, #9e9e9e); text-align: right; white-space: nowrap; }
    .plot { position: absolute; top: 0; right: 0; bottom: 26px; left: 56px; }
    .plot svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; overflow: visible; }
    .vl { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px solid var(--divider-color, rgba(255, 255, 255, .06)); }
    .col { position: absolute; top: 0; bottom: 0; padding: 0; border: 0; background: transparent; cursor: pointer; transition: background .15s; }
    .col:hover { background: color-mix(in srgb, var(--primary-text-color, #e1e1e1) 5%, transparent); }
    .bar { position: absolute; bottom: 0; padding: 0; border: 0; border-radius: 4px 4px 0 0; cursor: pointer; transform-origin: 50% 100%; transition: filter .15s; }
    .bar:hover { filter: brightness(1.2); }
    .bar.part { opacity: .55; }
    .btip { position: absolute; bottom: calc(100% + 6px); left: 50%; z-index: 4; padding: 4px 8px; border-radius: 6px; font-size: 12px; white-space: nowrap; pointer-events: none;
      color: var(--primary-text-color, #e1e1e1); background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 92%, var(--primary-text-color, #e1e1e1));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, .12)); opacity: 0; transform: translateX(-50%); transition: opacity .15s; }
    .bar:hover .btip, .bar:focus-visible .btip { opacity: 1; }
    .bar.edge-l .btip { left: 0; transform: none; }
    .bar.edge-r .btip { left: auto; right: 0; transform: none; }
    .xax { position: absolute; right: 0; bottom: 0; left: 56px; height: 22px; }
    .tick { position: absolute; top: 6px; font-size: 11px; color: var(--secondary-text-color, #9e9e9e); white-space: nowrap; }
    .msg { position: absolute; inset: 0 0 26px 56px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--secondary-text-color, #9e9e9e); }
    .hover { display: none; }
    .hover.on { display: block; }
    .legend { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 10px 20px 18px; font-size: 12px; color: var(--secondary-text-color, #9e9e9e); }
    .lg { display: inline-flex; align-items: center; gap: 6px; }
    .sw2 { width: 16px; height: 3px; border-radius: 2px; background: currentColor; }
    .sw2.dash { height: 0; background: none; border-top: 2px dashed currentColor; }
    .sw2.dot { height: 0; background: none; border-top: 2px dotted currentColor; }
    .hint { margin-left: auto; }
    .loading .plot, .loading .stats { opacity: .4; transition: opacity .2s; }
    .anim .lines { animation: rw-draw 1s cubic-bezier(.35, .6, .2, 1) .4s both; }
    .anim .area { animation: rw-fade .7s ease-out .05s both; }
    .anim .bar { animation: rw-bar .55s cubic-bezier(.2, .8, .2, 1) both; }
    .anim .stat { animation: rw-val .5s ease both; }
    .anim .end.on { animation: rw-pop .4s cubic-bezier(.2, .8, .3, 1.4) 1.4s both; }
    @media (max-width: 640px) {
      .wrap { align-items: flex-end; padding: 0; }
      .dlg { max-height: 94vh; border-radius: 20px 20px 0 0; }
      .chart { height: 240px; margin: 10px 12px 0; }
      .stats, .ctl, .legend { padding-left: 12px; padding-right: 12px; }
      .hint { margin-left: 0; }
    }
  `;

  // ---------------------------------------------------------------------------
  // Tile card
  // ---------------------------------------------------------------------------

  class RewindTileCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._uid = 'rw' + Math.random().toString(36).slice(2, 9);
      this._period = undefined;
      this._token = 0;
      this._data = null;
      this._lastDraw = 0;
    }

    static getStubConfig(hass) {
      const ids = Object.keys((hass && hass.states) || {});
      const power = ids.find((id) => id.startsWith('sensor.') && hass.states[id].attributes.device_class === 'power');
      const numeric = ids.find((id) => id.startsWith('sensor.') && isFinite(parseFloat(hass.states[id].state)));
      return { entity: power || numeric || 'sensor.example_power' };
    }

    setConfig(config) {
      if (!config || !config.entity) throw new Error('rewind-tile-card: "entity" is required');
      if (config.kind && !['power', 'measurement', 'energy'].includes(config.kind)) throw new Error('rewind-tile-card: "kind" must be power, measurement or energy');
      if (config.day_value && !['max', 'min', 'mean', 'last'].includes(config.day_value)) throw new Error('rewind-tile-card: "day_value" must be max, min, mean or last');
      if (config.tap_action && !['details', 'more-info', 'none'].includes(config.tap_action)) throw new Error('rewind-tile-card: "tap_action" must be details, more-info or none');
      this._config = Object.assign({ tap_action: 'details', animate: true, fill: true, show_ticks: true, energy_sync: true }, config);
      this._built = false;
      this._data = null;
      this._period = undefined;
      if (this._unsub) { this._unsub(); this._unsub = null; }
      if (this._hass) this.hass = this._hass;
    }

    set hass(hass) {
      this._hass = hass;
      if (!this._config) return;
      const so = hass.states[this._config.entity];
      if (!so) { this._showWarning(tr(hass, 'entity_missing', { entity: this._config.entity })); return; }
      if (!this._built) this._build();
      ensureEnergySync(hass, periodKey(this._config), energyKey(this._config), this._config.energy_sync !== false);
      if (!this._unsub && this.isConnected) this._subscribe();
      this._updateHeader();
      this._onLiveUpdate();
    }

    get hass() { return this._hass; }

    connectedCallback() {
      if (this._config && this._hass && this._built && !this._unsub) this._subscribe();
      if (!this._timer) {
        this._timer = setInterval(() => {
          if (this._period !== null || !this._data) return;
          this._load(this._loadedDay !== todayYmd());
        }, 5 * 60e3);
      }
    }

    disconnectedCallback() {
      if (this._unsub) { this._unsub(); this._unsub = null; }
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
      clearTimeout(this._drawTimer);
    }

    getCardSize() { return 3; }

    getGridOptions() { return { columns: 6, min_columns: 4 }; }

    _subscribe() {
      const key = periodKey(this._config);
      this._unsub = subscribePeriod(key, (p) => this._setPeriod(p));
      this._setPeriod(getPeriod(key));
    }

    _setPeriod(p) {
      if (p === this._period && this._data) return;
      this._period = p;
      this._load(true);
    }

    _setup() {
      const hass = this._hass;
      const c = this._config;
      const so = hass.states[c.entity];
      this._kind = c.kind || detectKind(so);
      this._info = entityInfo(hass, c.entity, this._kind);
      this._info2 = c.secondary_entity && this._kind === 'energy' ? entityInfo(hass, c.secondary_entity, this._kind) : null;
      this._dec = c.decimals != null ? Number(c.decimals) : defaultDecimals(hass, c.entity, this._info.unit, this._kind);
      const dc = so && so.attributes.device_class;
      this._color = c.color || DEFAULT_COLORS[dc] || DEFAULT_COLORS[this._kind] || 'var(--primary-color, #03a9f4)';
      this._color2 = c.secondary_color || '#ffb74d';
    }

    _build() {
      const c = this._config;
      this._setup();
      const tap = c.tap_action !== 'none';
      this.shadowRoot.innerHTML = `
        <style>${SHARED_CSS}${TILE_CSS}</style>
        <ha-card>
          <div class="tile${tap ? '' : ' no-tap'}" ${tap ? 'role="button" tabindex="0"' : ''}>
            <div class="head"><span class="name"></span><span class="icon"></span></div>
            <div class="val"><span class="big">–</span><span class="unit"></span></div>
            <div class="duals">
              <div class="dual"><span class="dl"><span class="dot d0"></span><span class="dn0"></span></span><span class="dv"><span class="dvn0">–</span><span class="unit dvu0"></span></span></div>
              <div class="dual"><span class="dl"><span class="dot d1"></span><span class="dn1"></span></span><span class="dv"><span class="dvn1">–</span><span class="unit dvu1"></span></span></div>
            </div>
            <div class="sub"></div>
            <div class="chart">
              <svg class="area" viewBox="0 0 300 76" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="${this._uid}-g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" style="stop-color: var(--rw-color); stop-opacity: .42"></stop>
                  <stop offset="1" style="stop-color: var(--rw-color); stop-opacity: 0"></stop>
                </linearGradient></defs>
                <path class="ap" fill="url(#${this._uid}-g)"></path>
              </svg>
              <svg class="lines" viewBox="0 0 300 76" preserveAspectRatio="none" aria-hidden="true">
                <path class="ln l0"></path><path class="ln l1"></path>
              </svg>
              <span class="end"></span>
              <div class="hover"><span class="xh"></span><span class="hd hd0"></span><span class="hd hd1"></span>
                <div class="tip"><span class="tip-t"></span><span class="tip-r r0"><span class="dot"></span><span></span></span><span class="tip-r r1"><span class="dot"></span><span></span></span></div>
              </div>
              <div class="msg"></div>
            </div>
            <div class="ticks${c.show_ticks === false ? ' hidden' : ''}"></div>
          </div>
        </ha-card>`;
      const $ = (s) => this.shadowRoot.querySelector(s);
      this._els = {
        tile: $('.tile'), name: $('.name'), icon: $('.icon'), big: $('.big'), unit: $('.val .unit'), sub: $('.sub'),
        dn: [$('.dn0'), $('.dn1')], dvn: [$('.dvn0'), $('.dvn1')], dvu: [$('.dvu0'), $('.dvu1')], dd: [$('.d0'), $('.d1')],
        chart: $('.chart'), ap: $('.ap'), area: $('.area'), l: [$('.l0'), $('.l1')], end: $('.end'), msg: $('.msg'), ticks: $('.ticks'),
        hover: $('.hover'), xh: $('.xh'), hd: [$('.hd0'), $('.hd1')], tip: $('.tip'), tipT: $('.tip-t'), tipR: [$('.r0'), $('.r1')]
      };
      this._els.tile.style.setProperty('--rw-color', this._color);
      this._els.tile.style.setProperty('--rw-color2', this._color2);
      const tile = this._els.tile;
      tile.addEventListener('click', () => this._tap());
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._tap(); }
      });
      tile.addEventListener('mousemove', (e) => this._hover(e));
      tile.addEventListener('mouseleave', () => this._els.hover.classList.remove('on'));
      this._built = true;
    }

    _showWarning(text) {
      this._built = false;
      this.shadowRoot.innerHTML = `<style>${TILE_CSS}</style><ha-card><div class="warning">${esc(text)}</div></ha-card>`;
    }

    _name() { return this._config.name || friendlyName(this._hass, this._config.entity); }
    _label() { return this._config.primary_label || friendlyName(this._hass, this._config.entity); }
    _label2() { return this._config.secondary_label || friendlyName(this._hass, this._config.secondary_entity); }

    _updateHeader() {
      const e = this._els;
      if (!e) return;
      const name = this._name();
      if (e.name.textContent !== name) e.name.textContent = name;
      renderIcon(e.icon, this._hass, this._config, this._config.entity);
      if (this._config.tap_action !== 'none') e.tile.setAttribute('aria-label', tr(this._hass, 'open_details', { name }));
    }

    async _load(animate) {
      if (!this._built || !this._hass) return;
      const token = ++this._token;
      const period = this._period === undefined ? null : this._period;
      this._els.tile.classList.add('loading');
      let data;
      try {
        data = await this._compute(period);
      } catch (err) {
        console.error('rewind-tile-card:', err);
        data = { live: period === null, series: [], dom: [Date.now() - DAY, Date.now()], ticks: [], value: null, sub: '', msg: tr(this._hass, 'no_data') };
      }
      if (token !== this._token) return;
      data.yr = yRange(data.series, this._kind, this._config);
      this._data = data;
      this._loadedDay = todayYmd();
      this._els.tile.classList.remove('loading');
      this._render(animate);
    }

    async _compute(period) {
      const hass = this._hass;
      const c = this._config;
      const kind = this._kind;
      const now = new Date();
      const today = startOfDay(now);
      const live = period === null;
      const day = live ? today : parseYmd(period);
      const dayEnd = addDays(day, 1);
      const prevDay = addDays(day, -1);
      const ttl = live ? 60e3 : 30 * 60e3;
      const p = this._info;
      const s2 = this._info2;
      const dec = this._dec;
      const out = { live, series: [], dom: null, ticks: [], value: null, unit: p.unit, duals: null, sub: '', msg: '' };

      if (kind === 'energy') {
        const end = live ? now : dayEnd;
        out.dom = [day.getTime(), dayEnd.getTime()];
        out.ticks = dayTicks(hass, day);
        const a = await energyData(hass, p, day, end, live, ttl);
        out.series.push({ pts: a.pts, color: 'var(--rw-color)', label: s2 ? this._label() : this._name(), area: !s2, base: a.base, info: p, fmt: (v) => fmtSmart(hass, v, p.unit, 1) });
        if (s2) {
          const b = await energyData(hass, s2, day, end, live, ttl);
          out.series.push({ pts: b.pts, color: 'var(--rw-color2)', label: this._label2(), base: b.base, info: s2, fmt: (v) => fmtSmart(hass, v, s2.unit, 1) });
          out.duals = [
            { label: this._label(), num: fmtNum(hass, a.total, dec), unit: p.unit, color: 'var(--rw-color)' },
            { label: this._label2(), num: fmtNum(hass, b.total, dec), unit: s2.unit, color: 'var(--rw-color2)' }
          ];
          const pa = await dayTotals(hass, p, prevDay, 1, 30 * 60e3);
          const pb = await dayTotals(hass, s2, prevDay, 1, 30 * 60e3);
          if (pa[0] != null && pb[0] != null) {
            out.sub = tr(hass, live ? 'dual_yesterday' : 'dual_previous', { a: fmtNum(hass, pa[0], dec), b: fmtSmart(hass, pb[0], s2.unit, dec) });
          }
          if (!a.rows.length && !b.rows.length) out.msg = tr(hass, 'no_stats');
        } else {
          out.value = a.total;
          if (c.forecast && live) {
            const fc = await getForecast(hass);
            const ft = forecastFor(fc, day);
            const fm = forecastFor(fc, dayEnd);
            if (ft.pts.length > 1) {
              out.series.push({ pts: ft.pts, color: c.forecast_color || '#ffd54f', dashed: true, label: tr(hass, 'forecast'), fmt: (v) => fmtSmart(hass, v, 'kWh', 1) });
            }
            if (ft.total > 0 || fm.total > 0) {
              out.sub = tr(hass, 'forecast_today_tomorrow', { today: fmtNum(hass, ft.total, 1), tomorrow: fmtSmart(hass, fm.total, 'kWh', 1) });
            }
          }
          if (!out.sub) {
            const pt = await dayTotals(hass, p, prevDay, 1, 30 * 60e3);
            if (pt[0] != null) out.sub = tr(hass, live ? 'vs_yesterday' : 'vs_previous', { value: fmtSmart(hass, pt[0], p.unit, dec) });
          }
          if (!a.rows.length) out.msg = tr(hass, 'no_stats');
        }
        return out;
      }

      const fmt = (v) => fmtSmart(hass, v, p.unit, dec);
      if (live) {
        const hrs = Number(c.live_hours) > 0 ? Number(c.live_hours) : (kind === 'power' ? 3 : 24);
        const start = new Date(now.getTime() - hrs * HOUR);
        let pts;
        if (hrs <= 6) {
          const raw = await getHistory(hass, p.id, start, now, 30e3);
          this._liveStep = Math.max(60e3, hrs * HOUR / 160);
          pts = resample(raw, start.getTime(), now.getTime(), this._liveStep);
        } else {
          const r = await lineData(hass, p, start, now, 60e3);
          this._liveStep = 5 * 60e3;
          pts = r.pts;
        }
        const cur = stateValue(hass, p);
        if (cur != null) pts.push([now.getTime(), cur]);
        this._liveHours = hrs;
        out.dom = [start.getTime(), now.getTime()];
        out.ticks = liveTicks(hass, start, now);
        out.value = cur;
        out.series.push({ pts, color: 'var(--rw-color)', label: this._name(), area: true, fmt });
        if (kind === 'power') {
          const r = await lineData(hass, p, today, now, 2 * 60e3);
          let best = extreme(r.rows, 'mean', true);
          if (cur != null && (!best || cur > best.v)) best = { v: cur, t: now.getTime() };
          if (best) out.sub = tr(hass, 'peak_today', { value: fmt(best.v), time: fmtTime(hass, best.t) });
        } else if (pts.length) {
          const vs = pts.map((x) => x[1]);
          out.sub = tr(hass, 'range_hours', { hours: fmtNum(hass, hrs, 0), min: fmtNum(hass, minOf(vs), dec), max: fmt(maxOf(vs)) });
        }
        if (!pts.length) out.msg = tr(hass, 'no_data');
        return out;
      }

      const r = await lineData(hass, p, day, dayEnd, ttl);
      out.dom = [day.getTime(), dayEnd.getTime()];
      out.ticks = dayTicks(hass, day);
      out.series.push({ pts: r.pts, color: 'var(--rw-color)', label: this._name(), area: true, fmt });
      if (!r.pts.length) { out.msg = tr(hass, r.period === null ? 'no_data' : 'no_stats'); return out; }
      const mode = c.day_value || (kind === 'power' ? 'max' : 'mean');
      const mx = extreme(r.rows, 'mean', true);
      const mn = extreme(r.rows, 'mean', false);
      const avg = avgOf(r.pts.map((x) => x[1]));
      const last = r.pts[r.pts.length - 1][1];
      if (mode === 'max') {
        out.value = mx.v;
        out.sub = tr(hass, kind === 'power' ? 'peak_at' : 'day_max', { time: fmtTime(hass, mx.t), value: fmt(avg) });
      } else if (mode === 'min') {
        out.value = mn.v;
        out.sub = tr(hass, 'day_min', { time: fmtTime(hass, mn.t), value: fmt(avg) });
      } else if (mode === 'last') {
        out.value = last;
        out.sub = tr(hass, 'day_last', { min: fmtNum(hass, mn.v, dec), max: fmt(mx.v) });
      } else {
        out.value = avg;
        out.sub = tr(hass, 'day_mean', { min: fmtNum(hass, mn.v, dec), max: fmt(mx.v) });
      }
      return out;
    }

    _bigValue(d) {
      const hass = this._hass;
      if (d.value == null) return { num: '–', unit: d.unit || '' };
      if (!d.live && this._kind === 'power' && d.unit === 'W' && Math.abs(d.value) >= 1000) {
        return { num: fmtNum(hass, d.value / 1000, 1), unit: 'kW' };
      }
      return { num: fmtNum(hass, d.value, this._dec), unit: d.unit || '' };
    }

    _render(animate) {
      const d = this._data;
      const e = this._els;
      if (!d || !e) return;
      e.tile.classList.toggle('dual-mode', !!d.duals);
      this._renderValues();
      e.msg.textContent = d.msg || '';
      this._draw();
      if (animate) this._animate();
    }

    _renderValues() {
      const d = this._data;
      const e = this._els;
      if (d.duals) {
        d.duals.forEach((x, i) => {
          e.dn[i].textContent = x.label;
          e.dvn[i].textContent = x.num;
          e.dvu[i].textContent = unitSuffix(this._hass, x.unit);
          e.dd[i].style.background = x.color;
        });
      } else {
        const v = this._bigValue(d);
        e.big.textContent = v.num;
        e.unit.textContent = v.unit;
      }
      e.sub.textContent = d.sub || '';
    }

    _draw() {
      const d = this._data;
      const e = this._els;
      const c = this._config;
      this._lastDraw = Date.now();
      d.series.forEach((s) => { s.xy = scaleXY(s.pts, d.dom, d.yr, 300, 76, 12, 3); });
      const s0 = d.series[0];
      e.ap.setAttribute('d', c.fill !== false && s0 && s0.area ? areaPath(s0.xy, 2, 73, 76) : '');
      for (let i = 0; i < 2; i++) {
        const s = d.series[i];
        e.l[i].setAttribute('d', s ? linePath(s.xy, 2, 73) : '');
        e.l[i].style.stroke = s ? s.color : 'none';
        e.l[i].classList.toggle('dash', !!(s && s.dashed));
      }
      const last = s0 && s0.xy[s0.xy.length - 1];
      if (d.live && last && !d.msg) {
        e.end.classList.add('on');
        e.end.style.left = pct(last[0] / 300 * 100);
        e.end.style.top = pct(last[1] / 76 * 100);
      } else {
        e.end.classList.remove('on');
      }
      e.ticks.innerHTML = positionTicks(d.ticks, d.dom);
    }

    _animate() {
      if (this._config.animate === false || !motionAllowed()) return;
      const tile = this._els.tile;
      const r = this.getBoundingClientRect();
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const delay = Math.round(clamp(r.left / w, 0, 1) * 160 + clamp(r.top / h, 0, 1) * 160);
      tile.style.setProperty('--rw-delay', delay + 'ms');
      tile.classList.remove('anim');
      void tile.offsetWidth;
      tile.classList.add('anim');
    }

    _onLiveUpdate() {
      const d = this._data;
      if (!d || !d.live || !this._hass) return;
      const so = this._hass.states[this._config.entity];
      const so2 = this._info2 ? this._hass.states[this._config.secondary_entity] : null;
      const key = (so && so.last_updated) + '|' + (so2 && so2.last_updated);
      if (key === this._lastKey) return;
      this._lastKey = key;
      const now = Date.now();
      if (this._kind === 'energy') {
        let changed = false;
        d.series.forEach((s) => {
          if (!s.base || !s.info) return;
          const tail = liveTail(this._hass, s.info, s.base);
          if (tail == null) return;
          const v = s.base.acc + tail;
          const lastPt = s.pts[s.pts.length - 1];
          if (s.pts.length > 1 && lastPt[0] > s.base.lastEnd) { lastPt[0] = now; lastPt[1] = v; } else s.pts.push([now, v]);
          changed = true;
        });
        if (!changed) return;
        if (d.duals) {
          d.series.slice(0, 2).forEach((s, i) => { if (d.duals[i]) d.duals[i].num = fmtNum(this._hass, s.pts[s.pts.length - 1][1], this._dec); });
        } else {
          d.value = d.series[0].pts[d.series[0].pts.length - 1][1];
        }
      } else {
        const cur = stateValue(this._hass, this._info);
        if (cur == null) return;
        const s = d.series[0];
        const step = this._liveStep || 60e3;
        const lastPt = s.pts[s.pts.length - 1];
        const prev = s.pts[s.pts.length - 2];
        if (lastPt && prev && now - prev[0] < step) { lastPt[0] = now; lastPt[1] = cur; } else s.pts.push([now, cur]);
        const start = now - (this._liveHours || 3) * HOUR;
        while (s.pts.length > 2 && s.pts[0][0] < start) s.pts.shift();
        d.dom = [start, now];
        d.ticks = liveTicks(this._hass, new Date(start), new Date(now));
        d.value = cur;
      }
      d.yr = yRange(d.series, this._kind, this._config);
      this._renderValues();
      clearTimeout(this._drawTimer);
      const wait = Math.max(0, 3000 - (now - this._lastDraw));
      this._drawTimer = setTimeout(() => { if (this._data === d) this._draw(); }, wait);
    }

    _hover(ev) {
      const d = this._data;
      const e = this._els;
      if (!d || !d.series.length || d.msg) return;
      const rc = e.chart.getBoundingClientRect();
      if (ev.clientY < rc.top - 4 || ev.clientY > rc.bottom + 22) { e.hover.classList.remove('on'); return; }
      const f = clamp((ev.clientX - rc.left) / rc.width, 0, 1);
      const info = hoverInfo(d.series, d.dom, f, 300, 76);
      if (!info) { e.hover.classList.remove('on'); return; }
      e.hover.classList.add('on');
      e.xh.style.left = info.left;
      for (let i = 0; i < 2; i++) {
        const row = info.rows[i];
        e.hd[i].classList.toggle('on', !!row);
        e.tipR[i].style.display = row ? '' : 'none';
        if (!row) continue;
        e.hd[i].style.left = row.x;
        e.hd[i].style.top = row.y;
        e.hd[i].style.background = row.color;
        e.tipR[i].firstElementChild.style.background = row.color;
        e.tipR[i].lastElementChild.textContent = row.text;
      }
      e.tipT.textContent = hoverTime(this._hass, info.t, d.live ? null : startOfDay(new Date(d.dom[0])));
      e.tip.style.left = info.left;
      e.tip.style.transform = info.flip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)';
    }

    _tap() {
      const c = this._config;
      if (c.tap_action === 'none') return;
      if (c.tap_action === 'more-info') {
        this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: c.entity } }));
        return;
      }
      const card = this.shadowRoot.querySelector('ha-card');
      RewindDetailsDialog.open({
        card: this,
        getHass: () => this._hass,
        config: c,
        kind: this._kind,
        info: this._info,
        info2: this._info2,
        dec: this._dec,
        name: this._name(),
        label: this._info2 ? this._label() : this._name(),
        label2: this._info2 ? this._label2() : null,
        color: this._color,
        color2: this._color2,
        period: this._period == null ? null : this._period,
        origin: (card || this).getBoundingClientRect()
      });
    }
  }

  // Positions and texts of the hover crosshair for a set of series.
  function hoverInfo(series, dom, f, w, h) {
    const ref = series.reduce((a, b) => (b.pts.length && (!a.pts.length || b.pts[b.pts.length - 1][0] > a.pts[a.pts.length - 1][0]) ? b : a));
    if (!ref.pts.length) return null;
    const t = dom[0] + f * (dom[1] - dom[0]);
    const ti = ref.pts[nearestIndex(ref.pts, t)][0];
    const lp = (ti - dom[0]) / ((dom[1] - dom[0]) || 1) * 100;
    const rows = [];
    series.forEach((s) => {
      if (!s.pts.length || !s.xy) return;
      const j = nearestIndex(s.pts, ti);
      const step = s.pts.length > 1 ? Math.abs(s.pts[s.pts.length - 1][0] - s.pts[0][0]) / (s.pts.length - 1) : HOUR;
      if (Math.abs(s.pts[j][0] - ti) > step * 0.75 + 60e3) return;
      rows.push({ x: pct(s.xy[j][0] / w * 100), y: pct(s.xy[j][1] / h * 100), color: s.color, text: s.label + ': ' + (s.fmt ? s.fmt(s.pts[j][1]) : String(s.pts[j][1])) });
    });
    return { t: ti, left: pct(lp), flip: lp > 58, rows };
  }

  function hoverTime(hass, t, dayOfRange) {
    const d = new Date(t);
    const time = fmtTime(hass, t);
    if (dayOfRange && ymd(d) === ymd(dayOfRange)) return time;
    if (!dayOfRange && ymd(d) === todayYmd()) return time;
    return fmtDate(hass, d, { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + time;
  }

  // ---------------------------------------------------------------------------
  // Date bar card
  // ---------------------------------------------------------------------------

  class RewindDateBar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    static getStubConfig() { return {}; }

    setConfig(config) {
      this._config = Object.assign({ energy_sync: true }, config || {});
      if (this._unsub) { this._unsub(); this._unsub = null; }
      if (this.isConnected) this._subscribe();
      if (this._built) this._render();
    }

    set hass(hass) {
      this._hass = hass;
      if (!this._config) return;
      if (!this._built) this._build();
      ensureEnergySync(hass, periodKey(this._config), energyKey(this._config), this._config.energy_sync !== false);
      this._render();
    }

    connectedCallback() {
      if (this._config && !this._unsub) this._subscribe();
      if (!this._timer) this._timer = setInterval(() => this._render(), 60e3);
    }

    disconnectedCallback() {
      if (this._unsub) { this._unsub(); this._unsub = null; }
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
      if (this._popover) this._popover.close();
    }

    getCardSize() { return 1; }

    getGridOptions() { return { columns: 'full', min_columns: 6 }; }

    _subscribe() {
      this._unsub = subscribePeriod(periodKey(this._config), () => this._render());
    }

    _build() {
      this.shadowRoot.innerHTML = `
        <style>${SHARED_CSS}${BAR_CSS}</style>
        <ha-card>
          <button class="date" type="button" aria-haspopup="dialog" aria-expanded="false">
            <ha-icon icon="mdi:calendar"></ha-icon><span class="long"></span><span class="short"></span><ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
          </button>
          <button class="now" type="button"><span class="pulse"></span><span class="nowtxt"></span></button>
          <button class="iconbtn prev" type="button"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
          <button class="iconbtn next" type="button"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        </ha-card>`;
      const $ = (s) => this.shadowRoot.querySelector(s);
      this._els = { date: $('.date'), long: $('.long'), short: $('.short'), now: $('.now'), nowTxt: $('.nowtxt'), prev: $('.prev'), next: $('.next') };
      this._els.now.addEventListener('click', () => this._go(null));
      this._els.prev.addEventListener('click', () => this._go(ymd(addDays(this._day(), -1))));
      this._els.next.addEventListener('click', () => this._go(ymd(addDays(this._day(), 1))));
      this._els.date.addEventListener('click', () => this._toggleCalendar());
      this._built = true;
    }

    _key() { return periodKey(this._config); }

    _day() {
      const p = getPeriod(this._key());
      return p == null ? startOfDay(new Date()) : parseYmd(p);
    }

    _go(p) {
      setPeriod(this._key(), p, 'bar');
      this._render();
    }

    _render() {
      if (!this._built || !this._hass) return;
      const hass = this._hass;
      const live = getPeriod(this._key()) == null;
      const day = this._day();
      const e = this._els;
      e.long.textContent = fmtDate(hass, day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      e.short.textContent = fmtDate(hass, day, { weekday: 'short', day: 'numeric', month: 'short' });
      e.nowTxt.textContent = tr(hass, 'now');
      e.now.classList.toggle('on', live);
      e.now.setAttribute('aria-pressed', live ? 'true' : 'false');
      e.next.disabled = live;
      e.prev.setAttribute('aria-label', tr(hass, 'prev_day'));
      e.next.setAttribute('aria-label', tr(hass, 'next_day'));
      e.date.setAttribute('aria-label', tr(hass, 'pick_date') + ': ' + e.long.textContent);
    }

    _toggleCalendar() {
      if (this._popover) { this._popover.close(); return; }
      this._els.date.setAttribute('aria-expanded', 'true');
      this._popover = RewindCalendar.open({
        anchor: this._els.date,
        hass: this._hass,
        selected: this._day(),
        onPick: (d) => this._go(d == null ? null : ymd(d)),
        onClose: () => {
          this._popover = null;
          if (this._els) this._els.date.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Calendar popover
  // ---------------------------------------------------------------------------

  class RewindCalendar extends HTMLElement {
    static open(opts) {
      const el = document.createElement('rewind-tile-calendar');
      el._opts = opts;
      document.body.appendChild(el);
      return el;
    }

    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      const o = this._opts;
      this._month = new Date(o.selected.getFullYear(), o.selected.getMonth(), 1);
      this.attachShadow({ mode: 'open' });
      this._place();
      this._render();
      this._onDown = (e) => { if (!e.composedPath().includes(this) && !e.composedPath().includes(o.anchor)) this.close(); };
      this._onKey = (e) => { if (e.key === 'Escape') { this.close(); o.anchor.focus(); } };
      this._onWin = () => this.close();
      setTimeout(() => {
        document.addEventListener('pointerdown', this._onDown, true);
        document.addEventListener('keydown', this._onKey);
        window.addEventListener('resize', this._onWin);
      });
      this.shadowRoot.addEventListener('click', (e) => this._click(e));
      const sel = this.shadowRoot.querySelector('.day.sel') || this.shadowRoot.querySelector('.day:not(:disabled)');
      if (sel) sel.focus();
    }

    close() {
      if (this._closed) return;
      this._closed = true;
      document.removeEventListener('pointerdown', this._onDown, true);
      document.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onWin);
      this.remove();
      if (this._opts.onClose) this._opts.onClose();
    }

    _place() {
      const r = this._opts.anchor.getBoundingClientRect();
      const w = Math.min(332, window.innerWidth - 16);
      const left = clamp(r.left, 8, window.innerWidth - w - 8);
      const below = r.bottom + 6;
      const top = below + 420 > window.innerHeight && r.top > 430 ? r.top - 426 : below;
      this.style.left = left + 'px';
      this.style.top = Math.max(8, top) + 'px';
    }

    _render() {
      const hass = this._opts.hass;
      const m = this._month;
      const today = startOfDay(new Date());
      const sel = ymd(this._opts.selected);
      const lead = (m.getDay() + 6) % 7;
      const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      const monday = new Date(2024, 0, 1);
      let cells = '';
      for (let i = 0; i < 7; i++) cells += '<span class="wd">' + esc(fmtDate(hass, addDays(monday, i), { weekday: 'short' }).replace('.', '')) + '</span>';
      for (let i = 0; i < lead; i++) cells += '<span></span>';
      for (let d = 1; d <= days; d++) {
        const date = new Date(m.getFullYear(), m.getMonth(), d);
        const key = ymd(date);
        const cls = 'day' + (key === ymd(today) ? ' today' : '') + (key === sel ? ' sel' : '');
        const label = fmtDate(hass, date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        cells += '<button type="button" class="' + cls + '" data-day="' + key + '"' + (date > today ? ' disabled' : '') + ' aria-label="' + esc(label) + '">' + d + '</button>';
      }
      const nextDisabled = m.getFullYear() * 12 + m.getMonth() >= today.getFullYear() * 12 + today.getMonth();
      this.shadowRoot.innerHTML = `
        <style>${SHARED_CSS}${CAL_CSS}</style>
        <div class="cal" role="dialog" aria-label="${esc(tr(hass, 'pick_date'))}">
          <div class="h">
            <button class="iconbtn" type="button" data-nav="-1" aria-label="${esc(tr(hass, 'prev_month'))}"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
            <span>${esc(fmtDate(hass, m, { month: 'long', year: 'numeric' }))}</span>
            <button class="iconbtn" type="button" data-nav="1" aria-label="${esc(tr(hass, 'next_month'))}"${nextDisabled ? ' disabled' : ''}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
          </div>
          <div class="g">${cells}</div>
          <button class="back" type="button" data-now="1">${esc(tr(hass, 'back_to_now'))}</button>
        </div>`;
    }

    _click(e) {
      const t = e.target.closest('button');
      if (!t || t.disabled) return;
      if (t.dataset.nav) {
        this._month = new Date(this._month.getFullYear(), this._month.getMonth() + Number(t.dataset.nav), 1);
        this._render();
        return;
      }
      if (t.dataset.now) { this._opts.onPick(null); this.close(); return; }
      if (t.dataset.day) { this._opts.onPick(parseYmd(t.dataset.day)); this.close(); }
    }
  }

  // ---------------------------------------------------------------------------
  // Details dialog
  // ---------------------------------------------------------------------------

  const DW = 1000;
  const DH = 260;
  const DTOP = 6;

  class RewindDetailsDialog extends HTMLElement {
    static open(opts) {
      const el = document.createElement('rewind-tile-details');
      el._opts = opts;
      document.body.appendChild(el);
      return el;
    }

    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      const o = this._opts;
      const today = startOfDay(new Date());
      this._state = { range: 'day', end: o.period == null ? today : parseYmd(o.period), cmp: false };
      this._token = 0;
      this._returnFocus = document.activeElement;
      this.attachShadow({ mode: 'open' });
      this._build();
      this._onKey = (e) => { if (e.key === 'Escape') this.close(); };
      document.addEventListener('keydown', this._onKey);
      this._openAnimation();
      this._load(true);
    }

    get _hass() { return this._opts.getHass(); }

    _build() {
      const o = this._opts;
      const hass = this._hass;
      const c = o.config;
      this.shadowRoot.innerHTML = `
        <style>${SHARED_CSS}${DIALOG_CSS}</style>
        <div class="wrap">
          <div class="bd" data-action="close"></div>
          <div class="dlg" role="dialog" aria-modal="true" aria-labelledby="rw-title">
            <div class="head">
              <span class="ic"></span>
              <div class="title"><span class="name" id="rw-title">${esc(o.name)}</span>
                <span class="period"><span class="ptxt"></span><span class="livetag"><span class="pulse"></span>${esc(tr(hass, 'live'))}</span></span></div>
              <button class="iconbtn" type="button" data-action="close" aria-label="${esc(tr(hass, 'close'))}"><ha-icon icon="mdi:close"></ha-icon></button>
            </div>
            <div class="body">
              <div class="ctl">
                <div class="seg" role="group" aria-label="${esc(tr(hass, 'period'))}">
                  <button type="button" data-range="day">${esc(tr(hass, 'range_day'))}</button>
                  <button type="button" data-range="7">${esc(tr(hass, 'range_7'))}</button>
                  <button type="button" data-range="30">${esc(tr(hass, 'range_30'))}</button>
                </div>
                <div class="nav">
                  <button class="iconbtn" type="button" data-action="prev"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
                  <button class="iconbtn" type="button" data-action="next"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
                </div>
                <span class="sp"></span>
                <button class="cmp" type="button" data-action="cmp"><span class="sw"></span><span>${esc(tr(hass, 'compare_prev'))}</span></button>
              </div>
              <div class="stats"></div>
              <div class="chart"></div>
              <div class="legend"></div>
            </div>
          </div>
        </div>`;
      const $ = (s) => this.shadowRoot.querySelector(s);
      this._els = { bd: $('.bd'), dlg: $('.dlg'), body: $('.body'), period: $('.period'), ptxt: $('.ptxt'), stats: $('.stats'), chart: $('.chart'), legend: $('.legend'),
        prev: $('[data-action="prev"]'), next: $('[data-action="next"]'), cmp: $('.cmp'), close: $('.head [data-action="close"]') };
      this._els.dlg.style.setProperty('--rw-color', o.color);
      this._els.dlg.style.setProperty('--rw-color2', o.color2);
      renderIcon(this.shadowRoot.querySelector('.ic'), hass, c, c.entity);
      this.shadowRoot.addEventListener('click', (e) => this._click(e));
      this._els.chart.addEventListener('mousemove', (e) => this._hover(e));
      this._els.chart.addEventListener('mouseleave', () => { const h = this.shadowRoot.querySelector('.hover'); if (h) h.classList.remove('on'); });
    }

    _animated() { return this._opts.config.animate !== false && motionAllowed(); }

    _openAnimation() {
      const e = this._els;
      e.close.focus({ preventScroll: true });
      if (!this._animated()) return;
      const r = this._opts.origin;
      const dx = Math.round(r.left + r.width / 2 - window.innerWidth / 2);
      const dy = Math.round(r.top + r.height / 2 - window.innerHeight / 2);
      e.dlg.style.transition = 'none';
      e.dlg.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(.3)';
      e.dlg.style.opacity = '0';
      e.bd.style.opacity = '0';
      void e.dlg.offsetWidth;
      e.dlg.style.transition = '';
      requestAnimationFrame(() => {
        e.dlg.style.transform = '';
        e.dlg.style.opacity = '';
        e.bd.style.opacity = '';
      });
      this._origin = { dx, dy };
    }

    close() {
      if (this._closing) return;
      this._closing = true;
      document.removeEventListener('keydown', this._onKey);
      const done = () => {
        this.remove();
        const back = this._opts.card;
        const target = back && back.shadowRoot && back.shadowRoot.querySelector('.tile');
        if (target && target.focus) target.focus({ preventScroll: true });
      };
      if (!this._animated() || !this._origin) { done(); return; }
      const e = this._els;
      e.dlg.style.transform = 'translate(' + this._origin.dx + 'px, ' + this._origin.dy + 'px) scale(.3)';
      e.dlg.style.opacity = '0';
      e.bd.style.opacity = '0';
      setTimeout(done, 340);
    }

    _click(e) {
      const t = e.target.closest('[data-action],[data-range],[data-day]');
      if (!t) return;
      const st = this._state;
      const n = st.range === 'day' ? 1 : Number(st.range);
      const today = startOfDay(new Date());
      if (t.dataset.action === 'close') { this.close(); return; }
      if (t.dataset.action === 'prev') { st.end = addDays(st.end, -n); this._load(true); return; }
      if (t.dataset.action === 'next') { const nx = addDays(st.end, n); st.end = nx > today ? today : nx; this._load(true); return; }
      if (t.dataset.action === 'cmp') { st.cmp = !st.cmp; this._load(true); return; }
      if (t.dataset.range) { if (st.range !== t.dataset.range) { st.range = t.dataset.range; this._load(true); } return; }
      if (t.dataset.day) { st.range = 'day'; st.end = parseYmd(t.dataset.day); this._load(true); }
    }

    _renderControls() {
      const hass = this._hass;
      const st = this._state;
      const n = st.range === 'day' ? 1 : Number(st.range);
      const today = startOfDay(new Date());
      const e = this._els;
      this.shadowRoot.querySelectorAll('[data-range]').forEach((b) => {
        const on = b.dataset.range === st.range;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      e.prev.setAttribute('aria-label', n === 1 ? tr(hass, 'prev_day') : tr(hass, 'prev_n_days', { n }));
      e.next.setAttribute('aria-label', n === 1 ? tr(hass, 'next_day') : tr(hass, 'next_n_days', { n }));
      e.next.disabled = st.end.getTime() >= today.getTime();
      e.cmp.hidden = n !== 1;
      e.cmp.classList.toggle('on', st.cmp);
      e.cmp.setAttribute('aria-pressed', st.cmp ? 'true' : 'false');
      const start = addDays(st.end, -(n - 1));
      e.ptxt.textContent = n === 1
        ? fmtDate(hass, st.end, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : fmtDate(hass, start, { day: 'numeric', month: 'short' }) + ' – ' + fmtDate(hass, st.end, { day: 'numeric', month: 'short', year: 'numeric' });
      e.period.classList.toggle('live', n === 1 && st.end.getTime() === today.getTime());
    }

    async _load(animate) {
      const token = ++this._token;
      this._renderControls();
      this._els.body.classList.add('loading');
      let m;
      try {
        m = await this._compute();
      } catch (err) {
        console.error('rewind-tile-card:', err);
        m = { series: [], bars: [], cols: [], stats: [], legend: [], dom: [0, 1], yt: null, xt: [], vlines: [], msg: tr(this._hass, 'no_data') };
      }
      if (token !== this._token || this._closing) return;
      this._model = m;
      this._els.body.classList.remove('loading');
      this._render();
      if (animate && this._animated()) {
        const b = this._els.body;
        b.classList.remove('anim');
        void b.offsetWidth;
        b.classList.add('anim');
      }
    }

    async _compute() {
      const o = this._opts;
      const hass = this._hass;
      const c = o.config;
      const st = this._state;
      const kind = o.kind;
      const n = st.range === 'day' ? 1 : Number(st.range);
      const now = new Date();
      const today = startOfDay(now);
      const start = addDays(st.end, -(n - 1));
      const endDay = addDays(st.end, 1);
      const liveEnd = st.end.getTime() === today.getTime();
      const end = liveEnd ? now : endDay;
      const ttl = liveEnd ? 60e3 : 30 * 60e3;
      const p = o.info;
      const s2 = o.info2;
      const dec = o.dec;
      const unit = p.unit;
      const fmt = (v) => fmtSmart(hass, v, unit, kind === 'energy' ? 1 : dec);
      const m = { series: [], bars: [], cols: [], stats: [], legend: [], dom: [start.getTime(), endDay.getTime()], xt: [], vlines: [], hint: '', msg: '', liveEnd, n, start, unit, kind };
      const tm = (t) => fmtTime(hass, t);

      if (n === 1) {
        m.xt = [0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => {
          const t = h === 24 ? endDay.getTime() : atHour(start, h).getTime();
          let label = fmtTime(hass, t);
          if (h === 24 && /^0?0[:.]00/.test(label)) label = '24' + label.replace(/^0?0/, '');
          return { t, label, minor: h % 6 !== 0 };
        });
        const prevDay = addDays(start, -1);
        if (kind === 'energy') {
          const infos = [p].concat(s2 ? [s2] : []);
          const names = [o.label].concat(s2 ? [o.label2] : []);
          const colors = ['var(--rw-color)', 'var(--rw-color2)'];
          const totals = [];
          for (let i = 0; i < infos.length; i++) {
            const a = await energyData(hass, infos[i], start, end, liveEnd, ttl);
            totals.push(a);
            m.series.push({ pts: a.pts, color: colors[i], label: names[i], area: infos.length === 1, fmt: (v) => fmtSmart(hass, v, infos[i].unit, 1) });
          }
          const prevTotals = [];
          for (let i = 0; i < infos.length; i++) {
            const b = await energyData(hass, infos[i], prevDay, start, false, 30 * 60e3);
            prevTotals.push(b);
            if (st.cmp) m.series.push({ pts: b.pts.map((x) => [x[0] + DAY, x[1]]), shift: true, color: colors[i], dotted: true, label: names[i] + ' · ' + tr(hass, 'previous_day'), fmt: (v) => fmtSmart(hass, v, infos[i].unit, 1) });
          }
          if (c.forecast && liveEnd && !s2) {
            const fc = forecastFor(await getForecast(hass), start);
            if (fc.pts.length > 1) m.series.push({ pts: fc.pts, color: c.forecast_color || '#ffd54f', dashed: true, label: tr(hass, 'forecast'), fmt: (v) => fmtSmart(hass, v, 'kWh', 1) });
          }
          infos.forEach((inf, i) => {
            m.stats.push({ label: names[i], value: fmtSmart(hass, totals[i].total, inf.unit, 1), sub: liveEnd ? tr(hass, 'until_now') : tr(hass, 'whole_day') });
          });
          infos.forEach((inf, i) => {
            m.stats.push({ label: tr(hass, 'stat_prev') + (s2 ? ' · ' + names[i] : ''), value: fmtSmart(hass, prevTotals[i].total, inf.unit, 1), sub: '' });
          });
          if (s2) {
            const diff = totals[0].total - totals[1].total;
            m.stats.push({ label: tr(hass, 'stat_net'), value: (diff >= 0 ? '+' : '−') + fmtSmart(hass, Math.abs(diff), unit, 1), sub: names[0] + ' − ' + names[1] });
          } else {
            const hourly = {};
            totals[0].rows.forEach((r) => { if (r.change != null) { const hk = atHour(new Date(r.start), new Date(r.start).getHours()).getTime(); hourly[hk] = (hourly[hk] || 0) + r.change; } });
            let bestT = null;
            Object.keys(hourly).forEach((k) => { if (bestT === null || hourly[k] > hourly[bestT]) bestT = k; });
            if (bestT !== null) m.stats.push({ label: tr(hass, 'stat_best_hour'), value: tm(Number(bestT)) + '–' + tm(Number(bestT) + HOUR), sub: fmtSmart(hass, hourly[bestT], unit, 1) });
          }
          if (!totals[0].rows.length) m.msg = tr(hass, 'no_stats');
        } else {
          let pts;
          let rows;
          const r = await lineData(hass, p, start, end, ttl);
          pts = r.pts;
          rows = r.rows;
          const cur = liveEnd ? stateValue(hass, p) : null;
          if (cur != null) { pts = pts.concat([[now.getTime(), cur]]); rows = rows.concat([{ start: now.getTime(), end: now.getTime(), mean: cur, min: cur, max: cur }]); }
          m.series.push({ pts, color: 'var(--rw-color)', label: o.name, area: true, fmt });
          if (st.cmp) {
            const pr = await lineData(hass, p, prevDay, start, 30 * 60e3);
            m.series.push({ pts: pr.pts.map((x) => [x[0] + DAY, x[1]]), shift: true, color: 'var(--rw-color)', dotted: true, label: tr(hass, 'previous_day'), fmt });
          }
          if (!pts.length) m.msg = tr(hass, r.period === null ? 'no_data' : 'no_stats');
          else {
            const mx = extreme(rows, 'mean', true);
            const mn = extreme(rows, 'mean', false);
            const avg = avgOf(pts.map((x) => x[1]));
            const last = pts[pts.length - 1][1];
            if (kind === 'power') {
              m.stats = [
                { label: tr(hass, 'stat_peak'), value: fmt(mx.v), sub: tr(hass, 'at_time', { time: tm(mx.t) }) },
                { label: tr(hass, 'stat_avg'), value: fmt(avg), sub: liveEnd ? tr(hass, 'until_now') : tr(hass, 'whole_day') },
                { label: tr(hass, 'stat_low'), value: fmt(mn.v), sub: tr(hass, 'at_time', { time: tm(mn.t) }) },
                { label: liveEnd ? tr(hass, 'stat_current') : tr(hass, 'stat_end'), value: fmt(last), sub: '' }
              ];
            } else {
              m.stats = [
                { label: tr(hass, 'stat_min'), value: fmt(mn.v), sub: tr(hass, 'at_time', { time: tm(mn.t) }) },
                { label: tr(hass, 'stat_max'), value: fmt(mx.v), sub: tr(hass, 'at_time', { time: tm(mx.t) }) },
                { label: tr(hass, 'stat_avg'), value: fmt(avg), sub: liveEnd ? tr(hass, 'until_now') : tr(hass, 'whole_day') },
                { label: liveEnd ? tr(hass, 'stat_current') : tr(hass, 'stat_end'), value: fmt(last), sub: '' }
              ];
            }
          }
        }
      } else {
        for (let i = 0; i < n; i++) {
          const d = addDays(start, i);
          const label = n === 7 ? fmtDate(hass, d, { weekday: 'short', day: 'numeric' }) : fmtDate(hass, d, { day: 'numeric', month: 'numeric' });
          if (n === 7 || i % 5 === 0 || i === n - 1) {
            m.xt.push({
              t: atHour(d, 12).getTime(),
              label,
              short: n === 7 ? fmtDate(hass, d, { weekday: 'narrow' }) : null,
              minor: n > 7 && i % 10 !== 0 && i !== n - 1,
              mid: true
            });
          }
          if (i > 0) m.vlines.push(d.getTime());
        }
        if (kind === 'energy') {
          const infos = [p].concat(s2 ? [s2] : []);
          const names = [o.label].concat(s2 ? [o.label2] : []);
          const colors = [o.color, o.color2];
          const totals = [];
          for (let i = 0; i < infos.length; i++) {
            const t = await dayTotals(hass, infos[i], start, n, ttl);
            if (liveEnd) {
              const a = await energyData(hass, infos[i], today, now, true, 60e3);
              t[n - 1] = a.total;
            }
            totals.push(t);
          }
          m.bars = { totals, names, colors, infos };
          infos.forEach((inf, i) => {
            const sum = totals[i].reduce((acc, v) => acc + (v || 0), 0);
            m.stats.push({ label: names[i], value: fmtSmart(hass, sum, inf.unit, 1), sub: tr(hass, 'per_day', { value: fmtSmart(hass, sum / n, inf.unit, 1) }) });
          });
          let bi = -1;
          totals[0].forEach((v, i) => { if (v != null && (bi < 0 || v > totals[0][bi])) bi = i; });
          if (bi >= 0) m.stats.push({ label: tr(hass, 'stat_best_day') + (s2 ? ' · ' + names[0] : ''), value: fmtSmart(hass, totals[0][bi], unit, 1), sub: fmtDate(hass, addDays(start, bi), { weekday: 'short', day: 'numeric', month: 'short' }) });
          if (!totals[0].some((v) => v != null)) m.msg = tr(hass, 'no_stats');
          m.hint = tr(hass, 'hint_bars');
        } else {
          const rows = await getStats(hass, p.id, start, end, 'hour', ['mean', 'min', 'max'], p.units, ttl);
          let pts = rows.filter((r) => r.mean != null && isFinite(r.mean)).map((r) => [(r.start + r.end) / 2, r.mean]);
          if (n > 7) {
            const merged = [];
            for (let i = 0; i < pts.length; i += 2) {
              const a = pts[i];
              const b = pts[i + 1];
              merged.push(b ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] : a);
            }
            pts = merged;
          }
          const cur = liveEnd ? stateValue(hass, p) : null;
          if (cur != null && pts.length) pts.push([now.getTime(), cur]);
          m.series.push({ pts, color: 'var(--rw-color)', label: o.name, area: true, fmt });
          for (let i = 0; i < n; i++) {
            const d = addDays(start, i);
            m.cols.push({ t0: d.getTime(), t1: addDays(d, 1).getTime(), day: ymd(d), label: tr(hass, 'show_day', { date: fmtDate(hass, d, { weekday: 'long', day: 'numeric', month: 'long' }) }) });
          }
          if (!pts.length) m.msg = tr(hass, 'no_stats');
          else {
            const mx = extreme(rows, 'mean', true);
            const mn = extreme(rows, 'mean', false);
            const avg = avgOf(pts.map((x) => x[1]));
            const when = (t) => fmtDate(hass, new Date(t), { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + tm(t);
            m.stats = [
              { label: kind === 'power' ? tr(hass, 'stat_peak') : tr(hass, 'stat_max'), value: fmt(mx.v), sub: when(mx.t) },
              { label: kind === 'power' ? tr(hass, 'stat_low') : tr(hass, 'stat_min'), value: fmt(mn.v), sub: when(mn.t) },
              { label: tr(hass, 'stat_avg'), value: fmt(avg), sub: tr(hass, 'over_days', { n }) }
            ];
          }
          m.hint = tr(hass, 'hint_cols');
        }
      }
      return m;
    }

    _render() {
      const m = this._model;
      const hass = this._hass;
      const e = this._els;
      e.stats.innerHTML = m.stats.map((s, i) => '<div class="stat" style="animation-delay:' + (i * 60) + 'ms"><span class="st-l">' + esc(s.label) + '</span><span class="st-v">' + esc(s.value) + '</span><span class="st-s">' + esc(s.sub) + '</span></div>').join('');

      let yr;
      let barMax = 0;
      if (m.bars && m.bars.totals) {
        m.bars.totals.forEach((t) => t.forEach((v) => { if (v != null && v > barMax) barMax = v; }));
        yr = niceTicks(0, (barMax || 1) * 1.05, 4);
      } else {
        const vs = [];
        m.series.forEach((s) => s.pts.forEach((x) => vs.push(x[1])));
        const c = this._opts.config;
        let lo;
        let hi;
        if (!vs.length) { lo = 0; hi = 1; } else if (m.kind === 'measurement') {
          lo = minOf(vs);
          hi = maxOf(vs);
          const pad = Math.max((hi - lo) * 0.08, 0.5);
          lo -= pad;
          hi += pad;
        } else {
          lo = Math.min(0, minOf(vs));
          hi = Math.max(maxOf(vs) * 1.06, 1e-6);
        }
        if (c.min != null && c.min !== '') lo = Number(c.min);
        if (c.max != null && c.max !== '') hi = Number(c.max);
        yr = niceTicks(lo, hi, 4);
      }
      const yToPct = (v) => (DTOP + (1 - (v - yr.lo) / ((yr.hi - yr.lo) || 1)) * (DH - DTOP)) / DH * 100;
      const decY = yr.step < 1 ? (yr.step < 0.1 ? 2 : 1) : 0;
      const yUnit = m.unit === 'W' && yr.hi >= 10000 ? 'kW' : m.unit;
      const yDiv = yUnit === 'kW' && m.unit === 'W' ? 1000 : 1;
      let html = yr.ticks.map((v) => '<div class="yl" style="top:' + pct(yToPct(v)) + '"><span class="ylab">' + esc(fmtNum(hass, v / yDiv, yDiv > 1 ? 0 : decY) + unitSuffix(hass, yUnit)) + '</span></div>').join('');
      html += '<div class="plot">';
      m.vlines.forEach((t) => { html += '<span class="vl" style="left:' + pct((t - m.dom[0]) / (m.dom[1] - m.dom[0]) * 100) + '"></span>'; });
      const yrArr = [yr.lo, yr.hi];
      m.series.forEach((s) => { s.xy = scaleXY(s.pts, m.dom, yrArr, DW, DH, DTOP, 0); });
      const s0 = m.series[0];
      const fillOn = this._opts.config.fill !== false;
      html += '<svg class="area" viewBox="0 0 ' + DW + ' ' + DH + '" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="rwdg" x1="0" y1="0" x2="0" y2="1">'
        + '<stop offset="0" style="stop-color:var(--rw-color);stop-opacity:.38"></stop><stop offset="1" style="stop-color:var(--rw-color);stop-opacity:0"></stop></linearGradient></defs>'
        + '<path d="' + (fillOn && s0 && s0.area ? areaPath(s0.xy, 1, DH, DH) : '') + '" fill="url(#rwdg)"></path></svg>';
      html += '<svg class="lines" viewBox="0 0 ' + DW + ' ' + DH + '" preserveAspectRatio="none" role="img" aria-label="' + esc(this._opts.name + ', ' + e.ptxt.textContent) + '">';
      m.series.forEach((s) => { html += '<path class="ln' + (s.dotted ? ' dot' : (s.dashed ? ' dash' : '')) + '" style="stroke:' + s.color + '" d="' + linePath(s.xy, 1, DH) + '"></path>'; });
      html += '</svg>';
      m.cols.forEach((col) => {
        const l = (col.t0 - m.dom[0]) / (m.dom[1] - m.dom[0]) * 100;
        const w = (col.t1 - col.t0) / (m.dom[1] - m.dom[0]) * 100;
        html += '<button class="col" type="button" data-day="' + col.day + '" style="left:' + pct(l) + ';width:' + pct(w) + '" aria-label="' + esc(col.label) + '"></button>';
      });
      if (m.bars && m.bars.totals) {
        const k = m.bars.totals.length;
        const n = m.n;
        const gw = 100 / n;
        const bw = gw * (n <= 7 ? 0.5 : 0.72) / k;
        for (let i = 0; i < n; i++) {
          const d = addDays(m.start, i);
          const part = m.liveEnd && i === n - 1;
          for (let j = 0; j < k; j++) {
            const v = m.bars.totals[j][i];
            if (v == null) continue;
            const tip = fmtDate(hass, d, { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + m.bars.names[j] + ' ' + fmtSmart(hass, v, m.bars.infos[j].unit, 1) + (part ? ' ' + tr(hass, 'so_far') : '');
            const left = i * gw + (gw - bw * k) / 2 + j * bw;
            const height = Math.max(0, (v - yr.lo) / ((yr.hi - yr.lo) || 1) * (DH - DTOP) / DH * 100);
            const edge = left < 12 ? ' edge-l' : (left > 80 ? ' edge-r' : '');
            html += '<button class="bar' + (part ? ' part' : '') + edge + '" type="button" data-day="' + ymd(d) + '" style="left:' + pct(left) + ';width:' + pct(bw * (k > 1 ? 0.9 : 1)) + ';height:' + pct(height)
              + ';background:' + m.bars.colors[j] + ';animation-delay:' + (i * (n <= 7 ? 45 : 18)) + 'ms" aria-label="' + esc(tip) + '"><span class="btip">' + esc(tip) + '</span></button>';
          }
        }
      }
      const last = s0 && s0.xy[s0.xy.length - 1];
      const showEnd = m.liveEnd && last && !s0.shift && !m.msg;
      html += '<span class="end' + (showEnd ? ' on' : '') + '" style="color:var(--rw-color);' + (last ? 'left:' + pct(last[0] / DW * 100) + ';top:' + pct(last[1] / DH * 100) : '') + '"></span>';
      html += '<div class="hover"><span class="xh"></span>' + m.series.map((_, i) => '<span class="hd hdx' + i + '"></span>').join('')
        + '<div class="tip"><span class="tip-t"></span>' + m.series.map((_, i) => '<span class="tip-r tr' + i + '"><span class="dot"></span><span></span></span>').join('') + '</div></div>';
      html += '</div>';
      const narrow = e.chart.clientWidth < 520;
      html += '<div class="xax">' + m.xt.filter((tk) => !(narrow && tk.minor)).map((tk) => {
        const lp = (tk.t - m.dom[0]) / (m.dom[1] - m.dom[0]) * 100;
        const tf = tk.mid ? 'translateX(-50%)' : (lp < 1 ? 'none' : (lp > 99 ? 'translateX(-100%)' : 'translateX(-50%)'));
        return '<span class="tick" style="left:' + pct(lp) + ';transform:' + tf + '">' + esc(narrow && tk.short ? tk.short : tk.label) + '</span>';
      }).join('') + '</div>';
      if (m.msg) html += '<div class="msg">' + esc(m.msg) + '</div>';
      e.chart.innerHTML = html;

      let legend = '';
      if (m.bars && m.bars.totals) {
        m.bars.names.forEach((nm, j) => { legend += '<span class="lg" style="color:' + m.bars.colors[j] + '"><span class="sw2"></span><span style="color:var(--secondary-text-color,#9e9e9e)">' + esc(nm) + '</span></span>'; });
      } else {
        m.series.forEach((s) => { legend += '<span class="lg" style="color:' + s.color + '"><span class="sw2' + (s.dotted ? ' dot' : (s.dashed ? ' dash' : '')) + '"></span><span style="color:var(--secondary-text-color,#9e9e9e)">' + esc(s.label) + '</span></span>'; });
      }
      if (m.hint) legend += '<span class="hint">' + esc(m.hint) + '</span>';
      e.legend.innerHTML = legend;
    }

    _hover(ev) {
      const m = this._model;
      if (!m || !m.series.length || m.msg) return;
      const plot = this.shadowRoot.querySelector('.plot');
      const hov = this.shadowRoot.querySelector('.hover');
      if (!plot || !hov) return;
      const rc = plot.getBoundingClientRect();
      const f = (ev.clientX - rc.left) / rc.width;
      if (f < 0 || f > 1) { hov.classList.remove('on'); return; }
      const info = hoverInfo(m.series, m.dom, f, DW, DH);
      if (!info) { hov.classList.remove('on'); return; }
      hov.classList.add('on');
      hov.querySelector('.xh').style.left = info.left;
      const shown = new Set();
      info.rows.forEach((row, i) => {
        const hd = hov.querySelector('.hdx' + i);
        const tr0 = hov.querySelector('.tr' + i);
        shown.add(i);
        hd.classList.add('on');
        hd.style.left = row.x;
        hd.style.top = row.y;
        hd.style.background = row.color;
        tr0.style.display = '';
        tr0.firstElementChild.style.background = row.color;
        tr0.lastElementChild.textContent = row.text;
      });
      m.series.forEach((_, i) => {
        if (shown.has(i)) return;
        hov.querySelector('.hdx' + i).classList.remove('on');
        hov.querySelector('.tr' + i).style.display = 'none';
      });
      hov.querySelector('.tip-t').textContent = hoverTime(this._hass, info.t, m.n === 1 ? m.start : null);
      const tip = hov.querySelector('.tip');
      tip.style.left = info.left;
      tip.style.transform = info.flip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)';
    }
  }

  // ---------------------------------------------------------------------------
  // Registration
  // ---------------------------------------------------------------------------

  const define = (name, cls) => { if (!customElements.get(name)) customElements.define(name, cls); };
  define('rewind-tile-card', RewindTileCard);
  define('rewind-date-bar', RewindDateBar);
  define('rewind-tile-calendar', RewindCalendar);
  define('rewind-tile-details', RewindDetailsDialog);

  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === 'rewind-tile-card')) {
    window.customCards.push({
      type: 'rewind-tile-card',
      name: 'Rewind Tile',
      description: 'Sparkline tile with a live value that can be rewound to any day and opens a details dialog.',
      preview: true,
      documentationURL: DOCS_URL
    });
    window.customCards.push({
      type: 'rewind-date-bar',
      name: 'Rewind Date Bar',
      description: 'Date bar with a "Now" button that switches all Rewind tiles (and Home Assistant energy cards) to another day.',
      preview: true,
      documentationURL: DOCS_URL
    });
  }

  console.info('%c REWIND-TILE-CARD %c ' + VERSION + ' ', 'color:#fff;background:#ff9800;font-weight:600;border-radius:3px 0 0 3px', 'color:#ff9800;background:#1c1c1c;border-radius:0 3px 3px 0');
})();
