// Golvbrunnens vattenlås i ett badrum, med golvet kapat rakt genom brunnen så att snittet visar vattnet,
// klockan och luktens väg. Kör: node figurer-anatomy/vattenlas/build.mjs  →  vattenlas.html
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../../vendor/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../vendor/anatomy/kit/tube.mjs";
import { writePage, ordSvg } from "../delat/sida.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 900;
const HEIGHT = 820;

// Världen i cm. Golvet är kapat vid y = DY, rakt genom brunnens mitt (DX).
const DX = 50;
const DY = 55;
const LIFT = 34; // så högt vattenlåset lyfts när det rensas
const HEAD = [64, 8, 72]; // duschhuvudet
const AIM = [DX, DY - 5, 0]; // dit duschen riktas

const P = k.fitProjection(
  [...k.boxCorners({ x: 0, y: -4, w: 100, d: DY + 4 }, -26, 82)],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 60, elevation: 22 },
);

const at = (p) => k.iso(p, P);
const S = (paths, c, extra = {}) => k.solidSvg(paths, { className: `c-${c}`, ...extra });
const box = (x, y, w, d, z, h, c, r = 1, bevel = 0, extra) => S(k.slabOf({ x, y, w, d, r }, z, h, P, 4, bevel), c, extra);
const can = (x, y, r, z, h, c, extra) => S(k.cylinder(x, y, r, z, h, P, 36, 0.3), c, extra);
const L = (d, tone = "lo", extra = {}) => k.lineSvg(d, { tone, ...extra });
const seg = (a, b) => k.segment(a, b, P);
const quad = (pts) => k.pathOf(pts.map(at), true);
// Snittets plan: lokala u åt höger från brunnens mitt, v nedåt från golvets ovansida.
const section = (inner, attrs = "") => `<g ${attrs} transform="${k.sideMatrix([DX, DY], 0, P, "left")}">${inner}</g>`;
const rect = (u0, v0, u1, v1, cls) => `<rect class="${cls}" x="${u0}" y="${v0}" width="${(u1 - u0).toFixed(2)}" height="${(v1 - v0).toFixed(2)}"/>`;
const poly = (pts, cls) => `<path class="${cls}" d="M${pts.map(([u, v]) => `${u} ${v}`).join(" L")} Z"/>`;

function room() {
  const out = [];
  out.push(box(0, -4, 100, 4, -26, 108, "kakel", 0));
  const tiles = [];
  for (let x = 8; x < 100; x += 12) tiles.push(seg([x, 0, 0], [x, 0, 82]));
  for (let z = 12; z < 82; z += 12) tiles.push(seg([0, 0, z], [100, 0, z]));
  out.push(L(tiles.join(""), "faint"));
  out.push(L(seg([100, 0, 0], [100, 0, 82]), "lo")); // väggens hörn, där fogarna slutar
  // Hårda varma skuggor strax bakom föremålen på väggen.
  out.push(`<path class="skugga" d="${quad([[37, 0, 41], [55, 0, 41], [55, 0, 48], [37, 0, 48]])}"/>`);
  out.push(`<path class="skugga" d="${quad([[78, 0, 34], [93, 0, 34], [93, 0, 70], [78, 0, 70]])}"/>`);
  return out.join("");
}

function shower() {
  const out = [];
  out.push(box(40, 0, 16, 4, 44, 6, "krom", 1.5, 0.4));
  for (const x of [38, 58]) out.push(S(G.solidOf([[0, 2.2], [3.2, 2.2], [3.2, 1.4], [5, 1.4]], G.frameAlong([x, 1, 47], [0, 1, 0]), P), "krom"));
  out.push(can(48, 2.5, 1.2, 40, 4, "krom"));
  const route = G.fillet([[48, 2.5, 40.2], [48, 2.5, 26], [54, 10, 22], [64, 10, 26], [64, 6, 62]], 4, 7, { P, tube: 0.8 });
  out.push(...tubePieces(route, 0.8, P, { maxLength: 16, rings: { pitch: 1.2, twist: 0.7, cross: true, fade: [0.1, 0.55] } })
    .sort((a, b) => k.depthOf(a.mid, P) - k.depthOf(b.mid, P)).map((p) => tubeSvg(p, { tone: "lo" })));
  out.push(box(61, 0, 6, 5, 60, 4, "krom", 1, 0.3));
  const dir = G.unit3(G.sub3(AIM, HEAD));
  out.push(S(G.solidOf([[-2, 1], [2.4, 1.2], [3.4, 4, 1], [4.2, 4.2]], G.frameAlong(HEAD, dir), P), "krom"));
  return out.join("");
}

