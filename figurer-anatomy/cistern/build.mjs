// Toalettens cistern som isometrisk figur med stegknappar, fönster in i cisternen och en modell som driver allt.
// Kör: node figurer-anatomy/cistern/build.mjs  →  cistern.html
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../../vendor/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../vendor/anatomy/kit/tube.mjs";
import { writePage, ordSvg } from "../delat/sida.mjs";
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
    ordSvg(WORDS.length),
  ],
});

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

// Figurens egen kod på sidan: ritar de rörliga delarna och ger texter och siffror. Körs med modellen i räckvidd.
const FIG_JS = `
const zOf = (h) => Z0 + ZH * h;
const FIG = {
  id: "cistern",
  init(s) { $("klamma").innerHTML = solidSvg(cylinder(FILL[0], FILL[1], 2.1, zOf(s.close) + 2.2, 1.4, P, 36, 0.3), { className: "c-krom" }); },
  reglage: (s) => (s.runs ? '<span class="varning">För högt: vattnet rinner över</span>' : fmt(s.liters) + " l per spolning"),
  rita(st, t, s) {
    const zL = zOf(st.h);
    $("vatten").innerHTML = solidSvg(slabOf({ ...IN, r: 0 }, Z0, Math.max(0.05, zL - Z0), P, 1), { className: "c-vatten", crease: "none" });
    $("vattenfront").setAttribute("d", pathOf([[IN.x, IN.y + IN.d, Z0], [IN.x + IN.w, IN.y + IN.d, Z0], [IN.x + IN.w, IN.y + IN.d, zL], [IN.x, IN.y + IN.d, zL]].map((p) => iso(p, P)), true));
    $("flottor").setAttribute("transform", translateAlong(P, [0, 0, ZH * st.h]));
    $("propp").setAttribute("transform", translateAlong(P, [0, 0, 5 * st.lift]));
    $("knapp").setAttribute("transform", translateAlong(P, [0, 0, -1.2 * st.press]));
    $("stang").setAttribute("d", segment([FLUSH[0], FLUSH[1], 72.5 + 5 * st.lift], [FLUSH[0], FLUSH[1], 80 - 1.2 * st.press], P));
    const strale = $("strale");
    strale.setAttribute("d", segment(NOZZLE, [NOZZLE[0], NOZZLE[1], zL + 0.2], P));
    strale.style.opacity = st.valve < 0.01 ? 0 : Math.min(1, 0.25 + st.valve);
    strale.style.strokeDashoffset = String(-t * 34);
    const over = $("over");
    over.setAttribute("d", segment([OVF[0] - 3.5, OVF[1], zL + 0.3], [OVF[0], OVF[1], zOf(OVERFLOW)], P) + segment([OVF[0], OVF[1] + 1.6, zOf(OVERFLOW) - 0.5], [OVF[0], OVF[1] + 1.6, Z0 + 2], P));
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
    WORDS.forEach((w, i) => (i === 4 && s.runs ? visaOrd(i, "glugg glugg", [-4, 14, 62], st) : visaOrd(i, w.text, w.at, st)));
  },
  texter(st, t, s) {
    let hint = HINTS.start;
    if (t >= START[0]) hint = st.step === 4 && s.runs ? HINTS.runs : HINTS.steps[st.step];
    if (t >= END[4]) hint = s.runs ? HINTS.doneRuns : HINTS.done;
    return {
      hint,
      labels: s.runs ? [null, null, null, null, "Vattnet rinner över"] : null,
      chips: {
        out: fmt(st.out) + " l",
        niva: Math.round(100 * st.h) + " %",
        kran: st.valve < 0.01 ? "stängd" : "öppen " + Math.round(100 * st.valve) + " %",
        tid: fmt(st.real) + " s",
        volym: s.runs ? ["rinner hela tiden", true] : fmt(s.liters) + " l",
      },
    };
  },
};
`;

writePage({
  id: "cistern",
  here: HERE,
  P,
  kicker: "Fig 2 · Toalettens cistern",
  title: "Hur fyller toaletten på sig själv?",
  question: "Hur fyller toaletten på sig själv efter att du spolat?",
  startHint: HINTS.start,
  steps: ["Tryck på knappen", "Vattnet forsar ut", "Proppen stänger", "Cisternen fylls", "Flottören stänger kranen"],
  slider: { label: "Flottörens läge", min: 0, max: 1, step: 0.01, value: M.SETTING_DEFAULT.toFixed(2) },
  chips: [
    { id: "out", label: "Ute i skålen" },
    { id: "niva", label: "Vattennivå" },
    { id: "kran", label: "Kranen" },
    { id: "tid", label: "Tid i verkligheten", star: true },
    { id: "volym", label: "Per spolning" },
  ],
  idea: "flottören flyter upp med vattnet och stänger kranen själv.",
  swatch: {
    label: "Färg på porslinet",
    var: "por",
    options: { mint: ["#c4ebdf", "#93d2bf", "#6fb5a2"], gul: ["#f8e3a0", "#f1c75a", "#d6a73c"], rosa: ["#f8cfd8", "#ee9fb2", "#d27b92"], vit: ["#fbf8f1", "#e9e3d6", "#cfc6b4"] },
  },
  materials: {
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
  },
  css: `
.scene .skal{fill:var(--por-d);stroke:var(--ink);stroke-width:1.2px}
.scene .skalvatten{fill:#8cc8ea;stroke:var(--ink);stroke-width:1px}
.scene .hal{fill:#3d4a63;stroke:var(--ink);stroke-width:1px}
.scene .vattenfront{fill:#5fa8d6;opacity:.38;stroke:none}
.scene .strale{fill:none;stroke:#3f8fc7;stroke-width:2.8px;stroke-dasharray:5 5;stroke-linecap:round}
.scene .virvel{fill:none;stroke:#2f78ad;stroke-width:1.4px;stroke-dasharray:6 6;stroke-linecap:round}
.scene .ring{fill:none;stroke:#2f78ad;stroke-width:1.1px}
.scene .stang{stroke-width:1.6px}
.scene #over{stroke:#1f6fa8;stroke-width:3px}
`,
  svg,
  sources:
    'Källor: spolmängd 4 och 2 liter, <a href="https://www.bauhaus.se/toalett-gustavsberg-skandic-1410-ink-standardsits" target="_blank" rel="noopener">Gustavsberg Skandic 1410 (Bauhaus)</a>. Justerbar upp till 6 liter, <a href="https://www.bauhaus.se/toalett-gustavsberg-nautic-1500-hygienic-flush-inkl-mjuksits" target="_blank" rel="noopener">Gustavsberg Nautic 1500 (Bauhaus)</a>. Att vattnet ska stå under överfallsröret: <a href="https://www.byggahus.se/forum/threads/oka-vattenmangd-i-toans-spolbehallare.359217/" target="_blank" rel="noopener">Byggahus forum</a> (TODO-KONTROLL: ersätt med tillverkarkälla). * Tiderna är uppskattade och inte källbelagda (TODO-KONTROLL).',
  figData: { IN, Z0, ZH, FILL, FLUSH, OVF, NOZZLE, WORDS, HINTS },
  figJs: FIG_JS,
});
