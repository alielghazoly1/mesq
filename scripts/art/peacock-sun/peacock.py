"""Procedural peacock (perched, facing right, train draping down-left).

python3 peacock.py out.svg [--mirror] [--no-texture]
"""
import math
import sys
from svgkit import Curve, smooth_path, polyline, mix, shade, lerp, clamp, Rng, fmt

W, H = 900, 1300
R = Rng(7)

# ---------- palette ----------
TEAL_D = '#0d3440'
TEAL = '#165566'
TEAL_L = '#2b8189'
TEAL_HL = '#5fb0ad'
INDIGO = '#1a1f4a'
OLIVE_D = '#3a4019'
OLIVE = '#5b6430'
OLIVE_L = '#8a9446'
GOLD_D = '#8c6a24'
GOLD = '#b8913a'
GOLD_L = '#dcbc6a'
GOLD_HL = '#f3e2a4'
COPPER = '#6a4420'
BURG = '#6b1428'
BURG_D = '#3f0a18'
CHESTNUT = '#7d3220'
CREAM = '#efe2c2'
BROWN_D = '#3b2516'

out = []


def add(s):
    out.append(s)


# ---------- train ----------
train = Curve([(506, 488), (466, 530), (424, 600), (390, 700), (368, 815), (362, 940), (372, 1060), (382, 1170), (378, 1268)], 60)


def width_at(t):
    # half width of the train along its length
    if t < 0.08:
        return lerp(22, 62, t / 0.08)
    if t < 0.35:
        return lerp(62, 122, (t - 0.08) / 0.27)
    if t < 0.8:
        return lerp(122, 150, (t - 0.35) / 0.45)
    # rounded end
    u = (t - 0.8) / 0.2
    return 150 * math.sqrt(max(0.0, 1 - u * u)) * 0.95 + 6


def train_outline(extra=0.0):
    left, right = [], []
    steps = 70
    for i in range(steps + 1):
        t = i / steps
        p = train.at(t)
        n = train.normal(t)
        w = width_at(t) + extra
        left.append((p[0] + n[0] * w, p[1] + n[1] * w))
        right.append((p[0] - n[0] * w, p[1] - n[1] * w))
    return left + right[::-1]


def eye_pos(t, s):
    p = train.at(t)
    n = train.normal(t)
    return (p[0] + n[0] * s, p[1] + n[1] * s)


def direction(t, s):
    tx, ty = train.tangent(t)
    w = width_at(t) or 1
    spread = 0.42 * (s / w)
    ang = math.atan2(ty, tx) + spread
    return ang


