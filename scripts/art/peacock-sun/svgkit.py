"""Small helpers for procedural SVG art (curves, colors, paths)."""
import math
import random


def lerp(a, b, t):
    return a + (b - a) * t


def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb2hex(c):
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(round(v)))) for v in c)


def mix(c1, c2, t):
    a, b = hex2rgb(c1), hex2rgb(c2)
    return rgb2hex(tuple(lerp(a[i], b[i], t) for i in range(3)))


def shade(c, k):
    """k<0 darken toward black, k>0 lighten toward white"""
    return mix(c, '#000000', -k) if k < 0 else mix(c, '#ffffff', k)


def catmull(points, n=24, closed=False):
    """Catmull-Rom spline through points -> dense list of points"""
    pts = list(points)
    if closed:
        pts = [pts[-1]] + pts + [pts[0], pts[1]]
    else:
        pts = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    if not closed:
        out.append(pts[-2])
    return out


def smooth_path(points, closed=True):
    """Smooth closed/open path through points using Catmull-Rom -> cubic beziers"""
    pts = list(points)
    n = len(pts)
    if n < 2:
        return ''
    d = 'M%.1f,%.1f' % pts[0]
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if closed else pts[max(i - 1, 0)]
        p1 = pts[i]
        p2 = pts[(i + 1) % n] if closed else pts[i + 1]
        p3 = pts[(i + 2) % n] if closed else pts[min(i + 2, n - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += ' C%.1f,%.1f %.1f,%.1f %.1f,%.1f' % (c1[0], c1[1], c2[0], c2[1], p2[0], p2[1])
    if closed:
        d += ' Z'
    return d


def polyline(points, closed=False):
    d = 'M' + ' L'.join('%.1f,%.1f' % p for p in points)
    return d + (' Z' if closed else '')


class Curve:
    """Arc-length parametrised polyline from a Catmull-Rom spline."""

    def __init__(self, ctrl, n=40):
        self.pts = catmull(ctrl, n)
        self.cum = [0.0]
        for i in range(1, len(self.pts)):
            a, b = self.pts[i - 1], self.pts[i]
            self.cum.append(self.cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
        self.length = self.cum[-1]

    def at(self, t):
        t = clamp(t)
        s = t * self.length
        lo, hi = 0, len(self.cum) - 1
        while lo < hi - 1:
            mid = (lo + hi) // 2
            if self.cum[mid] <= s:
                lo = mid
            else:
                hi = mid
        seg = self.cum[hi] - self.cum[lo] or 1e-9
        u = (s - self.cum[lo]) / seg
        a, b = self.pts[lo], self.pts[hi]
        return (lerp(a[0], b[0], u), lerp(a[1], b[1], u))

    def tangent(self, t):
        e = 0.002
        a, b = self.at(t - e), self.at(t + e)
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1e-9
        return (dx / L, dy / L)

    def normal(self, t):
        tx, ty = self.tangent(t)
        return (-ty, tx)


def rot(p, ang, c=(0, 0)):
    s, co = math.sin(ang), math.cos(ang)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * co - y * s, c[1] + x * s + y * co)


def fmt(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


class Rng(random.Random):
    def jitter(self, v, a):
        return v + self.uniform(-a, a)
