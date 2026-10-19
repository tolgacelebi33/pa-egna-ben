// Toalettens cistern som isometrisk figur med stegknappar, fönster in i cisternen och en modell som driver allt.
// Kör: node figurer-anatomy/cistern/build.mjs  →  cistern.html
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../../vendor/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../vendor/anatomy/kit/tube.mjs";
import { kitScript } from "../../vendor/anatomy/scripts/inline-kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 900;
const HEIGHT = 820;

// Världen: x åt höger längs väggen, y ut från väggen, z upp. Enhet ungefär 1 cm.
const IN = { x: -19, y: 4, w: 38, d: 12 }; // cisternens insida
const Z0 = 42; // cisternens innerbotten
const ZH = 34; // innerhöjd som nivån räknas på
const FILL = [-14, 10]; // påfyllningsventilen
const FLUSH = [4, 10]; // spolventilen
const OVF = [9.8, 11]; // överfallsröret
const NOZZLE = [-10, 12.2, 73];
const zOf = (h) => Z0 + ZH * h;

const P = k.fitProjection(
  [...k.boxCorners({ x: -40, y: -4, w: 80, d: 70 }, -3, 96)],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 52, elevation: 26 },
);

const at = (p) => k.iso(p, P);
const S = (paths, c, extra = {}) => k.solidSvg(paths, { className: `c-${c}`, ...extra });
const box = (x, y, w, d, z, h, c, r = 1, bevel = 0, extra) => S(k.slabOf({ x, y, w, d, r }, z, h, P, 4, bevel), c, extra);
const can = (x, y, r, z, h, c, extra) => S(k.cylinder(x, y, r, z, h, P, 36, 0.3), c, extra);
const L = (d, tone = "lo", extra = {}) => k.lineSvg(d, { tone, ...extra });
const seg = (a, b) => k.segment(a, b, P);
const quad = (pts) => k.pathOf(pts.map(at), true);

function room() {
  const out = [];
  out.push(box(-40, -4, 80, 4, -3, 99, "vagg", 0));
  const tiles = [];
  for (let x = -28; x < 40; x += 12) tiles.push(seg([x, 0, 0], [x, 0, 96]));
  for (let z = 12; z < 96; z += 12) tiles.push(seg([-40, 0, z], [40, 0, z]));
  out.push(L(tiles.join(""), "faint"));
  out.push(box(-40, 0, 80, 66, -3, 3, "golv", 0));
  const floor = [];
  for (let x = -28; x < 40; x += 12) floor.push(seg([x, 0, 0], [x, 66, 0]));
  for (let y = 12; y < 66; y += 12) floor.push(seg([-40, y, 0], [40, y, 0]));
  out.push(L(floor.join(""), "faint"));
  // Hårda varma skuggor strax bakom föremålen.
  out.push(`<path class="skugga" d="${quad([[-25, 0, 36], [17, 0, 36], [17, 0, 79], [-25, 0, 79]])}"/>`);
  out.push(`<path class="skugga" d="${k.planOutline({ x: -21, y: 3, w: 34, d: 50, r: 16 }, 0, P)}"/>`);
  out.push(`<path class="skugga" d="${quad([[-39, 0, 29], [-34, 0, 29], [-34, 0, 39], [-39, 0, 39]])}"/>`);
  return out.join("");
}

function shutoff() {
  const out = [];
  const along = (o, len, r) => S(G.solidOf([[0, r], [len, r]], G.frameAlong(o, [0, 1, 0]), P), "krom");
  out.push(along([-36, 0, 34], 3, 1.3));
  out.push(S(G.solidOf([[0, 2.3], [0.8, 2.9, 1], [5.2, 2.9, 1], [6, 2.3]], G.frameAlong([-36, 3, 34], [0, 1, 0]), P), "massing"));
  out.push(box(-38, 8.6, 4, 1.4, 30, 8, "massing", 0.6, 0.3));
  out.push(can(-36, 6, 1.2, 36.6, 3, "krom"));
  out.push(can(-36, 6, 1.9, 39.4, 2, "krom"));
  return out.join("");
}

function hose() {
  const route = G.fillet([[-36, 6, 41.4], [-36, 6, 46], [-29, 10, 49], [-21.2, 10, 49]], 4, 7, { P, tube: 0.9 });
  return tubePieces(route, 0.9, P, { maxLength: 18, rings: { pitch: 1.3, twist: 0.7, cross: true, fade: [0.1, 0.55] } })
    .sort((a, b) => k.depthOf(a.mid, P) - k.depthOf(b.mid, P))
    .map((piece) => tubeSvg(piece, { tone: "lo" }))
    .join("");
}