def ocellus(cx, cy, a, ang, alpha=1.0, dim=0.0):
    """One peacock 'eye' oriented with its long axis along ang (pointing to the feather tip)."""
    deg = math.degrees(ang) - 90  # local +y points toward tip
    g = []
    g.append('<g transform="translate(%s %s) rotate(%s)" opacity="%s">' % (fmt(cx), fmt(cy), fmt(deg), fmt(alpha)))
    # loose barb fringe around the eye
    fr = []
    nb = 22
    for k in range(nb):
        th = (k / nb) * 2 * math.pi
        rr = 1.0 + 0.18 * R.random()
        x1, y1 = math.cos(th) * a * 0.9, math.sin(th) * a * 1.15 + a * 0.2
        x2, y2 = math.cos(th) * a * 1.75 * rr, math.sin(th) * a * 2.0 * rr + a * 0.25
        fr.append('M%s,%sL%s,%s' % (fmt(x1), fmt(y1), fmt(x2), fmt(y2)))
    g.append('<path d="%s" stroke="%s" stroke-width="%s" stroke-linecap="round" opacity=".55" fill="none"/>' % (''.join(fr), mix(OLIVE_L, GOLD, 0.4), fmt(max(0.7, a * 0.07))))
    g.append('<ellipse cx="0" cy="%s" rx="%s" ry="%s" fill="url(#gHalo)"/>' % (fmt(a * 0.18), fmt(a * 1.45), fmt(a * 1.78)))
    g.append('<ellipse cx="0" cy="%s" rx="%s" ry="%s" fill="url(#gGreen)"/>' % (fmt(a * 0.12), fmt(a * 1.12), fmt(a * 1.38)))
    g.append('<ellipse cx="0" cy="%s" rx="%s" ry="%s" fill="url(#gGold)"/>' % (fmt(a * 0.07), fmt(a * 0.93), fmt(a * 1.15)))
    g.append('<ellipse cx="0" cy="%s" rx="%s" ry="%s" fill="%s"/>' % (fmt(a * 0.03), fmt(a * 0.8), fmt(a * 0.99), COPPER))
    # turquoise heart (notch toward the tip)
    hx, hy = a * 0.72, a * 0.93
    heart = 'M0,%s C%s,%s %s,%s 0,%s C%s,%s %s,%s 0,%s Z' % (
        fmt(-hy), fmt(hx * 1.25), fmt(-hy * 0.9), fmt(hx * 1.05), fmt(hy * 0.85), fmt(hy * 0.62),
        fmt(-hx * 1.05), fmt(hy * 0.85), fmt(-hx * 1.25), fmt(-hy * 0.9), fmt(-hy))
    g.append('<path d="%s" fill="url(#gTeal)"/>' % heart)
    # dark core
    kx, ky = a * 0.38, a * 0.47
    core = 'M0,%s C%s,%s %s,%s 0,%s C%s,%s %s,%s 0,%s Z' % (
        fmt(-ky * 0.95), fmt(kx * 1.3), fmt(-ky * 1.0), fmt(kx * 1.15), fmt(ky * 0.9), fmt(ky * 0.55),
        fmt(-kx * 1.15), fmt(ky * 0.9), fmt(-kx * 1.3), fmt(-ky * 1.0), fmt(-ky * 0.95))
    g.append('<path d="%s" transform="translate(0 %s)" fill="url(#gCore)"/>' % (core, fmt(-a * 0.12)))
    g.append('<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="#ffffff" opacity=".35"/>' % (fmt(-a * 0.18), fmt(-a * 0.32), fmt(a * 0.11), fmt(a * 0.07)))
    if dim > 0:
        g.append('<ellipse cx="0" cy="%s" rx="%s" ry="%s" fill="%s" opacity="%s"/>' % (fmt(a * 0.1), fmt(a * 1.5), fmt(a * 1.85), OLIVE_D, fmt(dim)))
    g.append('</g>')
    return ''.join(g)


def feather_body(cx, cy, a, ang, length):
    """The barb vane behind an eye (toward the base)."""
    deg = math.degrees(ang) - 90
    L = length
    wv = a * 1.25
    d = 'M0,%s C%s,%s %s,%s 0,%s C%s,%s %s,%s 0,%s Z' % (
        fmt(-L), fmt(wv * 0.35), fmt(-L * 0.7), fmt(wv * 1.25), fmt(-a * 0.6), fmt(a * 0.4),
        fmt(-wv * 1.25), fmt(-a * 0.6), fmt(-wv * 0.35), fmt(-L * 0.7), fmt(-L))
    lines = []
    for k in range(9):
        u = (k + 0.5) / 9
        y0 = -L + L * u
        span = wv * (0.25 + 0.9 * math.sin(math.pi * clamp(u * 0.95)))
        lines.append('M0,%sQ%s,%s %s,%s' % (fmt(y0 - a * 0.2), fmt(span * 0.6), fmt(y0 + a * 0.05), fmt(span), fmt(y0 + a * 0.55)))
        lines.append('M0,%sQ%s,%s %s,%s' % (fmt(y0 - a * 0.2), fmt(-span * 0.6), fmt(y0 + a * 0.05), fmt(-span), fmt(y0 + a * 0.55)))
    return ('<g transform="translate(%s %s) rotate(%s)">' % (fmt(cx), fmt(cy), fmt(deg))
            + '<path d="%s" fill="url(#gVane)" opacity=".92"/>' % d
            + '<path d="%s" stroke="%s" stroke-width="%s" fill="none" opacity=".5"/>' % (''.join(lines), GOLD_L, fmt(max(0.5, a * 0.05)))
            + '<path d="M0,%s L0,%s" stroke="%s" stroke-width="%s" opacity=".7"/>' % (fmt(-L), fmt(-a * 0.2), mix(GOLD_L, CREAM, 0.4), fmt(max(0.6, a * 0.06)))
            + '</g>')


