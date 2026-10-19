// Kyl och frys som isometrisk figur, byggd med anatomy-kitet. Kör: node figurer-anatomy/kyl/build.mjs
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../../vendor/anatomy/kit/lathe.mjs";
import { kitScript } from "../../vendor/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 600;
const HEIGHT = 640;

const W = 120;
const D = 110;
const T = 5;
const FOOT = 6;
const FZ_TOP = 100;
const FLOOR = 104;
const CEIL = 250;
const TOP = 256;
const SHELVES = [138, 192];
const DOOR_T = 6;
const DOOR_W = W;
const CRISP_OUT = 50;
const FRZ_OUT = 64;
const OPEN = { x0: 6, x1: W - 6, z0: 58, z1: 96 };

const P = k.fitProjection(
  [...k.boxCorners({ x: -60, y: 0, w: W + 60, d: D + DOOR_W }, 0, TOP), [W, D + FRZ_OUT, 0]],
  WIDTH,
  HEIGHT,
  { pad: 20, azimuth: 58, elevation: 22 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const box = (x, y, w, d, z, h, style = {}, r = 1, bevel = 0) => S(k.slabOf({ x, y, w, d, r }, z, h, P, 3, bevel), { tone: "mid", ...style });
const can = (x, y, r, z, h, style = {}) => S(k.cylinder(x, y, r, z, h, P, 28, 0.4), { tone: "mid", ...style });
const ball = (x, y, z, r) => S(G.sphereOf([x, y, z + r], r, P), { tone: "mid" });
const stem = (x, y, z) => L(k.segment([x, y, z], [x + 0.6, y, z + 2.6], P), { tone: "mid", free: "both" });
const lying = (x, y, z, length, r) =>
  S(G.solidOf([[0, r * 0.5], [r * 0.6, r], [length - r * 0.6, r], [length, r * 0.5]], G.frameAlong([x, y, z + r], [1, 0, 0]), P), { tone: "mid" });
const bottle = (x, y, z, r, h) =>
  S(G.solidOf([[0, r], [h * 0.6, r], [h * 0.8, r * 0.45], [h, r * 0.45]], G.frameAlong([x, y, z], [0, 0, 1]), P), { tone: "mid" }) + can(x, y, r * 0.55, z + h, 2.4, { tone: "lo" });
// Ritar delar bakifrån och fram.
const inDepth = (items) => items.sort((a, b) => k.depthOf(a[0], P) - k.depthOf(b[0], P)).map(([, svg]) => svg).join("");
const quad = (points) => k.pathOf(points.map(at), true);
const frontText = (x, y, z, text, size = 4, tone = "mid") => k.faceTextSvg(k.sideMatrix([x, y], z, P, "left"), text, { size, tone, anchor: "middle" });
const topText = (x, y, z, text, size = 3, tone = "mid") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });

function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => list.reduce((out, q) => { while (out.length > 1 && cross(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop(); out.push(q); return out; }, []);
  const lower = half(p);
  const upper = half([...p].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

function cabinet() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: 0, y: 0, w: W, d: D, r: 2 }, 0, FOOT, P)}"/>`];
  for (const [x, y] of [[8, 8], [W - 8, 8], [8, D - 8], [W - 8, D - 8]]) out.push(can(x, y, 4, 0, FOOT, { tone: "lo" }));
  out.push(box(0, 0, W, D, FOOT, FZ_TOP - FOOT, {}, 2, 0.6));
  return out.join("");
}

