# Räknar ändrade pixlar mellan bilder tagna var 0,1 s och flaggar hopp: en bild som ändras mer än 3x grannarna.
import sys, glob, json
from PIL import Image, ImageChops
frames = sorted(glob.glob(sys.argv[1] + "/f*.png"))
def changed(a, b):
    d = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 10 else 0)
    return sum(d.histogram()[255:])
imgs = [Image.open(f).convert("RGB") for f in frames]
counts = [changed(imgs[i], imgs[i + 1]) for i in range(len(imgs) - 1)]
# Steg och deras tider (från model.mjs): rörelser längre än 1 s.
tl = json.load(open(sys.argv[1] + "/tidslinje.json")); starts = tl["start"]; shows = tl["show"]
jumps = []
for i, c in enumerate(counts):
    t = i / 10
    inside = any(s <= t and t + 0.1 <= s + d for s, d in zip(starts, shows))
    if not inside or i == 0 or i == len(counts) - 1: continue
    near = (counts[i - 1] + counts[i + 1]) / 2
    if c > 3 * max(near, 1) and c > 400: jumps.append((round(t, 1), c, int(near)))
print("frames", len(frames), "max change", max(counts), "median", sorted(counts)[len(counts)//2])
for s, d in zip(starts, shows):
    seg = counts[int(round(s * 10)):int(round((s + d) * 10)) - 1]
    print(f"steg {s:5.1f}-{s+d:5.1f}s  min {min(seg):6d}  max {max(seg):6d}")
print("hopp:", jumps if jumps else "inga")