def sword_feather(cx, cy, a, ang, length):
    """Fishbone side feather without an eye (fringe at the train edge)."""
    deg = math.degrees(ang) - 90
    L = length
    seg = []
    n = 14
    for k in range(n):
        y = -L + L * (k / n)
        sp = a * (0.5 + 0.9 * (k / n))
        seg.append('M0,%sL%s,%sM0,%sL%s,%s' % (fmt(y), fmt(sp), fmt(y + sp * 0.9), fmt(y), fmt(-sp), fmt(y + sp * 0.9)))
    return ('<g transform="translate(%s %s) rotate(%s)">' % (fmt(cx), fmt(cy), fmt(deg))
            + '<path d="%s" stroke="%s" stroke-width="%s" fill="none" stroke-linecap="round" opacity=".75"/>' % (''.join(seg), mix(OLIVE_L, GOLD_L, 0.35), fmt(max(0.6, a * 0.09)))
            + '<path d="M0,%sL0,%s" stroke="%s" stroke-width="%s"/>' % (fmt(-L), fmt(a * 0.6), GOLD_L, fmt(max(0.7, a * 0.08)))
            + '</g>')


def build_train():
    g = []
    outline = train_outline(14)
    g.append('<path d="%s" fill="url(#gTrainBase)"/>' % smooth_path(outline[::2]))
    # fine barb texture over the whole train mass
    lines = []
    for i in range(900):
        t = R.uniform(0.02, 0.99)
        w = width_at(t)
        s = R.uniform(-w, w)
        p = eye_pos(t, s)
        ang = direction(t, s) + R.uniform(-0.15, 0.15)
        L = R.uniform(10, 30) * (0.6 + t)
        q = (p[0] + math.cos(ang) * L, p[1] + math.sin(ang) * L)
        lines.append('M%s,%sL%s,%s' % (fmt(p[0]), fmt(p[1]), fmt(q[0]), fmt(q[1])))
    g.append('<path d="%s" stroke="%s" stroke-width=".8" opacity=".35" fill="none"/>' % (''.join(lines), GOLD_L))

    rows = []
    t = 0.985
    k = 0
    while t > 0.07:
        a = lerp(8.5, 23.0, clamp((t - 0.05) / 0.85) ** 0.75)
        rows.append((t, a, k))
        spacing_len = a * 2.55
        t -= spacing_len / train.length
        k += 1
    # side sword feathers first (beneath)
    for (t, a, k) in rows[::2]:
        w = width_at(t)
        for side in (-1, 1):
            s = side * (w + a * 0.6)
            p = eye_pos(t, s)
            ang = direction(t, s) + side * 0.12
            g.append(sword_feather(p[0], p[1], a * 0.9, ang, a * 3.6))
    for (t, a, k) in rows:
        w = width_at(t)
        step = a * 2.75
        n = max(1, int((2 * w) / step))
        offset = (step * 0.5) if (k % 2) else 0.0
        cols = []
        for j in range(n + 1):
            s = -w + offset + j * step + R.uniform(-a * 0.2, a * 0.2)
            if abs(s) > w + a * 0.3:
                continue
            cols.append(s)
        R.shuffle(cols)
        for s in cols:
            tt = clamp(t + R.uniform(-0.004, 0.004))
            p = eye_pos(tt, s)
            ang = direction(tt, s) + R.uniform(-0.06, 0.06)
            edge = abs(s) / (w or 1)
            dim = 0.18 * max(0.0, edge - 0.55) / 0.45 + (0.22 * clamp((0.25 - t) / 0.2))
            g.append(feather_body(p[0], p[1], a, ang, a * 4.2))
            g.append(ocellus(p[0], p[1], a, ang, 1.0, dim))
    # volume: darker edges, lit centre
    g.append('<path d="%s" fill="url(#gTrainVol)"/>' % smooth_path(train_outline(16)[::2]))
    # shadow under the body where the train starts
    g.append('<ellipse cx="486" cy="540" rx="74" ry="64" fill="url(#gShadow)"/>')
    return ''.join(g)