function freezer() {
  const out = [];
  // Undre lådan står still.
  out.push(box(2, D, W - 4, 2, 10, 42, {}, 1, 0.3));
  out.push(box(44, D + 2, 32, 3, 44, 3, { tone: "lo" }));
  // Öppningen bakom övre lådan, och frosten under taket.
  const opening = [[OPEN.x0, D, OPEN.z0], [OPEN.x1, D, OPEN.z0], [OPEN.x1, D, OPEN.z1], [OPEN.x0, D, OPEN.z1]];
  const clip = hull([...opening, ...opening.map(([x, y, z]) => [x, y + FRZ_OUT + 4, z])].map(at));
  out.push(`<clipPath id="frys-klipp"><path d="${k.pathOf(clip, true)}"/></clipPath>`);
  out.push(`<path d="${quad(opening)}" style="fill:var(--anatomy-shade-0)"/>`);
  const bin = [];
  const y0 = D - 86;
  const bx0 = OPEN.x0 + 1;
  const bw = OPEN.x1 - OPEN.x0 - 2;
  const bz = OPEN.z0 + 2;
  bin.push(box(bx0, y0, bw, 2, bz, 32));
  bin.push(box(bx0, y0, 2, 86, bz, 32));
  bin.push(box(bx0, y0, bw, 86, OPEN.z0, 2));
  // Islager längs innerväggarna, det som ska frostas av.
  bin.push(`<g data-station="3" class="is">${box(bx0 + 2, y0 + 2, 6, 82, bz, 30, { tone: "blue", crease: "blue" }, 1)}${box(bx0 + 8, y0 + 2, bw - 10, 6, bz, 30, { tone: "blue", crease: "blue" }, 1)}</g>`);
  bin.push(box(20, y0 + 8, 30, 22, bz, 22, {}, 2));
  bin.push(box(54, y0 + 8, 26, 18, bz, 26, {}, 2));
  bin.push(box(84, y0 + 8, 20, 26, bz, 18, {}, 2));
  bin.push(box(bx0 + bw - 2, y0, 2, 86, bz, 32));
  out.push(`<g clip-path="url(#frys-klipp)"><g data-part="frys">${bin.join("")}</g></g>`);
  out.push(`<g data-part="frys">${box(2, D, W - 4, 2.5, 56, 42, {}, 1, 0.3)}${box(44, D + 2.5, 32, 3, 88, 3, { tone: "lo" })}${frontText(W / 2, D + 2.5, 70, "−18°", 7, "hi")}</g>`);
  return out.join("");
}

function crisper() {
  const out = [];
  const y = 18;
  const d = 86;
  out.push(box(12, y, W - 24, 2, FLOOR, 22));
  out.push(box(12, y, 2, d, FLOOR, 14));
  out.push(box(12, y, W - 24, d, FLOOR, 2));
  out.push(`<g data-station="2">${inDepth([
    [[32, 40, 0], ball(32, 40, FLOOR + 2, 11)],
    [[74, 36, 0], lying(52, 36, FLOOR + 2, 46, 4.5)],
    [[78, 50, 0], lying(58, 50, FLOOR + 2, 40, 4)],
    [[34, 74, 0], ball(34, 74, FLOOR + 2, 6.5) + stem(34, 74, FLOOR + 15)],
    [[52, 80, 0], ball(52, 80, FLOOR + 2, 6.5) + stem(52, 80, FLOOR + 15)],
    [[72, 76, 0], ball(72, 76, FLOOR + 2, 5.5)],
    [[88, 78, 0], ball(88, 78, FLOOR + 2, 5.5)],
  ])}</g>`);
  out.push(box(W - 14, y, 2, d, FLOOR, 14));
  out.push(box(10, y + d - 2, W - 20, 4, FLOOR, 14, {}, 1, 0.3));
  out.push(box(44, y + d + 2, 32, 2, FLOOR + 8, 3, { tone: "lo" }));
  return `<g data-part="gron">${out.join("")}</g>`;
}

function shelf(z) {
  return box(T, T, W - T * 2, D - T - 4, z, 2, { crease: "faint" }, 1);
}

