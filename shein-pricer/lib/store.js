'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** A JSON file kept in memory, written atomically (tmp + rename). */
class JsonFile {
  constructor(file, fallback) {
    this.file = file;
    this.fallback = fallback;
    this.data = null;
    this.timer = null;
  }

  load() {
    if (this.data) return this.data;
    try {
      const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      this.data = parsed && typeof parsed === 'object' ? parsed : structuredClone(this.fallback);
    } catch {
      this.data = structuredClone(this.fallback);
    }
    return this.data;
  }

  saveNow() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (!this.data) return;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data));
    fs.renameSync(tmp, this.file);
  }

  saveSoon(ms = 1000) {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      try { this.saveNow(); } catch (err) { console.error(`[store] could not save ${this.file}: ${err.message}`); }
    }, ms);
    if (typeof this.timer.unref === 'function') this.timer.unref();
  }

  flush() {
    if (this.timer) {
      try { this.saveNow(); } catch (err) { console.error(`[store] could not save ${this.file}: ${err.message}`); }
    }
  }
}

/** Key/value cache with expiry, persisted so a restart doesn't re-spend API requests. */
class TtlCache {
  constructor(jsonFile, { maxEntries = 3000, now = () => Date.now() } = {}) {
    this.file = jsonFile;
    this.maxEntries = maxEntries;
    this.now = now;
  }

  get(key) {
    const data = this.file.load();
    const entry = data[key];
    if (!entry) return undefined;
    if (entry.exp && entry.exp <= this.now()) {
      delete data[key];
      this.file.saveSoon();
      return undefined;
    }
    return entry.v;
  }

  set(key, value, ttlMs) {
    const data = this.file.load();
    data[key] = { v: value, exp: ttlMs > 0 ? this.now() + ttlMs : 0 };
    if (Object.keys(data).length > this.maxEntries) this.prune();
    this.file.saveSoon();
  }

  prune() {
    const data = this.file.load();
    const now = this.now();
    for (const [k, e] of Object.entries(data)) if (e.exp && e.exp <= now) delete data[k];
    const keys = Object.keys(data);
    if (keys.length > this.maxEntries) {
      keys.sort((a, b) => (data[a].exp || Infinity) - (data[b].exp || Infinity));
      for (const k of keys.slice(0, keys.length - this.maxEntries)) delete data[k];
    }
  }

  clear(prefix = '') {
    const data = this.file.load();
    let removed = 0;
    for (const k of Object.keys(data)) if (k.startsWith(prefix)) { delete data[k]; removed++; }
    this.file.saveSoon(0);
    return removed;
  }

  size(prefix = '') {
    const now = this.now();
    return Object.entries(this.file.load()).filter(([k, e]) => k.startsWith(prefix) && (!e.exp || e.exp > now)).length;
  }
}

/** Owner-editable pricing settings (rate and rounding), on top of the .env defaults. */
class Settings {
  constructor(jsonFile, defaults, { now = () => Date.now() } = {}) {
    this.file = jsonFile;
    this.defaults = defaults;
    this.now = now;
  }

  get() {
    const d = this.file.load();
    const rate = Number(d.rate);
    const roundTo = Number(d.roundTo);
    return {
      rate: Number.isFinite(rate) && rate > 0 ? rate : this.defaults.rate,
      roundTo: Number.isInteger(roundTo) && roundTo >= 1 ? roundTo : (this.defaults.roundTo >= 1 ? Math.floor(this.defaults.roundTo) : 1),
      updatedAt: d.updatedAt || null,
    };
  }

  update({ rate, roundTo }) {
    const r = Number(rate);
    const step = roundTo === undefined || roundTo === '' ? 1 : Number(roundTo);
    if (!Number.isFinite(r) || r <= 0 || r > 10000) throw new RangeError('rate');
    if (!Number.isInteger(step) || step < 1 || step > 1000) throw new RangeError('roundTo');
    const d = this.file.load();
    d.rate = Math.round(r * 10000) / 10000;
    d.roundTo = step;
    d.updatedAt = new Date(this.now()).toISOString();
    this.file.saveNow();
    return this.get();
  }

  /** The Product Details URL that last answered (found automatically if the configured one is wrong). */
  getEndpoint() {
    const v = this.file.load().endpoint;
    return typeof v === 'string' && v.startsWith('https://') ? v : null;
  }

  setEndpoint(url) {
    const d = this.file.load();
    if (d.endpoint === url) return;
    d.endpoint = url;
    this.file.saveNow();
  }
}

/**
 * Counts every request we send to RapidAPI (per day and per month, in the store's
 * time zone) and refuses new ones past the configured caps, so testing on the
 * free plan can't burn the whole quota by accident.
 */
class UsageMeter {
  constructor(jsonFile, { perDay = 0, perMonth = 0, timeZone = 'Africa/Cairo', now = () => Date.now() } = {}) {
    this.file = jsonFile;
    this.perDay = perDay;
    this.perMonth = perMonth;
    this.now = now;
    this.fmt = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  periods() {
    const day = this.fmt.format(new Date(this.now())); // YYYY-MM-DD
    return { day, month: day.slice(0, 7) };
  }

  snapshot() {
    const d = this.file.load();
    const { day, month } = this.periods();
    return {
      day,
      month,
      today: d.day === day ? d.dayCount || 0 : 0,
      thisMonth: d.month === month ? d.monthCount || 0 : 0,
      total: d.total || 0,
      perDay: this.perDay,
      perMonth: this.perMonth,
    };
  }

  canCall() {
    const s = this.snapshot();
    if (this.perMonth > 0 && s.thisMonth >= this.perMonth) return { ok: false, reason: 'month' };
    if (this.perDay > 0 && s.today >= this.perDay) return { ok: false, reason: 'day' };
    return { ok: true };
  }

  record() {
    const d = this.file.load();
    const { day, month } = this.periods();
    if (d.day !== day) { d.day = day; d.dayCount = 0; }
    if (d.month !== month) { d.month = month; d.monthCount = 0; }
    d.dayCount = (d.dayCount || 0) + 1;
    d.monthCount = (d.monthCount || 0) + 1;
    d.total = (d.total || 0) + 1;
    this.file.saveNow();
  }
}

/** Fixed-window limiter per key (client IP). */
class RateLimiter {
  constructor(limit, windowMs, { now = () => Date.now() } = {}) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
    this.hits = new Map();
  }

  check(key) {
    if (!(this.limit > 0)) return { ok: true };
    const now = this.now();
    if (this.hits.size > 5000) {
      for (const [k, v] of this.hits) if (v.reset <= now) this.hits.delete(k);
    }
    let entry = this.hits.get(key);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + this.windowMs };
      this.hits.set(key, entry);
    }
    entry.count++;
    if (entry.count > this.limit) return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
    return { ok: true };
  }
}

module.exports = { JsonFile, TtlCache, Settings, UsageMeter, RateLimiter };
