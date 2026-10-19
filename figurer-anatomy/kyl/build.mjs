// Kyl och frys i ett kök: termometer, rått kött längst ner, matlåda framme på bänken medan klockan går, avfrostning.
// Kör: node figurer-anatomy/kyl/build.mjs  →  kyl.html (och public/figurer/anatomi/kyl.html)
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../../vendor/anatomy/kit/lathe.mjs";
import { writePage, ordSvg } from "../delat/sida.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 900;
const HEIGHT = 820;

// Världen i cm: x längs väggen, y ut från väggen, z upp.
const D = 62; // kylens framkant
const DRAWER_OUT = 46;
const OPEN = { x0: 4, x1: 56, z0: 38, z1: 66 }; // frysens övre låda
const MEAT_HOME = [18, 42, 100.6];
const MEAT_AWAY = [86, 24, 90];
const BOX_HOME = [16, 38, 127.5];
const BOX_AWAY = [92, 34, 90];
const THERMO = [45, 53.2, 136];
const KNOB = [13, 58.2, 171];
const CLOCK = [94, 2.2, 168];

const P = k.fitProjection(
  [...k.boxCorners({ x: -70, y: -4, w: 190, d: 128 }, -3, 205)],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: 66, elevation: 24 },
);

const at = (p) => k.iso(p, P);
const S = (paths, c, extra = {}) => k.solidSvg(paths, { className: `c-${c}`, ...extra });
const box = (x, y, w, d, z, h, c, r = 1, bevel = 0, extra) => S(k.slabOf({ x, y, w, d, r }, z, h, P, 4, bevel), c, extra);
const can = (x, y, r, z, h, c, extra) => S(k.cylinder(x, y, r, z, h, P, 36, 0.3), c, extra);
const L = (d, tone = "lo", extra = {}) => k.lineSvg(d, { tone, ...extra });
const seg = (a, b) => k.segment(a, b, P);
const quad = (pts) => k.pathOf(pts.map(at), true);
// Grupp i planet för en framsida (normal +y): lokala x åt höger, y nedåt.
const front = ([x, y, z], inner) => `<g transform="${k.sideMatrix([x, y], z, P, "left")}">${inner}</g>`;
// Grupp i planet för en högersida (normal +x).
const side = ([x, y, z], inner) => `<g transform="${k.sideMatrix([x, y], z, P, "right")}">${inner}</g>`;
const ball = (x, y, z, r, c) => S(G.sphereOf([x, y, z + r], r, P), c);
const lying = (x, y, z, length, r, c) => S(G.solidOf([[0, r * 0.5], [r * 0.6, r], [length - r * 0.6, r], [length, r * 0.5]], G.frameAlong([x, y, z + r], [1, 0, 0]), P), c);
const bottle = (x, y, z, r, h, c) =>
  S(G.solidOf([[0, r], [h * 0.6, r], [h * 0.8, r * 0.45], [h, r * 0.45]], G.frameAlong([x, y, z], [0, 0, 1]), P), c) + can(x, y, r * 0.55, z + h, 2.4, "lock");

function room() {
  const out = [];
  out.push(box(-70, -4, 190, 4, -3, 208, "vagg", 0));
  out.push(box(-70, 0, 190, 128, -3, 3, "golv", 0));
  const floor = [];
  for (let x = -50; x < 120; x += 20) floor.push(seg([x, 0, 0], [x, 128, 0]));
  for (let y = 20; y < 128; y += 20) floor.push(seg([-70, y, 0], [120, y, 0]));
  out.push(L(floor.join(""), "faint"));
  // Kakel bakom bänken.
  out.push(box(66, 0, 54, 0.6, 90, 52, "kakel", 0));
  const tiles = [];
  for (let x = 75; x < 120; x += 9) tiles.push(seg([x, 0.6, 90], [x, 0.6, 142]));
  for (let z = 99; z < 142; z += 9) tiles.push(seg([66, 0.6, z], [120, 0.6, z]));
  out.push(L(tiles.join(""), "faint"));
  // Hårda varma skuggor strax bakom föremålen.
  out.push(`<path class="skugga" d="${quad([[-4, 0, 0], [56, 0, 0], [56, 0, 176], [-4, 0, 176]])}"/>`);
  out.push(`<path class="skugga" d="${k.planOutline({ x: -4, y: 0, w: 60, d: 62, r: 2 }, 0, P)}"/>`);
  out.push(`<path class="skugga" d="${k.planOutline({ x: 66, y: 0, w: 50, d: 62, r: 2 }, 0, P)}"/>`);

  return out.join("");
}