function fridge() {
  const out = [];
  out.push(box(0, 0, W, D, FZ_TOP, FLOOR - FZ_TOP, {}, 1));
  out.push(box(0, 0, T, D, FLOOR, CEIL - FLOOR));
  out.push(box(T, 0, W - T * 2, T, FLOOR, CEIL - FLOOR));
  // Gångjärnen ritas före lådan, som kan dras ut framför dem.
  out.push(box(-DOOR_T - 1, D - 3, DOOR_T + 1, 4, FLOOR + 4, 8, { tone: "lo" }));
  out.push(crisper());
  out.push(shelf(SHELVES[0]));
  const s1 = SHELVES[0] + 2;
  out.push(`<g data-station="1">${can(44, 78, 17, s1, 1.6, { tone: "hi" })}${box(32, 70, 24, 16, s1 + 1.6, 7, { tone: "hi" }, 3, 0.4)}${frontText(44, 86, s1 + 6.4, "RÅTT", 3.6, "hi")}</g>`);
  out.push(box(76, 40, 26, 22, s1, 12, {}, 3, 0.4));
  out.push(shelf(SHELVES[1]));
  const s2 = SHELVES[1] + 2;
  out.push(box(16, 50, 32, 26, s2, 14, {}, 3, 0.4));
  out.push(L(k.sideSeam({ x: 16, y: 50, w: 32, d: 26, r: 3 }, s2 + 11, P, 3), { tone: "lo" }));
  out.push(frontText(32, 76, s2 + 7.5, "RESTER", 3.4, "mid"));
  out.push(can(92, 50, 8, s2, 16));
  out.push(can(92, 50, 8.4, s2 + 16, 3, { tone: "lo" }));
  out.push(`<g data-station="0">${box(64, 82, 12, 3, s2, 22, { tone: "hi" }, 1)}${frontText(70, 85, s2 + 16, "4°", 5, "hi")}${L(k.segment([70, 85, s2 + 9], [70, 85, s2 + 3], P), { tone: "hi", free: "both" })}</g>`);

  out.push(box(W - T, 0, T, D, FLOOR, CEIL - FLOOR));
  out.push(box(0, 0, W, D, CEIL, TOP - CEIL, {}, 2, 0.6));
  return out.join("");
}

// Dörren står på 115 grader så att lådorna går fria. u går längs dörrens bredd, v ut från insidan.
const SWING = (115 * Math.PI) / 180;
const ALONG = [Math.cos(SWING), Math.sin(SWING)];
const INWARD = [Math.sin(SWING), -Math.cos(SWING)];
const onDoor = (u, v) => [ALONG[0] * u + INWARD[0] * v, D + ALONG[1] * u + INWARD[1] * v];
const doorSlab = (u0, u1, v0, v1, z, h, style = {}) =>
  S(k.extrude([onDoor(u0, v0), onDoor(u1, v0), onDoor(u1, v1), onDoor(u0, v1)], z, h, P), { tone: "mid", ...style });
const doorBottle = (u, r, z, h) => { const [x, y] = onDoor(u, 6); return bottle(x, y, z, r, h); };

function door() {
  const out = [];
  out.push(box(-DOOR_T - 1, D - 3, DOOR_T + 1, 4, TOP - 12, 8, { tone: "lo" }));
  out.push(doorSlab(0, DOOR_W, -DOOR_T, 0, FLOOR - 2, TOP - FLOOR + 2));
  out.push(`<path class="iso-line" data-tone="lo" d="${quad([[...onDoor(5, 0), FLOOR + 3], [...onDoor(DOOR_W - 5, 0), FLOOR + 3], [...onDoor(DOOR_W - 5, 0), TOP - 5], [...onDoor(5, 0), TOP - 5]])}"/>`);
  const bins = [
    { z: 118, items: (z) => doorBottle(22, 4.5, z, 30) + doorBottle(36, 4.5, z, 26) + doorBottle(50, 4, z, 28) },
    { z: 162, items: (z) => doorBottle(30, 3.6, z, 20) + doorBottle(42, 3.6, z, 18) + doorSlab(62, 74, 1, 11, z, 28) + doorSlab(62.5, 73.5, 5.3, 6.7, z + 28, 3) },
    { z: 206, items: (z) => doorSlab(20, 42, 2, 10, z, 7) + doorSlab(70, 96, 2, 10, z, 10) },
  ];
  for (const { z, items } of bins) {
    out.push(doorSlab(10, DOOR_W - 10, 0, 12, z, 2));
    out.push(items(z + 2));
    out.push(doorSlab(10, DOOR_W - 10, 10, 12, z, 12));
  }
  return out.join("");
}

const STATIONS = [
  { text: "Termometer · kylen 4 °C, frysen −18 °C", crisp: 0, frz: 0 },
  { text: "Rått kött · tätt, så att inget droppar", crisp: 0, frz: 0 },
  { text: "Grönsakslådan · grönsaker och en del frukt", crisp: CRISP_OUT, frz: 0 },
  { text: "Frysen · frosta av vid 3–5 mm is", crisp: 0, frz: FRZ_OUT },
];

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Kyl och frys med öppen kyldörr. I kylen står en termometer som visar 4 grader på mittenhyllan, en tallrik med rått kött på den nedersta hyllan och en grönsakslåda längst ner. Under kylen sitter frysen med två lådor; den övre märkt minus 18 grader kan dras ut och visar is under taket.",
  body: [cabinet(), freezer(), fridge(), door()],
});

