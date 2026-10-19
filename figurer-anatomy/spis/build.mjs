// Induktionshäll på en köksbänk: magnettestet, fältet från spolen under glaset, och en spisbrand som kvävs med locket.
// Kör: node figurer-anatomy/spis/build.mjs  →  spis.html
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../../vendor/anatomy/kit/lathe.mjs";
import { writePage, ordSvg } from "../delat/sida.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 900;
const HEIGHT = 820;

// Världen i cm. Glaset ligger på z = 90.4; kastrullen står på kokzonen fram till vänster.
const GLASS = 90.4;
const Z1 = [37, 38]; // kokzonen där det lagas mat
const Z2 = [67, 20]; // kall zon där kastrullen ställs undan
const PAN_R = 10;
const PAN_H = 8;
const LID_HOME = [102, 34, 90];
const MAGNET_HOME = [12, 50, 90];

const P = k.fitProjection(
  [...k.boxCorners({ x: 6, y: -4, w: 114, d: 66 }, 66, 172)],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 48, elevation: 30 },
);

const at = (p) => k.iso(p, P);
const S = (paths, c, extra = {}) => k.solidSvg(paths, { className: `c-${c}`, ...extra });
const box = (x, y, w, d, z, h, c, r = 1, bevel = 0, extra) => S(k.slabOf({ x, y, w, d, r }, z, h, P, 4, bevel), c, extra);
const can = (x, y, r, z, h, c, extra) => S(k.cylinder(x, y, r, z, h, P, 40, 0.3), c, extra);
const L = (d, tone = "lo", extra = {}) => k.lineSvg(d, { tone, ...extra });
const seg = (a, b) => k.segment(a, b, P);
const quad = (pts) => k.pathOf(pts.map(at), true);
const front = ([x, y, z], inner) => `<g transform="${k.sideMatrix([x, y], z, P, "left")}">${inner}</g>`;
const top = ([x, y, z], inner) => `<g transform="${k.topMatrix([x, y], z, P, "x")}">${inner}</g>`;

function room() {
  const out = [];
  out.push(box(-10, -4, 155, 4, -3, 173, "vagg", 0));
  out.push(box(-10, 0, 155, 80, -3, 3, "golv", 0));
  const grid = [];
  for (let x = 5; x < 145; x += 15) grid.push(seg([x, 0, 0], [x, 80, 0]));
  for (let y = 15; y < 80; y += 15) grid.push(seg([-10, y, 0], [145, y, 0]));
  out.push(L(grid.join(""), "faint"));
  out.push(box(-2, 0, 124, 0.6, 90, 56, "kakel", 0));
  const tiles = [];
  for (let x = 8; x < 122; x += 10) tiles.push(seg([x, 0.6, 90], [x, 0.6, 146]));
  for (let z = 100; z < 146; z += 10) tiles.push(seg([-2, 0.6, z], [122, 0.6, z]));
  out.push(L(tiles.join(""), "faint"));
  out.push(L(seg([122, 0.6, 90], [122, 0.6, 146]), "lo")); // kakelpanelens hörn, där fogarna slutar
  out.push(`<path class="skugga" d="${quad([[103, 0, 116], [118, 0, 116], [118, 0, 138], [103, 0, 138]])}"/>`);
  out.push(`<path class="skugga" d="${quad([[20, 0, 156], [80, 0, 156], [80, 0, 172], [20, 0, 172]])}"/>`);
  // Brandfilt på väggen och köksfläkt över hällen.
  out.push(box(105, 0, 14, 3.5, 118, 22, "brandfilt", 1.2, 0.4));
  out.push(front([112, 3.5, 133], `<text class="skylt ljus" text-anchor="middle" font-size="2.6">BRANDFILT</text>`));
  out.push(box(44, 0, 14, 12, 172, 6, "flakt", 0.6));
  out.push(box(22, 0, 60, 34, 158, 14, "flakt", 1.5, 0.6));
  out.push(L(k.planOutline({ x: 26, y: 4, w: 52, d: 26, r: 1 }, 158, P), "lo"));
  return out.join("");
}

