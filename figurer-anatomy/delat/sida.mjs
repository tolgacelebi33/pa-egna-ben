// Gemensam sidmall för OMO:s anatomifigurer: ledtråd, stegknappar där bara nästa går, Manuell/Auto,
// markör i turen, fartmärke, reglage, siffror, "Den stora idén", färgval, källor, ?render med window.seek(t)
// och ?embed för appen. En figur ger modellen, SVG:n och en liten FIG-modul med rita/texter/reglage.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../vendor/anatomy/scripts/inline-kit.mjs";

export const INK = "#22304a";
const tones = (name, [l, m, d]) => `.c-${name}{--l:${l};--m:${m};--d:${d}}`;

/** Textrader för ljudorden, en per steg. Figuren placerar dem med visaOrd() i sin rita-funktion. */
export const ordSvg = (n) => `<g id="ord">${Array.from({ length: n }, (_, i) => `<text class="ljud" id="ord${i}" text-anchor="middle"></text>`).join("")}</g>`;

const BASE_CSS = `
:root{--ink:${INK};--paper:#f5f0e5;--hand:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;--sans:"Avenir Next","Avenir","Segoe UI",system-ui,sans-serif;--sol:#ffd76a}
*{box-sizing:border-box}
html,body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans)}
.page{position:relative;max-width:1460px;margin:0 auto;padding:22px 24px 18px}
.kicker{font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.65;margin:0}
h1{font-size:30px;margin:4px 0 12px;font-weight:700;letter-spacing:-.01em}
.hint{min-height:90px;display:flex;align-items:center;font-size:21px;line-height:1.35;background:#fffaf0;border:2px solid var(--ink);border-radius:16px;padding:12px 18px;max-width:1060px}
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
.reglage .varning{color:#b33b38;font-weight:700}
.stage{position:relative;margin:0;height:860px}
.stage svg{display:block;height:100%;width:auto;max-width:100%;margin:0 auto}
.badge{position:absolute;top:8px;right:8px;font:700 16px var(--sans);background:var(--ink);color:#fffaf0;border-radius:999px;padding:6px 14px;opacity:0}
.under{display:grid;gap:10px;margin-top:6px}
.chips{list-style:none;display:flex;flex-wrap:wrap;gap:10px;margin:0;padding:0}
.chips li{border:2px solid var(--ink);border-radius:999px;padding:6px 14px;background:#fffaf0;font-size:15px}
.chips b{font-variant-numeric:tabular-nums;margin-left:6px;display:inline-block}
.chips li.varning{background:#f8d7d3;border-color:#b33b38}
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
.scene .ljud{font-family:var(--hand);font-size:22px;font-weight:700;fill:var(--ink);opacity:0}
.scene .skylt{font-family:var(--sans);font-weight:700;fill:var(--ink)}
@media (prefers-reduced-motion:reduce){.manual .pill.next{animation:none}}
.render *,.render *::before{transition:none!important;animation:none!important}
.embed .kicker,.embed h1{display:none}
.embed .page{padding-top:4px}
@media (max-width:860px){.page{padding:14px 16px}h1{font-size:22px}.hint{font-size:17px;min-height:0}.layout{grid-template-columns:minmax(0,1fr);gap:12px}.steps{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.pill{font-size:14px;padding:6px 10px 6px 6px}.pill .nr{width:26px;height:26px;font-size:13px}.stage{height:auto;order:-1}.stage svg{width:100%;height:auto}.reglage{margin-top:12px}}
`;

