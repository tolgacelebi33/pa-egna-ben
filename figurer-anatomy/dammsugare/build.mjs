// Golvdammsugare på en matta, uppskuren på sidan så att påsen, filtren och motorn syns, med luftens väg genom den.
// Kör: node figurer-anatomy/dammsugare/build.mjs  →  dammsugare.html
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

// Världen i cm. Dammsugarens kropp: x 98..134, y 20..50, uppskuren vid framsidan y = 50.
const MOUTH = [70, 68, 1]; // munstyckets öppning
const INLET = [98, 35, 14];
const HANDLE = [84, 56, 46];
const PLUG = [128, 0.8, 26];
const CABLE_END = [128, 10, 26];
const BAG = { x: 103, y: 27, w: 13, d: 16, z: 7, h: 14 };
const LIFT = 22; // så högt påse och filter lyfts ur
const HOSE_TOP = [92, 50, 52];
const HOSE_MID = [96, 42, 30];

const P = k.fitProjection(
  [...k.boxCorners({ x: 52, y: 14, w: 90, d: 72 }, 0, 52)],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 52, elevation: 32 },
);

const at = (p) => k.iso(p, P);
const S = (paths, c, extra = {}) => k.solidSvg(paths, { className: `c-${c}`, ...extra });
const box = (x, y, w, d, z, h, c, r = 1, bevel = 0, extra) => S(k.slabOf({ x, y, w, d, r }, z, h, P, 4, bevel), c, extra);
const can = (x, y, r, z, h, c, extra) => S(k.cylinder(x, y, r, z, h, P, 36, 0.3), c, extra);
const L = (d, tone = "lo", extra = {}) => k.lineSvg(d, { tone, ...extra });
const seg = (a, b) => k.segment(a, b, P);
const quad = (pts) => k.pathOf(pts.map(at), true);
const along = (o, dir, profile, c) => S(G.solidOf(profile, G.frameAlong(o, dir), P), c);

function room() {
  const out = [];
  out.push(box(-6, -4, 150, 4, -2, 68, "vagg", 0));
  out.push(box(-6, 0, 150, 96, -2, 2, "golv", 0));
  const boards = [];
  for (let x = 6; x < 144; x += 12) boards.push(seg([x, 0, 0], [x, 96, 0]));
  out.push(L(boards.join(""), "faint"));
  out.push(box(-6, 0, 150, 1.4, 0, 7, "list", 0.3));
  // Eluttaget med kontakten.
  out.push(`<path class="skugga" d="${quad([[120, 0, 18], [132, 0, 18], [132, 0, 31], [120, 0, 31]])}"/>`);
  out.push(box(122, 0, 12, 0.8, 20, 12, "uttag", 1.5, 0.3));
  out.push(k.dotsSvg([at([126, 0.8, 26]), at([130, 0.8, 26])], { size: 0.7, tone: "hi" }));
  // Mattan.
  out.push(`<path class="skugga" d="${k.planOutline({ x: 37, y: 52, w: 64, d: 40, r: 1 }, 0.01, P)}"/>`);
  out.push(box(40, 54, 64, 38, 0, 0.6, "matta", 0.6));
  out.push(L(k.planOutline({ x: 45, y: 59, w: 54, d: 28, r: 1 }, 0.6, P), "faint", { className: "mattmonster" }));
  return out.join("");
}

function cable() {
  const route = G.fillet([[134, 40, 6], [140, 40, 1], [138, 12, 1], [128, 10, 1], [128, 10, 26]], 3, 7, { P, tube: 0.55 });
  return tubePieces(route, 0.55, P, { maxLength: 30 }).sort((a, b) => k.depthOf(a.mid, P) - k.depthOf(b.mid, P)).map((p) => tubeSvg(p, { tone: "lo" })).join("") +
    `<path id="sladd-slut" class="sladd" d=""/><g id="kontakt">${box(125, 0.8, 6, 3.6, 23, 6, "uttag", 1, 0.3)}</g>`;
}