function pedestal() {
  const out = [];
  out.push(box(-11, 12, 22, 28, 0, 3, "por", 7, 0.6));
  out.push(can(-12.6, 24, 1.6, 0, 2.6, "vit"));
  out.push(box(-10, 10, 20, 30, 3, 25, "por", 8, 0.8));
  out.push(box(-17, 6, 34, 50, 28, 10, "por", 16, 1));
  out.push(box(-9, 7, 18, 9, 38, 2, "vit", 2));
  return out.join("");
}

function cisternBack() {
  const out = [];
  out.push(box(-21, 2, 42, 2, 40, 40, "por", 0.6));
  out.push(box(-21, 2, 2, 16, 40, 40, "por", 0.6));
  out.push(box(-21, 2, 42, 16, 40, 2, "por", 0.6));
  out.push(S(G.solidOf([[0, 1], [5, 1]], G.frameAlong([-19, 10, 49], [1, 0, 0]), P), "plast"));
  return out.join("");
}

function fillValve() {
  const out = [];
  const [x, y] = FILL;
  out.push(can(x, y, 2.4, Z0, 3, "plast"));
  out.push(can(x, y, 1.5, Z0 + 3, 29, "plast"));
  return out.join("");
}

function fillHead() {
  const out = [];
  const [x, y] = FILL;
  out.push(can(x, y, 2.9, 74, 4, "plast"));
  out.push(box(-12.6, 11, 2.8, 2, 74.4, 1.2, "plast", 0.4));
  out.push(can(NOZZLE[0], NOZZLE[1], 0.8, 73, 2.6, "plast"));
  return out.join("");
}

// Flottören byggs med nivån 0 och flyttas upp med 34·h.
function floatAtZero() {
  const [x, y] = FILL;
  return can(x, y, 3.6, Z0 - 5.5, 7, "flottor") + L(k.sideArc(x, y, 3.6, Z0 - 2, P, 24), "lo", { className: "inre" });
}

function clipAt(close) {
  const [x, y] = FILL;
  return can(x, y, 2.1, zOf(close) + 2.2, 1.4, "krom");
}

function flushStatic() {
  const out = [];
  const [x, y] = FLUSH;
  out.push(can(x, y, 5, Z0, 1.4, "gummi"));
  out.push(box(7.6, 10, 1.6, 2, Z0, 1.6, "plast", 0.4));
  out.push(`<g id="ovfror">${can(OVF[0], OVF[1], 1.5, Z0, zOf(M.OVERFLOW) - Z0, "plast")}</g>`);
  out.push(`<path class="hal" d="${k.ring(OVF[0], OVF[1], 1, zOf(M.OVERFLOW), P, 20)}"/>`);
  return out.join("");
}

// Proppen med stång och huvud, byggd stängd och lyft med 5·lift.
function plug() {
  const [x, y] = FLUSH;
  return can(x, y, 4.4, Z0 + 1.4, 2.6, "vitplast") + can(x, y, 1.1, Z0 + 4, 24, "vitplast") + box(0.5, 7.5, 7, 5, 70, 2.5, "vitplast", 1);
}

function cisternFront() {
  const out = [];
  out.push(box(19, 2, 2, 16, 40, 40, "por", 0.6));
  out.push(box(-21, 16, 42, 2, 40, 4, "por", 0.4));
  out.push(box(-21, 16, 4, 2, 44, 34, "por", 0.4));
  out.push(box(17, 16, 4, 2, 44, 34, "por", 0.4));
  out.push(box(-21, 16, 42, 2, 78, 2, "por", 0.4));
  out.push(box(-22, 1, 44, 18, 80, 3, "por", 2, 0.8));
  out.push(box(-3, 6, 14, 8, 83, 0.6, "krom", 3));
  out.push(`<g id="knapp">${box(-2, 7, 7, 6, 83.6, 1.4, "krom", 2.2, 0.3)}</g>`);
  out.push(box(5.6, 7, 4.6, 6, 83.6, 1.4, "krom", 2, 0.3));
  return out.join("");
}