function towel() {
  return S(G.solidOf([[0, 1.1], [4, 1.1]], G.frameAlong([86, 0, 72], [0, 1, 0]), P), "krom") + box(80, 2.5, 14, 2, 35, 36, "handduk", 1, 0.4);
}

function floor() {
  const out = [];
  out.push(box(0, 0, 100, DY, -26, 25, "betong", 0));
  out.push(box(0, 0, 100, DY, -1, 1, "golv", 0));
  const grid = [];
  for (let x = 8; x < 100; x += 12) grid.push(seg([x, 0, 0], [x, DY, 0]));
  for (let y = 7; y < DY; y += 12) grid.push(seg([0, y, 0], [100, y, 0]));
  out.push(L(grid.join(""), "faint"));
  // Brunnens ram, kapad i snittet.
  out.push(box(DX - 13, DY - 13, 26, 13, -0.6, 0.8, "krom", 0.5));
  return out.join("");
}

// Brunnslocket (halvt, kapat i snittet) lyfts med vattenlåset.
function grate() {
  const ring = Array.from({ length: 25 }, (_, i) => { const a = Math.PI + (i / 24) * Math.PI; return [DX + 10 * Math.cos(a), DY + 10 * Math.sin(a)]; });
  const holes = [];
  for (let r = 2.5; r < 9.5; r += 2.4) for (let a = Math.PI + 0.25; a < 2 * Math.PI - 0.2; a += 2.6 / r) holes.push(at([DX + r * Math.cos(a), DY + r * Math.sin(a), 0.45]));
  return `<g id="lock">${S(k.extrude(ring, -0.2, 0.65, P), "krom")}${k.dotsSvg(holes, { size: 0.55, tone: "hi" })}</g>`;
}

// Snittet genom golvet och brunnen, ritat i snittets plan. Vattenlåset ligger i en egen grupp som lyfts.
function cut() {
  const out = [];
  out.push(rect(-26, 0.1, 42, 1, "sek-kakel"));
  // Brunnens kropp och utloppet.
  out.push(poly([[-14, 0], [-14, 20], [14, 20], [14, 18], [32, 18], [32, 25], [38, 25], [38, 12], [14, 12], [14, 0]], "sek-plast"));
  out.push(poly([[-12.6, 1.2], [-12.6, 18.6], [12.6, 18.6], [12.6, 16.8], [33.2, 16.8], [33.2, 25], [36.8, 25], [36.8, 13.2], [12.6, 13.2], [12.6, 1.2]], "sek-luft"));
  out.push(rect(-18, -0.2, -12.6, 1.2, "sek-plast"), rect(12.6, -0.2, 18, 1.2, "sek-plast"));
  // Vattenlåset: krage med tätring, klocka och kopp. Ritas vid lyft 0 och flyttas med transform.
  const insert = [];
  insert.push(`<rect id="sek-vatten" class="sek-vatten" x="-7.8" y="4" width="15.6" height="11.8"/>`);
  insert.push(poly([[-9, 4], [-9, 17], [9, 17], [9, 4], [7.8, 4], [7.8, 15.8], [-7.8, 15.8], [-7.8, 4]], "sek-vit"));
  insert.push(rect(-6.5, 2.2, -5.3, 9, "sek-vit"), rect(5.3, 2.2, 6.5, 9, "sek-vit"));
  insert.push(rect(-12.3, 1.4, -2, 2.4, "sek-vit"), rect(2, 1.4, 12.3, 2.4, "sek-vit"));
  insert.push(`<g id="sek-har"><path class="har" d="M-6.8 9.4 c1 -1.6 2.4 1.2 3.4 -0.6 s1.8 1.4 2.6 -0.2"/><path class="har" d="M3.6 9.6 c0.8 -1.2 1.8 0.9 2.6 -0.4 s1.4 1.1 2.2 -0.3"/><path class="har" d="M-8.6 4.2 c0.6 -1 1.6 0.8 2.4 -0.4"/></g>`);
  insert.push(`<g id="tatring" class="tatring"><rect x="-13.1" y="1.3" width="1.6" height="1.2"/><rect x="11.5" y="1.3" width="1.6" height="1.2"/></g>`);
  insert.push(rect(-11, -0.6, 11, 0.2, "sek-krom"));
  out.push(`<g id="insats">${insert.join("")}</g>`);
  out.push(`<path id="sek-strale" class="strale" d="M0 -1 L0 4"/>`);
  out.push(`<g id="lukt"></g>`);
  return section(out.join(""));
}