function counter() {
  const out = [];
  out.push(box(2, 4, 116, 54, 0, 8, "sockel", 0.5));
  out.push(box(0, 2, 120, 58, 8, 78, "skap", 1, 0.6));
  for (const x of [40, 80]) out.push(L(seg([x, 60, 8], [x, 60, 86]), "lo"));
  for (const x of [36, 44, 76, 84]) out.push(box(x - 0.8, 60, 1.6, 1.6, 68, 12, "krom", 0.6));
  // Pulversläckaren på golvet bredvid bänken.
  out.push(can(132, 26, 6.5, 0, 42, "slackare"));
  out.push(can(132, 26, 2.4, 42, 5, "krom"));
  out.push(box(128, 24, 10, 3, 46, 2, "krom", 0.6));
  out.push(front([132, 32.5, 22], `<text class="skylt ljus" text-anchor="middle" font-size="3.6">6 kg</text><text class="skylt ljus" text-anchor="middle" y="4" font-size="2.4">PULVER</text>`));
  return out.join("");
}

function hob() {
  const out = [];
  out.push(box(-2, 0, 124, 8, 86, 4, "skiva", 0.6, 0.6));
  out.push(box(-2, 52, 124, 10, 86, 4, "skiva", 0.6, 0.6));
  out.push(box(-2, 8, 24, 44, 86, 4, "skiva", 0.4));
  out.push(box(82, 8, 40, 44, 86, 4, "skiva", 0.4));
  // Spolarna under glaset, och glaset lite genomskinligt ovanpå.
  out.push(box(22, 8, 60, 44, 86, 2, "plat", 0.4));
  const coil = (cx, cy) => Array.from({ length: 6 }, (_, i) => `<path class="spole" d="${k.ring(cx, cy, 2.2 + i * 1.35, 88.05, P, 40)}"/>`).join("");
  out.push(coil(...Z1), coil(...Z2), coil(37, 20), coil(67, 38));
  out.push(box(22, 8, 60, 44, GLASS - 1, 1, "glas", 1, 0.3, { className: "c-glas genom" }));
  for (const [x, y] of [Z1, Z2, [37, 20], [67, 38]]) out.push(L(k.ring(x, y, 9.5, GLASS + 0.01, P, 48), "faint", { className: "zon" }));
  out.push(top([52, 49, GLASS + 0.02], `<text id="effekt" class="lcd-rod" text-anchor="middle" font-size="3.4" y="1.2">0</text>`));
  out.push(`<g id="falt"></g>`);
  return out.join("");
}

function pan() {
  const [x, y] = Z1;
  const body = k.cylinder(x, y, PAN_R, GLASS, PAN_H, P, 48, 0.4);
  return `<g id="kastrull">${box(x + PAN_R - 1, y - 2, 16, 4, GLASS + 5, 2, "handtag", 1, 0.3)}${S(body, "kastrull")}<path id="glod" class="glod" d="${body.fill}"/><path class="olja" d="${k.ring(x, y, PAN_R - 1, GLASS + PAN_H - 1.4, P, 48)}"/><path class="iso-line" data-tone="lo" d="${k.ring(x, y, PAN_R - 0.8, GLASS + PAN_H, P, 48)}"/></g>`;
}

function magnet() {
  const [x, y, z] = MAGNET_HOME;
  return `<g id="magnet">${box(x - 2.2, y - 1, 4.4, 2, z, 3.2, "magnet", 0.6, 0.3)}</g>`;
}

function lid() {
  const [x, y, z] = LID_HOME;
  return `<g id="lock">${can(x, y, PAN_R + 0.8, z, 0.9, "lock")}${can(x, y, 1.8, z + 0.9, 2, "lockknopp")}</g>`;
}

const WORDS = [
  { text: "klick", at: [36, 56, 98] },
  { text: "pip", at: [56, 56, 96] },
  { text: "fräs", at: [24, 40, 110] },
  { text: "fwoosh!", at: [30, 46, 126] },
  { text: "klonk", at: [56, 44, 112] },
  { text: "pip", at: [56, 56, 96] },
];

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "En köksbänk med en induktionshäll. Glaset är lite genomskinligt så att kopparspolarna under syns. En kastrull med olja står på en kokzon, ett lock ligger bredvid på bänken och en magnet ligger framme. På väggen sitter en brandfilt och på golvet står en pulversläckare på 6 kg.",
  body: [room(), counter(), hob(), pan(), magnet(), `<g id="rok"></g>`, `<g id="eld"></g>`, lid(), ordSvg(WORDS.length)],
});