function nozzle() {
  const out = [];
  const [mx, my] = MOUTH;
  out.push(`<path class="skugga" d="${k.planOutline({ x: mx - 14, y: my - 5, w: 26, d: 10, r: 2 }, 0.62, P)}"/>`);
  // Munstycket: brett och platt, med två små hjul bak, en borstlist fram och en ledad hals.
  for (const x of [mx - 9, mx + 9]) out.push(S(G.disc(-0.8, 0.8, 1.6, G.frameAlong([x, my - 4.6, 1.6], [0, 1, 0]), P), "hjul"));
  out.push(box(mx - 14, my - 4, 28, 8.4, 0.6, 2.8, "dsug", 3.4, 0.5));
  out.push(box(mx - 13, my + 3.6, 26, 0.8, 0.6, 1.4, "borste", 0.3));
  out.push(box(mx - 4, my - 4.4, 8, 4, 3.2, 1.6, "dsug", 1.5, 0.3));
  out.push(S(G.sphereOf([mx, my - 2.4, 5.2], 2.4, P), "dsug"));
  out.push(`<g id="har"><path class="har" d="${seg([mx - 10, my + 4.1, 1.2], [mx - 6, my + 4.1, 2.8]) + seg([mx - 6, my + 4.1, 2.8], [mx - 8.5, my + 4.1, 3.6])}"/><path class="har" d="${seg([mx + 5, my + 4.1, 1], [mx + 8, my + 4.1, 3]) + seg([mx + 8, my + 4.1, 3], [mx + 10, my + 4.1, 1.6])}"/></g>`);
  // Röret upp till handtaget.
  const neck = [mx, my - 2.4, 6.6];
  const dir = G.unit3(G.sub3(HANDLE, neck));
  const len = Math.hypot(...G.sub3(HANDLE, neck));
  out.push(along(neck, dir, [[0, 1.6], [len, 1.6]], "ror"));
  out.push(along(G.add3(HANDLE, G.mul3(dir, -2)), dir, [[0, 2.4], [8, 2.4]], "dsug"));
  return out.join("");
}

function hose() {
  const route = G.fillet([G.add3(HANDLE, [1.4, -0.8, 3]), HOSE_TOP, HOSE_MID, [93, 35, 15], [94.6, 35, 14]], 7, 7, { P, tube: 2 });
  return tubePieces(route, 2, P, { maxLength: 14, rings: { pitch: 1.5, fade: [0.1, 0.55] } })
    .sort((a, b) => k.depthOf(a.mid, P) - k.depthOf(b.mid, P)).map((p) => tubeSvg(p, { tone: "lo" })).join("");
}

function bagGroup(id) {
  return `<g id="${id}"><g id="${id}-damm"></g>${box(BAG.x, BAG.y, BAG.w, BAG.d, BAG.z, BAG.h, "pase", 1.5, 0.3, { className: "c-pase genom" })}${box(BAG.x - 1, BAG.y + 6, 1, 12, BAG.z + 3, 9, "kartong", 0.4)}</g>`;
}

// Kroppen är ett rundat skal kring en axel längs x: fram ett genomskinligt lock över påsen, bak ett täckt motorhus.
const NOSE = [98, 35, 14];
const FRONT = [[0, 5], [1.5, 8.6, 1], [6, 12.2, 1], [13, 13.6, 1], [20, 13.8, 1]];
const REAR = [[20, 13.8, 1], [27, 13.5, 1], [33, 11.6, 1], [37, 8.2, 1], [38, 6.8]];
const shell = (profile, c, extra) => S(G.solidOf(profile, G.frameAlong(NOSE, [1, 0, 0]), P), c, extra);
const wheel = (y) => S(G.disc(-1.6, 1.6, 10, G.frameAlong([127, y, 10], [0, 1, 0]), P), "hjul") + S(G.disc(-1.9, 1.9, 3.4, G.frameAlong([127, y, 10], [0, 1, 0]), P), "krom");
const ringYZ = (x, cy, cz, r, n = 40) => k.pathOf(Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return at([x, cy + r * Math.cos(a), cz + r * Math.sin(a)]); }), true);

