// تبليغ السيرفر بأي انهيار في الواجهة (routes/clientErrors.js) — عشان
// صاحب الموقع يشوف السبب الحقيقي في لوحة التحكم ← "أعطال الواجهة".
// بيتبعت مرة واحدة لكل رسالة في الجلسة (منعًا لتكرار نفس الخطأ عشرات المرات).
const sent = new Set();

/**
 * @param {Error} error
 * @param {{ where?: string, componentStack?: string, context?: string }} [info]
 */
export function reportError(error, info = {}) {
  try {
    const message = String((error && error.message) || error || '').slice(0, 500);
    if (!message) return;
    const key = `${info.where || ''}|${message}`;
    if (sent.has(key)) return;
    sent.add(key);
    fetch('/api/client-error', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        message,
        stack: String((error && error.stack) || '').slice(0, 4000),
        componentStack: String(info.componentStack || '').slice(0, 4000),
        where: info.where || '',
        context: info.context || '',
        path: window.location.pathname,
      }),
    }).catch(() => { /* التبليغ نفسه مايوقعش حاجة */ });
  } catch { /* */ }
}
