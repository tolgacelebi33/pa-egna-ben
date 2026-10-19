// Stillbilder, rörelsekontroll och inspelning av en figurs tur via window.seek(t).
//   node delat/render.mjs <figur> stills <mapp> [reglage]   mitt i varje steg, och med reglaget på värdet om det anges
//   node delat/render.mjs <figur> scrub <mapp>              var 0,1 s över hela turen, bara scenen (+ tidslinje.json)
//   node delat/render.mjs <figur> video <fil.mp4>           60 bilder/s, 1500×1320, H.264
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [id, what, out, extra] = process.argv.slice(2);
const HERE = join(ROOT, id);
const M = await import(pathToFileURL(join(HERE, "model.mjs")).href);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1320 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(pathToFileURL(join(HERE, `${id}.html`)).href + "?render");
await page.waitForFunction(() => typeof window.seek === "function");
await page.evaluate(() => document.fonts.ready);
const seek = (t) => page.evaluate((x) => window.seek(x), t);

if (what === "stills") {
  mkdirSync(out, { recursive: true });
  const shots = [["0-start", 0], ...M.STEPS.map((n, i) => [`${i + 1}-${n}`, (M.START[i] + M.END[i]) / 2])];
  for (const [name, t] of shots) { await seek(t); await page.screenshot({ path: join(out, `${name}.png`) }); }
  if (extra !== undefined) {
    await page.evaluate((v) => { const el = document.getElementById("reglage"); el.value = v; el.dispatchEvent(new Event("input")); }, extra);
    for (const [name, t] of shots.slice(1)) { await seek(t); await page.screenshot({ path: join(out, `reglage-${name}.png`) }); }
  }
  console.log("stills:", shots.length * (extra !== undefined ? 2 : 1) - (extra !== undefined ? 1 : 0));
} else if (what === "scrub") {
  mkdirSync(out, { recursive: true });
  const stage = await page.locator(".stage").boundingBox();
  let i = 0;
  for (let t = 0; t <= M.TOUR + 1e-9; t += 0.1, i++) {
    await seek(t);
    await page.screenshot({ path: join(out, `f${String(i).padStart(4, "0")}.png`), clip: stage });
  }
  writeFileSync(join(out, "tidslinje.json"), JSON.stringify({ start: M.START, show: M.SHOW }));
  console.log("scrub frames:", i);
} else if (what === "video") {
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", "60", "-c:v", "png", "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const frames = Math.round(M.TOUR * 60);
  for (let f = 0; f < frames; f++) {
    await seek(f / 60);
    const png = await page.screenshot({ type: "png" });
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 600 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on("close", (c) => (c ? j(new Error("ffmpeg " + c)) : r())));
  console.log("video:", out, frames, "frames");
}
console.log(errors.length ? "page errors: " + errors.join(" | ") : "page errors: none");
await browser.close();
