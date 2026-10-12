"""Procedural art pieces for the Peacock & Sun template.

python3 pieces.py <outdir> [name ...]
"""
import math
import os
import sys
from svgkit import smooth_path, polyline, mix, shade, lerp, clamp, Rng, fmt, Curve

BURG_DD = '#320812'
BURG_D = '#4a0e1c'
BURG = '#6b1428'
BURG_L = '#8a2236'
OLIVE_DD = '#2c3214'
OLIVE_D = '#3e4521'
OLIVE = '#5b6430'
OLIVE_L = '#7a8445'
GOLD_DD = '#6e5219'
GOLD_D = '#8c6a24'
GOLD = '#b8913a'
GOLD_L = '#d9b866'
GOLD_HL = '#f1dda0'
CREAM = '#f4e8cc'
CREAM_D = '#e6d3a8'
BROWN = '#5c3b22'
BROWN_D = '#3b2516'
TEAL = '#165566'
TEAL_L = '#2b8189'

GOLD_DEFS = '''
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#f6e7b0"/><stop offset=".22" stop-color="#d9b866"/><stop offset=".5" stop-color="#a87f2e"/>
  <stop offset=".72" stop-color="#e3c77a"/><stop offset="1" stop-color="#8c6a24"/></linearGradient>
<linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#f6e7b0"/><stop offset=".3" stop-color="#d4b061"/><stop offset=".65" stop-color="#9c752a"/><stop offset="1" stop-color="#d9b866"/></linearGradient>
<radialGradient id="goldR" cx=".38" cy=".32" r=".75">
  <stop offset="0" stop-color="#fbefc0"/><stop offset=".35" stop-color="#e0c072"/><stop offset=".75" stop-color="#a87f2e"/><stop offset="1" stop-color="#7a5a1c"/></radialGradient>
<filter id="foil" x="-2%" y="-2%" width="104%" height="104%">
  <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="9" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .8  0 0 0 .35 0" result="c"/>
  <feComposite in="c" in2="SourceGraphic" operator="in" result="g"/>
  <feBlend in="g" in2="SourceGraphic" mode="screen"/></filter>
<filter id="emboss" x="-5%" y="-5%" width="110%" height="110%">
  <feDropShadow dx="0" dy="1.6" stdDeviation="1.2" flood-color="#1c0a04" flood-opacity=".55"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="4" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 .2  0 0 0 0 .1  0 0 0 0 .05  0 0 0 .22 0" result="c"/>
  <feComposite in="c" in2="SourceGraphic" operator="in" result="g"/>
  <feBlend in="SourceGraphic" in2="g" mode="multiply"/></filter>
'''


def svg(w, h, body, defs=''):
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d"><defs>%s%s</defs>%s</svg>'
            % (w, h, w, h, GOLD_DEFS, defs, body))


def star(cx, cy, r, points=5, inner=0.45, rot=-90):
    pts = []
    for k in range(points * 2):
        rr = r if k % 2 == 0 else r * inner
        a = math.radians(rot + k * 180.0 / points)
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    return polyline(pts, True)


def rosette(cx, cy, r, petals=8, fill='url(#gold)', center=BURG, stroke=GOLD_DD):
    g = []
    for k in range(petals):
        a = 360.0 * k / petals
        g.append('<path d="M0,0 C%s,%s %s,%s 0,%s C%s,%s %s,%s 0,0Z" transform="translate(%s %s) rotate(%s)" fill="%s" stroke="%s" stroke-width="%s"/>' % (
            fmt(r * .42), fmt(-r * .25), fmt(r * .38), fmt(-r * .85), fmt(-r), fmt(-r * .38), fmt(-r * .85), fmt(-r * .42), fmt(-r * .25),
            fmt(cx), fmt(cy), fmt(a), fill, stroke, fmt(max(.6, r * .04))))
    g.append('<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="url(#gold)" stroke-width="%s"/>' % (fmt(cx), fmt(cy), fmt(r * .3), center, fmt(r * .08)))
    g.append('<circle cx="%s" cy="%s" r="%s" fill="url(#goldR)"/>' % (fmt(cx), fmt(cy), fmt(r * .13)))
    return ''.join(g)


def leaf(x, y, L, ang, w=0.38, fill='url(#gold)', stroke=GOLD_DD, sw=0.8, vein=True):
    d = 'M0,0 C%s,%s %s,%s %s,0 C%s,%s %s,%s 0,0Z' % (fmt(L * .3), fmt(-L * w), fmt(L * .75), fmt(-L * w * .8), fmt(L),
                                                     fmt(L * .75), fmt(L * w * .8), fmt(L * .3), fmt(L * w))
    v = '<path d="M%s,0 L%s,0" stroke="%s" stroke-width="%s" opacity=".7"/>' % (fmt(L * .08), fmt(L * .85), stroke, fmt(sw * .8)) if vein else ''
    return '<g transform="translate(%s %s) rotate(%s)"><path d="%s" fill="%s" stroke="%s" stroke-width="%s"/>%s</g>' % (
        fmt(x), fmt(y), fmt(ang), d, fill, stroke, fmt(sw), v)