# ---------- body ----------
BODY = [(724, 166), (712, 151), (692, 146), (674, 154), (667, 172), (672, 184), (676, 222), (672, 262), (660, 300),
        (636, 334), (600, 360), (556, 392), (514, 428), (486, 462), (478, 488), (492, 502), (520, 528), (560, 548),
        (610, 560), (656, 560), (694, 545), (716, 512), (722, 470), (713, 424), (701, 376), (699, 326), (707, 278),
        (720, 234), (727, 200), (729, 180)]

WING = [(652, 338), (618, 352), (566, 392), (516, 436), (478, 486), (452, 528), (474, 532), (546, 520), (612, 500),
        (664, 468), (690, 420), (684, 368)]

PRIMARIES = [(584, 480), (536, 498), (486, 516), (452, 530), (474, 534), (542, 524), (606, 506), (632, 490)]

MANTLE = [(634, 326), (600, 350), (556, 384), (512, 422), (480, 460), (506, 452), (552, 414), (604, 374), (650, 340)]


def scale_texture(clip_id, color, size, opacity, region, ang=0.0):
    """Overlapping scallop scales inside a clip path."""
    x0, y0, x1, y1 = region
    arcs = []
    row = 0
    y = y0
    while y < y1 + size:
        x = x0 + (size * 0.5 if row % 2 else 0)
        while x < x1 + size:
            arcs.append('M%s,%s a%s,%s 0 0 0 %s,0' % (fmt(x - size * 0.5), fmt(y), fmt(size * 0.5), fmt(size * 0.42), fmt(size)))
            x += size
        y += size * 0.55
        row += 1
    return '<g clip-path="url(#%s)"><path d="%s" stroke="%s" stroke-width="%s" fill="none" opacity="%s" transform="rotate(%s %s %s)"/></g>' % (
        clip_id, ''.join(arcs), color, fmt(size * 0.13), fmt(opacity), fmt(ang), fmt((x0 + x1) / 2), fmt((y0 + y1) / 2))


def barred_texture(clip_id, region):
    x0, y0, x1, y1 = region
    bars = []
    y = y0
    i = 0
    while y < y1:
        pts = []
        x = x0
        while x <= x1:
            pts.append((x, y + math.sin(x / 9.0 + i) * 2.2))
            x += 5
        bars.append(polyline(pts))
        y += 5.2
        i += 1
    return '<g clip-path="url(#%s)"><g transform="rotate(-28 570 420)"><path d="%s" stroke="%s" stroke-width="2" fill="none" opacity=".8"/></g></g>' % (clip_id, ''.join(bars), BROWN_D)


