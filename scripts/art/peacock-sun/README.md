# رسومات قالب Peacock & Sun

كل صور القالب (`client/public/templates/peacock-sun/*.webp`) مرسومة بالكود هنا —
SVG بيتولّد بـ Python وبيترسم PNG بـ Chromium (Playwright)، وبعدين بيتحوّل WebP.
لو عايز تغيّر لون ولا شكل (لون الطاووس، عدد أشعة الشمس، شكل القوس...) عدّل هنا وأعد التوليد.

| الملف | بيرسم |
|---|---|
| `peacock.py` | الطاووس الواقف وديله نازل (`peacock.webp`) |
| `pieces.py` | ميدالية الشمس وأشعتها، شعار الشمس، القوس المغولي (فوق/العمود/القاعدة)، بابين البوابة، الشريط، النخلة، اللوتس، الزهرية |
| `feather.py` | ريشة الطاووس (`feather.webp`) |
| `textures.py` | خامات القطيفة الزيتي والعنابي والورق (تتكرر من غير فواصل) |
| `render.js` | SVG → PNG بخلفية شفافة |

```bash
cd scripts/art/peacock-sun
python3 pieces.py out                # كل القطع (أو اسم قطعة: python3 pieces.py out sun-rays)
python3 peacock.py out/peacock.svg
node render.js out/peacock.svg out/peacock.png 1.25   # محتاج playwright (PLAYWRIGHT_PATH لو مش متسطّب محليًا)
python3 textures.py out
```

بعد كده صغّر وحوّل WebP (Pillow) بنفس المقاسات اللي في الفولدر وحطها مكان القديمة.
