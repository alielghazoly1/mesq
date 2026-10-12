"""Single peacock feather, vertical (eye at top)."""
import math
import sys
import peacock as P
from svgkit import Curve, smooth_path, fmt, clamp, mix

W, H = 300, 1000


def main(path):
    rach = Curve([(150, 990), (146, 760), (152, 520), (158, 300), (152, 150)], 40)
    g = []
    lines = []
    for s in range(0, 160):
        t = 0.18 + 0.8 * s / 160
        p = rach.at(t)
        tx, ty = rach.tangent(t)
        L = 18 + 95 * math.sin(math.pi * clamp((t - 0.18) / 0.82) * 0.92) ** 1.3
        for side in (-1, 1):
            a = math.atan2(ty, tx) + side * 2.45
            q = (p[0] + math.cos(a) * L, p[1] + math.sin(a) * L)
            m = (p[0] + math.cos(a) * L * 0.5 + tx * 6, p[1] + math.sin(a) * L * 0.5 + ty * 6)
            lines.append('M%s,%sQ%s,%s %s,%s' % (fmt(p[0]), fmt(p[1]), fmt(m[0]), fmt(m[1]), fmt(q[0]), fmt(q[1])))
    g.append('<path d="%s" stroke="url(#barb)" stroke-width="1.5" fill="none" opacity=".9"/>' % ''.join(lines))
    g.append('<path d="%s" stroke="%s" stroke-width="3.2" fill="none" stroke-linecap="round"/>' % (smooth_path(rach.pts[::6], closed=False), P.GOLD_L))
    e = rach.at(0.86)
    tx, ty = rach.tangent(0.86)
    ang = math.atan2(-ty, -tx) + math.pi
    g.append(P.ocellus(e[0], e[1] - 6, 44, math.atan2(-1, 0), 1.0, 0))
    defs = P.defs().replace('</defs>', '<linearGradient id="barb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="%s"/><stop offset=".6" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (P.GOLD, P.OLIVE_L, P.OLIVE))
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">%s<g filter="url(#soft)">%s</g></svg>' % (W, H, W, H, defs, ''.join(g))
    open(path, 'w').write(svg)


if __name__ == '__main__':
    main(sys.argv[1])
