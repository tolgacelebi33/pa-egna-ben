// Diskmaskin i en diskbänk, uppskuren från sidan: korgar, spolarmar som snurrar, filter, och en tavla
// som jämför vatten per disk med handdisk. Kör: node figurer-anatomy/diskmaskin/build.mjs  →  diskmaskin.html
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../../vendor/anatomy/kit/lathe.mjs";
import { writePage, ordSvg } from "../delat/sida.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 900;
const HEIGHT = 820;

// Världen i cm. Diskmaskinen står längst till höger (x 0..60) och är uppskuren vid x = 58.
const HUB = [30, 30]; // spolarmarnas nav
const LOWER_Z = 15;
const UPPER_Z = 48;
const OUT = 36; // så långt filter och spolarm glider ut genom snittet när de rensas

const P = k.fitProjection(
  [...k.boxCorners({ x: -74, y: -4, w: 178, d: 70 }, -3, 150)],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 40, elevation: 24 },
);

const at = (p) => k.iso(p, P);
const S = (paths, c, extra = {}) => k.solidSvg(paths, { className: `c-${c}`, ...extra });
const box = (x, y, w, d, z, h, c, r = 1, bevel = 0, extra) => S(k.slabOf({ x, y, w, d, r }, z, h, P, 4, bevel), c, extra);
const can = (x, y, r, z, h, c, extra) => S(k.cylinder(x, y, r, z, h, P, 36, 0.3), c, extra);
const L = (d, tone = "lo", extra = {}) => k.lineSvg(d, { tone, ...extra });
const seg = (a, b) => k.segment(a, b, P);
const quad = (pts) => k.pathOf(pts.map(at), true);
const front = ([x, y, z], inner) => `<g transform="${k.sideMatrix([x, y], z, P, "left")}">${inner}</g>`;
const disc = (c, axis, r, t, cls) => S(G.disc(-t / 2, t / 2, r, G.frameAlong(c, axis), P), cls);

function room() {
  const out = [];
  out.push(box(-74, -4, 138, 4, -3, 153, "kakel", 0));
  out.push(box(-74, 0, 178, 70, -3, 3, "golv", 0));
  const grid = [];
  for (let x = -62; x < 104; x += 15) grid.push(seg([x, 0, 0], [x, 70, 0]));
  for (let y = 15; y < 70; y += 15) grid.push(seg([-74, y, 0], [104, y, 0]));
  out.push(L(grid.join(""), "faint"));
  const tiles = [];
  for (let x = -64; x < 64; x += 10) tiles.push(seg([x, 0, 90], [x, 0, 150]));
  for (let z = 100; z < 150; z += 10) tiles.push(seg([-74, 0, z], [64, 0, z]));
  out.push(L(tiles.join(""), "faint"));
  out.push(L(seg([64, 0, 0], [64, 0, 150]), "lo"));
  out.push(`<path class="skugga" d="${quad([[1, 0, 101], [57, 0, 101], [57, 0, 143], [1, 0, 143]])}"/>`);
  return out.join("");
}

// Tavlan på väggen: staplar för liter per disk, ritade i väggens plan.
function poster() {
  const out = [box(4, 0, 54, 0.6, 104, 42, "papper", 0.6)];
  const scale = 1.05; // cm per liter på tavlan
  const ticks = [0, 10, 20, 30, 40].map((l) => `<line class="tick" x1="${(l * scale).toFixed(1)}" y1="31" x2="${(l * scale).toFixed(1)}" y2="33"/><text class="tavla" x="${(l * scale).toFixed(1)}" y="36" text-anchor="middle" font-size="2.6">${l}</text>`).join("");
  out.push(front([8, 0.6, 142], `<text class="tavla rubrik" x="0" y="4" font-size="3.6">Liter vatten per disk</text>
    <text class="tavla" x="0" y="12" font-size="3">Maskin</text><rect class="stapel-bak" x="0" y="13.5" width="${(46.4).toFixed(1)}" height="5"/><rect id="stapel-maskin" class="stapel maskin" x="0" y="13.5" width="0" height="5"/>
    <text class="tavla" x="0" y="24" font-size="3">För hand</text><rect class="stapel-bak" x="0" y="25.5" width="${(46.4).toFixed(1)}" height="5"/><rect id="stapel-hand" class="stapel hand" x="0" y="25.5" width="0" height="5"/>
    <line class="tick" x1="0" y1="31" x2="46.4" y2="31"/>${ticks}`));
  return out.join("");
}