const HINTS = {
  start: "En induktionshäll värmer bara kastruller som en magnet fastnar på. Och om olja börjar brinna ska elden kvävas, aldrig släckas med vatten.",
  steps: [
    "Håll en magnet mot kastrullens botten. Fastnar den, fungerar kastrullen på induktion.",
    "Spolen under glaset gör ett magnetfält som värmer kastrullens botten direkt.",
    "Lämna aldrig spisen när du lagar mat. Oljan blir allt varmare och börjar ryka.",
    "Nu brinner oljan. Häll aldrig vatten på: vatten får lågorna att spridas.",
    "Lägg på locket. Då kommer ingen luft in och elden kvävs.",
    "Stäng av plattan och ställ undan kastrullen med locket kvar.",
  ],
  cold: [
    "Håll en magnet mot kastrullens botten. Den fastnar inte: kastrullen fungerar inte på induktion.",
    "Magnetfältet värmer inte en kastrull av {material}. Den förblir kall.",
    "Kastrullen blir inte varm, så inget händer. Lämna ändå aldrig spisen när den är på.",
    "Ingen eld här. Om olja börjar brinna: häll aldrig vatten på.",
    "Lägg på locket ändå. Det är så man kväver en brand i en kastrull.",
    "Stäng av plattan och ställ undan kastrullen.",
  ],
  done: "Klart. Har du en brandfilt och en pulversläckare på 6 kilo hemma är du ännu bättre rustad.",
};

const FIG_JS = `
const bez = (a, b, c, d, u) => a.map((_, i) => { const v = 1 - u; return v * v * v * a[i] + 3 * v * v * u * b[i] + 3 * v * u * u * c[i] + u * u * u * d[i]; });
const PAN_TOP = [Z1[0], Z1[1], GLASS + PAN_H];
const LID_PATH = [LID_HOME, [LID_HOME[0], LID_HOME[1] + 4, 124], [PAN_TOP[0] + 8, PAN_TOP[1], 124], PAN_TOP];
const AWAY = [Z2[0] - Z1[0], Z2[1] - Z1[1], 0];
const MAGNET_STUCK = [Z1[0], Z1[1] + PAN_R + 1.2, GLASS + 0.6];
const MAGNET_FALLEN = [Z1[0] - 2, Z1[1] + PAN_R + 5, 90];
function flames(amount, t) {
  if (amount < 0.01) return "";
  const [cx, cy] = iso([Z1[0], Z1[1], GLASS + PAN_H - 1], P);
  const k = 5.2 * amount;
  let svg = "";
  [[-5, 1.0, 0], [0, 1.4, 1.7], [5, 0.9, 3.1], [-2, 0.7, 4.4], [3, 0.8, 5.2]].forEach(([dx, h, ph], i) => {
    const w = Math.sin(t * 8 + ph) * 1.6 * amount, hh = (11 + 4 * Math.sin(t * 6.3 + ph)) * h * k;
    const x = cx + dx * k * 0.9, y = cy;
    const outer = "M" + (x - 3.4 * k) + " " + y + " C" + (x - 3.6 * k) + " " + (y - hh * 0.5) + " " + (x + w) + " " + (y - hh * 0.7) + " " + (x + w * 1.6) + " " + (y - hh) + " C" + (x + 2.8 * k) + " " + (y - hh * 0.6) + " " + (x + 3.6 * k) + " " + (y - hh * 0.3) + " " + (x + 3.4 * k) + " " + y + " Z";
    svg += '<path class="flamma' + (i > 2 ? " inre" : "") + '" d="' + outer + '"/>';
  });
  return '<g style="opacity:' + Math.min(1, amount * 1.6).toFixed(3) + '">' + svg + "</g>";
}
function smoke(amount, t, away) {
  if (amount < 0.01) return "";
  let svg = "";
  for (let i = 0; i < 6; i++) {
    const u = (t * 0.35 + i / 6) % 1;
    const p = iso([Z1[0] - 3 + 6 * Math.sin(i * 2.1 + t), Z1[1] - 4 * u, GLASS + PAN_H + 4 + 46 * u], P);
    const a = amount * Math.sin(Math.PI * u) * 0.8;
    svg += '<circle class="rok" r="' + (4 + 11 * u).toFixed(2) + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" style="opacity:' + a.toFixed(3) + '"/>';
  }
  return svg;
}
function field(on, t, magnetic) {
  if (on < 0.01) return "";
  let svg = "";
  for (let i = 0; i < 3; i++) {
    const u = (t * 0.7 + i / 3) % 1;
    svg += '<path class="falt" style="opacity:' + (on * (1 - u) * (magnetic ? 0.9 : 0.6)).toFixed(3) + '" d="' + ring(Z1[0], Z1[1], PAN_R + 1 + 7 * u, GLASS + 0.3 + 2 * u, P, 48) + '"/>';
  }
  return svg;
}
const FIG = {
  id: "spis",
  init(s) { $("kastrull").setAttribute("data-m", String(s.setting)); },
  reglage: (s) => "Kastrull av " + s.material.label + (s.magnetic ? "" : ' <span class="varning">fungerar inte på induktion</span>'),
  rita(st, t, s) {
    const away = AWAY.map((v) => v * st.away);
    $("kastrull").setAttribute("transform", translateAlong(P, away));
    $("glod").style.opacity = (0.6 * st.heat).toFixed(3);
    const mp = s.magnetic ? MAGNET_STUCK : MAGNET_FALLEN;
    let m = MAGNET_HOME.map((v, i) => v + (MAGNET_STUCK[i] - v) * st.magnet);
    if (!s.magnetic) m = m.map((v, i) => v + (MAGNET_FALLEN[i] - MAGNET_STUCK[i]) * st.drop);
    if (s.magnetic) m = m.map((v, i) => v + away[i]);
    $("magnet").setAttribute("transform", translateAlong(P, [m[0] - MAGNET_HOME[0], m[1] - MAGNET_HOME[1], m[2] - MAGNET_HOME[2]]));
    const lp = st.lid < 1 ? bez(...LID_PATH, st.lid) : PAN_TOP;
    $("lock").setAttribute("transform", translateAlong(P, [lp[0] - LID_HOME[0] + away[0], lp[1] - LID_HOME[1] + away[1], lp[2] - LID_HOME[2]]));
    $("falt").innerHTML = field(st.on, t, s.magnetic);
    $("rok").innerHTML = smoke(st.smoke, t, st.away);
    $("eld").innerHTML = flames(st.fire, t);
    $("effekt").textContent = st.on > 0.5 ? "9" : "0";
    WORDS.forEach((w, i) => visaOrd(i, i === 0 && !s.magnetic ? "plopp" : w.text, w.at, st, st.step === i && (s.magnetic || i < 2 || i > 3)));
  },
  texter(st, t, s) {
    const list = s.magnetic ? HINTS.steps : HINTS.cold;
    let hint = t < START[0] ? HINTS.start : list[st.step].replace("{material}", s.material.label);
    if (t >= END[END.length - 1]) hint = HINTS.done;
    return {
      hint,
      chips: {
        magnet: s.magnetic ? (st.magnet > 0.95 ? "fastnar" : "–") : st.drop > 0.5 ? ["fastnar inte", true] : "–",
        kastrull: st.heat < 0.15 ? "kall" : st.heat < 0.8 ? "varm" : ["het", true],
        eld: st.fire > 0.05 ? ["brinner", true] : st.lid > 0.6 && s.magnetic ? "kvävd med locket" : "ingen",
        platta: st.on > 0.5 ? "på" : "av",
        hemma: "brandfilt och 6 kg pulversläckare",
      },
    };
  },
};
`;

