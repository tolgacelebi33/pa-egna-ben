// Kyl och frys som isometrisk figur, byggd med anatomy-kitet. Kör: node figurer-anatomy/kyl/build.mjs
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
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
const CRISP_OUT = 40;
const FRZ_OUT = 64;
const OPEN = { x0: 6, x1: W - 6, z0: 58, z1: 96 };

const P = k.fitProjection(
  [...k.boxCorners({ x: -DOOR_T, y: 0, w: W + DOOR_T, d: D + DOOR_W }, 0, TOP), [W, D + FRZ_OUT, 0]],
  WIDTH,
  HEIGHT,
  { pad: 20, azimuth: 58, elevation: 22 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const box = (x, y, w, d, z, h, style = {}, r = 1, bevel = 0) => S(k.slabOf({ x, y, w, d, r }, z, h, P, 3, bevel), { tone: "mid", ...style });
const can = (x, y, r, z, h, style = {}) => S(k.cylinder(x, y, r, z, h, P, 28, 0.4), { tone: "mid", ...style });
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
  out.push(box(12, y, 2, d, FLOOR, 22));
  out.push(box(12, y, W - 24, d, FLOOR, 2));
  out.push(`<g data-station="2">${box(22, 30, 40, 12, FLOOR + 2, 16, { tone: "hi" }, 5)}${box(66, 30, 34, 12, FLOOR + 2, 18, { tone: "hi" }, 5)}${can(34, 60, 8, FLOOR + 2, 14, { tone: "hi" })}${can(54, 62, 7, FLOOR + 2, 13, { tone: "hi" })}${box(70, 54, 28, 10, FLOOR + 2, 12, { tone: "hi" }, 4)}</g>`);
  out.push(box(W - 14, y, 2, d, FLOOR, 22));
  out.push(box(10, y + d - 2, W - 20, 4, FLOOR, 26, {}, 1, 0.3));
  out.push(box(44, y + d + 2, 32, 2, FLOOR + 18, 3, { tone: "lo" }));
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
  out.push(crisper());
  out.push(shelf(SHELVES[0]));
  const s1 = SHELVES[0] + 2;
  out.push(`<g data-station="1">${can(44, 78, 17, s1, 1.6, { tone: "hi" })}${box(32, 70, 24, 16, s1 + 1.6, 7, { tone: "hi" }, 3, 0.4)}${frontText(44, 86, s1 + 6.4, "RÅTT", 3.6, "hi")}</g>`);
  out.push(box(76, 40, 26, 22, s1, 12, {}, 3, 0.4));
  out.push(shelf(SHELVES[1]));
  const s2 = SHELVES[1] + 2;
  out.push(box(16, 50, 32, 26, s2, 14, {}, 3, 0.4));
  out.push(L(k.sideSeam({ x: 16, y: 50, w: 32, d: 26, r: 3 }, s2 + 11, P, 3), { tone: "lo" }));
  out.push(can(92, 50, 8, s2, 18));
  out.push(`<g data-station="0">${box(64, 82, 12, 3, s2, 22, { tone: "hi" }, 1)}${frontText(70, 85, s2 + 16, "4°", 5, "hi")}${L(k.segment([70, 85, s2 + 9], [70, 85, s2 + 3], P), { tone: "hi", free: "both" })}</g>`);

  out.push(box(W - T, 0, T, D, FLOOR, CEIL - FLOOR));
  out.push(box(0, 0, W, D, CEIL, TOP - CEIL, {}, 2, 0.6));
  return out.join("");
}

function door() {
  const out = [];
  const y0 = D;
  out.push(box(-DOOR_T, y0, DOOR_T, DOOR_W, FLOOR - 2, TOP - FLOOR + 2, {}, 1.5, 0.4));
  out.push(`<path class="iso-line" data-tone="lo" d="${quad([[0, y0 + 5, FLOOR + 3], [0, y0 + DOOR_W - 5, FLOOR + 3], [0, y0 + DOOR_W - 5, TOP - 5], [0, y0 + 5, TOP - 5]])}"/>`);
  for (const z of [FLOOR + 4, TOP - 12]) out.push(box(-DOOR_T - 1, D - 3, DOOR_T + 1, 4, z, 8, { tone: "lo" }));
  const bins = [
    { z: 118, items: (z) => can(6, y0 + 22, 4.5, z, 26) + can(6, y0 + 36, 4.5, z, 22) + can(6, y0 + 50, 4, z, 24) },
    { z: 162, items: (z) => box(1, y0 + 66, 10, 10, z, 30, {}, 1) + can(6, y0 + 30, 4, z, 16) + can(6, y0 + 44, 4, z, 14) },
    { z: 206, items: (z) => box(2, y0 + 20, 8, 22, z, 7, {}, 1) + box(2, y0 + 70, 8, 26, z, 10, {}, 2) },
  ];
  for (const { z, items } of bins) {
    out.push(box(0, y0 + 10, 12, DOOR_W - 20, z, 2));
    out.push(items(z + 2));
    out.push(box(10, y0 + 10, 2, DOOR_W - 20, z, 12, {}, 0.5));
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

const body = k.plateHtml({
  fig: "Fig 1",
  title: "Kyl och frys",
  hint: "Peka eller använd piltangenterna",
  readout: STATIONS[0].text,
  keys: [{ mark: "lit", label: "Det som visas just nu" }],
  caption:
    "Kylen ska hålla 4 °C och frysen −18 °C eller kallare. Mät med en termometer, skalan på ratten visar inte grader. Källor: Livsmedelsverket, Electrolux.",
  body: `<style>.is .iso-fill,.is .iso-top,.is .iso-shade{fill:#dfe8fb!important}</style><div class="iso-stage" tabindex="0" role="slider" aria-label="Kyl och frys: piltangenterna byter vad som visas" aria-valuemin="1" aria-valuemax="${STATIONS.length}" aria-valuenow="1">${svg}</div>`,
});

const page = k.pageHtml({ title: "Kyl och frys", theme: "light", body, script: kitScript() + live }).replace('<html lang="en">', '<html lang="sv">');
writeFileSync(join(HERE, "kyl.html"), page);
console.log("wrote kyl.html");