def build_body():
    g = []
    bpath = smooth_path(BODY)
    g.append('<clipPath id="cBody"><path d="%s"/></clipPath>' % bpath)
    g.append('<path d="%s" fill="url(#gBody)"/>' % bpath)
    # iridescent scale sheen on neck and breast
    g.append(scale_texture('cBody', TEAL_HL, 8, 0.28, (560, 140, 760, 580), -12))
    g.append('<path d="%s" fill="url(#gBodyShade)"/>' % bpath)
    # mantle (bronze-green back)
    mpath = smooth_path(MANTLE)
    g.append('<clipPath id="cMantle"><path d="%s"/></clipPath>' % mpath)
    g.append('<path d="%s" fill="url(#gMantle)"/>' % mpath)
    g.append(scale_texture('cMantle', GOLD_L, 10, 0.55, (460, 290, 660, 460), -35))
    # wing
    wpath = smooth_path(WING)
    g.append('<clipPath id="cWing"><path d="%s"/></clipPath>' % wpath)
    g.append('<path d="%s" fill="%s"/>' % (wpath, CREAM))
    g.append(barred_texture('cWing', (420, 300, 720, 560)))
    g.append('<path d="%s" fill="url(#gWingShade)"/>' % wpath)
    # secondaries (dark teal band)
    sec = [(646, 452), (604, 478), (552, 494), (504, 508), (472, 522), (536, 520), (604, 504), (656, 470)]
    g.append('<path d="%s" fill="%s" opacity=".85"/>' % (smooth_path(sec), TEAL_D))
    # primaries (chestnut / burgundy)
    ppath = smooth_path(PRIMARIES)
    g.append('<path d="%s" fill="url(#gPrim)"/>' % ppath)
    sep = []
    for k in range(6):
        u = k / 6
        x = lerp(596, 476, u)
        y = lerp(494, 520, u)
        sep.append('M%s,%s Q%s,%s %s,%s' % (fmt(x + 18), fmt(y - 6), fmt(x - 6), fmt(y + 4), fmt(x - 28), fmt(y + 12)))
    g.append('<path d="%s" stroke="%s" stroke-width="1.4" fill="none" opacity=".6"/>' % (''.join(sep), BURG_D))
    g.append('<path d="%s" fill="none" stroke="%s" stroke-width="1.6" opacity=".55"/>' % (wpath, GOLD_D))
    # legs
    for (lx, k) in ((622, 0), (664, 1)):
        g.append('<path d="M%s,552 C%s,570 %s,584 %s,596" stroke="#7d6c58" stroke-width="8" stroke-linecap="round" fill="none"/>' % (fmt(lx), fmt(lx - 2), fmt(lx + 2), fmt(lx)))
        for ty in range(562, 594, 6):
            g.append('<path d="M%s,%s h8" stroke="#5e5040" stroke-width="1.2" opacity=".7"/>' % (fmt(lx - 4), ty))
        # toes gripping the ledge (front edge at y=600)
        g.append('<path d="M%s,596 c9,0 18,2 23,7 c2,2 2,5 0,7 M%s,596 c5,3 7,8 7,14 M%s,596 c-7,1 -13,5 -15,10 M%s,597 c-7,-1 -13,-3 -16,-7" stroke="#6e5f4c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' % (fmt(lx), fmt(lx), fmt(lx), fmt(lx)))
    # head details
    g.append('<path d="M684,165 C694,158 708,157 718,162 C708,162 696,164 686,169 Z" fill="%s"/>' % CREAM)
    g.append('<path d="M690,184 C700,186 712,187 722,183 C714,191 700,192 690,188 Z" fill="%s"/>' % CREAM)
    g.append('<circle cx="706" cy="174" r="5.2" fill="#140c08"/><circle cx="704.6" cy="172.6" r="1.6" fill="#fff" opacity=".9"/>')
    g.append('<circle cx="706" cy="174" r="6.6" fill="none" stroke="%s" stroke-width="1.2" opacity=".7"/>' % CREAM)
    # beak
    g.append('<path d="M722,168 C734,168 748,174 756,183 C746,182 734,182 722,184 Z" fill="#cbb58c"/>')
    g.append('<path d="M723,184 C734,183 746,184 754,184 C744,189 732,190 724,189 Z" fill="#a8916a"/>')
    g.append('<circle cx="732" cy="174" r="1.4" fill="#5a4a32"/>')
    # crest
    crest = []
    for k in range(8):
        ang = math.radians(-128 + k * 9.5)
        L = 54 + 8 * math.sin(k * 0.9)
        bx, by = 688 + k * 2.2, 152 + abs(k - 3.5) * 0.6
        ex, ey = bx + math.cos(ang) * L, by + math.sin(ang) * L
        crest.append('<path d="M%s,%s Q%s,%s %s,%s" stroke="%s" stroke-width="1.6" fill="none"/>' % (fmt(bx), fmt(by), fmt((bx + ex) / 2 + 3), fmt((by + ey) / 2), fmt(ex), fmt(ey), '#4b5a52'))
        crest.append('<ellipse cx="%s" cy="%s" rx="4.4" ry="7.2" transform="rotate(%s %s %s)" fill="url(#gCrest)"/>' % (fmt(ex), fmt(ey), fmt(math.degrees(ang) + 90), fmt(ex), fmt(ey)))
    g.append(''.join(crest))
    # gilded outline
    g.append('<path d="%s" fill="none" stroke="%s" stroke-width="1.5" opacity=".55"/>' % (bpath, GOLD))
    return ''.join(g)