function seat() {
  const out = [];
  for (const x of [-8, 8]) out.push(can(x, 20, 1.4, 38, 2.2, "krom"));
  out.push(box(-16, 21, 32, 34, 38, 1.8, "sits", 15, 0.6));
  out.push(`<path class="skal" d="${k.planOutline({ x: -11, y: 26, w: 22, d: 24, r: 10 }, 39.8, P)}"/>`);
  out.push(`<path class="skalvatten" d="${k.planOutline({ x: -6, y: 33, w: 12, d: 12, r: 6 }, 39.8, P)}"/>`);
  out.push(`<g id="ringar"></g>`);
  out.push(can(12.6, 24, 1.6, 0, 2.6, "vit"));
  return out.join("");
}

const WORDS = [
  { text: "klick", at: [1, 10, 90] },
  { text: "svosch!", at: [-6, 50, 44] },
  { text: "plupp", at: [2, 14, 56] },
  { text: "sssss", at: [-3, 14, 66] },
  { text: "tick", at: [-14, 10, 82] },
];

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "En toalett mot en kaklad vägg. Cisternen har ett fönster i framsidan. Inuti syns påfyllningsventilen med en orange flottör till vänster, och spolventilen med en propp i botten till höger, bredvid överfallsröret. En flätad slang går från en avstängningskran på väggen till cisternen.",
  body: [
    room(),
    shutoff(),
    hose(),
    pedestal(),
    cisternBack(),
    `<g id="vatten"></g>`,
    fillValve(),
    `<g id="flottor">${floatAtZero()}</g>`,
    `<g id="klamma"></g>`,
    fillHead(),
    flushStatic(),
    `<g id="propp">${plug()}</g>`,
    `<path id="stang" class="iso-line stang" d=""/>`,
    `<path id="virvel" class="virvel" d=""/>`,
    `<path id="strale" class="strale" d=""/>`,
    `<path id="over" class="strale" d=""/>`,
    `<path id="vattenfront" class="vattenfront" d=""/>`,
    cisternFront(),
    seat(),
    `<g id="ord">${WORDS.map((w, i) => `<text class="ljud" id="ord${i}" text-anchor="middle">${w.text}</text>`).join("")}</g>`,
  ],
});

const STEP_LABELS = ["Tryck på knappen", "Vattnet forsar ut", "Proppen stänger", "Cisternen fylls", "Flottören stänger kranen"];
const HINTS = {
  start: "Cisternen är full. Tryck på knappen så ser du vad som händer inuti.",
  steps: [
    "Knappen lyfter en propp i botten av cisternen.",
    "Hålet är öppet. Vattnet forsar ner i skålen och spolar rent. Flottören sjunker med vattnet.",
    "Nästan allt vatten är ute. Proppen faller tillbaka och täpper till hålet.",
    "Flottören är långt ner, så kranen är öppen. Nytt vatten rinner in.",
    "Vattnet lyfter flottören. När den är högst upp stänger den kranen.",
  ],
  runs: "Flottören sitter för högt. Vattnet når röret i mitten och rinner ner i skålen hela tiden.",
  done: "Klart. Cisternen är full igen och väntar på nästa spolning.",
  doneRuns: "Det slutar aldrig rinna. Sänk flottören med reglaget.",
};

const SWATCHES = {
  mint: ["#c4ebdf", "#93d2bf", "#6fb5a2"],
  gul: ["#f8e3a0", "#f1c75a", "#d6a73c"],
  rosa: ["#f8cfd8", "#ee9fb2", "#d27b92"],
  vit: ["#fbf8f1", "#e9e3d6", "#cfc6b4"],
};
const MATERIALS = {
  vagg: ["#efe8da", "#e6dece", "#d6ccb8"],
  golv: ["#e6dbc6", "#d6c9b0", "#c3b499"],
  vatten: ["#cfe9f7", "#8cc8ea", "#5fa8d6"],
  flottor: ["#ffc58a", "#f39c4a", "#d27a2c"],
  plast: ["#dbe1ec", "#a9b4c8", "#8592aa"],
  vitplast: ["#ffffff", "#ece7dc", "#cfc7b6"],
  gummi: ["#f19a96", "#d9534f", "#b33b38"],
  krom: ["#f4f6f9", "#c9ced6", "#98a1ad"],
  massing: ["#f6dc95", "#d9b155", "#ad8733"],
  sits: ["#fffdf8", "#f1ece1", "#d9d1c0"],
  vit: ["#fbf8f1", "#e9e3d6", "#cfc6b4"],
};
const tones = (name, [l, m, d]) => `.c-${name}{--l:${l};--m:${m};--d:${d}}`;