def scroll_vine(ctrl, rng, leaf_len=22, density=0.07, flower_every=0, stem='url(#gold)', sw=3.0, leaf_fill='url(#gold)'):
    """A gold scrolling stem along a spline with alternating leaves and optional rosettes."""
    c = Curve(ctrl, 30)
    g = ['<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (smooth_path(ctrl, closed=False), stem, fmt(sw))]
    n = max(2, int(c.length * density))
    for k in range(1, n):
        t = k / n
        p = c.at(t)
        tx, ty = c.tangent(t)
        base = math.degrees(math.atan2(ty, tx))
        side = 1 if k % 2 else -1
        L = leaf_len * (0.75 + 0.5 * rng.random()) * (1.0 - 0.35 * t)
        g.append(leaf(p[0], p[1], L, base + side * rng.uniform(38, 62), fill=leaf_fill))
        if flower_every and k % flower_every == 0:
            g.append(rosette(p[0] + side * 4, p[1] - 6, leaf_len * 0.55, 6))
    # curl at the end
    end = c.at(1.0)
    tx, ty = c.tangent(1.0)
    ang = math.atan2(ty, tx)
    curl = []
    for k in range(20):
        u = k / 19.0
        r = leaf_len * 0.55 * (1 - u * 0.75)
        a = ang + u * 4.2
        curl.append((end[0] + math.cos(a + math.pi / 2) * r - math.cos(ang + math.pi / 2) * leaf_len * .55,
                     end[1] + math.sin(a + math.pi / 2) * r - math.sin(ang + math.pi / 2) * leaf_len * .55))
    g.append('<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (smooth_path(curl, closed=False), stem, fmt(sw * .8)))
    return ''.join(g)


# ---------------------------------------------------------------- sun medallion

def sun_medallion():
    W = 1000
    c = W / 2
    rng = Rng(11)
    g = []
    # outer burgundy band with stars
    g.append('<circle cx="%s" cy="%s" r="496" fill="url(#gold)"/>' % (c, c))
    g.append('<circle cx="%s" cy="%s" r="488" fill="%s"/>' % (c, c, BURG))
    g.append('<circle cx="%s" cy="%s" r="488" fill="url(#burgRing)"/>' % (c, c))
    # tiny floral dots in the band
    dots = []
    for k in range(260):
        a = rng.uniform(0, 2 * math.pi)
        r = rng.uniform(424, 482)
        x, y = c + math.cos(a) * r, c + math.sin(a) * r
        dots.append('<circle cx="%s" cy="%s" r="%s"/>' % (fmt(x), fmt(y), fmt(rng.uniform(1.2, 2.6))))
    g.append('<g fill="%s" opacity=".55">%s</g>' % (GOLD_L, ''.join(dots)))
    vines = []
    for k in range(48):
        a0 = k * 2 * math.pi / 48
        pts = []
        for u in range(9):
            a = a0 + u * (2 * math.pi / 48) / 8
            r = 453 + 14 * math.sin(u / 8 * math.pi * 2)
            pts.append((c + math.cos(a) * r, c + math.sin(a) * r))
        vines.append(polyline(pts))
    g.append('<path d="%s" fill="none" stroke="%s" stroke-width="1.6" opacity=".45"/>' % (''.join(vines), GOLD_L))
    for k in range(24):
        a = k * 2 * math.pi / 24 + 0.06
        r = 454 + (10 if k % 2 else -8)
        g.append('<path d="%s" fill="url(#gold)" stroke="%s" stroke-width="1"/>' % (star(c + math.cos(a) * r, c + math.sin(a) * r, 13 if k % 2 else 10), GOLD_DD))
    # gold rings
    g.append('<circle cx="%s" cy="%s" r="418" fill="none" stroke="url(#gold)" stroke-width="7"/>' % (c, c))
    g.append('<circle cx="%s" cy="%s" r="408" fill="none" stroke="url(#gold)" stroke-width="2"/>' % (c, c))
    # cream field
    g.append('<circle cx="%s" cy="%s" r="405" fill="url(#creamField)"/>' % (c, c))
    # band of little gold florets just inside the ring
    for k in range(60):
        a = k * 2 * math.pi / 60
        x, y = c + math.cos(a) * 386, c + math.sin(a) * 386
        if k % 2:
            g.append('<circle cx="%s" cy="%s" r="3" fill="url(#gold)"/>' % (fmt(x), fmt(y)))
        else:
            g.append(rosette(x, y, 9, 6, center=BURG))
    g.append('<circle cx="%s" cy="%s" r="370" fill="none" stroke="%s" stroke-width="1.6" opacity=".8"/>' % (c, c, GOLD))
    defs = '''<radialGradient id="burgRing" cx=".5" cy=".5" r=".5"><stop offset=".82" stop-color="#2a0610" stop-opacity=".6"/><stop offset=".9" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a0610" stop-opacity=".55"/></radialGradient>
<radialGradient id="creamField" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f8eed6"/><stop offset=".7" stop-color="#f1e2bf"/><stop offset="1" stop-color="#e2cc98"/></radialGradient>'''
    return svg(W, W, '<g filter="url(#grain)">%s</g>' % ''.join(g), defs)


def sun_rays():
    W = 1000
    c = W / 2
    rng = Rng(5)
    g = []
    n = 64
    for k in range(n):
        a = k * 2 * math.pi / n
        longr = k % 2 == 0
        r0 = 196
        r1 = 360 if longr else 300
        width = 15 if longr else 11
        waves = 3 if longr else 2
        pts_l, pts_r = [], []
        steps = 26
        for s in range(steps + 1):
            u = s / steps
            r = lerp(r0, r1, u)
            off = math.sin(u * math.pi * waves) * (7 if longr else 5) * u
            wid = width * (1 - u) ** 0.9 + 0.6
            ang = a + (off / r)
            nx, ny = -math.sin(ang), math.cos(ang)
            x, y = c + math.cos(ang) * r, c + math.sin(ang) * r
            pts_l.append((x + nx * wid, y + ny * wid))
            pts_r.append((x - nx * wid, y - ny * wid))
        d = smooth_path(pts_l + pts_r[::-1][1:], closed=True)
        g.append('<path d="%s" fill="%s"/>' % (d, 'url(#rayL)' if longr else 'url(#rayS)'))
        # fine gold midline
        mid = []
        for s in range(steps + 1):
            u = s / steps * 0.92
            r = lerp(r0 + 6, r1, u)
            off = math.sin(u * math.pi * waves) * (7 if longr else 5) * u
            ang = a + (off / r)
            mid.append((c + math.cos(ang) * r, c + math.sin(ang) * r))
        g.append('<path d="%s" fill="none" stroke="%s" stroke-width="1.2" opacity=".55"/>' % (smooth_path(mid, closed=False), GOLD_L))
    # little gold stars scattered between rays
    for k in range(26):
        a = rng.uniform(0, 2 * math.pi)
        r = rng.uniform(250, 350)
        g.append('<path d="%s" fill="url(#gold)"/>' % star(c + math.cos(a) * r, c + math.sin(a) * r, rng.uniform(4, 7.5)))
    defs = '''<radialGradient id="rayL" gradientUnits="userSpaceOnUse" cx="500" cy="500" r="360"><stop offset=".5" stop-color="#4a0e1c"/><stop offset=".8" stop-color="#7a1a30"/><stop offset="1" stop-color="#9a2a3e"/></radialGradient>
<radialGradient id="rayS" gradientUnits="userSpaceOnUse" cx="500" cy="500" r="300"><stop offset=".6" stop-color="#5a1022"/><stop offset="1" stop-color="#8a2236"/></radialGradient>'''
    return svg(W, W, '<g filter="url(#grain)">%s</g>' % ''.join(g), defs)


def sun_emblem():
    """Gold sunburst with a hole in the middle (monogram disc goes there in HTML)."""
    W = 600
    c = W / 2
    g = []
    n = 36
    for k in range(n):
        a = k * 2 * math.pi / n
        if k % 2 == 0:
            r0, r1, wd = 128, 292, 15
            pts = [(c + math.cos(a - wd / r0) * r0, c + math.sin(a - wd / r0) * r0),
                   (c + math.cos(a) * r1, c + math.sin(a) * r1),
                   (c + math.cos(a + wd / r0) * r0, c + math.sin(a + wd / r0) * r0)]
            g.append('<path d="%s" fill="url(#gold)" stroke="%s" stroke-width="1.4"/>' % (polyline(pts, True), GOLD_DD))
            g.append('<path d="M%s,%s L%s,%s" stroke="%s" stroke-width="1.4" opacity=".7"/>' % (
                fmt(c + math.cos(a) * r0), fmt(c + math.sin(a) * r0), fmt(c + math.cos(a) * (r1 - 6)), fmt(c + math.sin(a) * (r1 - 6)), GOLD_HL))
        else:
            pl, pr = [], []
            for s in range(21):
                u = s / 20
                r = lerp(130, 228, u)
                off = math.sin(u * math.pi * 3) * 6 * u
                ang = a + off / r
                wd = 10 * (1 - u) + 0.8
                nx, ny = -math.sin(ang), math.cos(ang)
                x, y = c + math.cos(ang) * r, c + math.sin(ang) * r
                pl.append((x + nx * wd, y + ny * wd))
                pr.append((x - nx * wd, y - ny * wd))
            g.append('<path d="%s" fill="url(#gold)" stroke="%s" stroke-width="1.2"/>' % (smooth_path(pl + pr[::-1][1:]), GOLD_DD))
    g.append('<circle cx="%s" cy="%s" r="132" fill="none" stroke="url(#gold)" stroke-width="12"/>' % (c, c))
    g.append('<circle cx="%s" cy="%s" r="124" fill="none" stroke="%s" stroke-width="2"/>' % (c, c, GOLD_DD))
    for k in range(32):
        a = k * 2 * math.pi / 32
        g.append('<circle cx="%s" cy="%s" r="3.2" fill="%s"/>' % (fmt(c + math.cos(a) * 146), fmt(c + math.sin(a) * 146), GOLD_HL))
    return svg(W, W, '<g filter="url(#emboss)"><g filter="url(#foil)">%s</g></g>' % ''.join(g))


# ---------------------------------------------------------------- Mughal arch

ARCH_W, ARCH_H = 1000, 600
SPRING_Y = 600
OPEN_L, OPEN_R = 112, 888
APEX_Y = 74


def arch_base_curve(side):
    """Points on the pointed base arch from springing (bottom) to apex, for one side (-1 left, +1 right)."""
    # pointed arch: circular arc whose centre is on the springing line
    x_s = OPEN_L if side < 0 else OPEN_R
    half = (OPEN_R - OPEN_L) / 2
    cx_mid = (OPEN_L + OPEN_R) / 2
    h = SPRING_Y - APEX_Y
    # ogee-ish: blend a pointed arch with a slight S near the springing
    pts = []
    for k in range(41):
        u = k / 40
        ang = u * math.pi / 2
        x = cx_mid + side * half * math.cos(ang) ** 0.92
        y = SPRING_Y - h * (math.sin(ang) ** 1.18)
        pts.append((x, y))
    return pts


def foil_path(inset=0.0, lobes=5):
    """Cusped (multifoil) opening outline: left springing -> apex -> right springing, then closed along the bottom."""
    out = []
    for side in (-1, 1):
        base = arch_base_curve(side)
        c = Curve(base, 12)
        segs = []
        # lobe boundaries: denser towards the apex
        bounds = [0.0, 0.18, 0.38, 0.58, 0.79, 1.0][:lobes + 1]
        for i in range(len(bounds) - 1):
            segs.append((bounds[i], bounds[i + 1]))
        side_pts = []
        for (t0, t1) in segs:
            p0, p1 = c.at(t0), c.at(t1)
            for s in range(13):
                u = s / 12
                t = lerp(t0, t1, u)
                p = c.at(t)
                n = c.normal(t)
                # outward normal points away from the opening centre
                cx, cy = (OPEN_L + OPEN_R) / 2, SPRING_Y
                if (p[0] + n[0] - cx) ** 2 + (p[1] + n[1] - cy) ** 2 < (p[0] - cx) ** 2 + (p[1] - cy) ** 2:
                    n = (-n[0], -n[1])
                seg_len = c.length * (t1 - t0)
                depth = math.sin(u * math.pi) * seg_len * 0.2 - inset
                side_pts.append((p[0] + n[0] * depth, p[1] + n[1] * depth))
        if side > 0:
            side_pts = side_pts[::-1]
        out.append(side_pts)
    left, right = out
    # left goes springing->apex; right is apex->springing after reversal
    pts = left + right
    return pts


def arch_top():
    rng = Rng(21)
    W, H = ARCH_W, ARCH_H
    opening = foil_path()
    open_d = polyline(opening + [(OPEN_R, H + 2), (OPEN_L, H + 2)], True)
    g = []
    defs = '<clipPath id="spandrel"><path d="M0,0 H%d V%d H0Z %s" clip-rule="evenodd"/></clipPath>' % (W, H, open_d)
    defs += '<mask id="cut"><rect width="%d" height="%d" fill="#fff"/><path d="%s" fill="#000"/></mask>' % (W, H, open_d)
    defs += '''<linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a1022"/><stop offset=".55" stop-color="#6b1428"/><stop offset="1" stop-color="#4a0e1c"/></linearGradient>
<pattern id="damask" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30,8 C36,18 44,22 52,30 C44,38 36,42 30,52 C24,42 16,38 8,30 C16,22 24,18 30,8Z" fill="#000" opacity=".14"/><circle cx="0" cy="0" r="4" fill="#000" opacity=".12"/><circle cx="60" cy="0" r="4" fill="#000" opacity=".12"/><circle cx="0" cy="60" r="4" fill="#000" opacity=".12"/><circle cx="60" cy="60" r="4" fill="#000" opacity=".12"/></pattern>'''
    body = ['<g mask="url(#cut)">']
    body.append('<rect width="%d" height="%d" fill="url(#panel)"/>' % (W, H))
    body.append('<rect width="%d" height="%d" fill="url(#damask)"/>' % (W, H))
    # outer frame borders
    body.append('<rect x="8" y="8" width="%d" height="%d" fill="none" stroke="url(#gold)" stroke-width="8"/>' % (W - 16, H + 40))
    body.append('<rect x="22" y="22" width="%d" height="%d" fill="none" stroke="url(#gold)" stroke-width="2.4"/>' % (W - 44, H + 40))
    # beads between the borders
    for x in range(30, W - 20, 18):
        body.append('<circle cx="%d" cy="15" r="2.2" fill="%s"/>' % (x, GOLD_L))
    # spandrel ornament: vines + rosettes, mirrored
    orn = []
    orn.append(rosette(168, 168, 54, 8, center=BURG_D))
    orn.append('<circle cx="168" cy="168" r="64" fill="none" stroke="url(#gold)" stroke-width="2.4"/>')
    orn.append(scroll_vine([(120, 238), (90, 300), (70, 380), (80, 470), (60, 540)], rng, 20, 0.07))
    orn.append(scroll_vine([(232, 150), (300, 120), (360, 82), (420, 60), (452, 44)], rng, 18, 0.075))
    orn.append(scroll_vine([(214, 214), (250, 260), (220, 320), (170, 340)], rng, 16, 0.09))
    orn.append(scroll_vine([(118, 116), (90, 80), (60, 60), (44, 40)], rng, 14, 0.09))
    for (x, y, r) in ((300, 190, 20), (110, 420, 18), (380, 120, 13), (52, 300, 12)):
        orn.append(rosette(x, y, r, 6, center=BURG))
    orn_s = ''.join(orn)
    body.append('<g clip-path="url(#spandrel)" filter="url(#emboss)">%s<g transform="translate(%d 0) scale(-1 1)">%s</g></g>' % (orn_s, W, orn_s))
    body.append('</g>')
    # capitals (impost blocks) where the arch springs from the columns — hides the seam with the pilasters
    for x0 in (0, W - 126):
        body.append('<g filter="url(#emboss)"><rect x="%d" y="570" width="126" height="30" fill="url(#goldV)" stroke="%s" stroke-width="1.5"/>'
                    '<rect x="%d" y="578" width="126" height="4" fill="%s"/>' % (x0, GOLD_DD, x0, BURG_D)
                    + ''.join('<rect x="%d" y="587" width="6" height="9" fill="%s"/>' % (x0 + 6 + k * 12, BURG_D) for k in range(10))
                    + '</g>')
    # apex finial (kalash / lotus bud)
    fx = W / 2
    body.append('<g filter="url(#emboss)">'
                '<path d="M%s,%s c-18,-6 -30,-22 -26,-40 c10,6 18,10 26,4 c8,6 16,2 26,-4 c4,18 -8,34 -26,40Z" fill="url(#gold)" stroke="%s" stroke-width="1.5"/>'
                '<path d="M%s,%s c-8,-12 -8,-28 0,-44 c8,16 8,32 0,44Z" fill="url(#gold)" stroke="%s" stroke-width="1.5"/>'
                '<circle cx="%s" cy="%s" r="5" fill="url(#goldR)"/></g>' % (
                    fmt(fx), fmt(APEX_Y - 6), GOLD_DD, fmt(fx), fmt(APEX_Y - 30), GOLD_DD, fmt(fx), fmt(APEX_Y - 78)))
    # arch moldings: three gold lines following the cusped opening + outer pointed arch line
    for (inset, sw, col) in ((0, 9, 'url(#gold)'), (-14, 2.4, 'url(#gold)'), (-24, 1.4, GOLD_L)):
        pts = foil_path(inset=inset)
        body.append('<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linejoin="round"/>' % (polyline(pts), col, sw))
    # cusps tips: tiny gold drops at each cusp
    base_l = Curve(arch_base_curve(-1), 12)
    base_r = Curve(arch_base_curve(1), 12)
    for bc in (base_l, base_r):
        for t in (0.18, 0.38, 0.58, 0.79):
            p = bc.at(t)
            body.append('<circle cx="%s" cy="%s" r="5.5" fill="url(#goldR)" stroke="%s" stroke-width="1"/>' % (fmt(p[0]), fmt(p[1]), GOLD_DD))
    # inner shadow along the opening so the parchment looks recessed
    body.append('<path d="%s" fill="none" stroke="#1a0508" stroke-width="22" opacity=".28" filter="url(#blur6)" mask="url(#inside)"/>' % polyline(opening))
    defs += '<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>'
    defs += '<mask id="inside"><path d="%s" fill="#fff"/></mask>' % open_d
    return svg(W, H, ''.join(body), defs)


def arch_pilaster():
    """Repeating vertical tile for the side columns (left side; mirror for right)."""
    W, H = 112, 220
    rng = Rng(3)
    g = ['<rect width="%d" height="%d" fill="url(#panelV)"/>' % (W, H)]
    g.append('<rect x="8" y="0" width="8" height="%d" fill="url(#goldV)"/>' % H)
    g.append('<rect x="22" y="0" width="2.4" height="%d" fill="%s"/>' % (H, GOLD_L))
    g.append('<rect x="%d" y="0" width="9" height="%d" fill="url(#goldV)"/>' % (W - 9, H))
    g.append('<rect x="%d" y="0" width="2.2" height="%d" fill="%s"/>' % (W - 20, H, GOLD_L))
    # repeating diamond + rosette chain
    cx = (24 + W - 20) / 2
    for y in (0, 110, 220):
        g.append('<path d="M%s,%s l26,40 l-26,40 l-26,-40Z" fill="none" stroke="url(#gold)" stroke-width="2.2"/>' % (fmt(cx), y - 40))
        g.append(rosette(cx, y, 14, 8, center=BURG_D))
    for y in (55, 165):
        g.append(leaf(cx, y, 20, -60))
        g.append(leaf(cx, y, 20, -120))
        g.append(leaf(cx, y, 16, 60))
        g.append(leaf(cx, y, 16, 120))
        g.append('<circle cx="%s" cy="%s" r="3.5" fill="url(#goldR)"/>' % (fmt(cx), y))
    defs = '<linearGradient id="panelV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a0e1c"/><stop offset=".5" stop-color="#6b1428"/><stop offset="1" stop-color="#4a0e1c"/></linearGradient>'
    return svg(W, H, '<g filter="url(#emboss)">%s</g>' % ''.join(g), defs)


def arch_base():
    """Ledge at the bottom of the frame: a gold molding with a burgundy lotus band."""
    W, H = 1000, 150
    g = []
    g.append('<rect x="0" y="22" width="%d" height="%d" fill="url(#panel2)"/>' % (W, H - 22))
    g.append('<rect x="0" y="10" width="%d" height="14" fill="url(#goldV)"/>' % W)
    g.append('<rect x="0" y="4" width="%d" height="6" fill="%s"/>' % (W, GOLD_D))
    g.append('<rect x="0" y="30" width="%d" height="3" fill="%s"/>' % (W, GOLD_L))
    g.append('<rect x="0" y="%d" width="%d" height="3" fill="%s"/>' % (H - 26, W, GOLD_L))
    g.append('<rect x="0" y="%d" width="%d" height="10" fill="url(#goldV)"/>' % (H - 12, W))
    # lotus band
    for i in range(12):
        x = 42 + i * 83.3
        y = 92
        g.append('<path d="M%s,%s c-6,-18 -2,-34 0,-42 c2,8 6,24 0,42Z" fill="url(#gold)" stroke="%s" stroke-width="1"/>' % (fmt(x), y + 18, GOLD_DD))
        g.append('<path d="M%s,%s c-14,-8 -22,-24 -22,-34 c10,4 18,14 22,34Z" fill="url(#gold)" stroke="%s" stroke-width="1"/>' % (fmt(x), y + 18, GOLD_DD))
        g.append('<path d="M%s,%s c14,-8 22,-24 22,-34 c-10,4 -18,14 -22,34Z" fill="url(#gold)" stroke="%s" stroke-width="1"/>' % (fmt(x), y + 18, GOLD_DD))
        g.append('<circle cx="%s" cy="%s" r="2.6" fill="%s"/>' % (fmt(x + 41.6), y + 4, GOLD_L))
    defs = '<linearGradient id="panel2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a0e1c"/><stop offset=".4" stop-color="#6b1428"/><stop offset="1" stop-color="#3a0915"/></linearGradient>'
    return svg(W, H, '<g filter="url(#emboss)">%s</g>' % ''.join(g), defs)


PIECES = {
    'sun-medallion': sun_medallion,
    'sun-rays': sun_rays,
    'sun-emblem': sun_emblem,
    'arch-top': arch_top,
    'arch-pilaster': arch_pilaster,
    'arch-base': arch_base,
}

# ---------------------------------------------------------------- cover doors

GATE_H = 1250
BASE_TOP = 1100


def opening_polygon():
    pts = foil_path()
    return pts + [(OPEN_R, BASE_TOP), (OPEN_L, BASE_TOP)]


def door(side):
    W, H = ARCH_W, GATE_H
    rng = Rng(31 if side < 0 else 32)
    op = polyline(opening_polygon(), True)
    mid = 500
    half_rect = 'M0,0 H%d V%d H0Z' % (mid, H) if side < 0 else 'M%d,0 H%d V%d H%dZ' % (mid, W, H, mid)
    defs = '<clipPath id="leaf"><path d="%s"/></clipPath><clipPath id="half"><path d="%s"/></clipPath>' % (op, half_rect)
    defs += '''<linearGradient id="wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3d0b17"/><stop offset=".5" stop-color="#5e1224"/><stop offset="1" stop-color="#3d0b17"/></linearGradient>
<pattern id="jaali" width="36" height="36" patternUnits="userSpaceOnUse">
<rect width="36" height="36" fill="#1e050b"/>
<path d="M18,2 L22,14 L34,18 L22,22 L18,34 L14,22 L2,18 L14,14Z" fill="none" stroke="#d9b866" stroke-width="2"/>
<path d="M0,0 L8,8 M36,0 L28,8 M0,36 L8,28 M36,36 L28,28" stroke="#d9b866" stroke-width="2"/>
<circle cx="18" cy="18" r="3" fill="#d9b866"/></pattern>'''
    g = []
    g.append('<rect width="%d" height="%d" fill="url(#wood)"/>' % (W, H))
    grain = []
    for k in range(60):
        x = rng.uniform(100, 900)
        pts = [(x + math.sin(y / 60.0 + k) * 3, y) for y in range(0, H, 40)]
        grain.append(polyline(pts))
    g.append('<path d="%s" stroke="#000" stroke-width="1.2" opacity=".12" fill="none"/>' % ''.join(grain))
    # top arched jaali panel: opening inset
    inner = foil_path(inset=46)
    jaali_d = polyline(inner + [(OPEN_R - 46, 560), (OPEN_L + 46, 560)], True)
    g.append('<path d="%s" fill="url(#jaali)" stroke="url(#gold)" stroke-width="7"/>' % jaali_d)
    g.append('<path d="%s" fill="none" stroke="%s" stroke-width="2" transform="translate(0 0)" opacity=".9"/>' % (polyline(foil_path(inset=60) + [(OPEN_R - 60, 546), (OPEN_L + 60, 546)], True), GOLD_L))
    # rail with studs under the jaali
    g.append('<rect x="%d" y="578" width="%d" height="16" fill="url(#goldV)"/>' % (OPEN_L, OPEN_R - OPEN_L))
    for x in range(OPEN_L + 20, OPEN_R - 10, 26):
        g.append('<circle cx="%d" cy="586" r="4.2" fill="url(#goldR)"/>' % x)
    # rectangular panels per leaf
    for (x0, x1) in ((OPEN_L + 34, mid - 30), (mid + 30, OPEN_R - 34)):
        for (y0, y1) in ((624, 840), (872, 1072)):
            g.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#4a0e1c" stroke="url(#gold)" stroke-width="6"/>' % (x0, y0, x1 - x0, y1 - y0))
            g.append('<rect x="%d" y="%d" width="%d" height="%d" fill="url(#damask2)" stroke="%s" stroke-width="1.6"/>' % (x0 + 14, y0 + 14, x1 - x0 - 28, y1 - y0 - 28, GOLD_L))
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            g.append('<path d="M%s,%s l%s,%s l%s,%s l%s,%s Z" fill="none" stroke="url(#gold)" stroke-width="2.4"/>' % (
                fmt(cx), fmt(y0 + 30), fmt((x1 - x0) / 2 - 30), fmt((y1 - y0) / 2 - 30), fmt(-((x1 - x0) / 2 - 30)), fmt((y1 - y0) / 2 - 30), fmt(-((x1 - x0) / 2 - 30)), fmt(-((y1 - y0) / 2 - 30))))
            g.append(rosette(cx, cy, 30, 8, center=BURG_D))
            for (lx, ly, a) in ((x0 + 22, y0 + 22, 45), (x1 - 22, y0 + 22, 135), (x1 - 22, y1 - 22, 225), (x0 + 22, y1 - 22, 315)):
                g.append(leaf(lx, ly, 26, a))
    # bottom rail with studs
    g.append('<rect x="%d" y="1082" width="%d" height="14" fill="url(#goldV)"/>' % (OPEN_L, OPEN_R - OPEN_L))
    # meeting stile
    g.append('<rect x="%d" y="0" width="14" height="%d" fill="url(#goldV)"/>' % (mid - 7, H))
    for y in range(110, BASE_TOP, 34):
        g.append('<circle cx="%d" cy="%d" r="4" fill="url(#goldR)"/>' % (mid + (-16 if side < 0 else 16), y))
    # ring knocker
    kx = mid - 70 if side < 0 else mid + 70
    g.append('<circle cx="%d" cy="852" r="15" fill="url(#goldR)" stroke="%s" stroke-width="1.5"/>' % (kx, GOLD_DD))
    g.append('<circle cx="%d" cy="900" r="34" fill="none" stroke="url(#gold)" stroke-width="8"/>' % kx)
    # leaf outline in gold + inner shadow at the hinge side
    g.append('<path d="%s" fill="none" stroke="url(#gold)" stroke-width="14"/>' % op)
    shade_x = OPEN_L if side < 0 else OPEN_R
    g.append('<rect x="%d" y="0" width="60" height="%d" fill="url(#hinge%s)"/>' % (shade_x - (0 if side < 0 else 60), H, 'L' if side < 0 else 'R'))
    defs += '<linearGradient id="hingeL" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>'
    defs += '<linearGradient id="hingeR" x1="1" x2="0"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>'
    defs += '<pattern id="damask2" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#5a1022"/><path d="M22,6 C26,14 32,17 38,22 C32,27 26,30 22,38 C18,30 12,27 6,22 C12,17 18,14 22,6Z" fill="#3a0915" opacity=".7"/></pattern>'
    body = '<g clip-path="url(#half)"><g clip-path="url(#leaf)" filter="url(#emboss)">%s</g></g>' % ''.join(g)
    return svg(W, H, body, defs)


def door_left():
    return door(-1)


def door_right():
    return door(1)


# ---------------------------------------------------------------- border band (repeat-x tile)

def border_band():
    W, H = 240, 64
    g = ['<rect width="%d" height="%d" fill="url(#bandBg)"/>' % (W, H)]
    g.append('<rect y="0" width="%d" height="7" fill="url(#goldV)"/><rect y="%d" width="%d" height="7" fill="url(#goldV)"/>' % (W, H - 7, W))
    g.append('<rect y="11" width="%d" height="1.6" fill="%s"/><rect y="%s" width="%d" height="1.6" fill="%s"/>' % (W, GOLD_L, H - 12.6, W, GOLD_L))
    # lotus at 60, rosette at 180 with olive leaves between
    x, y = 60, H / 2 + 12
    g.append('<path d="M%s,%s c-5,-14 -2,-26 0,-32 c2,6 5,18 0,32Z" fill="url(#gold)" stroke="%s" stroke-width=".9"/>' % (x, y, GOLD_DD))
    g.append('<path d="M%s,%s c-12,-6 -18,-18 -18,-27 c8,3 15,11 18,27Z" fill="url(#gold)" stroke="%s" stroke-width=".9"/>' % (x, y, GOLD_DD))
    g.append('<path d="M%s,%s c12,-6 18,-18 18,-27 c-8,3 -15,11 -18,27Z" fill="url(#gold)" stroke="%s" stroke-width=".9"/>' % (x, y, GOLD_DD))
    g.append('<path d="M%s,%s c-14,0 -26,-4 -30,-10 c10,0 22,2 30,10Z M%s,%s c14,0 26,-4 30,-10 c-10,0 -22,2 -30,10Z" fill="%s"/>' % (x, y, x, y, OLIVE_L))
    g.append(rosette(180, H / 2, 13, 8, center=BURG_D))
    for (lx, a) in ((112, 180), (128, 0), (232, 180), (8, 0)):
        pass
    g.append('<path d="M92,%s C110,%s 130,%s 150,%s M210,%s C226,%s 236,%s 252,%s M-28,%s C-12,%s -2,%s 14,%s" stroke="url(#gold)" stroke-width="1.8" fill="none"/>' % (
        H / 2, H / 2 - 9, H / 2 + 9, H / 2, H / 2, H / 2 - 9, H / 2 + 9, H / 2, H / 2, H / 2 - 9, H / 2 + 9, H / 2))
    for (lx, ly, a) in ((104, H / 2 - 3, -150), (138, H / 2 + 3, 30), (218, H / 2 - 4, -150), (22, H / 2 + 3, 30)):
        g.append(leaf(lx, ly, 13, a, fill=OLIVE_L, stroke=OLIVE_D, sw=.6))
    defs = '<linearGradient id="bandBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a0e1c"/><stop offset=".5" stop-color="#6b1428"/><stop offset="1" stop-color="#4a0e1c"/></linearGradient>'
    return svg(W, H, '<g filter="url(#emboss)">%s</g>' % ''.join(g), defs)


# ---------------------------------------------------------------- palm tree (gold line art)

def palm():
    W, H = 640, 1000
    rng = Rng(8)
    g = []
    trunk = Curve([(330, 995), (326, 820), (338, 640), (360, 470), (372, 360), (366, 300)], 30)
    pts = [trunk.at(t) for t in [i / 50 for i in range(51)]]
    lw = [(p, 19 - 9 * (i / 50)) for i, p in enumerate(pts)]
    left = [(p[0] - w, p[1]) for p, w in lw]
    right = [(p[0] + w, p[1]) for p, w in lw]
    g.append('<path d="%s" fill="url(#trunk)" stroke="%s" stroke-width="1.5"/>' % (polyline(left + right[::-1], True), GOLD_DD))
    rings = []
    for i in range(0, 50):
        p, w = lw[i]
        rings.append('M%s,%s l%s,%s l%s,%s' % (fmt(p[0] - w), fmt(p[1] - 3), fmt(w), fmt(6), fmt(w), fmt(-6)))
    g.append('<path d="%s" stroke="%s" stroke-width="1.5" fill="none" opacity=".8"/>' % (''.join(rings), GOLD_DD))
    top = trunk.at(1.0)
    fronds = []
    specs = [(-200, 250, 150), (-178, 270, 120), (-155, 250, 70), (-130, 210, 30), (-104, 190, 0), (-80, 200, 10),
             (-56, 230, 40), (-32, 260, 90), (-8, 270, 130), (14, 240, 170), (-222, 200, 190)]
    for k, (a, L, droop) in enumerate(specs):
        ar = math.radians(a)
        ex, ey = top[0] + math.cos(ar) * L, top[1] + math.sin(ar) * L * 0.55 + droop
        mx, my = top[0] + math.cos(ar) * L * 0.5, top[1] + math.sin(ar) * L * 0.5 - 18
        ctrl = [top, (mx, my), (ex, ey)]
        c = Curve(ctrl, 24)
        lines = []
        n = 34
        for s in range(2, n):
            t = s / n
            p = c.at(t)
            tx, ty = c.tangent(t)
            nx, ny = -ty, tx
            ll = 58 * math.sin(math.pi * min(1, t * 1.05)) ** 0.8 + 6
            for side in (-1, 1):
                qx = p[0] + (nx * side * 0.75 + tx * 0.45) * ll
                qy = p[1] + (ny * side * 0.75 + ty * 0.45) * ll + ll * 0.45
                lines.append('M%s,%sQ%s,%s %s,%s' % (fmt(p[0]), fmt(p[1]), fmt((p[0] + qx) / 2 + tx * 6), fmt((p[1] + qy) / 2 - 3), fmt(qx), fmt(qy)))
        fronds.append('<path d="%s" fill="none" stroke="url(#gold)" stroke-width="2" stroke-linecap="round"/>' % ''.join(lines))
        fronds.append('<path d="%s" fill="none" stroke="url(#gold)" stroke-width="3.6" stroke-linecap="round"/>' % smooth_path(ctrl, closed=False))
    g.extend(fronds)
    for k in range(11):
        g.append('<circle cx="%s" cy="%s" r="7" fill="url(#goldR)" stroke="%s" stroke-width=".8"/>' % (fmt(top[0] + rng.uniform(-18, 18)), fmt(top[1] + 16 + rng.uniform(0, 22)), GOLD_DD))
    defs = '<linearGradient id="trunk" x1="0" x2="1"><stop offset="0" stop-color="#8c6a24"/><stop offset=".45" stop-color="#e3c77a"/><stop offset="1" stop-color="#8c6a24"/></linearGradient>'
    return svg(W, H, '<g filter="url(#emboss)">%s</g>' % ''.join(g), defs)


# ---------------------------------------------------------------- lotus group

def lotus_flower(cx, cy, s, open_=1.0):
    g = []
    petals = [(-62, .8, '#a8384a'), (62, .8, '#a8384a'), (-38, .95, '#c25a66'), (38, .95, '#c25a66'), (-14, 1.05, '#d97f86'), (14, 1.05, '#d97f86'), (0, 1.12, '#e9a3a4')]
    for (a, L, col) in petals:
        Lp = 70 * s * L
        wp = 22 * s
        d = 'M0,0 C%s,%s %s,%s 0,%s C%s,%s %s,%s 0,0Z' % (fmt(wp), fmt(-Lp * .3), fmt(wp * .7), fmt(-Lp * .8), fmt(-Lp), fmt(-wp * .7), fmt(-Lp * .8), fmt(-wp), fmt(-Lp * .3))
        g.append('<path d="%s" transform="translate(%s %s) rotate(%s)" fill="%s" stroke="%s" stroke-width="1.4"/>' % (d, fmt(cx), fmt(cy), fmt(a * open_), col, GOLD))
        g.append('<path d="M0,-%s L0,-%s" transform="translate(%s %s) rotate(%s)" stroke="#fff" stroke-width="1" opacity=".35"/>' % (fmt(Lp * .15), fmt(Lp * .8), fmt(cx), fmt(cy), fmt(a * open_)))
    g.append('<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="url(#gold)"/>' % (fmt(cx), fmt(cy - 4 * s), fmt(16 * s), fmt(6 * s)))
    return ''.join(g)


def lily_pad(cx, cy, rx, ry):
    return ('<path d="M%s,%s A%s,%s 0 1 1 %s,%s L%s,%s Z" fill="url(#pad)" stroke="%s" stroke-width="1.6"/>' % (
        fmt(cx + 2), fmt(cy - ry), fmt(rx), fmt(ry), fmt(cx - 2), fmt(cy - ry), fmt(cx), fmt(cy), GOLD_D)
        + '<path d="M%s,%s l%s,%s M%s,%s l%s,%s M%s,%s l%s,%s" stroke="%s" stroke-width="1" opacity=".5"/>' % (
            fmt(cx), fmt(cy), fmt(-rx * .7), fmt(ry * .4), fmt(cx), fmt(cy), fmt(rx * .7), fmt(ry * .4), fmt(cx), fmt(cy), 0, fmt(ry * .9), OLIVE_DD))


def lotus():
    W, H = 900, 300
    g = []
    g.append(lily_pad(150, 250, 120, 34))
    g.append(lily_pad(760, 255, 110, 30))
    g.append(lily_pad(470, 275, 150, 30))
    g.append(lily_pad(330, 230, 70, 18))
    for (x, y, s) in ((300, 228, 1.15), (560, 236, 1.4), (760, 232, 1.0)):
        g.append('<path d="M%s,%s q4,30 0,60" stroke="%s" stroke-width="4" fill="none"/>' % (x, y, OLIVE_D))
        g.append(lotus_flower(x, y, s))
    # buds
    for (x, y) in ((140, 200), (430, 190), (860, 205)):
        g.append('<path d="M%s,%s q-3,40 2,90" stroke="%s" stroke-width="3.5" fill="none"/>' % (x, y, OLIVE_D))
        g.append('<path d="M%s,%s c-14,-12 -12,-36 0,-50 c12,14 14,38 0,50Z" fill="#c25a66" stroke="%s" stroke-width="1.4"/>' % (x, y, GOLD))
    defs = '<radialGradient id="pad" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#8a9446"/><stop offset=".7" stop-color="#5b6430"/><stop offset="1" stop-color="#3e4521"/></radialGradient>'
    return svg(W, H, '<g filter="url(#emboss)">%s</g>' % ''.join(g), defs)


# ---------------------------------------------------------------- brass urn with burgundy flowers

def urn():
    W, H = 520, 760
    rng = Rng(12)
    g = []
    cx = 260
    # foliage behind: olive eucalyptus sprays + drooping amaranthus
    sprays = []
    for k in range(9):
        a = math.radians(-160 + k * 17 + rng.uniform(-6, 6))
        L = rng.uniform(150, 230)
        sx, sy = cx, 360
        ex, ey = sx + math.cos(a) * L, sy + math.sin(a) * L * 0.9
        ctrl = [(sx, sy), ((sx + ex) / 2 + rng.uniform(-30, 30), (sy + ey) / 2 - 20), (ex, ey)]
        sprays.append('<path d="%s" stroke="%s" stroke-width="2.4" fill="none"/>' % (smooth_path(ctrl, closed=False), OLIVE_D))
        c = Curve(ctrl, 16)
        for s in range(2, 12):
            t = s / 12
            p = c.at(t)
            r = 9 + 4 * (1 - t)
            for side in (-1, 1):
                tx, ty = c.tangent(t)
                ox, oy = -ty * side * r, tx * side * r
                sprays.append('<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width=".8"/>' % (
                    fmt(p[0] + ox), fmt(p[1] + oy), fmt(r), mix(OLIVE, OLIVE_L, rng.random()), OLIVE_DD))
    g.append(''.join(sprays))
    # burgundy dahlias: layered petals, dark outside -> crimson centre
    for (x, y, r) in ((cx - 128, 330, 36), (cx + 132, 338, 38), (cx - 70, 300, 48), (cx + 64, 296, 52), (cx + 10, 334, 42), (cx, 250, 58)):
        layers = [(18, 1.0, '#3f0a18', '#6b1428'), (15, .8, '#5a1022', '#8a2236'), (12, .6, '#6b1428', '#a8384a'), (9, .42, '#8a2236', '#c25a66'), (6, .25, '#a8384a', '#d97f86')]
        for li, (n, rr, c1, c2) in enumerate(layers):
            off = rng.uniform(0, 30)
            for k in range(n):
                a = off + 360.0 * k / n
                Lp = r * rr
                wp = Lp * (0.36 if li < 3 else 0.42)
                d = 'M0,0 C%s,%s %s,%s 0,%s C%s,%s %s,%s 0,0Z' % (fmt(wp), fmt(-Lp * .2), fmt(wp * 1.05), fmt(-Lp * .85), fmt(-Lp), fmt(-wp * 1.05), fmt(-Lp * .85), fmt(-wp), fmt(-Lp * .2))
                g.append('<path d="%s" transform="translate(%s %s) rotate(%s)" fill="%s" stroke="%s" stroke-width=".7"/>' % (d, fmt(x), fmt(y), fmt(a), mix(c1, c2, rng.random()), '#2a0610'))
        g.append('<circle cx="%s" cy="%s" r="%s" fill="#3f0a18"/>' % (fmt(x), fmt(y), fmt(r * .1)))
    # drooping amaranthus strands
    for (sx, sy, L) in ((cx - 100, 360, 300), (cx + 96, 360, 330), (cx - 150, 350, 220), (cx + 150, 356, 250), (cx - 40, 380, 360)):
        x, y = sx, sy
        for k in range(int(L / 9)):
            x += math.sin(k * 0.22) * 1.4 + (0.6 if sx > cx else -0.6)
            y += 9
            r = 6.5 * (1 - k / (L / 9)) + 2.2
            g.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (fmt(x + rng.uniform(-1.5, 1.5)), fmt(y), fmt(r), mix('#5a1022', '#8a2236', rng.random())))
    # pomegranates
    for (x, y, r) in ((cx - 30, 360, 26), (cx + 40, 368, 22)):
        g.append('<circle cx="%s" cy="%s" r="%s" fill="url(#pom)" stroke="#3a0915" stroke-width="1.2"/>' % (x, y, r))
        g.append('<path d="M%s,%s l-6,-10 l6,4 l6,-4 l-6,10Z" fill="#7d3220"/>' % (x, y - r + 2))
    # the urn (brass)
    prof = [(0, 0), (70, 6), (92, 30), (98, 70), (90, 120), (70, 160), (40, 190), (30, 214), (46, 236), (58, 250), (58, 262)]
    top_y = 380
    left = [(cx - px, top_y + py) for (px, py) in prof]
    right = [(cx + px, top_y + py) for (px, py) in prof]
    urn_d = smooth_path(right + left[::-1], closed=True)
    g.append('<path d="%s" fill="url(#brass)" stroke="%s" stroke-width="2"/>' % (urn_d, GOLD_DD))
    g.append('<ellipse cx="%s" cy="%s" rx="72" ry="12" fill="#2a1a08" stroke="url(#gold)" stroke-width="5"/>' % (cx, top_y + 2))
    g.append('<path d="M%s,%s q98,22 196,0 l0,22 q-98,22 -196,0Z" fill="%s" opacity=".9"/>' % (cx - 98, top_y + 64, BURG))
    for k in range(7):
        x = cx - 78 + k * 26
        g.append(rosette(x, top_y + 82, 8, 6, center=BURG_D))
    g.append('<path d="M%s,%s q60,10 120,0" stroke="%s" stroke-width="3" fill="none" opacity=".7"/>' % (cx - 60, top_y + 150, GOLD_HL))
    g.append('<path d="M%s,%s C%s,%s %s,%s %s,%s" stroke="#fff" stroke-width="10" opacity=".22" fill="none" stroke-linecap="round"/>' % (
        cx - 62, top_y + 30, cx - 84, top_y + 70, cx - 76, top_y + 120, cx - 50, top_y + 160))
    defs = '''<linearGradient id="brass" x1="0" x2="1"><stop offset="0" stop-color="#6e5219"/><stop offset=".3" stop-color="#d9b866"/><stop offset=".55" stop-color="#f1dda0"/><stop offset=".8" stop-color="#a87f2e"/><stop offset="1" stop-color="#5e4414"/></linearGradient>
<radialGradient id="pom" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#d0505a"/><stop offset=".6" stop-color="#8a2236"/><stop offset="1" stop-color="#4a0e1c"/></radialGradient>'''
    return svg(W, H, '<g filter="url(#emboss)">%s</g>' % ''.join(g), defs)


PIECES.update({
    'door-left': door_left,
    'door-right': door_right,
    'border-band': border_band,
    'palm': palm,
    'lotus': lotus,
    'urn': urn,
})


if __name__ == '__main__':
    outdir = sys.argv[1]
    names = sys.argv[2:] or list(PIECES)
    for n in names:
        s = PIECES[n]()
        p = os.path.join(outdir, n + '.svg')
        open(p, 'w').write(s)
        print('wrote', p, len(s) // 1024, 'KB')
