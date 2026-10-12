"""Tileable textures (FFT noise) -> WebP."""
import sys
import numpy as np
from PIL import Image

N = 512
rng = np.random.default_rng(42)


def fbm(beta=2.0, seed=0):
    r = np.random.default_rng(seed)
    white = r.standard_normal((N, N))
    f = np.fft.fft2(white)
    kx = np.fft.fftfreq(N)[:, None]
    ky = np.fft.fftfreq(N)[None, :]
    k = np.sqrt(kx * kx + ky * ky)
    k[0, 0] = 1
    f = f / (k ** (beta / 2))
    f[0, 0] = 0
    out = np.real(np.fft.ifft2(f))
    out = (out - out.mean()) / (out.std() + 1e-9)
    return out


def colorize(t, dark, mid, light):
    t = np.clip(t, -2.5, 2.5) / 2.5  # -1..1
    dark, mid, light = (np.array(c, float) for c in (dark, mid, light))
    out = np.where(t[..., None] < 0, mid + (dark - mid) * (-t[..., None]), mid + (light - mid) * t[..., None])
    return out


def velvet(dark, mid, light, seed):
    big = fbm(2.6, seed)
    mid_n = fbm(1.6, seed + 1)
    fine = fbm(0.4, seed + 2)
    t = big * 0.75 + mid_n * 0.35 + fine * 0.18
    img = colorize(t, dark, mid, light)
    # pile sheen streaks
    streak = fbm(1.2, seed + 3)
    streak = np.repeat(streak.mean(axis=1, keepdims=True), N, axis=1) * 0.0 + streak
    img += (np.clip(streak, 0, None) * 4.0)[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)


def parchment(seed):
    big = fbm(2.8, seed)
    mid_n = fbm(1.8, seed + 1)
    fine = fbm(0.2, seed + 2)
    t = big * 0.7 + mid_n * 0.35 + fine * 0.22
    img = colorize(t, (222, 202, 160), (240, 228, 200), (250, 243, 226))
    # fibres
    r = np.random.default_rng(seed + 9)
    fib = np.zeros((N, N))
    for _ in range(420):
        x, y = r.integers(0, N, 2)
        L = r.integers(8, 40)
        ang = r.uniform(0, np.pi)
        for s in range(L):
            xx = int(x + np.cos(ang) * s) % N
            yy = int(y + np.sin(ang) * s) % N
            fib[yy, xx] += 1
    img -= (fib * 10.0)[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)


if __name__ == '__main__':
    out = sys.argv[1]
    Image.fromarray(velvet((44, 50, 22), (72, 80, 38), (98, 107, 54), 1)).save(out + '/velvet-olive.webp', quality=82, method=6)
    Image.fromarray(velvet((50, 8, 20), (84, 16, 36), (110, 26, 48), 11)).save(out + '/velvet-burgundy.webp', quality=82, method=6)
    Image.fromarray(parchment(21)).save(out + '/parchment.webp', quality=80, method=6)
    # preview: 2x2 tiles of each to check seams
    for n in ('velvet-olive', 'velvet-burgundy', 'parchment'):
        im = Image.open(out + '/' + n + '.webp')
        big = Image.new('RGB', (N * 2, N * 2))
        for x in (0, N):
            for y in (0, N):
                big.paste(im, (x, y))
        big.resize((512, 512)).save(out + '/' + n + '_tiles.jpg', quality=85)
    print('ok')