function clock() {
  const [x, y, z] = CLOCK;
  const out = [`<path class="skugga" d="${quad([[x - 13, 0, z - 13], [x + 7, 0, z - 13], [x + 7, 0, z + 9], [x - 13, 0, z + 9]])}"/>`];
  out.push(S(G.solidOf([[0, 11], [2.2, 11]], G.frameAlong([x, 0, z], [0, 1, 0]), P), "klocka"));
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? 7.6 : 6.6;
    return `<line class="tick" x1="${(Math.sin(a) * r0).toFixed(2)}" y1="${(-Math.cos(a) * r0).toFixed(2)}" x2="${(Math.sin(a) * 8.6).toFixed(2)}" y2="${(-Math.cos(a) * 8.6).toFixed(2)}"/>`;
  }).join("");
  out.push(front([x, y, z], `<circle class="urtavla" r="9.4"/>${ticks}<line id="visare-h" class="visare tjock" x1="0" y1="1" x2="0" y2="-4.6"/><line id="visare-m" class="visare" x1="0" y1="1.4" x2="0" y2="-7.4"/><circle class="nav" r="0.9"/>`));
  return out.join("");
}

function counter() {
  const out = [];
  out.push(box(70, 2, 46, 58, 0, 6, "sockel", 0.5));
  out.push(box(68, 2, 50, 60, 6, 80, "skap", 1, 0.6));
  out.push(L(seg([93, 62, 6], [93, 62, 86]), "lo"));
  for (const x of [88, 98]) out.push(box(x - 0.8, 62, 1.6, 1.6, 66, 12, "krom", 0.6));
  out.push(box(66, 0, 54, 64, 86, 4, "tra", 1, 0.8));
  return out.join("");
}

function freezerBack() {
  const out = [];
  for (const [x, y] of [[4, 6], [56, 6], [4, 58], [56, 58]]) out.push(can(x, y, 2, 0, 3, "sockel"));
  out.push(box(0, 2, 60, 3, 3, 67, "kyl", 0.6));
  out.push(box(0, 2, 3, 60, 3, 67, "kyl", 0.6));
  out.push(box(0, 2, 60, 60, 3, 3, "kyl", 0.6));
  out.push(box(1, D, 58, 2.4, 6, 30, "kyl", 1, 0.4));
  out.push(box(22, D + 2.4, 16, 2, 30, 2.4, "krom", 0.8));
  return out.join("");
}

function freezerDrawer() {
  const out = [];
  const opening = [[OPEN.x0, D, OPEN.z0], [OPEN.x1, D, OPEN.z0], [OPEN.x1, D, OPEN.z1], [OPEN.x0, D, OPEN.z1]];
  const pts = [...opening, ...opening.map(([x, y, z]) => [x, y + DRAWER_OUT + 4, z])].map(at);
  out.push(`<clipPath id="frys-klipp"><path d="${k.pathOf(G.hullOf(pts), true)}"/></clipPath>`);
  out.push(`<path class="oppning" d="${quad(opening)}"/>`);
  const bin = [];
  const y0 = 8, d = D - y0, bx = OPEN.x0 + 1, bw = OPEN.x1 - OPEN.x0 - 2, bz = OPEN.z0 + 1.5;
  bin.push(box(bx, y0, bw, 1.5, bz, 25, "insida"));
  bin.push(box(bx, y0, 1.5, d, bz, 25, "insida"));
  bin.push(box(bx, y0, bw, d, OPEN.z0, 1.5, "insida"));
  bin.push(`<g id="is"></g>`);
  bin.push(box(12, 14, 16, 12, bz, 12, "frysbox", 1.5, 0.4));
  bin.push(box(32, 13, 18, 10, bz, 16, "frysbox", 1.5, 0.4));
  bin.push(`<g id="skal-grupp">${S(G.solidOf([[0, 4.6], [1, 5.6, 1], [4.4, 7.6, 1], [5, 7.8]], G.frameAlong([24, 44, bz], [0, 0, 1]), P), "skal")}<path class="varmvatten" d="${k.ring(24, 44, 7.2, bz + 4.4, P, 36)}"/><path id="anga" class="anga" d="${seg([22, 44, bz + 7], [22, 44, bz + 17]) + seg([26, 44, bz + 8], [26, 44, bz + 19])}"/></g>`);
  bin.push(box(bx + bw - 1.5, y0, 1.5, d, bz, 25, "insida"));
  out.push(`<g clip-path="url(#frys-klipp)"><g data-part="frys">${bin.join("")}</g></g>`);
  // Lådans front har ett genomskinligt fönster, så att isen och skålen syns inuti.
  const pane = quad([[4, D + 1.3, 41], [56, D + 1.3, 41], [56, D + 1.3, 57], [4, D + 1.3, 57]]);
  out.push(`<g data-part="frys"><path class="ruta" d="${pane}"/>${box(1, D, 58, 2.6, 37, 4, "kyl", 0.6)}${box(1, D, 3, 2.6, 41, 16, "kyl", 0.4)}${box(56, D, 3, 2.6, 41, 16, "kyl", 0.4)}${box(1, D, 58, 2.6, 57, 10, "kyl", 1, 0.4)}${box(10, D + 2.6, 14, 2, 61, 2.4, "krom", 0.8)}${front([42, D + 2.6, 64.5], `<text class="skylt" text-anchor="middle" font-size="5.4">−18°</text>`)}</g>`);
  return out.join("");
}