// Allt som är lika för alla figurer. FIG (figurens kod) och modellen ligger i samma skript och finns i räckvidd.
const RUNTIME = `
const $ = (id) => document.getElementById(id);
const page = document.querySelector(".page");
const scene = document.querySelector(".scene");
const pills = [...document.querySelectorAll(".pill")];
const cursor = $("cursor");
const query = new URLSearchParams(location.search);
const render = query.has("render");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
const MODE_KEY = FIG.id + "-mode";
let mode = render ? "auto" : store.get(MODE_KEY) === "auto" ? "auto" : "manual";
const slider = $("reglage");
let s = setup(slider ? Number(slider.value) : undefined);
let t = 0, next = 0, playingTo = null, frame = 0, last = 0;
const sm = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const fmt = (x, d = 1) => x.toFixed(d).replace(".", ",");

/** Ett ljudord som tonas in i början av sitt steg, stiger lite och tonas ut i slutet. */
function visaOrd(i, text, point, st, on = st.step === i) {
  const el = $("ord" + i);
  if (!el) return;
  const a = on ? sm(0, 0.12, st.p) * (1 - sm(0.82, 1, st.p)) : 0;
  if (el.textContent !== text) el.textContent = text;
  const p = iso(point, P);
  el.setAttribute("x", p[0].toFixed(1));
  el.setAttribute("y", (p[1] - (on ? 6 * st.p : 0)).toFixed(1));
  el.setAttribute("transform", "rotate(-8 " + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")");
  el.style.opacity = a.toFixed(3);
}

function draw(time) {
  t = time;
  const st = at(t, s);
  FIG.rita(st, t, s);
  const tx = FIG.texter(st, t, s);
  pills.forEach((b, i) => {
    b.classList.toggle("run", st.running && st.step === i);
    b.classList.toggle("done", t >= END[i] && !(st.running && st.step === i));
    b.classList.toggle("next", mode === "manual" && i === next && playingTo === null);
    b.classList.toggle("tryckt", mode === "auto" && Math.abs(t - CLICK[i]) < 0.12);
    b.disabled = mode === "auto" || i !== next || playingTo !== null;
    const label = (tx.labels && tx.labels[i]) || b.dataset.label;
    const el = b.querySelector(".txt");
    if (el.textContent !== label) el.textContent = label;
  });
  if ($("hint").textContent !== tx.hint) $("hint").textContent = tx.hint;
  // Fartmärket tonas in och ut över 0,2 s så att det inte blinkar till.
  const speed = speedOf(st.step, s);
  const show = t >= START[0] ? sm(START[st.step], START[st.step] + 0.2, t) * (1 - sm(END[st.step] - 0.2, END[st.step], t)) : 0;
  $("speed").textContent = speed ? speed + (speed.includes("/") ? " · slowmotion" : " · snabbspolat") : "";
  $("speed").style.opacity = speed ? show.toFixed(3) : 0;
  for (const [id, value] of Object.entries(tx.chips)) {
    const el = $("c-" + id);
    const [text, warn] = Array.isArray(value) ? value : [value, false];
    if (el.textContent !== text) el.textContent = text;
    el.parentElement.classList.toggle("varning", !!warn);
  }
  drawCursor();
}

function centreOf(el) {
  const a = el.getBoundingClientRect(), b = page.getBoundingClientRect();
  return [a.left - b.left + a.width * 0.32, a.top - b.top + a.height * 0.62];
}
function drawCursor() {
  if (mode !== "auto") { cursor.style.opacity = 0; return; }
  const home = centreOf(document.querySelector(".stage"));
  let from = home, to = home, u = 1, press = 0;
  for (let i = 0; i < CLICK.length; i++) {
    if (t >= CLICK[i] - 0.6) { from = i ? centreOf(pills[i - 1]) : home; to = centreOf(pills[i]); u = sm(CLICK[i] - 0.6, CLICK[i], t); }
    press = Math.max(press, 1 - Math.min(1, Math.abs(t - CLICK[i]) / 0.12));
  }
  const x = from[0] + (to[0] - from[0]) * u, y = from[1] + (to[1] - from[1]) * u;
  cursor.style.opacity = 1;
  cursor.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + (1 - 0.18 * press).toFixed(3) + ")";
}

// Auto loopar hela turen, Manuell spelar ett steg i taget.
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
  if (!render) store.set(MODE_KEY, m);
  document.body.classList.toggle("manual", m === "manual");
  document.querySelectorAll(".switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  restart();
}
pills.forEach((b, i) => b.addEventListener("click", () => play(i)));
document.querySelectorAll(".switch button").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
$("restart").addEventListener("click", (e) => { e.preventDefault(); restart(); });
function newSetup() { s = setup(Number(slider.value)); if (FIG.init) FIG.init(s); $("reglage-ut").innerHTML = FIG.reglage(s); }
if (slider) slider.addEventListener("input", () => { newSetup(); draw(t); });
document.addEventListener("keydown", (e) => {
  if ((e.key === " " || e.key === "Enter") && !e.target.closest("button, input, a")) { e.preventDefault(); play(next); }
});
document.querySelectorAll(".swatches button").forEach((b) => b.addEventListener("click", () => {
  const [l, m, d] = JSON.parse(b.dataset.toner);
  const v = b.dataset.var;
  scene.style.setProperty("--" + v + "-l", l); scene.style.setProperty("--" + v + "-m", m); scene.style.setProperty("--" + v + "-d", d);
  document.querySelectorAll(".swatches button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
}));
if (render) document.body.classList.add("render");
// Inbäddad i appen: dölj egen rubrik och berätta sidans höjd för iframen.
if (query.has("embed")) {
  document.body.classList.add("embed");
  const tell = () => parent.postMessage({ anatomiHojd: Math.ceil(page.getBoundingClientRect().height) }, "*");
  new ResizeObserver(tell).observe(page);
}
window.seek = (time) => { draw(Math.min(TOUR, Math.max(0, time))); };
window.TOUR = TOUR;
if (slider) newSetup(); else if (FIG.init) FIG.init(s);
setMode(mode);
`;