const live = `
const P = ${JSON.stringify(P)};
const STATIONS = ${JSON.stringify(STATIONS)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const gron = svg.querySelector('[data-part="gron"]');
const frys = [...svg.querySelectorAll('[data-part="frys"]')];
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let index = 0, crisp = 0, frz = 0, frame = 0, last = 0, clock = 0, touring = !still.matches, visible = false, idleTimer = 0;
function light() {
  svg.querySelectorAll("[data-station] .iso-solid").forEach((node) => node.removeAttribute("data-lit"));
  svg.querySelectorAll('[data-station="' + index + '"] .iso-solid').forEach((node) => node.setAttribute("data-lit", ""));
  const text = STATIONS[index].text;
  readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(index + 1));
  stage.setAttribute("aria-valuetext", text);
}
function draw() {
  gron.setAttribute("transform", translateAlong(P, [0, crisp, 0]));
  frys.forEach((node) => node.setAttribute("transform", translateAlong(P, [0, frz, 0])));
}
function pick(next) { if (next !== index) { index = next; light(); } }
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { clock += dt; pick(Math.floor(clock / 3.2) % STATIONS.length); }
  const goal = STATIONS[index];
  const ease = still.matches ? 1 : 1 - Math.exp(-dt / 0.3);
  crisp += (goal.crisp - crisp) * ease; frz += (goal.frz - frz) * ease;
  if (Math.abs(goal.crisp - crisp) < 0.05) crisp = goal.crisp;
  if (Math.abs(goal.frz - frz) < 0.05) frz = goal.frz;
  draw();
  const settled = !touring && crisp === goal.crisp && frz === goal.frz;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; pick(next); clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; clock = index * 3.2; run(); }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  steer(Math.min(STATIONS.length - 1, Math.max(0, Math.floor(((event.clientX - box.left) / box.width) * STATIONS.length))));
});
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") to = Math.min(STATIONS.length - 1, index + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") to = Math.max(0, index - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = STATIONS.length - 1;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
light();
draw();
`;

// Aktivt läge i appens markeringsfärg (ockra), isen i frysen alltid blå.
const LIT_CSS = [
  ".iso-solid[data-lit]>.iso-fill,.iso-solid[data-lit]>.iso-top{fill:#fbecc4;stroke:#fbecc4}",
  ...["#e9c87f", "#f0d595", "#f5dfaa", "#f9e8bd"].map((c, i) => `.iso-solid[data-lit]>.iso-shade[data-shade="${i}"]{fill:${c};stroke:${c}}`),
  ".iso-solid[data-lit]>.iso-edge{stroke:#8a5a12;stroke-width:1.1px}",
  ".iso-swatch[data-mark=lit] path{stroke:#8a5a12}",
  ".is .iso-fill,.is .iso-top,.is .iso-shade{fill:#dfe8fb!important;stroke:none!important}",
  ".is .iso-solid[data-lit]>.iso-edge{stroke:var(--anatomy-blue)}",
].join("");

const body = k.plateHtml({
  fig: "Fig 1",
  title: "Kyl och frys",
  hint: "Peka eller använd piltangenterna",
  readout: STATIONS[0].text,
  keys: [{ mark: "lit", label: "Det som visas just nu" }],
  caption:
    "Kylen ska hålla 4 °C och frysen −18 °C eller kallare. Mät med en termometer, skalan på ratten visar inte grader. Källor: Livsmedelsverket, Electrolux.",
  body: `<style>${LIT_CSS}</style><div class="iso-stage" tabindex="0" role="slider" aria-label="Kyl och frys: piltangenterna byter vad som visas" aria-valuemin="1" aria-valuemax="${STATIONS.length}" aria-valuenow="1">${svg}</div>`,
});

const page = k.pageHtml({ title: "Kyl och frys", theme: "light", body, script: kitScript() + live }).replace('<html lang="en">', '<html lang="sv">');
writeFileSync(join(HERE, "kyl.html"), page);
console.log("wrote kyl.html");