function freezerSide() {
  return box(57, 2, 3, 60, 3, 67, "kyl", 0.6);
}

function fridgeBack() {
  const out = [];
  out.push(box(0, 2, 60, 60, 70, 4, "kyl", 0.8));
  out.push(box(0, 2, 3, 60, 74, 102, "kyl", 0.6));
  out.push(box(3, 2, 54, 3, 74, 102, "insida", 0.6));
  out.push(box(3, 5, 54, 54, 74, 1, "insida", 0.4));
  return out.join("");
}

function crisper() {
  const out = [];
  out.push(box(5, 8, 50, 1.5, 75, 18, "glas"));
  out.push(box(5, 8, 1.5, 48, 75, 12, "glas"));
  out.push(box(5, 8, 50, 48, 75, 1.2, "glas"));
  out.push(ball(14, 22, 76.2, 7, "sallad"));
  out.push(lying(24, 20, 76.2, 26, 2.6, "gron"));
  out.push(ball(16, 42, 76.2, 3.6, "tomat"));
  out.push(ball(26, 46, 76.2, 3.4, "tomat"));
  out.push(lying(34, 40, 76.2, 16, 2, "morot"));
  out.push(box(53.5, 8, 1.5, 48, 75, 12, "glas"));
  out.push(box(4, 54.5, 52, 2, 75, 12, "glas", 0.6, 0.3));
  return out.join("");
}

const shelf = (z) => box(3, 5, 54, 53, z, 1.6, "glas", 0.8);

function fridgeInside() {
  const out = [crisper()];
  out.push(shelf(97));
  out.push(can(MEAT_HOME[0], MEAT_HOME[1], 9, 98.6, 1.2, "tallrik"));
  out.push(box(36, 14, 16, 14, 98.6, 10, "mjolk", 1, 0.4));
  out.push(shelf(124));
  // Termometern: ett hus med en rund tavla på framsidan.
  const [tx, ty, tz] = THERMO;
  out.push(box(tx - 7, ty - 4, 14, 4, 125.6, 18, "vit", 1.5, 0.4));
  const thermoTicks = [-10, -5, 0, 5, 10, 15, 20].map((c) => {
    const a = ((c + 10) / 30 - 0.5) * 1.5 * Math.PI, r0 = c % 10 ? 4.6 : 4;
    return `<line class="tick" x1="${(Math.sin(a) * r0).toFixed(2)}" y1="${(-Math.cos(a) * r0).toFixed(2)}" x2="${(Math.sin(a) * 5.4).toFixed(2)}" y2="${(-Math.cos(a) * 5.4).toFixed(2)}"/>`;
  }).join("");
  const zone = (() => { const a0 = ((0 + 10) / 30 - 0.5) * 1.5 * Math.PI, a1 = ((5 + 10) / 30 - 0.5) * 1.5 * Math.PI, r = 5; return `<path class="zon" d="M${(Math.sin(a0) * r).toFixed(2)} ${(-Math.cos(a0) * r).toFixed(2)} A${r} ${r} 0 0 1 ${(Math.sin(a1) * r).toFixed(2)} ${(-Math.cos(a1) * r).toFixed(2)}"/>`; })();
  out.push(front([tx, ty, tz], `<circle class="urtavla" r="6"/>${zone}${thermoTicks}<text id="termo-text" class="skylt" text-anchor="middle" y="4.2" font-size="2.6">8 °C</text><line id="nal" class="nal" x1="0" y1="0.8" x2="0" y2="-4.8"/><circle class="nav" r="0.7"/>`));
  out.push(shelf(150));
  out.push(can(14, 30, 5, 151.6, 10, "burk"), can(14, 30, 5.3, 161.6, 2, "lock"));
  out.push(can(30, 24, 4, 151.6, 8, "burk"), can(30, 24, 4.3, 159.6, 2, "lock"));
  // Ratten för temperaturen sitter i ett hus under taket.
  const [kx, ky, kz] = KNOB;
  out.push(box(kx - 8, 48, 16, ky - 48, 166, 10, "vit", 1, 0.4));
  const knobTicks = [1, 2, 3, 4, 5].map((n) => {
    const a = ((n - 3) / 4) * 1.4 * Math.PI * 0.5;
    return `<line class="tick" x1="${(Math.sin(a) * 3.4).toFixed(2)}" y1="${(-Math.cos(a) * 3.4).toFixed(2)}" x2="${(Math.sin(a) * 4.4).toFixed(2)}" y2="${(-Math.cos(a) * 4.4).toFixed(2)}"/>`;
  }).join("");
  out.push(front([kx, ky, kz], `<circle class="ratt" r="3"/>${knobTicks}<line id="ratt-pek" class="visare" x1="0" y1="0" x2="0" y2="-2.6"/>`));
  return out.join("");
}