const CURSOR = `<svg id="cursor" viewBox="0 0 30 30" aria-hidden="true"><path d="M4 2 L4 24 L10 18.5 L14.5 28 L18.5 26.2 L14 17 L22 17 Z" fill="#fffaf0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`;

/**
 * Skriver figurens sida, både fristående (<id>.html bredvid byggskriptet) och till appen (public/figurer/anatomi/).
 * fig: { id, here, kicker, title, question, startHint, steps, slider?, chips, idea, swatch?, materials, css, svg, sources, model, figJs, figData }
 */
export function writePage(fig) {
  const modelSrc = readFileSync(join(fig.here, fig.model ?? "model.mjs"), "utf8").replace(/^export /gm, "");
  const sw = fig.swatch;
  const css = BASE_CSS +
    Object.entries(fig.materials).map(([n, t]) => tones(n, t)).join("") +
    `.scene{--krom-l:${fig.materials.krom[0]};--krom-m:${fig.materials.krom[1]};--krom-d:${fig.materials.krom[2]}${sw ? `;--${sw.var}-l:${Object.values(sw.options)[0][0]};--${sw.var}-m:${Object.values(sw.options)[0][1]};--${sw.var}-d:${Object.values(sw.options)[0][2]}` : ""}}` +
    (sw ? `.c-${sw.var}{--l:var(--${sw.var}-l);--m:var(--${sw.var}-m);--d:var(--${sw.var}-d)}` : "") +
    (fig.css ?? "");
  const live = `${modelSrc}\nconst P = ${JSON.stringify(fig.P)};\n${Object.entries(fig.figData ?? {}).map(([n, v]) => `const ${n} = ${JSON.stringify(v)};`).join("\n")}\n${fig.figJs}\n${RUNTIME}`;
  const slider = fig.slider
    ? `<div class="reglage"><label for="reglage">${fig.slider.label}</label><input type="range" id="reglage" min="${fig.slider.min}" max="${fig.slider.max}" step="${fig.slider.step}" value="${fig.slider.value}"><output id="reglage-ut" for="reglage"></output></div>`
    : "";
  const swatches = sw
    ? `<div class="swatches"><span>${sw.label}:</span>${Object.entries(sw.options).map(([n, tones], i) => `<button type="button" data-var="${sw.var}" data-toner='${JSON.stringify(tones)}' aria-label="${n}" aria-pressed="${i === 0}" style="background:${tones[1]}"></button>`).join("")}</div>`
    : "";
  const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fig.title}</title><style>${k.ISO_CSS}${css}</style></head>
<body class="iso manual" data-theme="light">
<main class="page">
  <p class="kicker">${fig.kicker}</p>
  <h1>${fig.question}</h1>
  <p class="hint" id="hint" aria-live="polite">${fig.startHint}</p>
  <div class="layout">
    <aside>
      <div class="switch" role="group" aria-label="Läge">
        <button type="button" data-mode="manual" aria-pressed="true">Manuell</button>
        <button type="button" data-mode="auto" aria-pressed="false">Auto</button>
      </div>
      <ol class="steps">${fig.steps.map((label, i) => `<li><button type="button" class="pill" data-label="${label}"><span class="nr">${i + 1}</span><span class="txt">${label}</span></button></li>`).join("")}</ol>
      <a href="#" class="restart" id="restart">Börja om</a>
      ${slider}
    </aside>
    <figure class="stage scene">${fig.svg}<div class="badge" id="speed"></div></figure>
  </div>
  <section class="under">
    <ul class="chips">${fig.chips.map((c) => `<li>${c.label}<b id="c-${c.id}"${c.width ? ` style="min-width:${c.width}ch"` : ""}></b>${c.star ? "*" : ""}</li>`).join("")}</ul>
    <p class="idea"><strong>Den stora idén:</strong> ${fig.idea}</p>
    ${swatches}
    <p class="kallor">${fig.sources}</p>
  </section>
  ${CURSOR}
</main>
<script type="module">${(kitScript() + "\n" + live).replace(/<\/(script)/gi, "<\\/$1")}</script>
</body></html>`;
  writeFileSync(join(fig.here, `${fig.id}.html`), html);
  writeFileSync(join(fig.here, `../../public/figurer/anatomi/${fig.id}.html`), html);
  console.log(`wrote ${fig.id}.html`, (html.length / 1024).toFixed(0) + " kB");
}