writePage({
  id: "spis",
  here: HERE,
  P,
  kicker: "Fig 9 · Spisen",
  title: "Induktion och spisbrand",
  question: "Hur värmer en induktionshäll, och vad gör du om det börjar brinna i kastrullen?",
  startHint: HINTS.start,
  steps: ["Magnettestet", "Slå på plattan", "Gå inte ifrån", "Det börjar brinna", "Lägg på locket", "Stäng av och ställ undan"],
  slider: { label: "Kastrullens material", min: 0, max: 3, step: 1, value: 0 },
  chips: [
    { id: "magnet", label: "Magneten", width: 11 },
    { id: "kastrull", label: "Kastrullen", width: 4 },
    { id: "eld", label: "Elden", width: 15 },
    { id: "platta", label: "Plattan", width: 2 },
    { id: "hemma", label: "Bra att ha" },
  ],
  idea: "eld behöver luft. Ett lock tar bort luften och kväver branden, vatten får den att spridas.",
  swatch: {
    label: "Färg på skåpen",
    var: "skap",
    options: {
      salvia: ["#dfe9e3", "#bfd3c7", "#9fb9aa"],
      gul: ["#f8e3a0", "#f1c75a", "#d6a73c"],
      blå: ["#d5e4f3", "#a9c6e6", "#82a6cf"],
      vit: ["#fbf9f4", "#ece7dc", "#d3cbbb"],
    },
  },
  materials: {
    vagg: ["#efe8da", "#e6dece", "#d6ccb8"],
    golv: ["#e6dbc6", "#d6c9b0", "#c3b499"],
    kakel: ["#f3efe6", "#e7e0d2", "#d4cab6"],
    sockel: ["#b7c2cf", "#9aa7b6", "#7f8c9b"],
    skiva: ["#e9e4da", "#d4cdbf", "#b9b1a1"],
    plat: ["#8a919c", "#6b727d", "#555b64"],
    glas: ["#5d6675", "#3d4553", "#2c323d"],
    handtag: ["#5d6675", "#3d4553", "#2c323d"],
    kastrull: ["#7d8693", "#5d6675", "#454c58"],
    lock: ["#eef1f4", "#cdd3da", "#a9b2bd"],
    lockknopp: ["#5d6675", "#3d4553", "#2c323d"],
    magnet: ["#ff9a8a", "#e8584a", "#c03f33"],
    brandfilt: ["#ff8f80", "#e04b3c", "#b8382c"],
    slackare: ["#ff8f80", "#e04b3c", "#b8382c"],
    flakt: ["#eef1f4", "#cdd3da", "#a9b2bd"],
    krom: ["#f4f6f9", "#c9ced6", "#98a1ad"],
  },
  css: `
.stage svg{overflow:hidden}
.scene .genom{opacity:.62}
.scene .spole{fill:none;stroke:#d9893a;stroke-width:1.4px}
.scene .zon{stroke:#e6e9ee;stroke-width:1px}
.scene .lcd-rod{fill:#ff6b5a;font-family:ui-monospace,Menlo,monospace;font-weight:700}
.scene .falt{fill:none;stroke:#8a6be0;stroke-width:2.2px;stroke-dasharray:5 3}
.scene .glod{fill:#ff7a2e;stroke:none;mix-blend-mode:multiply}
.scene .olja{fill:#f2c75a;stroke:var(--ink);stroke-width:1px}
.scene .rok{fill:#b9b4ab;stroke:#8d877c;stroke-width:1px}
.scene .flamma{fill:#ff8a3d;stroke:#b8441c;stroke-width:1.2px;stroke-linejoin:round}
.scene .flamma.inre{fill:#ffd45c;stroke:#e08a2a}
.scene .skylt.ljus{fill:#fffaf0}
#kastrull[data-m="0"] .c-kastrull{--l:#7d8693;--m:#5d6675;--d:#454c58}
#kastrull[data-m="1"] .c-kastrull{--l:#f4f6f9;--m:#c9ced6;--d:#98a1ad}
#kastrull[data-m="2"] .c-kastrull{--l:#f7f8fa;--m:#dfe3e8;--d:#bcc3cc}
#kastrull[data-m="3"] .c-kastrull{--l:#f6c49a;--m:#de8f55;--d:#b86a35}
`,
  svg,
  sources:
    'Källor: <a href="https://support.electrolux.se/support-articles/article/vilka-kokkarl-ar-lampliga-for-induktionshall" target="_blank" rel="noopener">Electrolux</a> och <a href="https://support.aeg.se/support-articles/article/vilka-kokkarl-ar-lampliga-for-induktionshall" target="_blank" rel="noopener">AEG: Vilka kokkärl är lämpliga för induktionshäll?</a> (magnettestet, vilka material som fungerar). <a href="https://rib.msb.se/filer/pdf/31375.pdf" target="_blank" rel="noopener">Myndigheten för civilt försvar: Skydda dig mot brand hemma</a> (lämna inte spisen, lock eller brandfilt kväver branden, aldrig vatten, 6 kg pulversläckare). <a href="https://www.rsgbg.se/hem-och-fritid/brandsakert-hemma/brand-pa-spisen/" target="_blank" rel="noopener">Räddningstjänsten Storgöteborg: Brand på spisen</a>. <a href="https://www.svt.se/nyheter/lokalt/vast/sa-startade-branden-i-kortedala" target="_blank" rel="noopener">SVT om räddningstjänstens råd</a> (lägg på locket, stäng av spisen, ställ bort kastrullen). Inga temperaturer eller tider visas: de saknar källa.',
  figData: { GLASS, Z1, Z2, PAN_R, PAN_H, LID_HOME, MAGNET_HOME, WORDS, HINTS },
  figJs: FIG_JS,
});