const CSS = `
:root{--ink:#22304a;--paper:#f5f0e5;--hand:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;--sans:"Avenir Next","Avenir","Segoe UI",system-ui,sans-serif;--sol:#ffd76a}
*{box-sizing:border-box}
html,body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans)}
.page{position:relative;max-width:1460px;margin:0 auto;padding:22px 24px 18px}
.kicker{font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.65;margin:0}
h1{font-size:30px;margin:4px 0 12px;font-weight:700;letter-spacing:-.01em}
.hint{min-height:64px;display:flex;align-items:center;font-size:21px;line-height:1.35;background:#fffaf0;border:2px solid var(--ink);border-radius:16px;padding:12px 18px;max-width:1060px}
.layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:24px;margin-top:16px}
.switch{display:inline-flex;border:2px solid var(--ink);border-radius:999px;overflow:hidden;margin-bottom:16px}
.switch button{font:600 15px var(--sans);color:var(--ink);background:#fffaf0;border:0;padding:8px 18px;cursor:pointer}
.switch button[aria-pressed="true"]{background:var(--ink);color:#fffaf0}
.steps{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.pill{width:100%;display:flex;align-items:center;gap:12px;font:600 17px var(--sans);color:var(--ink);background:#fffaf0;border:2px solid var(--ink);border-radius:999px;padding:9px 18px 9px 9px;text-align:left;cursor:pointer;transition:background .25s,opacity .25s,transform .12s}
.pill .nr{flex:none;width:34px;height:34px;border-radius:50%;border:2px solid var(--ink);display:grid;place-items:center;font-size:16px;background:#fff}
.pill.run{background:var(--sol)}
.pill.run .nr{background:var(--ink);color:#fff}
.pill.done{opacity:.42}
.pill.tryckt{transform:scale(.96)}
.pill:disabled{cursor:default}
.manual .pill:disabled:not(.done):not(.run){opacity:.62}
.manual .pill.next{animation:puls 1.3s ease-in-out infinite}
@keyframes puls{0%,100%{box-shadow:0 0 0 0 rgba(34,48,74,.35)}50%{box-shadow:0 0 0 7px rgba(34,48,74,0)}}
.restart{display:inline-block;margin-top:14px;color:var(--ink);font-size:15px}
.reglage{margin-top:22px;padding:14px;border:2px solid var(--ink);border-radius:16px;background:#fffaf0}
.reglage label{display:block;font-weight:700;font-size:15px;margin-bottom:6px}
.reglage input{width:100%;accent-color:var(--ink)}
.reglage output{display:block;font-size:15px;margin-top:4px}
.reglage .rinner{color:#b33b38;font-weight:700}
.stage{position:relative;margin:0;height:860px}
.stage svg{display:block;height:100%;width:auto;max-width:100%;margin:0 auto}
.badge{position:absolute;top:8px;right:8px;font:700 16px var(--sans);background:var(--ink);color:#fffaf0;border-radius:999px;padding:6px 14px;opacity:0;transition:opacity .2s}
.under{display:grid;gap:10px;margin-top:6px}
.chips{list-style:none;display:flex;flex-wrap:wrap;gap:10px;margin:0;padding:0}
.chips li{border:2px solid var(--ink);border-radius:999px;padding:6px 14px;background:#fffaf0;font-size:15px}
.chips b{font-variant-numeric:tabular-nums;margin-left:6px}
.idea{font-size:20px;margin:4px 0 0}
.swatches{display:flex;gap:8px;align-items:center;font-size:14px}
.swatches button{width:28px;height:28px;border-radius:50%;border:2px solid var(--ink);cursor:pointer}
.swatches button[aria-pressed="true"]{outline:3px solid var(--ink);outline-offset:2px}
.kallor{font-size:12.5px;opacity:.75;max-width:1200px;margin:0}
.kallor a{color:var(--ink)}
#cursor{position:absolute;left:0;top:0;width:30px;height:30px;pointer-events:none;opacity:0;z-index:5}
.scene .iso-solid>.iso-top{fill:var(--l);stroke:none}
.scene .iso-solid>.iso-fill,.scene .iso-solid>.iso-shade[data-shade="2"],.scene .iso-solid>.iso-shade[data-shade="3"]{fill:var(--m)}
.scene .iso-solid>.iso-shade[data-shade="0"],.scene .iso-solid>.iso-shade[data-shade="1"]{fill:var(--d)}
.scene .iso-solid[data-seamless]>.iso-top{stroke:var(--l)}
.scene .iso-solid[data-seamless]>.iso-shade[data-shade="2"],.scene .iso-solid[data-seamless]>.iso-shade[data-shade="3"]{stroke:var(--m)}
.scene .iso-solid[data-seamless]>.iso-shade[data-shade="0"],.scene .iso-solid[data-seamless]>.iso-shade[data-shade="1"]{stroke:var(--d)}
.scene .iso-line{stroke:var(--ink);stroke-width:1.2px}
.scene .iso-crease,.scene .iso-bevel,.scene .inre{stroke-width:.8px;opacity:.45}
.scene .iso-line[data-tone="faint"]{stroke:#c9bda5;stroke-width:.9px;opacity:1}
.scene .tb-body{fill:var(--krom-m)}
.scene .tb-shine{fill:var(--krom-l)}
.scene .tb-shade{fill:var(--krom-d)}
.scene .tb-ring{stroke:#7d8693;stroke-width:.5}
.scene .skugga{fill:#ddd4c3}
.scene .skal{fill:var(--por-d);stroke:var(--ink);stroke-width:1.2px}
.scene .skalvatten{fill:#8cc8ea;stroke:var(--ink);stroke-width:1px}
.scene .hal{fill:#3d4a63;stroke:var(--ink);stroke-width:1px}
.scene .vattenfront{fill:#5fa8d6;opacity:.38;stroke:none}
.scene .strale{fill:none;stroke:#3f8fc7;stroke-width:2.2px;stroke-dasharray:5 5;stroke-linecap:round}
.scene .virvel{fill:none;stroke:#2f78ad;stroke-width:1.4px;stroke-dasharray:6 6;stroke-linecap:round}
.scene .ring{fill:none;stroke:#2f78ad;stroke-width:1.1px}
.scene .stang{stroke-width:1.6px}
.scene .strale{stroke-width:2.8px}
.scene #over{stroke:#1f6fa8;stroke-width:3px}
.scene .ljud{font-family:var(--hand);font-size:22px;font-weight:700;fill:var(--ink);opacity:0}
${Object.entries(MATERIALS).map(([n, t]) => tones(n, t)).join("")}
.c-por{--l:var(--por-l);--m:var(--por-m);--d:var(--por-d)}
.scene{--krom-l:${MATERIALS.krom[0]};--krom-m:${MATERIALS.krom[1]};--krom-d:${MATERIALS.krom[2]};--por-l:${SWATCHES.mint[0]};--por-m:${SWATCHES.mint[1]};--por-d:${SWATCHES.mint[2]}}
@media (prefers-reduced-motion:reduce){.manual .pill.next{animation:none}}
.render *,.render *::before{transition:none!important;animation:none!important}
.embed .kicker,.embed h1{display:none}
.embed .page{padding-top:4px}
@media (max-width:860px){.page{padding:14px 16px}h1{font-size:22px}.hint{font-size:17px;min-height:0}.layout{grid-template-columns:minmax(0,1fr);gap:12px}.steps{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.pill{font-size:14px;padding:6px 10px 6px 6px}.pill .nr{width:26px;height:26px;font-size:13px}.stage{height:auto;order:-1}.stage svg{width:100%;height:auto}.reglage{margin-top:12px}}
`;