function sink() {
  const out = [];
  out.push(box(-70, 2, 69, 54, 0, 10, "sockel", 0.5));
  out.push(box(-70, 2, 69, 58, 10, 76, "skap", 1, 0.6));
  out.push(L(seg([-35.5, 60, 10], [-35.5, 60, 86]), "lo"));
  for (const x of [-40, -31]) out.push(box(x - 0.8, 60, 1.6, 1.6, 66, 12, "krom", 0.6));
  // Diskhon: botten och de inre väggar som syns, sedan bänkskivan runt hålet.
  out.push(box(-60, 12, 46, 38, 68, 2, "rostfri", 2));
  out.push(box(-60, 10, 46, 2, 68, 20, "rostfri", 0.4));
  out.push(box(-62, 12, 2, 38, 68, 20, "rostfri", 0.4));
  out.push(`<path class="hal" d="${k.ring(-37, 31, 2.6, 70.05, P, 24)}"/>`);
  return out.join("");
}

// Bänkskivan ritas sist, ovanpå diskmaskinen, med hål för diskhon. Kranen står på den.
function worktop() {
  const out = [];
  out.push(box(-74, 0, 138, 12, 86, 4, "skiva", 0.6, 0.6));
  out.push(box(-74, 12, 12, 38, 86, 4, "skiva", 0.4));
  out.push(box(-14, 12, 78, 38, 86, 4, "skiva", 0.4));
  out.push(box(-74, 50, 138, 12, 86, 4, "skiva", 0.6, 0.6));
  out.push(can(-37, 6, 2.6, 90, 3, "krom"));
  out.push(can(-37, 6, 1.6, 93, 18, "krom"));
  out.push(S(G.solidOf([[0, 1.4], [16, 1.4]], G.frameAlong([-37, 6, 110], [0, 1, 0]), P), "krom"));
  out.push(can(-37, 22, 1.6, 104, 6, "krom"));
  out.push(box(-38, 2, 2, 8, 112, 2, "krom", 0.6));
  return out.join("");
}

function tubInside() {
  const out = [];
  out.push(box(0, 4, 60, 56, 0, 10, "sockel", 0.5));
  out.push(box(2, 2, 56, 2, 12, 72, "tub", 0.4));
  out.push(box(2, 4, 2, 52, 12, 72, "tub", 0.4));
  out.push(box(2, 4, 56, 52, 10, 2, "tub", 0.4));
  out.push(`<path class="hal" d="${k.ring(HUB[0], HUB[1] + 14, 7, 12.05, P, 36)}"/>`);
  out.push(`<g id="vatten"></g>`);
  out.push(`<g id="filter">${can(HUB[0], HUB[1] + 14, 4.2, 9, 6, "filter")}${k.dotsSvg([[-1.4, 0.4], [1.2, -0.8], [0.4, 1.6], [-0.6, -1.8], [2, 1]].map(([dx, dy]) => at([HUB[0] + dx, HUB[1] + 14 + dy, 15.05])), { size: 0.9, tone: "hi" }).replace('class="iso-dots"', 'id="smulor" class="iso-dots smulor"')}</g>`);
  out.push(can(HUB[0], HUB[1], 2.4, 12, 3, "plast"));
  out.push(`<g id="arm-nere"></g>`);
  return out.join("");
}

// Korg av gallertråd: botten som rutnät inom ramen, och kanter som tunna slabbar.
function basket(z, x0, x1, y0, y1, h, back) {
  const plan = { x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: 1.5 };
  if (back) {
    const wires = [];
    for (let x = x0 + 4; x < x1; x += 4) wires.push(seg([x, y0, z], [x, y1, z]));
    for (let y = y0 + 4; y < y1; y += 4) wires.push(seg([x0, y, z], [x1, y, z]));
    return L(k.planOutline(plan, z, P, 4), "mid") + L(wires.join(""), "lo", { className: "trad" }) + box(x0, y0, x1 - x0, 0.8, z, h, "korg", 0.3) + box(x0, y0, 0.8, y1 - y0, z, h, "korg", 0.3);
  }
  return box(x1 - 0.8, y0, 0.8, y1 - y0, z, h, "korg", 0.3) + box(x0, y1 - 0.8, x1 - x0, 0.8, z, h, "korg", 0.3);
}

function dishes() {
  const lower = [];
  for (let x = 12; x <= 48; x += 6) lower.push(disc([x, 30, 30], [1, 0, 0], 10, 1, x % 12 ? "tallrik" : "tallrik2"));
  const upper = [];
  for (const [x, y] of [[12, 16], [24, 16], [36, 16], [48, 16], [12, 30], [24, 30], [36, 30], [48, 30], [12, 44], [24, 44], [36, 44], [48, 44]].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    upper.push((x + y) % 24 ? can(x, y, 3.4, 53.4, 8, "kopp") : can(x, y, 3, 53.4, 10, "glas"));
  }
  return { lower: `<g id="disk-nere">${lower.join("")}</g>`, upper: `<g id="disk-uppe">${upper.join("")}</g>` };
}