const WORDS = [
  { text: "blubb", at: [DX + 18, DY + 2, -2] },
  { text: "sssss", at: [DX + 20, DY + 2, 3] },
  { text: "fy!", at: [DX - 8, DY + 2, 18] },
  { text: "sprutt", at: [72, 14, 78] },
  { text: "flopp", at: [DX + 20, DY + 2, 32] },
  { text: "klick", at: [DX + 20, DY + 2, 5] },
];

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Ett badrumsgolv med kakel och en dusch på väggen. Golvet är kapat rakt genom golvbrunnen. I snittet syns vattenlåset: en kopp med vatten och en klocka vars kant står nere i vattnet, så att lukt från avloppsröret inte kommer upp.",
  body: [room(), shower(), towel(), floor(), grate(), cut(), `<path id="strale" class="strale" d="${seg(G.add3(HEAD, G.mul3(G.unit3(G.sub3(AIM, HEAD)), 4.4)), AIM)}"/>`, ordSvg(WORDS.length)],
});

const HINTS = {
  start: "Under golvbrunnen finns ett vattenlås: lite vatten som stänger ute lukten från avloppet.",
  steps: [
    "Vattnet täcker kanten på den vita klockan. Lukten från avloppet kommer inte förbi vattnet.",
    "Ingen duschar på länge, till exempel på sommaren. Vattnet avdunstar sakta.",
    "Nu når vattnet inte upp till kanten. Lukten smiter förbi och kommer upp i badrummet.",
    "Spola vatten en stund. Då fylls vattenlåset och lukten försvinner efter en liten stund.",
    "Rensa minst två gånger per år. Ta bort locket, lyft upp vattenlåset och gör rent det från hår och tvål.",
    "Sätt tillbaka vattenlåset, tryck fast tätringen och spola så att det fylls med vatten.",
  ],
  done: "Klart. Vattnet stänger ute lukten igen.",
  doneGap: "Tätringen glappar. Då smiter lukten förbi kanten, fast det finns vatten. Tryck fast den.",
};

// Luktens vägar i snittet (u, v). Huvudvägen går under klockans kant, den andra förbi en glappande tätring.
const MAIN = [[35, 25], [35, 15], [14, 15], [11, 10], [10.6, 3.6], [7.2, 3.6], [7.15, 6], [6, 9.8], [3.6, 8], [0, 3], [0, -1], [1, -14]];
const BLOCK = 6; // index där vattnet stoppar huvudvägen
const GAPPATH = [[35, 25], [35, 15], [14, 15], [12.9, 9], [12.95, 2.6], [13, -1], [16, -14]];