function body() {
  const out = [];
  out.push(`<path class="skugga" d="${k.planOutline({ x: 97, y: 19, w: 40, d: 33, r: 14 }, 0.02, P)}"/>`);
  out.push(wheel(35 - 15.6));
  out.push(S(G.sphereOf([104, 35, 2.4], 2.4, P), "hjul"));
  // Inuti: påsen, motorfiltret och luften. Syns genom locket.
  out.push(bagGroup("pase-gammal"), bagGroup("pase-ny"));
  const disc = (x, r, c) => S(G.disc(-0.7, 0.7, r, G.frameAlong([x, 35, 14], [1, 0, 0]), P), c);
  out.push(`<g id="filter-motor">${disc(117.6, 11.4, "filter")}<g id="smuts-motor" class="smuts">${disc(117.6, 11.4, "smuts")}</g></g>`);
  out.push(`<g id="luft"></g>`);
  // Locket fram: genomskinligt, med en tät kant mot motorhuset. Lyfts när påsen byts. Ritas före motorhuset, som ligger närmare.
  out.push(`<g id="lock">${shell(FRONT, "lock", { className: "c-lock skal-genom" })}</g>`);
  // Motorhuset bak, täckt, med bärhandtag och knapp för sladden.
  out.push(shell(REAR, "dsug", { inner: L(G.arcOf(G.frameAlong(NOSE, [1, 0, 0]), 20.6, 13.8, P), "lo") }));
  const handle = G.fillet([[116, 35, 27.4], [116, 35, 32.4], [129, 35, 32.4], [129, 35, 26.4]], 3, 7, { P, tube: 1.5 });
  out.push(...tubePieces(handle, 1.5, P, { maxLength: 40 }).map((piece) => tubeSvg(piece, { tone: "lo" })));
  out.push(can(124, 41, 2.2, 26.2, 1.2, "krom"));
  // Utblåsfiltret i bakänden, med galler.
  out.push(`<g id="filter-bak">${disc(135.6, 6.6, "filter")}<g id="smuts-bak" class="smuts">${disc(135.6, 6.6, "smuts")}</g><path class="galler" d="${[-4, -2, 0, 2, 4].map((dz) => { const w = Math.sqrt(36 - dz * dz); return k.segment([136.31, 35 - w, 14 + dz], [136.31, 35 + w, 14 + dz], P); }).join("")}"/></g>`);
  out.push(`<path id="flakt" class="flakt" d="${ringYZ(136.6, 35, 14, 8.4)}"/>`);
  out.push(along([98.6, 35, 14], [-1, 0, 0], [[0, 3.8], [3.2, 3.8]], "dsug"));
  out.push(wheel(35 + 15.6));
  return out.join("");
}

const DUST = Array.from({ length: 16 }, (_, i) => {
  const a = i * 2.39996, r = 6 + (i % 5) * 4.2;
  return [MOUTH[0] - 16 + ((i * 7.3) % 34), 70 + ((i * 5.1) % 16) + Math.sin(a) * 1.5, 0.7];
});

const WORDS = [
  { text: "vrrrm", at: [116, 52, 34] },
  { text: "pfff", at: [116, 52, 34] },
  { text: "plopp", at: [128, 12, 36] },
  { text: "prassel", at: [108, 36, 50] },
  { text: "knack knack", at: [124, 36, 48] },
  { text: "klipp", at: [70, 76, 10] },
];

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "En golvdammsugare på ett trägolv med en matta. Sidan på dammsugaren är uppskuren: där syns påsen med damm i, ett filter mellan påsen och motorn, motorn och ett filter på baksidan. En korrugerad slang och ett rör går till munstycket på mattan. Sladden sitter i ett eluttag på väggen.",
  body: [room(), cable(), `<g id="damm"></g>`, nozzle(), hose(), `<g id="luft-ute"></g>`, body(), `<g id="lukt"></g>`, ordSvg(WORDS.length)],
});