function fridgeFront() {
  const out = [];
  out.push(box(57, 2, 3, 60, 74, 102, "kyl", 0.6));
  out.push(box(0, 2, 60, 60, 176, 4, "kyl", 1, 0.8));
  // En lapp på sidan, hållen av en magnet.
  out.push(box(60, 18, 0.4, 16, 128, 20, "lapp", 0.2));
  out.push(L([0, 1, 2, 3].map((i) => seg([60.4, 21, 143 - i * 3.6], [60.4, 31 - (i % 2) * 4, 143 - i * 3.6])).join(""), "lo", { free: "both" }));
  out.push(box(60.4, 24.5, 1.2, 3, 145, 3, "magnet", 1));
  return out.join("");
}

// Dörren står på 115 grader så att lådorna går fria. u längs dörrens bredd, v ut från insidan.
const SWING = (115 * Math.PI) / 180;
const ALONG = [Math.cos(SWING), Math.sin(SWING)];
const INWARD = [Math.sin(SWING), -Math.cos(SWING)];
const onDoor = (u, v) => [ALONG[0] * u + INWARD[0] * v, D + ALONG[1] * u + INWARD[1] * v];
const doorSlab = (u0, u1, v0, v1, z, h, c) => S(k.extrude([onDoor(u0, v0), onDoor(u1, v0), onDoor(u1, v1), onDoor(u0, v1)], z, h, P), c);
const doorBottle = (u, r, z, h, c) => { const [x, y] = onDoor(u, 5); return bottle(x, y, z, r, h, c); };

function door() {
  const out = [];
  for (const z of [77, 168]) out.push(box(-4, D - 3, 4, 4, z, 6, "krom", 0.8));
  out.push(doorSlab(0, 60, -5, 0, 74, 106, "kyl"));
  out.push(`<path class="iso-line" data-tone="lo" d="${quad([[...onDoor(4, 0), 78], [...onDoor(56, 0), 78], [...onDoor(56, 0), 176], [...onDoor(4, 0), 176]])}"/>`);
  const bins = [
    { z: 88, items: (z) => doorBottle(14, 3.6, z, 24, "saft") + doorBottle(24, 3.6, z, 22, "flaska") + doorBottle(34, 3.2, z, 20, "saft") },
    { z: 120, items: (z) => doorBottle(14, 3, z, 15, "flaska") + doorSlab(30, 40, 1, 9, z, 22, "mjolk") + doorSlab(30.5, 39.5, 4.3, 5.7, z + 22, 2.4, "mjolk") },
    { z: 152, items: (z) => doorSlab(12, 26, 2, 8, z, 5, "smor") + doorSlab(36, 50, 2, 9, z, 7, "agg") },
  ];
  for (const { z, items } of bins) {
    out.push(doorSlab(6, 54, 0, 10, z, 1.5, "insida"));
    out.push(items(z + 1.5));
    out.push(doorSlab(6, 54, 8.5, 10, z, 9, "glas"));
  }
  return out.join("");
}