function casing() {
  const out = [];
  out.push(box(58, 2, 2, 6, 10, 76, "maskin", 0.4));
  out.push(box(58, 8, 2, 48, 80, 6, "maskin", 0.4));
  // Luckan, stängd, med display och startknapp.
  out.push(box(0, 56, 60, 6, 10, 76, "maskin", 1, 0.6));
  out.push(front([30, 62, 82], `<rect class="display" x="-18" y="-1" width="36" height="7" rx="1"/><text id="display-tid" class="lcd" x="-16" y="4.2" font-size="3.8">2:12</text><text id="display-liter" class="lcd" x="16" y="4.2" font-size="3.8" text-anchor="end">0,0 l</text>`));
  out.push(`<g id="knapp">${can(52, 62.2, 1.6, 79, 0.01, "plast").replace("iso-solid", "iso-solid")}</g>`);
  out.push(front([52, 62, 80], `<circle id="knapp-lampa" class="lampa" r="1.6"/>`));
  out.push(box(8, 62, 44, 1.6, 74, 2.2, "krom", 0.8));
  return out.join("");
}

const WORDS = [
  { text: "klirr", at: [66, 30, 66] },
  { text: "pip", at: [54, 70, 92] },
  { text: "swisch swisch", at: [66, 30, 40] },
  { text: "plask", at: [-36, 40, 100] },
  { text: "plock", at: [66, 40, 30] },
  { text: "peta peta", at: [66, 30, 50] },
];

const dish = dishes();
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "En diskbänk med diskho och en diskmaskin längst till höger. Diskmaskinens sida är uppskuren: inuti syns en nedre korg med tallrikar, en övre korg med koppar och glas, två spolarmar som snurrar och sprutar, och ett filter i botten. På väggen sitter en tavla som jämför liter vatten per disk i maskin och för hand.",
  body: [
    room(),
    poster(),
    sink(),
    tubInside(),
    basket(18, 6, 54, 8, 52, 9, true),
    dish.lower,
    `<g id="strale-nere"></g>`,
    basket(18, 6, 54, 8, 52, 9, false),
    `<g id="arm-uppe"></g>`,
    `<g id="strale-uppe"></g>`,
    basket(52, 6, 54, 8, 52, 7, true),
    dish.upper,
    basket(52, 6, 54, 8, 52, 7, false),
    casing(),
    worktop(),
    ordSvg(WORDS.length),
  ],
});

const HINTS = {
  start: "En diskmaskin med sidan uppskuren, så att du ser vad som händer inuti. Tavlan visar hur mycket vatten det går åt.",
  steps: [
    "Tallrikarna i den nedre korgen, koppar och glas i den övre.",
    "Stäng luckan och tryck på start. Det rinner in lite vatten i botten.",
    "Spolarmarna snurrar och sprutar vatten på disken. Hela programmet tar 2 timmar och 12 minuter.",
    "För hand gick det åt nästan fyra gånger så mycket vatten för samma disk.",
    "Kolla filtret i botten efter varje disk. Vrid loss det, lyft ur det och skölj bort matresterna.",
    "Hålen i spolarmarna kan täppas igen. Ta loss armen och rensa hålen, till exempel med en tandpetare.",
  ],
  done: "Klart. Ren disk, rent filter och fria hål i spolarmen.",
};