const MODEL_SRC = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");

const live = `
${MODEL_SRC}
const P = ${JSON.stringify(P)};
const IN = ${JSON.stringify(IN)}, Z0 = ${Z0}, ZH = ${ZH}, FILL = ${JSON.stringify(FILL)}, FLUSH = ${JSON.stringify(FLUSH)}, OVF = ${JSON.stringify(OVF)}, NOZZLE = ${JSON.stringify(NOZZLE)};
const WORDS = ${JSON.stringify(WORDS)};
const HINTS = ${JSON.stringify(HINTS)};
const SWATCHES = ${JSON.stringify(SWATCHES)};
const zOf = (h) => Z0 + ZH * h;
const $ = (id) => document.getElementById(id);
const page = document.querySelector(".page");
const scene = document.querySelector(".scene");
const pills = [...document.querySelectorAll(".pill")];
const cursor = $("cursor");
const render = new URLSearchParams(location.search).has("render");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
let mode = render ? "auto" : store.get("cistern-mode") === "auto" ? "auto" : "manual";
let s = setup(Number($("flottorlage").value));
let t = 0, next = 0, playingTo = null, frame = 0, last = 0;
const sm = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const fmt = (x, d = 1) => x.toFixed(d).replace(".", ",");
const floatGroup = $("flottor"), plugGroup = $("propp"), knapp = $("knapp");

function setClip() { $("klamma").innerHTML = solidSvg(cylinder(FILL[0], FILL[1], 2.1, zOf(s.close) + 2.2, 1.4, P, 36, 0.3), { className: "c-krom" }); }

function draw(time) {
  t = time;
  const st = at(t, s);
  const zL = zOf(st.h);
  $("vatten").innerHTML = solidSvg(slabOf({ ...IN, r: 0 }, Z0, Math.max(0.05, zL - Z0), P, 1), { className: "c-vatten", crease: "none" });
  $("vattenfront").setAttribute("d", pathOf([[IN.x, IN.y + IN.d, Z0], [IN.x + IN.w, IN.y + IN.d, Z0], [IN.x + IN.w, IN.y + IN.d, zL], [IN.x, IN.y + IN.d, zL]].map((p) => iso(p, P)), true));
  floatGroup.setAttribute("transform", translateAlong(P, [0, 0, ZH * st.h]));
  plugGroup.setAttribute("transform", translateAlong(P, [0, 0, 5 * st.lift]));
  knapp.setAttribute("transform", translateAlong(P, [0, 0, -1.2 * st.press]));
  $("stang").setAttribute("d", segment([FLUSH[0], FLUSH[1], 72.5 + 5 * st.lift], [FLUSH[0], FLUSH[1], 80 - 1.2 * st.press], P));
  const flow = st.valve;
  const strale = $("strale");
  strale.setAttribute("d", segment(NOZZLE, [NOZZLE[0], NOZZLE[1], zL + 0.2], P));
  strale.style.opacity = flow < 0.01 ? 0 : Math.min(1, 0.25 + flow);
  strale.style.strokeDashoffset = String(-t * 34);
  const over = $("over");
  over.setAttribute("d", segment([OVF[0] - 3.5, OVF[1], zL + 0.3], [OVF[0], OVF[1], zOf(OVERFLOW)], P) + segment([OVF[0], OVF[1] + 1.6, zOf(OVERFLOW) - 0.5], [OVF[0], OVF[1] + 1.6, Z0 + 2], P));
  $("ovfror").classList.toggle("rinner", st.overflowing);
  over.style.opacity = st.overflowing ? 1 : 0;
  over.style.strokeDashoffset = String(-t * 30);
  const swirl = st.step === 1 ? sm(0, 0.08, st.p) * (1 - sm(0.85, 1, st.p)) : 0;
  $("virvel").setAttribute("d", ring(FLUSH[0], FLUSH[1], 6.5, zL + 0.15, P, 40));
  $("virvel").style.opacity = swirl;
  $("virvel").style.strokeDashoffset = String(-t * 40);
  const splash = Math.max(st.step === 1 ? sm(0, 0.06, st.p) : st.step === 2 ? 1 - sm(0, 0.8, st.p) : 0, st.overflowing ? 0.55 : 0);
  let rings = "";
  if (splash > 0.001) for (let i = 0; i < 3; i++) {
    const u = (t * 0.55 + i / 3) % 1;
    rings += '<path class="ring" style="opacity:' + (splash * (1 - u)).toFixed(3) + '" d="' + ring(0, 39, 0.8 + 5 * u, 39.85, P, 32) + '"/>';
  }
  $("ringar").innerHTML = rings;
  WORDS.forEach((w, i) => {
    const el = $("ord" + i);
    let a = 0;
    if (st.step === i) a = sm(0, 0.12, st.p) * (1 - sm(0.82, 1, st.p));
    if (i === 4 && s.runs) el.textContent = "glugg glugg"; else el.textContent = w.text;
    const p = iso(i === 4 && s.runs ? [-4, 14, 62] : w.at, P);
    const rise = st.step === i ? 6 * st.p : 0;
    el.setAttribute("x", p[0].toFixed(1));
    el.setAttribute("y", (p[1] - rise).toFixed(1));
    el.setAttribute("transform", "rotate(-8 " + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")");
    el.style.opacity = a.toFixed(3);
  });
  // Knappar, ledtråd, fartmärke och siffror.
  pills.forEach((b, i) => {
    const running = st.running && st.step === i;
    b.classList.toggle("run", running);
    b.classList.toggle("done", t >= END[i] && !(st.running && st.step === i));
    b.classList.toggle("next", mode === "manual" && i === next && playingTo === null);
    b.classList.toggle("tryckt", mode === "auto" && Math.abs(t - CLICK[i]) < 0.12);
    b.disabled = mode === "auto" || i !== next || playingTo !== null;
    b.querySelector(".txt").textContent = i === 4 && s.runs ? "Vattnet rinner över" : b.dataset.label;
  });
  let hint = HINTS.start;
  if (t >= START[0]) hint = st.step === 4 && s.runs ? HINTS.runs : HINTS.steps[st.step];
  if (t >= END[4]) hint = s.runs ? HINTS.doneRuns : HINTS.done;
  if ($("hint").textContent !== hint) $("hint").textContent = hint;
  // Fartmärket tonas in och ut över 0,2 s så att det inte blinkar till.
  const speed = speedOf(st.step, s);
  const show = t >= START[0] ? sm(START[st.step], START[st.step] + 0.2, t) * (1 - sm(END[st.step] - 0.2, END[st.step], t)) : 0;
  $("speed").textContent = speed ? speed + (speed.includes("/") ? " · slowmotion" : " · snabbspolat") : "";
  $("speed").style.opacity = speed ? show.toFixed(3) : 0;
  $("c-out").textContent = fmt(st.out) + " l";
  $("c-niva").textContent = Math.round(100 * st.h) + " %";
  $("c-kran").textContent = flow < 0.01 ? "stängd" : "öppen " + Math.round(100 * flow) + " %";
  $("c-tid").textContent = fmt(st.real) + " s";
  $("c-volym").textContent = s.runs ? "rinner hela tiden" : fmt(s.liters) + " l";
  drawCursor();
}

function centreOf(el) {
  const a = el.getBoundingClientRect(), b = page.getBoundingClientRect();
  return [a.left - b.left + a.width * 0.32, a.top - b.top + a.height * 0.62];
}
function drawCursor() {
  if (mode !== "auto") { cursor.style.opacity = 0; return; }
  const stageBox = document.querySelector(".stage");
  const home = centreOf(stageBox);
  let from = home, to = home, u = 1, press = 0;
  for (let i = 0; i < CLICK.length; i++) {
    const target = centreOf(pills[i]);
    if (t >= CLICK[i] - 0.6) { from = i ? centreOf(pills[i - 1]) : home; to = target; u = sm(CLICK[i] - 0.6, CLICK[i], t); }
    press = Math.max(press, 1 - Math.min(1, Math.abs(t - CLICK[i]) / 0.12));
  }
  const x = from[0] + (to[0] - from[0]) * u, y = from[1] + (to[1] - from[1]) * u;
  cursor.style.opacity = 1;
  cursor.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + (1 - 0.18 * press).toFixed(3) + ")";
}

// Spela: auto loopar hela turen, manuell spelar ett steg i taget.
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (mode === "auto") draw((t + dt) % TOUR);
  else if (playingTo !== null) {
    const goal = END[playingTo];
    const nt = Math.min(goal, t + dt);
    if (nt >= goal) { next = playingTo + 1; playingTo = null; }
    draw(nt);
  }
  frame = mode === "auto" || playingTo !== null ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && !render) { last = 0; frame = requestAnimationFrame(tick); } };
function play(i) {
  if (mode !== "manual" || i !== next || playingTo !== null) return;
  playingTo = i;
  if (still.matches) { next = i + 1; playingTo = null; draw(END[i]); return; }
  draw(START[i]);
  run();
}
function restart() { next = 0; playingTo = null; draw(0); if (mode === "auto") run(); }
function setMode(m) {
  mode = m;
  if (!render) store.set("cistern-mode", m);
  document.body.classList.toggle("manual", m === "manual");
  document.querySelectorAll(".switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  restart();
}
pills.forEach((b, i) => b.addEventListener("click", () => play(i)));
document.querySelectorAll(".switch button").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
$("restart").addEventListener("click", (e) => { e.preventDefault(); restart(); });
$("flottorlage").addEventListener("input", (e) => {
  s = setup(Number(e.target.value));
  $("flottorut").innerHTML = s.runs ? '<span class="rinner">För högt: vattnet rinner över</span>' : fmt(s.liters) + " l per spolning";
  setClip();
  draw(t);
});
document.addEventListener("keydown", (e) => {
  if ((e.key === " " || e.key === "Enter") && !e.target.closest("button, input, a")) { e.preventDefault(); play(next); }
});
document.querySelectorAll(".swatches button").forEach((b) => b.addEventListener("click", () => {
  const [l, m, d] = SWATCHES[b.dataset.farg];
  scene.style.setProperty("--por-l", l); scene.style.setProperty("--por-m", m); scene.style.setProperty("--por-d", d);
  document.querySelectorAll(".swatches button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
}));
if (render) document.body.classList.add("render");
// Inbäddad i appen: dölj egen rubrik och berätta sidans höjd för iframen.
if (new URLSearchParams(location.search).has("embed")) {
  document.body.classList.add("embed");
  const tell = () => parent.postMessage({ anatomiHojd: Math.ceil(document.querySelector(".page").getBoundingClientRect().height) }, "*");
  new ResizeObserver(tell).observe(document.querySelector(".page"));
}
window.seek = (time) => { draw(Math.min(TOUR, Math.max(0, time))); };
window.TOUR = TOUR;
setClip();
$("flottorut").textContent = fmt(s.liters).replace(".", ",") + " l per spolning";
setMode(mode);
`;