const FIG_JS = `
const sm2 = (a, b, x) => sm(Math.min(a, b), Math.max(a, b), a < b ? x : a + b - x);
const lengths = (pts) => pts.reduce((acc, p, i) => [...acc, i ? acc[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0], []);
const pointAt = (pts, len, d) => { for (let i = 1; i < pts.length; i++) if (d <= len[i]) { const u = (d - len[i - 1]) / (len[i] - len[i - 1] || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]; } return pts[pts.length - 1]; };
const MAIN_L = lengths(MAIN), GAP_L = lengths(GAPPATH);
// Luktmoln längs en väg. stop är hur långt de kommer: vid vattnet, eller hela vägen när låset är öppet.
function puffs(pts, len, stop, t, phase) {
  const total = len[len.length - 1];
  let svg = "";
  for (let i = 0; i < 7; i++) {
    const d = ((t * 7 + phase + (i * total) / 7) % total);
    const shown = Math.min(d, stop);
    const [u, v] = pointAt(pts, len, shown);
    const a = sm(0, 4, d) * (1 - sm(total - 10, total, d)) * Math.exp(-Math.max(0, d - stop) / 4);
    if (a > 0.01) svg += '<circle class="lukt" r="1.6" cx="' + u.toFixed(2) + '" cy="' + v.toFixed(2) + '" style="opacity:' + a.toFixed(3) + '"/>';
  }
  return svg;
}
const FIG = {
  id: "vattenlas",
  reglage: (s) => (s.gap ? '<span class="varning">Tätringen glappar</span>' : "Tätringen sitter på plats"),
  rita(st, t, s) {
    const seated = 1 - sm(0, 0.05, st.lift);
    // Vattenytan: kanten på klockan ligger 9 cm ner i snittet, och 50 mm vatten över den når koppens kant.
    const vw = 9 - st.level / 10;
    const w = $("sek-vatten");
    w.setAttribute("y", vw.toFixed(2));
    w.setAttribute("height", Math.max(0, 15.8 - vw).toFixed(2));
    $("insats").setAttribute("transform", "translate(0 " + (-LIFT * st.lift).toFixed(2) + ")");
    $("lock").setAttribute("transform", translateAlong(P, [0, 0, LIFT * st.lift]));
    $("sek-har").style.opacity = st.hair.toFixed(3);
    $("tatring").setAttribute("transform", s.gap ? "translate(0 1.6)" : "");
    $("tatring").classList.toggle("glapp", s.gap);
    for (const id of ["strale", "sek-strale"]) { $(id).style.opacity = st.pour.toFixed(3); $(id).style.strokeDashoffset = String(-t * 30); }
    $("sek-strale").setAttribute("d", "M0 -1 L0 " + Math.max(4, vw).toFixed(2));
    const open = seated * sm2(0, -6, st.level);
    const blockLen = MAIN_L[BLOCK] - 0.4 - 4 * Math.max(0, Math.min(1, st.level / 50));
    const stop = blockLen + (MAIN_L[MAIN_L.length - 1] - blockLen) * open;
    let html = st.lift > 0.5 ? "" : puffs(MAIN, MAIN_L, stop, t, 0);
    if (s.gap) html += puffs(GAPPATH, GAP_L, GAP_L[3] + (GAP_L[GAP_L.length - 1] - GAP_L[3]) * seated * Math.pow(st.cup, 8), t, 9);
    $("lukt").innerHTML = html;
    WORDS.forEach((w, i) => visaOrd(i, w.text, w.at, st));
  },
  texter(st, t, s) {
    let hint = t < START[0] ? HINTS.start : HINTS.steps[st.step];
    if (t >= END[END.length - 1]) hint = s.gap ? HINTS.doneGap : HINTS.done;
    return {
      hint,
      chips: {
        djup: [Math.round(st.seal) + " mm", st.lift < 0.02 && st.level < 25],
        lukt: st.smell ? ["kommer in", true] : "stängs ute",
        ring: s.gap ? ["glappar", true] : "tät",
        har: st.hair > 0.5 ? "hår och tvål" : "rent",
        rensa: "minst 2 gånger per år",
      },
    };
  },
};
`;