// Saker som flyttas: byggs på sin plats i kylen och flyttas med en transform.
// Saker som flyttas mellan kylen och bänken finns på båda ställena och tonas över, så att ingen flygbana
// framför den öppna kylen kan misstas för att saken åker genom hyllorna.
const meatAt = (id, [x, y, z]) => `<g id="${id}">${box(x - 7, y - 5, 14, 10, z, 4.4, "kott", 1.6, 0.4)}${front([x, y + 5, z + 2.4], `<text class="skylt" text-anchor="middle" font-size="2.6" y="0.9">RÅTT</text>`)}</g>`;
const lunchAt = (id, [x, y, z]) => `<g id="${id}">${box(x - 8, y - 6, 16, 12, z, 6, "lada", 1.6, 0.4)}${box(x - 8.4, y - 6.4, 16.8, 12.8, z + 6, 1.4, "ladlock", 2, 0.3)}${front([x, y + 6.4, z + 4], `<text class="skylt" text-anchor="middle" font-size="2.4" y="0.8">RESTER</text>`)}</g>`;
const meat = () => meatAt("kott-hem", MEAT_HOME) + meatAt("kott-ute", MEAT_AWAY);
const lunch = () => lunchAt("lada-hem", BOX_HOME) + lunchAt("lada-ute", BOX_AWAY);

const WORDS = [
  { text: "klick klick", at: [12, 66, 182] },
  { text: "flapp", at: [30, 70, 112] },
  { text: "svisch", at: [62, 86, 126] },
  { text: "tick tack", at: [94, 8, 184] },
  { text: "klonk", at: [36, 70, 140] },
  { text: "dropp dropp", at: [44, 104, 74] },
];

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Ett kök med en kyl och frys till vänster och en bänk till höger. Kyldörren står öppen: inuti syns en termometer, rått kött på en tallrik på nedersta hyllan, en matlåda och en grönsakslåda. På väggen över bänken sitter en klocka. Frysens översta låda kan dras ut och har is på innerväggarna.",
  body: [room(), clock(), freezerBack(), fridgeBack(), fridgeInside(), freezerSide(), fridgeFront(), freezerDrawer(), door(), counter(), meat(), lunch(), ordSvg(WORDS.length)],
});

const HINTS = {
  start: "Här är en kyl med frys. Vi ställer in den rätt och ser hur länge maten tål att stå framme.",
  steps: [
    "Vrid på ratten och titta på termometern. Kylen ska vara 4 grader.",
    "Rått kött läggs längst ner på en tallrik, så att inget droppar på annan mat.",
    "Du tar fram matlådan och ställer den på bänken.",
    "Nu står maten i rumstemperatur. Klockan visar hur länge. Vid {rum} får den stå högst {max} timmar.",
    "In med matlådan i kylen igen innan tiden är slut.",
    "Det är 4 mm is i frysen. En skål varmt vatten, inte kokande, hjälper isen att släppa.",
  ],
  done: "Klart. Sätt frysen på kallaste läget i minst 3 timmar innan maten åker in igen.",
};