const FIG_JS = `
const HOLES = [-17, -11, -5, 5, 11, 17];
function arm(cx, cy, z, len, w, turn, lift, clog) {
  const a = turn * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
  const pt = (u, v) => [cx + u * c - v * s, cy + u * s + v * c];
  const ring = [pt(-len / 2, -w / 2), pt(len / 2, -w / 2), pt(len / 2, w / 2), pt(-len / 2, w / 2)];
  const zz = z + lift;
  const holes = HOLES.filter((u) => Math.abs(u) < len / 2 - 1).map((u) => iso([...pt(u, 0), zz + 1.4], P));
  return solidSvg(extrude(ring, zz, 1.4, P), { className: "c-plast" }) +
    '<g class="hal-prick" style="opacity:' + (0.25 + 0.75 * clog).toFixed(3) + '">' + dotsSvg(holes, { size: 0.7, tone: "hi" }) + "</g>";
}
function jets(cx, cy, z, len, turn, amount, height, t) {
  if (amount < 0.01) return "";
  const a = turn * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
  let d = "";
  for (const u of HOLES) {
    if (Math.abs(u) >= len / 2 - 1) continue;
    const x = cx + u * c, y = cy + u * s;
    d += segment([x, y, z + 1.6], [x + 1.5 * Math.sign(u) * -s, y + 1.5 * Math.sign(u) * c, z + height], P);
  }
  return '<path class="jet" d="' + d + '" style="opacity:' + amount.toFixed(3) + ";stroke-dashoffset:" + (-t * 40).toFixed(1) + '"/>';
}
const FIG = {
  id: "diskmaskin",
  reglage: (s) => s.perWeek + " diskar i veckan",
  rita(st, t, s) {
    $("disk-nere").style.opacity = st.dishes.toFixed(3);
    $("disk-uppe").style.opacity = st.dishes.toFixed(3);
    $("disk-nere").setAttribute("transform", translateAlong(P, [0, 0, 6 * (1 - st.dishes)]));
    $("disk-uppe").setAttribute("transform", translateAlong(P, [0, 0, 6 * (1 - st.dishes)]));
    $("vatten").innerHTML = st.water < 0.01 ? "" : solidSvg(slabOf({ x: 4, y: 6, w: 52, d: 48, r: 1 }, 12, 0.2 + 1.4 * st.water, P, 2), { className: "c-vatten", crease: "none" });
    $("vatten").style.opacity = Math.min(1, st.water * 3).toFixed(3);
    $("arm-nere").innerHTML = arm(HUB[0], HUB[1], LOWER_Z, 44, 4, st.spin, 0, st.clogged);
    $("arm-nere").setAttribute("transform", translateAlong(P, [OUT * st.armLift, 0, 1.5 * Math.min(1, st.armLift * 4)]));
    $("arm-uppe").innerHTML = arm(HUB[0], HUB[1], UPPER_Z, 38, 3.4, -st.spin * 1.3, 0, st.clogged);
    $("strale-nere").innerHTML = jets(HUB[0], HUB[1], LOWER_Z, 44, st.spin, st.jets, 14, t);
    $("strale-uppe").innerHTML = jets(HUB[0], HUB[1], UPPER_Z, 38, -st.spin * 1.3, st.jets, 5, t);
    $("filter").setAttribute("transform", translateAlong(P, [OUT * st.filterLift, 0, 3.6 * Math.min(1, st.filterLift * 4)]));
    $("smulor").style.opacity = st.crumbs.toFixed(3);
    const h = Math.floor(st.minutesLeft / 60), m = Math.floor(st.minutesLeft % 60);
    $("display-tid").textContent = h + ":" + String(m).padStart(2, "0");
    $("display-liter").textContent = fmt(st.machineL) + " l";
    document.querySelector(".display").style.opacity = (0.35 + 0.65 * st.on).toFixed(3);
    $("knapp-lampa").style.opacity = st.on.toFixed(3);
    $("knapp").setAttribute("transform", translateAlong(P, [0, -0.8 * st.press, 0]));
    $("stapel-maskin").setAttribute("width", (st.machineL * 1.05).toFixed(2));
    $("stapel-hand").setAttribute("width", (st.handL * 1.05).toFixed(2));
    WORDS.forEach((w, i) => visaOrd(i, w.text, w.at, st));
  },
  texter(st, t, s) {
    let hint = t < START[0] ? HINTS.start : HINTS.steps[st.step];
    if (t >= END[END.length - 1]) hint = HINTS.done;
    return {
      hint,
      chips: {
        maskin: fmt(st.machineL) + " l",
        hand: fmt(st.handL) + " l",
        tid: Math.floor(st.minutesLeft / 60) + " h " + String(Math.floor(st.minutesLeft % 60)).padStart(2, "0") + " min",
        ar: s.yearMachine.toLocaleString("sv-SE") + " l i maskin · " + s.yearHand.toLocaleString("sv-SE") + " l för hand",
        filter: st.crumbs > 0.5 ? ["matrester", st.step >= 3] : "rent",
      },
    };
  },
};
`;