writePage({
  id: "vattenlas",
  here: HERE,
  P,
  kicker: "Fig 5 · Vattenlåset",
  title: "Varför luktar det avlopp?",
  question: "Varför luktar det avlopp ibland, och hur stoppar en golvbrunn lukten?",
  startHint: HINTS.start,
  steps: ["Vatten stänger ute lukten", "Vattnet avdunstar", "Lukten kommer upp", "Spola vatten", "Lyft upp och rensa", "Sätt tillbaka och spola"],
  slider: { label: "Tätringen", min: 0, max: 1, step: 1, value: 0 },
  chips: [
    { id: "djup", label: "Vattenlås" },
    { id: "lukt", label: "Lukt" },
    { id: "ring", label: "Tätring" },
    { id: "har", label: "I brunnen" },
    { id: "rensa", label: "Rensa" },
  ],
  idea: "en liten propp av vatten, 50 mm djup, stänger ute lukten från avloppet.",
  swatch: {
    label: "Färg på kaklet",
    var: "kakel",
    options: {
      mint: ["#e4f4ee", "#cfe9e0", "#b3d6c9"],
      vit: ["#fbf9f4", "#efebe2", "#dcd5c6"],
      gul: ["#fbf0cf", "#f5e2a6", "#e2c97c"],
      rosa: ["#fbe3e8", "#f4cbd5", "#e0aab8"],
    },
  },
  materials: {
    golv: ["#e3e6ea", "#cfd4da", "#b5bcc5"],
    betong: ["#d9d4cb", "#c4bdb1", "#a9a194"],
    handduk: ["#ffc9a8", "#f59f6c", "#d47c48"],
    krom: ["#f4f6f9", "#c9ced6", "#98a1ad"],
  },
  css: `
.scene .sek-kakel{fill:#cfd4da}
.scene .sek-plast{fill:#8592aa;stroke:var(--ink);stroke-width:1px;vector-effect:non-scaling-stroke}
.scene .sek-luft{fill:#4a5872;stroke:var(--ink);stroke-width:1px;vector-effect:non-scaling-stroke}
.scene .sek-vit{fill:#f4f1ea;stroke:var(--ink);stroke-width:1px;vector-effect:non-scaling-stroke}
.scene .sek-krom{fill:#c9ced6;stroke:var(--ink);stroke-width:1px;vector-effect:non-scaling-stroke}
.scene .sek-vatten{fill:#8cc8ea}
.scene .tatring{fill:#22304a}
.scene .tatring.glapp{fill:#d9534f}
.scene .har{fill:none;stroke:#7a5a3a;stroke-width:1.4px;stroke-linecap:round;vector-effect:non-scaling-stroke}
.scene .lukt{fill:#b9cf7f;stroke:#5d7a2e;stroke-width:1px;vector-effect:non-scaling-stroke}
.scene .strale{fill:none;stroke:#3f8fc7;stroke-width:2.6px;stroke-dasharray:5 5;stroke-linecap:round;vector-effect:non-scaling-stroke}
`,
  svg,
  sources:
    'Källor: <a href="https://www.sis.se/produkter/byggnadsmaterial-och-byggnader/bygginstallationer/avloppsinstallationer/ssen125312015/" target="_blank" rel="noopener">SIS: SS-EN 1253-1:2015, golvbrunnar med minst 50 mm vattenlåsdjup</a>. <a href="https://www.afbostader.se/globalassets/bo-hos-oss/stadtips/stada-badrum.pdf" target="_blank" rel="noopener">AF Bostäder: Så rengör och rensar du golvbrunnen</a> (minst två gånger per år, så gör du, uttorkat vattenlås). <a href="https://fastpartner.se/media/tips-1.pdf" target="_blank" rel="noopener">Fastpartner: Tips</a> (gummilisten ska sluta tätt). Hur fort vattnet avdunstar har ingen källa (TODO-KONTROLL), därför visas ingen tid. Brunnar finns i olika utföranden; detta är ett exempel.',
  figData: { DX, DY, LIFT, WORDS, HINTS, MAIN, BLOCK, GAPPATH },
  figJs: FIG_JS,
});