const FIG_JS = `
// u 0 = i kylen, 1 = på bänken. Den ena tonas ut medan den andra tonas in och sjunker ner de sista centimetrarna.
const swap = (id, u) => {
  const away = Math.min(1, Math.max(0, (u - 0.4) / 0.6)), home = 1 - Math.min(1, u / 0.6);
  $(id + "-hem").style.opacity = home.toFixed(3);
  $(id + "-hem").setAttribute("transform", translateAlong(P, [0, 0, 4 * (1 - home)]));
  $(id + "-ute").style.opacity = away.toFixed(3);
  $(id + "-ute").setAttribute("transform", translateAlong(P, [0, 0, 4 * (1 - away)]));
};
const hm = (h) => { const m = Math.round(h * 60); return Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0") + " min"; };
const FIG = {
  id: "kyl",
  reglage: (s) => s.room.label + ": högst " + s.room.limitH + " timmar framme",
  rita(st, t, s) {
    $("ratt-pek").setAttribute("transform", "rotate(" + (-35 + 70 * st.knob).toFixed(2) + ")");
    $("nal").setAttribute("transform", "rotate(" + (((st.temp + 10) / 30 - 0.5) * 270).toFixed(2) + ")");
    $("termo-text").textContent = Math.round(st.temp) + " °C";
    swap("kott", 1 - st.meat);
    swap("lada", st.box);
    $("visare-m").setAttribute("transform", "rotate(" + (st.hours * 360).toFixed(2) + ")");
    $("visare-h").setAttribute("transform", "rotate(" + (st.hours * 30).toFixed(2) + ")");
    document.querySelectorAll('[data-part="frys"]').forEach((g) => g.setAttribute("transform", translateAlong(P, [0, DRAWER_OUT * st.drawer, 0])));
    const e = 0.45 * st.ice; // isen ritas fyra gånger tjockare än verkligt för att synas
    const bx = OPEN.x0 + 2.5, bz = OPEN.z0 + 1.5;
    // Isen tonas ut i takt med tjockleken, så att den blå ytan inte försvinner på en enda bild.
    $("is").style.opacity = Math.min(1, st.ice / 1.5).toFixed(3);
    $("is").innerHTML = e < 0.005 ? "" : solidSvg(slabOf({ x: bx, y: 9.5, w: e, d: D - 11, r: 0 }, bz, 24, P, 1), { className: "c-is" }) + solidSvg(slabOf({ x: bx + e, y: 9.5, w: OPEN.x1 - OPEN.x0 - 5 - e, d: e, r: 0 }, bz, 24, P, 1), { className: "c-is" });
    $("skal-grupp").style.opacity = st.bowl.toFixed(3);
    $("anga").style.strokeDashoffset = String(-t * 12);
    WORDS.forEach((w, i) => visaOrd(i, w.text, w.at, st));
  },
  texter(st, t, s) {
    let hint = t < START[0] ? HINTS.start : HINTS.steps[st.step].replace("{rum}", s.room.label).replace("{max}", s.room.limitH);
    if (t >= END[END.length - 1]) hint = HINTS.done;
    const share = st.hours / s.room.limitH;
    return {
      hint,
      chips: {
        kyl: Math.round(st.temp) + " °C",
        frys: "−18 °C",
        framme: [hm(st.hours) + " av max " + s.room.limitH + " h", share > 0.75],
        is: st.ice > 0.05 ? [st.ice.toFixed(1).replace(".", ",") + " mm · frosta av", st.ice >= 3] : "0 mm",
        rum: s.room.label,
      },
    };
  },
};
`;

