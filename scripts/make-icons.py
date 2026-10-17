"""Draws the EdiSubmit icon with Pillow (mirrors public/favicon.svg) at 180/192/512 px.
Run: python scripts/make-icons.py   (needs: pip install pillow)"""
from PIL import Image, ImageDraw

def draw(size):
    S = size * 4                      # supersample for smooth edges
    k = S / 64.0
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # gradient square clipped to a rounded rect
    grad = Image.new("RGBA", (S, S))
    gp = grad.load()
    c1, c2 = (139, 92, 246), (109, 40, 217)
    for y in range(S):
        for x in range(S):
            t = (x + y) / (2.0 * S)
            gp[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)) + (255,)
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=15 * k, fill=255)
    img.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([16 * k, 13 * k, 47 * k, 53 * k], radius=5 * k, fill="white")
    d.rounded_rectangle([22 * k, 21 * k, 36 * k, 24.5 * k], radius=1.75 * k, fill="#C4B5FD")
    d.rounded_rectangle([22 * k, 28 * k, 41 * k, 31.5 * k], radius=1.75 * k, fill="#C4B5FD")
    d.line([(23 * k, 42 * k), (29 * k, 48 * k), (41 * k, 35 * k)], fill="#7C3AED", width=int(5 * k), joint="curve")
    for p in [(23, 42), (41, 35)]:     # round caps
        r = 2.5 * k
        d.ellipse([p[0] * k - r, p[1] * k - r, p[0] * k + r, p[1] * k + r], fill="#7C3AED")
    bolt = [(47, 5), (36, 22), (44, 22), (41, 35), (55, 15), (47, 15)]
    d.polygon([(x * k, y * k) for x, y in bolt], fill="#FBBF24", outline="#6D28D9", width=int(1.5 * k))
    return img.resize((size, size), Image.LANCZOS)

for size, name in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
    draw(size).save("public/" + name)
    print("wrote public/" + name)
