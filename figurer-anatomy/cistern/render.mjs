// Stillbilder, rörelsekontroll och inspelning av cisternens tur via window.seek(t).
//   node render.mjs stills <mapp>          mitt i varje steg + överfyllt läge
//   node render.mjs scrub <mapp>           var 0,1 s över hela turen, bara scenen
//   node render.mjs video <fil.mp4>        60 bilder/s, 1500×1320, H.264
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const [what, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1320 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(pathToFileURL(join(HERE, "cistern.html")).href + "?render");
await page.waitForFunction(() => typeof window.seek === "function");
await page.evaluate(() => document.fonts.ready);
const seek = (t) => page.evaluate((x) => window.seek(x), t);

if (what === "stills") {
  mkdirSync(out, { recursive: true });
  const shots = [["0-start", 0], ...M.STEPS.map((n, i) => [`${i + 1}-${n}`, (M.START[i] + M.END[i]) / 2])];
  for (const [name, t] of shots) { await seek(t); await page.screenshot({ path: join(out, `${name}.png`) }); }
  await page.evaluate(() => { const el = document.getElementById("flottorlage"); el.value = "1"; el.dispatchEvent(new Event("input")); });
  await seek((M.START[4] + M.END[4]) / 2);
  await page.screenshot({ path: join(out, "6-overfullt.png") });
  console.log("stills:", shots.length + 1);
} else if (what === "scrub") {
  mkdirSync(out, { recursive: true });
  const stage = await page.locator(".stage").boundingBox();
  let i = 0;
  for (let t = 0; t <= M.TOUR + 1e-9; t += 0.1, i++) {
    await seek(t);
    await page.screenshot({ path: join(out, `f${String(i).padStart(4, "0")}.png`), clip: stage });
  }
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