writePage({
  id: "kyl",
  here: HERE,
  P,
  kicker: "Fig 4 · Kyl och frys",
  title: "Hur länge håller maten?",
  question: "Varför ska kylen vara 4 grader, och hur länge får maten stå framme?",
  startHint: HINTS.start,
  steps: ["Ställ in 4 grader", "Rått kött längst ner", "Ta fram matlådan", "Klockan tickar", "In i kylen igen", "Frosta av frysen"],
  slider: { label: "Rummets temperatur", min: 0, max: 2, step: 1, value: 0 },
  chips: [
    { id: "kyl", label: "Kylen" },
    { id: "frys", label: "Frysen" },
    { id: "framme", label: "Framme" },
    { id: "is", label: "Is i frysen" },
    { id: "rum", label: "Rummet" },
  ],
  idea: "kyla bromsar bakterierna. Vid 4 °C håller maten ungefär dubbelt så länge som vid 8 °C.",
  swatch: {
    label: "Färg på kylen",
    var: "kyl",
    options: {
      rod: ["#f6b3a8", "#e8786a", "#c95a4d"],
      mint: ["#c4ebdf", "#93d2bf", "#6fb5a2"],
      gul: ["#f8e3a0", "#f1c75a", "#d6a73c"],
      vit: ["#fbf9f4", "#ece7dc", "#d3cbbb"],
    },
  },
  materials: {
    vagg: ["#efe8da", "#e6dece", "#d6ccb8"],
    golv: ["#e6dbc6", "#d6c9b0", "#c3b499"],
    kakel: ["#e3eef2", "#cfe0e6", "#b6ccd4"],
    skap: ["#e7eef5", "#c9d6e3", "#a8b8c8"],
    sockel: ["#b7c2cf", "#9aa7b6", "#7f8c9b"],
    tra: ["#f1d3a6", "#ddb27a", "#b88a54"],
    klocka: ["#fbf8f1", "#e9e3d6", "#cfc6b4"],
    insida: ["#ffffff", "#f1eee7", "#ddd7ca"],
    glas: ["#eef7f9", "#d6eaef", "#b9d6de"],
    kott: ["#f7b8b0", "#e98579", "#c9645a"],
    lada: ["#d9ecff", "#a9cdf0", "#7fadd8"],
    ladlock: ["#bcd9f7", "#7fadd8", "#5f8fbd"],
    tallrik: ["#ffffff", "#f3efe6", "#dcd5c6"],
    mjolk: ["#ffffff", "#e9eef5", "#cbd5e2"],
    sallad: ["#d6efb4", "#a8d77a", "#7fb556"],
    gron: ["#bfe3a4", "#7fbf5e", "#5d9d40"],
    tomat: ["#ffb3a6", "#f0614c", "#c8432f"],
    morot: ["#ffd09a", "#f5a04a", "#d07a2a"],
    burk: ["#fff3d6", "#f5d690", "#d9b25c"],
    lock: ["#f6a59a", "#d9534f", "#b33b38"],
    saft: ["#ffc9d6", "#f07f9c", "#cc5b78"],
    flaska: ["#dff3e8", "#a6dcc0", "#78bd9b"],
    smor: ["#fff6c8", "#f7e38a", "#d8c25e"],
    agg: ["#fdf3e3", "#f1dfc1", "#d6c19e"],
    frysbox: ["#e6f0ff", "#bcd4f5", "#93b3e0"],
    is: ["#f7fbff", "#dfe8fb", "#c4d3ef"],
    skal: ["#fff1e0", "#f5c995", "#d9a368"],
    vit: ["#fbf8f1", "#e9e3d6", "#cfc6b4"],
    lapp: ["#fffbe6", "#fff3c2", "#ead89a"],
    magnet: ["#9fd0ff", "#4f97e0", "#2f73b8"],
    krom: ["#f4f6f9", "#c9ced6", "#98a1ad"],
  },
  css: `
.scene .urtavla{fill:#fffdf8;stroke:var(--ink);stroke-width:1.2px;vector-effect:non-scaling-stroke}
.scene .ratt{fill:#f1eee7;stroke:var(--ink);stroke-width:1.2px;vector-effect:non-scaling-stroke}
.scene .tick{stroke:var(--ink);stroke-width:.9px;vector-effect:non-scaling-stroke}
.scene .visare{stroke:var(--ink);stroke-width:1.6px;stroke-linecap:round;vector-effect:non-scaling-stroke}
.scene .visare.tjock{stroke-width:2.6px}
.scene .nal{stroke:#c9452f;stroke-width:1.8px;stroke-linecap:round;vector-effect:non-scaling-stroke}
.scene .nav{fill:var(--ink)}
.scene .zon{fill:none;stroke:#5fa8d6;stroke-width:3px;vector-effect:non-scaling-stroke}
.scene .oppning{fill:#4a5872;stroke:var(--ink);stroke-width:1px}
.scene .varmvatten{fill:#bfe3f5;stroke:var(--ink);stroke-width:1px}
.scene .anga{fill:none;stroke:#9fb3c8;stroke-width:2px;stroke-dasharray:3 4;stroke-linecap:round}
.scene .skylt{font-weight:800}
.scene .ruta{fill:#cfe6f5;opacity:.28;stroke:none}
`,
  svg,
  sources:
    'Källor: <a href="https://www.livsmedelsverket.se/livsmedel-och-innehall/tillagning-forvaring-hallbarhet/forvaring-av-kyld-mat/" target="_blank" rel="noopener">Livsmedelsverket: Förvaring av kylvaror</a> (4 °C, −18 °C, dubbelt så länge som vid 8 °C, högst 4 h vid 20 °C, 3 h vid 25 °C och 2 h vid 26–30 °C framme). <a href="https://support.electrolux.se/support-articles/article/avfrostning-av-kylfrys" target="_blank" rel="noopener">Electrolux: Avfrostning av kyl/frys</a> (frosta av vid 3–5 mm is, varmt men inte kokande vatten, kallaste läget i minst 3 timmar efteråt). Isen ritas fyra gånger tjockare än verkligt.',
  figData: { D, DRAWER_OUT, OPEN, MEAT_HOME, MEAT_AWAY, BOX_HOME, BOX_AWAY, WORDS, HINTS },
  figJs: FIG_JS,
});