const HINTS = {
  start: "En dammsugare suger luft genom munstycket, röret, slangen och påsen. Påsen fångar dammet och filtren tar det som slinker igenom.",
  steps: [
    "Dammsug. Dammet följer med luften in i påsen.",
    "Det suger sämre. Oftast är filtret igensatt, eller så är påsen full.",
    "Dra alltid ut sladden innan du öppnar dammsugaren.",
    "Byt påse en gång i kvartalet, även om den inte är full. En gammal påse börjar lukta.",
    "Ett filter sitter mellan påsen och motorn, ett på baksidan. Byt eller rensa dem en gång i halvåret.",
    "Klipp loss hår som fastnat i munstycket. Sätt i sladden och dammsug klart.",
  ],
  fresh: "Påsen är ny och filtren rena, så det suger bra hela tiden.",
  done: "Klart. Ny påse, rena filter och fritt munstycke: nu suger den bra igen.",
};

const FIG_JS = `
const AIR = [[MOUTH[0], MOUTH[1], 2.4], [MOUTH[0], MOUTH[1] - 2, 7], HANDLE, HOSE_TOP, HOSE_MID, INLET, [104, 35, 14], [117.6, 35, 14], [128, 35, 14], [136, 35, 14], [146, 35, 14]];
const airPath = (from, to) => pathOf(AIR.slice(from, to).map((p) => iso(p, P)));
function dust(st) {
  let svg = "";
  DUST.forEach((d, i) => {
    const th = ((i + 0.5) / DUST.length) * 0.95;
    const u = sm(th, th + 0.06, st.sucked);
    if (u > 0.999) return;
    const p = iso([d[0] + (MOUTH[0] - d[0]) * u, d[1] + (MOUTH[1] - d[1]) * u, d[2] + 1.2 * Math.sin(Math.PI * u)], P);
    svg += '<circle class="dammkorn" r="' + (1.6 - 0.8 * u).toFixed(2) + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" style="opacity:' + (1 - u * u).toFixed(3) + '"/>';
  });
  return svg;
}
function dustIn(fill) {
  if (fill < 0.01) return "";
  // Tonas in medan påsen börjar fyllas, så att det tunnaste lagret inte dyker upp på en gång.
  return '<g style="opacity:' + Math.min(1, fill / 0.08).toFixed(3) + '">' + solidSvg(slabOf({ x: BAG.x + 0.6, y: BAG.y + 0.6, w: BAG.w - 1.2, d: BAG.d - 1.2, r: 1 }, BAG.z + 0.3, Math.max(0.2, (BAG.h - 1) * fill), P, 3), { className: "c-damm", crease: "none" }) + "</g>";
}
function smell(on, t) {
  if (on < 0.01) return "";
  let svg = "";
  for (let i = 0; i < 5; i++) {
    const u = (t * 0.4 + i / 5) % 1;
    const p = iso([136 + 10 * u, 35 + 3 * Math.sin(i + t), 16 + 18 * u], P);
    svg += '<circle class="lukt" r="' + (1.8 + 2.4 * u).toFixed(2) + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" style="opacity:' + (on * Math.sin(Math.PI * u)).toFixed(3) + '"/>';
  }
  return svg;
}
const FIG = {
  id: "dammsugare",
  reglage: (s) => s.months + (s.months === 1 ? " månad" : " månader") + " sedan påsen byttes" + (s.smells ? ' <span class="varning">dags att byta</span>' : ""),
  rita(st, t, s) {
    const endFill = Math.min(0.97, s.startFill + 0.45);
    $("damm").innerHTML = dust(st);
    const oldOut = sm(0, 1, st.bagSwap), newIn = sm(1, 2, st.bagSwap);
    $("pase-gammal-damm").innerHTML = dustIn(st.bagSwap < 1 ? st.fill : endFill);
    $("pase-gammal").style.opacity = (1 - oldOut).toFixed(3);
    $("pase-gammal").setAttribute("transform", translateAlong(P, [0, 0, LIFT * oldOut]));
    $("pase-ny-damm").innerHTML = dustIn(st.bagSwap >= 1 ? st.fill : 0);
    $("pase-ny").style.opacity = newIn.toFixed(3);
    $("pase-ny").setAttribute("transform", translateAlong(P, [0, 0, LIFT * (1 - newIn)]));
    $("lock").setAttribute("transform", translateAlong(P, [0, 0, 18 * st.lid]));
    for (const id of ["filter-motor", "filter-bak"]) $(id).setAttribute("transform", translateAlong(P, [0, 0, LIFT * st.filterLift]));
    for (const id of ["smuts-motor", "smuts-bak"]) $(id).style.opacity = (0.85 * st.dirt).toFixed(3);
    $("har").style.opacity = st.hair.toFixed(3);
    $("kontakt").setAttribute("transform", translateAlong(P, [0, 7 * (1 - st.plug), -3 * (1 - st.plug)]));
    $("sladd-slut").setAttribute("d", segment(CABLE_END, [PLUG[0], PLUG[1] + 3.6 + 7 * (1 - st.plug), PLUG[2] - 3 * (1 - st.plug)], P));
    $("flakt").style.opacity = st.motor.toFixed(3);
    $("flakt").style.strokeDashoffset = String(-t * 60);
    const air = '<path class="luft" d="' + "@" + '" style="opacity:' + Math.min(1, st.flow * 3).toFixed(3) + ";stroke-width:" + (2.2 + 4 * st.flow).toFixed(2) + "px;stroke-dashoffset:" + (-t * 36).toFixed(1) + '"/>';
    $("luft-ute").innerHTML = st.flow < 0.01 ? "" : air.replace("@", airPath(0, 6));
    $("luft").innerHTML = st.flow < 0.01 ? "" : air.replace("@", airPath(5, 11));
    $("lukt").innerHTML = smell(s.smells && st.step <= 1 ? st.motor : 0, t);
    WORDS.forEach((w, i) => visaOrd(i, w.text, w.at, st, st.step === i && (i !== 1 || st.weak || s.months >= 3)));
  },
  texter(st, t, s) {
    let hint = t < START[0] ? HINTS.start : HINTS.steps[st.step];
    if (st.step === 1 && s.months < BAG_MONTHS && t >= START[0]) hint = HINTS.fresh;
    if (t >= END[END.length - 1]) hint = HINTS.done;
    return {
      hint,
      chips: {
        flode: st.motor < 0.3 ? "av" : st.flow < 0.45 ? ["svagt", true] : "bra",
        pase: st.fill < 0.2 ? "nästan tom" : st.fill < 0.6 ? "halvfull" : ["nästan full", true],
        filter: st.dirt > 0.6 ? ["igensatt", true] : st.dirt > 0.2 ? "dammigt" : "rent",
        bytpase: "varje kvartal",
        bytfilter: "varje halvår",
      },
    };
  },
};
`;

