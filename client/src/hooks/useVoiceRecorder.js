// تسجيل فويس من المايك (زي فويس الواتساب) — مشترك بين نافذة الدعوة عند
// العميل وصفحة الدعم في اللوحة.
//
// المتصفحات بتسجّل بصيغ مختلفة: كروم/أندرويد WebM، سفاري/آيفون MP4.
// السيرفر بيقبل الاتنين وبيحوّلهم mp3 على Cloudinary، فهنا بنختار أول
// صيغة المتصفح بيدعمها وخلاص.
//
// levels: 28 رقم (0..1) لموجة الصوت الحية وقت التسجيل — من AnalyserNode.
import { useCallback, useEffect, useRef, useState } from 'react';

const TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
const BARS = 28;

function pickType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
  return TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

export function canRecordVoice() {
  return typeof window !== 'undefined'
    && typeof MediaRecorder !== 'undefined'
    && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * @param {{maxSeconds?: number, onDone: (r: {blob: Blob, duration: number, type: string}) => void}} opts
 */
export default function useVoiceRecorder({ maxSeconds = 120, onDone }) {
  const [state, setState] = useState('idle'); // idle | asking | recording | error
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState(() => Array(BARS).fill(0.08));
  const [error, setError] = useState('');

  const rec = useRef(null);
  const stream = useRef(null);
  const chunks = useRef([]);
  const startedAt = useRef(0);
  const cancelled = useRef(false);
  const timer = useRef(null);
  const raf = useRef(null);
  const ctx = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const cleanup = useCallback(() => {
    clearInterval(timer.current);
    cancelAnimationFrame(raf.current);
    if (stream.current) stream.current.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (ctx.current) { ctx.current.close().catch(() => {}); ctx.current = null; }
  }, []);

  useEffect(() => () => {
    cancelled.current = true;
    try { if (rec.current && rec.current.state !== 'inactive') rec.current.stop(); } catch { /* */ }
    cleanup();
  }, [cleanup]);

  const stop = useCallback(() => {
    const r = rec.current;
    if (r && r.state !== 'inactive') {
      try { r.requestData(); } catch { /* سفاري القديم */ }
      r.stop();
    }
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    stop();
    cleanup();
    setState('idle');
    setSeconds(0);
  }, [stop, cleanup]);

  const start = useCallback(async () => {
    if (!canRecordVoice()) {
      setError('unsupported'); setState('error');
      return;
    }
    setError('');
    setState('asking');
    let s;
    try {
      s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) {
      setError(e && e.name === 'NotAllowedError' ? 'denied' : 'nomic');
      setState('error');
      return;
    }
    stream.current = s;
    chunks.current = [];
    cancelled.current = false;
    const type = pickType();
    let r;
    try {
      r = type ? new MediaRecorder(s, { mimeType: type, audioBitsPerSecond: 64000 }) : new MediaRecorder(s);
    } catch {
      cleanup(); setError('unsupported'); setState('error');
      return;
    }
    rec.current = r;
    r.ondataavailable = (e) => { if (e.data && e.data.size) chunks.current.push(e.data); };
    r.onstop = () => {
      const duration = (Date.now() - startedAt.current) / 1000;
      cleanup();
      setState('idle');
      setSeconds(0);
      if (cancelled.current) return;
      const blob = new Blob(chunks.current, { type: r.mimeType || type || 'audio/webm' });
      if (duration < 0.6 || blob.size < 200) { setError('short'); setState('error'); return; }
      doneRef.current && doneRef.current({ blob, duration, type: blob.type });
    };
    r.start(250);
    startedAt.current = Date.now();
    setState('recording');
    setSeconds(0);
    timer.current = setInterval(() => {
      const sec = (Date.now() - startedAt.current) / 1000;
      setSeconds(sec);
      if (sec >= maxSeconds) stop();
    }, 200);

    // موجة الصوت الحية
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ac = new AC();
        ctx.current = ac;
        const src = ac.createMediaStreamSource(s);
        const an = ac.createAnalyser();
        an.fftSize = 256;
        src.connect(an);
        const data = new Uint8Array(an.frequencyBinCount);
        let last = 0;
        const loop = (t) => {
          raf.current = requestAnimationFrame(loop);
          if (t - last < 90) return;
          last = t;
          an.getByteTimeDomainData(data);
          let peak = 0;
          for (let i = 0; i < data.length; i += 1) peak = Math.max(peak, Math.abs(data[i] - 128));
          const v = Math.min(1, 0.08 + (peak / 128) * 1.6);
          setLevels((prev) => [...prev.slice(1), v]);
        };
        raf.current = requestAnimationFrame(loop);
      }
    } catch { /* الموجة ديكور — التسجيل شغال من غيرها */ }
  }, [cleanup, maxSeconds, stop]);

  return {
    state, seconds, levels, error, start, stop, cancel,
    clearError: () => { setError(''); setState('idle'); },
  };
}

/** 75 → "1:15" */
export function fmtSeconds(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