const CURSOR = `<svg id="cursor" viewBox="0 0 30 30" aria-hidden="true"><path d="M4 2 L4 24 L10 18.5 L14.5 28 L18.5 26.2 L14 17 L22 17 Z" fill="#fffaf0" stroke="#22304a" stroke-width="2" stroke-linejoin="round"/></svg>`;

const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hur fyller toaletten på sig själv?</title><style>${k.ISO_CSS}${CSS}</style></head>
<body class="iso manual" data-theme="light">
<main class="page">
  <p class="kicker">Fig 2 · Toalettens cistern</p>
  <h1>Hur fyller toaletten på sig själv efter att du spolat?</h1>
  <p class="hint" id="hint" aria-live="polite">${HINTS.start}</p>
  <div class="layout">
    <aside>
      <div class="switch" role="group" aria-label="Läge">
        <button type="button" data-mode="manual" aria-pressed="true">Manuell</button>
        <button type="button" data-mode="auto" aria-pressed="false">Auto</button>
      </div>
      <ol class="steps">${STEP_LABELS.map((label, i) => `<li><button type="button" class="pill" data-label="${label}"><span class="nr">${i + 1}</span><span class="txt">${label}</span></button></li>`).join("")}</ol>
      <a href="#" class="restart" id="restart">Börja om</a>
      <div class="reglage">
        <label for="flottorlage">Flottörens läge</label>
        <input type="range" id="flottorlage" min="0" max="1" step="0.01" value="${M.SETTING_DEFAULT.toFixed(2)}">
        <output id="flottorut" for="flottorlage"></output>
      </div>
    </aside>
    <figure class="stage scene">${svg}<div class="badge" id="speed"></div></figure>
  </div>
  <section class="under">
    <ul class="chips">
      <li>Ute i skålen<b id="c-out"></b></li>
      <li>Vattennivå<b id="c-niva"></b></li>
      <li>Kranen<b id="c-kran"></b></li>
      <li>Tid i verkligheten<b id="c-tid"></b>*</li>
      <li>Per spolning<b id="c-volym"></b></li>
    </ul>
    <p class="idea"><strong>Den stora idén:</strong> flottören flyter upp med vattnet och stänger kranen själv.</p>
    <div class="swatches"><span>Färg på porslinet:</span>${Object.entries(SWATCHES).map(([n, [, m]], i) => `<button type="button" data-farg="${n}" aria-label="${n}" aria-pressed="${i === 0}" style="background:${m}"></button>`).join("")}</div>
    <p class="kallor">Källor: spolmängd 4 och 2 liter, <a href="https://www.bauhaus.se/toalett-gustavsberg-skandic-1410-ink-standardsits" target="_blank" rel="noopener">Gustavsberg Skandic 1410 (Bauhaus)</a>. Justerbar upp till 6 liter, <a href="https://www.bauhaus.se/toalett-gustavsberg-nautic-1500-hygienic-flush-inkl-mjuksits" target="_blank" rel="noopener">Gustavsberg Nautic 1500 (Bauhaus)</a>. Att vattnet ska stå under överfallsröret: <a href="https://www.byggahus.se/forum/threads/oka-vattenmangd-i-toans-spolbehallare.359217/" target="_blank" rel="noopener">Byggahus forum</a> (TODO-KONTROLL: ersätt med tillverkarkälla). * Tiderna är uppskattade och inte källbelagda (TODO-KONTROLL).</p>
  </section>
  ${CURSOR}
</main>
<script type="module">${(kitScript() + "\n" + live).replace(/<\/(script)/gi, "<\\/$1")}</script>
</body></html>`;

writeFileSync(join(HERE, "cistern.html"), html);
writeFileSync(join(HERE, "../../public/figurer/anatomi/cistern.html"), html);
console.log("wrote cistern.html", (html.length / 1024).toFixed(0) + " kB");