writePage({
  id: "dammsugare",
  here: HERE,
  P,
  kicker: "Fig 10 · Dammsugaren",
  title: "Varför suger den sämre?",
  question: "Varför suger dammsugaren sämre ibland, och vad gör du åt det?",
  startHint: HINTS.start,
  steps: ["Dammsug", "Det suger sämre", "Dra ur sladden", "Byt påsen", "Rensa filtren", "Rensa munstycket"],
  slider: { label: "Sedan påsen byttes", min: 0, max: 8, step: 1, value: M.SETTING_DEFAULT },
  chips: [
    { id: "flode", label: "Luftflöde", width: 5 },
    { id: "pase", label: "Påsen", width: 10 },
    { id: "filter", label: "Filtren", width: 8 },
    { id: "bytpase", label: "Byt påse" },
    { id: "bytfilter", label: "Byt eller rensa filtren" },
  ],
  idea: "luften ska kunna ta sig hela vägen igenom. En full påse eller ett igensatt filter stryper flödet, och då suger dammsugaren sämre.",
  swatch: {
    label: "Färg på dammsugaren",
    var: "dsug",
    options: {
      röd: ["#f6b3a8", "#e8786a", "#c95a4d"],
      blå: ["#cfe3f7", "#93bde8", "#6d9bcf"],
      gul: ["#f8e3a0", "#f1c75a", "#d6a73c"],
      grå: ["#e3e7ee", "#b8c0cc", "#929cab"],
    },
  },
  materials: {
    vagg: ["#efe8da", "#e6dece", "#d6ccb8"],
    golv: ["#f1d3a6", "#ddb27a", "#b88a54"],
    list: ["#fbf8f1", "#e9e3d6", "#cfc6b4"],
    uttag: ["#fbf8f1", "#e9e3d6", "#cfc6b4"],
    matta: ["#d9e6f7", "#b2c9ea", "#8faad3"],
    ror: ["#f4f6f9", "#c9ced6", "#98a1ad"],
    lock: ["#eef6fc", "#cfe2f2", "#a9c6e0"],
    borste: ["#5d6675", "#3d4553", "#2c323d"],
    hjul: ["#5d6675", "#3d4553", "#2c323d"],
    pase: ["#fffdf6", "#f5f0e2", "#e2d9c4"],
    kartong: ["#e9d2ae", "#d4b483", "#b8955f"],
    damm: ["#8f7f6d", "#6f604f", "#55483a"],
    filter: ["#fbf8f1", "#e9e3d6", "#cfc6b4"],
    smuts: ["#9a8c7e", "#7d6f62", "#635749"],
    motor: ["#dbe1ec", "#a9b4c8", "#8592aa"],
    krom: ["#f4f6f9", "#c9ced6", "#98a1ad"],
  },
  css: `
.stage svg{overflow:hidden}
.scene .genom{opacity:.34}
.scene .skal-genom{opacity:.42}
.scene .galler{fill:none;stroke:var(--ink);stroke-width:1px}
.scene .mattmonster{stroke:#7f99c4;stroke-dasharray:3 3}
.scene .har{fill:none;stroke:#5a4632;stroke-width:1.3px;stroke-linecap:round}
.scene .dammkorn{fill:#9a8c7e;stroke:#635749;stroke-width:.8px}
.scene .luft{fill:none;stroke:#2f78ad;stroke-dasharray:5 6;stroke-linecap:round;stroke-linejoin:round}
.scene .flakt{fill:none;stroke:var(--ink);stroke-width:1.6px;stroke-dasharray:3 5}
.scene .sladd{fill:none;stroke:#3d4553;stroke-width:2.2px;stroke-linecap:round}
.scene .lukt{fill:#c9d48f;stroke:#7d8a3a;stroke-width:.9px}
`,
  svg,
  sources:
    'Källor: <a href="https://www.elgiganten.se/magazine/rengoring/dammsugare/rengor-din-dammsugare" target="_blank" rel="noopener">Elgiganten: Dammsugare som luktar illa eller suger dåligt?</a> (byt påse en gång i kvartalet enligt en produktexpert på Electrolux, filtren en gång i halvåret, igensatt filter ger sämre sug, rensa munstycket, dra ut sladden). <a href="https://www.miele.se/support/customer-assistance/dammsugare_med_eller_utan_paase-941/alla_kategorier/rengoeringseffekten_avtar_boost_cx1-119813765643" target="_blank" rel="noopener">Miele: Rengöringseffekten avtar</a> (större föremål kan blockera sugvägarna). Luftflödet visas utan siffror; hur mycket påse och filter stryper det har ingen källa. Följ bruksanvisningen för din modell: vissa filter tvättas, andra byts.',
  figData: { HOSE_TOP, HOSE_MID, MOUTH, INLET, HANDLE, PLUG, CABLE_END, BAG, LIFT, DUST, WORDS, HINTS },
  figJs: FIG_JS,
});
