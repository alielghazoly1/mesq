(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const CODE_TEXT = {
    OK: 'تمام',
    QUOTA_GUARD: 'اتوقف: وصلنا للحد اليومي/الشهري اللي في .env',
    QUOTA: 'RapidAPI قال إن الطلبات خلصت',
    AUTH: 'المفتاح غلط أو الاشتراك مش شغال',
    BAD_ENDPOINT: 'لينك الـ endpoint غلط — راجع RAPIDAPI_PRODUCT_URL',
    NOT_FOUND: 'المنتج مش موجود في شي إن السعودية',
    NO_PRICE: 'الرد وصل بس مفيهوش سعر عرفنا نقراه',
    CURRENCY_MISMATCH: 'السعر رجع بعملة غير الريال — اتوقف عشان مانسعّرش غلط',
    UPSTREAM: 'مشكلة عند الـ API',
    UPSTREAM_NETWORK: 'الـ API مردّش',
    BAD_RESPONSE: 'الرد مش JSON',
    NO_KEY: 'مفيش مفتاح RapidAPI',
    CART_UNREADABLE: 'مقدرناش نقرا منتجات السلة من شي إن (التفاصيل في "آخر لينك أو سلة مااتقريتش")',
    LINK_UNREADABLE: 'اللينك اتفتح بس مالقيناش فيه رقم المنتج أو السلة (التفاصيل في "آخر لينك أو سلة مااتقريتش")',
    LINK_FETCH_FAILED: 'اللينك مافتحش خالص',
  };

  const fmtTime = (iso) => {
    try { return new Date(iso).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }); } catch { return iso; }
  };

  async function api(path, body) {
    const r = await fetch(path, body === undefined
      ? { cache: 'no-store' }
      : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { ok: r.ok, data: await r.json().catch(() => ({})) };
  }

  function render(s) {
    const st = s.settings || {};
    if (document.activeElement !== $('rate')) $('rate').value = st.rate > 0 ? String(st.rate) : '';
    if (document.activeElement !== $('round')) $('round').value = String(st.roundTo || 1);

    const u = s.usage || {};
    const cap = (n) => (n > 0 ? ` من ${n}` : '');
    $('usage').textContent = `النهارده: ${u.today || 0}${cap(u.perDay)} · الشهر ده: ${u.thisMonth || 0}${cap(u.perMonth)} · الإجمالي: ${u.total || 0} · منتجات محفوظة في الكاش: ${s.cachedProducts || 0}`;

    const a = s.api || {};
    $('api').textContent = a.configured
      ? `المفتاح موجود · ${a.productUrl} · country=${a.country} · currency=${a.currency} · language=${a.language}`
      : 'RAPIDAPI_KEY فاضي في .env — الأسعار الأوتوماتيك مش هتشتغل.';

    const list = $('events');
    list.replaceChildren();
    for (const e of s.events || []) {
      const li = document.createElement('li');
      const ok = e.code === 'OK' || String(e.code).startsWith('CART_OK');
      const code = document.createElement('span');
      code.className = ok ? 'ok' : 'bad';
      code.textContent = CODE_TEXT[e.code] || (ok ? 'السلة اتقرت' : e.code);
      const what = e.goodsId ? `منتج ${e.goodsId}` : e.groupId ? `سلة ${e.groupId}` : '';
      li.append(`${fmtTime(e.at)} · ${what} · `, code);
      if (e.detail) li.append(` (${e.detail})`);
      list.append(li);
    }
    if (!list.children.length) {
      const li = document.createElement('li');
      li.textContent = 'لسه مفيش عمليات.';
      list.append(li);
    }

    const lf = s.lastLinkFailure;
    $('link-debug-card').hidden = !lf;
    if (lf) {
      $('link-debug').textContent = [
        `link: ${lf.url}`,
        `when: ${lf.at}`,
        `code: ${lf.code}`,
        `status: ${lf.status ?? '-'}${lf.error ? ` (${lf.error})` : ''}`,
        `final url: ${lf.finalUrl || '-'}${lf.offsite ? ' (outside shein.com)' : ''}`,
        `hops: ${(lf.hops || []).join('  ->  ') || '-'}`,
        '',
        lf.summary || '(no page content)',
      ].join('\n');
    }

    const last = s.lastApi;
    $('last-api').textContent = last
      ? `${fmtTime(last.at)} · goods_id=${last.goodsId} · HTTP ${last.status ?? '-'} · ${last.code}${last.message ? ` · ${last.message}` : ''}\n\n${last.sample || ''}`
      : 'لسه مفيش طلبات.';
  }

  async function load() {
    const { ok, data } = await api('/api/admin/status');
    if (ok) render(data);
  }

  $('rate-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rate = Number(String($('rate').value).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(',', '.'));
    const roundTo = Number(String($('round').value || '1').replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)));
    const { ok, data } = await api('/api/admin/settings', { rate, roundTo });
    $('rate-msg').textContent = ok
      ? `اتحفظ: الريال بـ ${data.settings.rate} جنيه، والتقريب لأقرب ${data.settings.roundTo}.`
      : (data.code === 'BAD_ROUNDTO' ? 'التقريب لازم يكون رقم صحيح من 1 لـ 1000.' : 'اكتب سعر الريال رقم أكبر من صفر.');
    if (ok) load();
  });

  $('clear-cache').addEventListener('click', async () => {
    if (!confirm('متأكد؟ أي منتج هيتسأل عليه تاني هياخد طلب جديد من RapidAPI.')) return;
    await api('/api/admin/cache/clear', {});
    load();
  });

  $('copy-link-debug').addEventListener('click', async () => {
    const text = $('link-debug').textContent;
    try {
      await navigator.clipboard.writeText(text);
      $('copy-msg').textContent = 'اتنسخ — الزقه في الشات وابعته.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('link-debug'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      $('copy-msg').textContent = 'اتحدد — دوس Ctrl+C وبعدين الزقه في الشات.';
    }
  });

  $('refresh').addEventListener('click', load);
  load();
})();