def defs():
    return '''<defs>
<radialGradient id="gHalo" cx=".5" cy=".55" r=".5"><stop offset=".55" stop-color="%(ol)s" stop-opacity=".95"/><stop offset="1" stop-color="%(old)s" stop-opacity="0"/></radialGradient>
<radialGradient id="gGold" cx=".5" cy=".45" r=".5"><stop offset="0" stop-color="%(gl)s"/><stop offset=".8" stop-color="%(g)s"/><stop offset="1" stop-color="%(gd)s"/></radialGradient>
<radialGradient id="gGreen" cx=".5" cy=".45" r=".5"><stop offset="0" stop-color="%(oll)s"/><stop offset="1" stop-color="%(old)s"/></radialGradient>
<radialGradient id="gTeal" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="%(thl)s"/><stop offset=".6" stop-color="%(tl)s"/><stop offset="1" stop-color="%(t)s"/></radialGradient>
<radialGradient id="gCore" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#3a3f86"/><stop offset="1" stop-color="%(ind)s"/></radialGradient>
<linearGradient id="gVane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%(old)s" stop-opacity=".2"/><stop offset=".55" stop-color="%(ol)s"/><stop offset="1" stop-color="%(oll)s"/></linearGradient>
<linearGradient id="gTrainBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3214"/><stop offset=".5" stop-color="%(old)s"/><stop offset="1" stop-color="%(ol)s"/></linearGradient>
<linearGradient id="gTrainVol" gradientUnits="userSpaceOnUse" x1="190" y1="0" x2="560" y2="0"><stop offset="0" stop-color="#140f04" stop-opacity=".55"/><stop offset=".22" stop-color="#140f04" stop-opacity=".12"/><stop offset=".48" stop-color="#fff3c4" stop-opacity=".10"/><stop offset=".75" stop-color="#140f04" stop-opacity=".12"/><stop offset="1" stop-color="#140f04" stop-opacity=".55"/></linearGradient>
<radialGradient id="gShadow"><stop offset="0" stop-color="#1a1408" stop-opacity=".55"/><stop offset="1" stop-color="#1a1408" stop-opacity="0"/></radialGradient>
<linearGradient id="gBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%(tl)s"/><stop offset=".45" stop-color="%(t)s"/><stop offset="1" stop-color="%(td)s"/></linearGradient>
<linearGradient id="gBodyShade" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".0"/><stop offset=".25" stop-color="#ffffff" stop-opacity=".10"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
<linearGradient id="gMantle" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%(oll)s"/><stop offset="1" stop-color="%(ol)s"/></linearGradient>
<linearGradient id="gWingShade" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%(gl)s" stop-opacity=".25"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0c" stop-opacity=".45"/></linearGradient>
<linearGradient id="gPrim" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a4a2c"/><stop offset=".6" stop-color="%(ch)s"/><stop offset="1" stop-color="%(bd)s"/></linearGradient>
<radialGradient id="gCrest" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="%(thl)s"/><stop offset="1" stop-color="%(td)s"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%%" height="100%%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .25  0 0 0 .55 0" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in" result="g"/><feBlend in="SourceGraphic" in2="g" mode="multiply"/></filter>
<filter id="soft" x="-5%%" y="-5%%" width="110%%" height="110%%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#1a0e06" flood-opacity=".35"/></filter>
</defs>''' % dict(ol=OLIVE, old=OLIVE_D, oll=OLIVE_L, g=GOLD, gl=GOLD_L, gd=GOLD_D, thl=TEAL_HL, tl=TEAL_L, t=TEAL, td=TEAL_D,
                  ind=INDIGO, ch=CHESTNUT, bd=BURG_D)


def main():
    path = sys.argv[1]
    mirror = '--mirror' in sys.argv
    texture = '--no-texture' not in sys.argv
    body = '<g filter="url(#soft)"><g %s>%s%s</g></g>' % ('filter="url(#grain)"' if texture else '', build_train(), build_body())
    if mirror:
        body = '<g transform="translate(%d 0) scale(-1 1)">%s</g>' % (W, body)
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">%s%s</svg>' % (W, H, W, H, defs(), body)
    open(path, 'w').write(svg)
    print('wrote', path, len(svg) // 1024, 'KB')


if __name__ == '__main__':
    main()