writePage({
  id: "diskmaskin",
  here: HERE,
  P,
  kicker: "Fig 8 · Diskmaskinen",
  title: "Hur mycket vatten drar en disk?",
  question: "Vad händer inne i diskmaskinen, och drar den mer vatten än att diska för hand?",
  startHint: HINTS.start,
  steps: ["Ställ in disken", "Starta", "Spolarmarna sprutar", "Jämför med handdisk", "Rensa filtret", "Rensa spolarmen"],
  slider: { label: "Diskar per vecka", min: 1, max: 7, step: 1, value: M.SETTING_DEFAULT },
  chips: [
    { id: "maskin", label: "Maskin", width: 6 },
    { id: "hand", label: "För hand", width: 6 },
    { id: "tid", label: "Kvar på programmet", width: 9 },
    { id: "ar", label: "Per år" },
    { id: "filter", label: "Filtret", width: 9 },
  ],
  idea: "i Råd & Röns test drog diskmaskinen 11,8 liter per disk. För hand gick det åt 44,2 liter för samma disk.",
  swatch: {
    label: "Färg på diskmaskinen",
    var: "maskin",
    options: {
      vit: ["#fbf9f4", "#ece7dc", "#d3cbbb"],
      rostfri: ["#eef1f4", "#cdd3da", "#a9b2bd"],
      blå: ["#cfe3f7", "#93bde8", "#6d9bcf"],
      röd: ["#f6b3a8", "#e8786a", "#c95a4d"],
    },
  },
  materials: {
    kakel: ["#f0ece4", "#e4ddd0", "#d2c8b6"],
    golv: ["#e6dbc6", "#d6c9b0", "#c3b499"],
    skap: ["#dfe9e3", "#bfd3c7", "#9fb9aa"],
    sockel: ["#b7c2cf", "#9aa7b6", "#7f8c9b"],
    skiva: ["#f1d3a6", "#ddb27a", "#b88a54"],
    rostfri: ["#eef1f4", "#cdd3da", "#a9b2bd"],
    tub: ["#f2f4f6", "#dde2e8", "#c3cad3"],
    korg: ["#d9dde3", "#aeb6c1", "#8b95a3"],
    plast: ["#dbe1ec", "#a9b4c8", "#8592aa"],
    filter: ["#e3e7ee", "#b8c0cc", "#929cab"],
    tallrik: ["#ffffff", "#f1ece1", "#d9d1c0"],
    tallrik2: ["#fdf3dc", "#f4dfae", "#dcc285"],
    kopp: ["#ffe0c2", "#f7b783", "#d9915a"],
    glas: ["#e8f6fb", "#c7e7f2", "#a3cfe0"],
    vatten: ["#cfe9f7", "#8cc8ea", "#5fa8d6"],
    papper: ["#fffdf6", "#f5f0e2", "#e2d9c4"],
    krom: ["#f4f6f9", "#c9ced6", "#98a1ad"],
  },
  css: `
.scene .hal{fill:#4a5872;stroke:var(--ink);stroke-width:1px}
.scene .trad{stroke:#7d8693;stroke-width:.7px}
.scene .jet{fill:none;stroke:#3f8fc7;stroke-width:1.8px;stroke-dasharray:3 4;stroke-linecap:round}
.scene .display{fill:#2f3d33;stroke:var(--ink);stroke-width:1px;vector-effect:non-scaling-stroke}
.scene .lcd{fill:#b8f0a8;font-family:ui-monospace,Menlo,monospace;font-weight:700}
.scene .lampa{fill:#7be06a;stroke:var(--ink);stroke-width:1px;vector-effect:non-scaling-stroke}
.scene .tavla{fill:var(--ink);font-family:var(--sans)}
.scene .tavla.rubrik{font-weight:800}
.scene .stapel-bak{fill:#ece6d6}
.scene .stapel{stroke:var(--ink);stroke-width:1px;vector-effect:non-scaling-stroke}
.scene .stapel.maskin{fill:#5fa8d6}
.scene .stapel.hand{fill:#f39c4a}
.scene .tick{stroke:var(--ink);stroke-width:.9px;vector-effect:non-scaling-stroke}
.scene .smulor circle{fill:#9a6b3f;opacity:1}
`,
  svg,
  sources:
    'Källor: <a href="https://www.radron.se/globalassets/pdf-tidningen/radron_04_2015_handdisk.pdf" target="_blank" rel="noopener">Råd & Rön 4/2015: Vi testar handdisk</a> (huvudprogram 11,8 l, 0,99 kWh och 2 h 12 min per disk; handdisk 44,2 l, 1,27 kWh och 52 min; samma nedsmutsade disk). <a href="https://support.electrolux.se/support-articles/article/hur-du-rengor-och-underhaller-din-diskmaskin-fran-electrolux" target="_blank" rel="noopener">Electrolux: Hur du rengör och underhåller din diskmaskin</a> (kontrollera filtren efter varje användning, rengör spolarmarnas hål). Siffrorna gäller en maskin och en testpanel; andra maskiner och diskvanor ger andra värden. Årssiffran är räknad på 52 veckor.',
  figData: { HUB, LOWER_Z, UPPER_Z, OUT, WORDS, HINTS },
  figJs: FIG_JS,
});
