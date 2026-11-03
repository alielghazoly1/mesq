(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const els = {
    storeName: $('store-name'),
    form: $('quote-form'),
    links: $('links'),
    paste: $('paste-btn'),
    submit: $('submit-btn'),
    notice: $('notice'),
    results: $('results'),
    items: $('items'),
    problems: $('problems'),
    summary: $('summary'),
    total: $('total'),
    totalNote: $('total-note'),
    order: $('order-btn'),
    manual: $('manual'),
    manualSar: $('manual-sar'),
    manualEgp: $('manual-egp'),
    tpl: $('item-tpl'),
  };

  const MESSAGES = {
    NO_LINKS: 'مفيش لينك في اللي لزقته. الزق لينك المنتج أو السلة من شي إن.',
    RATE_NOT_SET: 'الأسعار مش متاحة دلوقتي. كلمنا على واتساب وهنرد عليك بالسعر.',
    SLOW_DOWN: 'طلبات كتير ورا بعض. استنى دقيقة وجرّب تاني.',
    NOT_SHEIN: 'ده مش لينك من شي إن.',
    NOT_PRODUCT_LINK: 'اللينك ده مش لينك منتج أو سلة.',
    LINK_UNREADABLE: 'مقدرناش نفتح اللينك ده.',
    LINK_FETCH_FAILED: 'مقدرناش نفتح اللينك ده دلوقتي.',
    CART_UNREADABLE: 'مقدرناش نقرا السلة أوتوماتيك. ابعتلنا اللينك على واتساب وهنرد عليك بالسعر، أو الزق لينكات المنتجات واحد واحد.',
    NOT_FOUND: 'المنتج ده مش متاح دلوقتي في شي إن السعودية.',
    NETWORK: 'في مشكلة في النت. اتأكد من الاتصال وجرّب تاني.',
    DEFAULT: 'مقدرناش نجيب سعر ده دلوقتي. ابعتلنا اللينك على واتساب وهنرد عليك بالسعر.',
  };

  let cfg = { storeName: '', whatsapp: null, showSar: false, rate: null, roundTo: 1, ready: false };
  let priced = [];   // { item, qty, el }
  let unpriced = []; // { name, goodsId, attrs }
  let links = [];

  const money = (n) => `${Math.round(n).toLocaleString('en-US')} ج.م`;
  const riyal = (n) => `${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })} ر.س`;
  const hasUrl = (s) => /https?:\/\/|shein\.com\//i.test(s);
  const short = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

  function toEgp(sar) {
    if (!(sar > 0) || !(cfg.rate > 0)) return null;
    const raw = Math.round(sar * cfg.rate * 100) / 100;
    const step = cfg.roundTo >= 1 ? cfg.roundTo : 1;
    return Math.ceil(raw / step - 1e-9) * step;
  }

  function parseNumber(s) {
    const t = String(s || '')
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
      .replace(/[٫,]/g, '.');
    const m = t.match(/\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : 0;
  }

  function waLink(text) {
    return cfg.whatsapp ? `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text)}` : null;
  }

  function showNotice(text, kind = '') {
    els.notice.textContent = text;
    els.notice.className = `notice ${kind}`.trim();
    els.notice.hidden = !text;
  }

  function setLoading(on) {
    els.submit.disabled = on;
    els.paste.disabled = on;
    els.submit.textContent = on ? 'لحظة…' : 'اعرف السعر';
    if (on) showNotice('بنجيب الأسعار… ممكن تاخد كام ثانية.', 'loading');
  }

  async function loadConfig() {
    try {
      const r = await fetch('/api/config', { cache: 'no-store' });
      if (r.ok) cfg = { ...cfg, ...(await r.json()) };
    } catch { /* keep defaults */ }
    if (cfg.storeName) {
      els.storeName.textContent = cfg.storeName;
      document.title = `${cfg.storeName} — اعرف السعر بالمصري`;
    }
    els.manual.hidden = !(cfg.rate > 0);
  }

  function renderItem(item) {
    const node = els.tpl.content.firstElementChild.cloneNode(true);
    const img = node.querySelector('img');
    if (item.image && item.image.startsWith('https://')) img.src = item.image;
    else img.remove();
    node.querySelector('.name').textContent = item.name || `منتج ${item.goodsId}`;
    node.querySelector('.attrs').textContent = item.attrs || '';
    const badges = node.querySelector('.badges');
    const addBadge = (text, soft) => {
      const b = document.createElement('span');
      b.className = soft ? 'badge soft' : 'badge';
      b.textContent = text;
      badges.append(b);
    };

    if (!item.ok) {
      node.classList.add('unavailable');
      addBadge(item.code === 'NOT_FOUND' ? 'مش متاح في شي إن السعودية' : 'السعر مش متاح دلوقتي');
      node.querySelector('.price-row').remove();
      unpriced.push(item);
      return node;
    }

    node.querySelector('.egp').textContent = money(item.egp);
    if (item.originalEgp && item.originalEgp > item.egp) node.querySelector('.was').textContent = money(item.originalEgp);
    if (cfg.showSar && item.priceSar) node.querySelector('.sar').textContent = riyal(item.priceSar);

    const entry = { item, qty: Math.max(1, Math.min(20, item.quantity || 1)), el: node };
    const val = node.querySelector('.qty-val');
    val.textContent = String(entry.qty);
    if (!item.inStock) {
      node.classList.add('unavailable');
      addBadge('خلصان');
      node.querySelector('.qty').remove();
      entry.qty = 0;
    } else {
      node.querySelector('.minus').addEventListener('click', () => { entry.qty = Math.max(1, entry.qty - 1); val.textContent = String(entry.qty); updateSummary(); });
      node.querySelector('.plus').addEventListener('click', () => { entry.qty = Math.min(20, entry.qty + 1); val.textContent = String(entry.qty); updateSummary(); });
    }
    priced.push(entry);
    return node;
  }

  function renderProblem(group) {
    const li = document.createElement('li');
    li.className = 'problem';
    const p = document.createElement('p');
    p.textContent = MESSAGES[group.code] || MESSAGES.DEFAULT;
    const link = document.createElement('span');
    link.className = 'link';
    link.textContent = group.url;
    li.append(p, link);
    const wa = group.code !== 'NOT_SHEIN' && waLink(`السلام عليكم، عايز أعرف سعر:\n${group.url}`);
    if (wa) {
      const a = document.createElement('a');
      a.className = 'btn whatsapp small';
      a.href = wa;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'ابعت اللينك على واتساب';
      li.append(a);
    }
    return li;
  }

  function orderMessage() {
    const lines = ['السلام عليكم، عايز أطلب:'];
    let n = 0;
    let total = 0;
    for (const { item, qty } of priced) {
      if (!qty) continue;
      n++;
      const line = item.egp * qty;
      total += line;
      const attrs = item.attrs ? ` (${short(item.attrs, 40)})` : '';
      lines.push(`${n}) ${short(item.name || 'منتج', 60)}${attrs} — كود ${item.goodsId} × ${qty} = ${money(line)}`);
    }
    if (n) lines.push(`الإجمالي: ${money(total)}`);
    if (unpriced.length) {
      lines.push('', 'محتاج تسعير:');
      for (const u of unpriced) lines.push(`- ${short(u.name || 'منتج', 60)} — كود ${u.goodsId}`);
    }
    if (links.length) lines.push('', 'اللينكات:', ...links);
    return lines.join('\n');
  }

  function updateSummary() {
    const active = priced.filter((e) => e.qty > 0);
    const total = active.reduce((sum, e) => sum + e.item.egp * e.qty, 0);
    els.summary.hidden = !active.length && !unpriced.length;
    els.total.textContent = money(total);
    const notes = [];
    if (unpriced.length) notes.push(`فيه ${unpriced.length} منتج من غير سعر — هنسعّرهم لك على واتساب.`);
    if (els.summary.dataset.truncated) notes.push('السلة كبيرة، فعرضنا أول المنتجات بس.');
    els.totalNote.textContent = notes.join(' ');
    els.totalNote.hidden = !notes.length;
    const wa = waLink(orderMessage());
    els.order.hidden = !wa;
    if (wa) els.order.href = wa;
  }

  function render(data) {
    priced = [];
    unpriced = [];
    links = [];
    els.items.replaceChildren();
    els.problems.replaceChildren();
    delete els.summary.dataset.truncated;

    for (const group of data.groups || []) {
      links.push(group.url);
      if (!group.ok) { els.problems.append(renderProblem(group)); continue; }
      if (group.truncated) els.summary.dataset.truncated = '1';
      for (const item of group.items || []) els.items.append(renderItem(item));
    }
    els.results.hidden = false;
    updateSummary();
    showNotice('');
    els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submit(event) {
    if (event) event.preventDefault();
    const text = els.links.value.trim();
    if (!text) { showNotice(MESSAGES.NO_LINKS); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await r.json().catch(() => ({ ok: false, code: 'DEFAULT' }));
      if (!data.ok) {
        els.results.hidden = true;
        showNotice(MESSAGES[data.code] || MESSAGES.DEFAULT);
        return;
      }
      render(data);
    } catch {
      showNotice(MESSAGES.NETWORK);
    } finally {
      setLoading(false);
    }
  }

  els.form.addEventListener('submit', submit);

  els.links.addEventListener('paste', () => {
    setTimeout(() => { if (hasUrl(els.links.value)) submit(); }, 0);
  });

  els.paste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        els.links.value = text;
        if (hasUrl(text)) submit();
        return;
      }
    } catch { /* clipboard blocked (e.g. Instagram browser) */ }
    els.links.focus();
    showNotice('اضغط مطوّل جوه الخانة واختار "لصق".');
  });

  els.manualSar.addEventListener('input', () => {
    const egp = toEgp(parseNumber(els.manualSar.value));
    els.manualEgp.textContent = egp ? money(egp) : '—';
  });

  loadConfig();
})();
