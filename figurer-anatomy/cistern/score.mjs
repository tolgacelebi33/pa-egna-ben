// Musik och ljud till cisternens tur, helt i kod: inga samplingar, inget att licensiera.
// 36 s lo-fi i 84 BPM (Fmaj7, Em7, Dm7, Cmaj7), rund bas, borstade trummor från takt 2, svagt vinylknaster.
// Ovanpå: klick vid varje knapptryck, forsande vatten under spolningen, porl när kranen är öppen,
// en duns när proppen landar och ett tick när flottören stänger. Tiderna tas från model.mjs.
// Kör: node score.mjs ut/ljud-ra.wav
import { writeFileSync } from "node:fs";
import * as M from "./model.mjs";

const SR = 48000;
const N = Math.round(M.TOUR * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const BEAT = 60 / 84, BAR = 4 * BEAT;
const TAU = Math.PI * 2;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// Deterministiskt brus, så att varje körning ger samma fil.
let seed = 20261019;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const noise = () => rnd() * 2 - 1;
const lp = (cut) => { const a = 1 - Math.exp((-TAU * cut) / SR); let y = 0; return (x) => (y += a * (x - y)); };
const hp = (cut) => { const f = lp(cut); return (x) => x - f(x); };
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan) * 0.5 * 2 ** 0.5; R[i] += v * (1 + pan) * 0.5 * 2 ** 0.5; } };

// Elpiano: grundton, svag oktav och ett kort klockanslag, mjuk tremolo.
function ep(t0, midi, vel, pan) {
  const f = hz(midi), len = 2.6;
  for (let n = 0; n < len * SR; n++) {
    const t = n / SR, env = Math.min(1, t / 0.006) * Math.exp(-t / 1.3);
    const trem = 1 - 0.12 * (0.5 + 0.5 * Math.sin(TAU * 4.6 * (t0 + t)));
    const v = Math.sin(TAU * f * t) + 0.22 * Math.sin(TAU * 2 * f * t) + 0.12 * Math.exp(-t / 0.05) * Math.sin(TAU * 7.1 * f * t);
    add(Math.round((t0 + t) * SR), vel * env * trem * v, pan);
  }
}
function bass(t0, midi, len, vel) {
  const f = hz(midi);
  for (let n = 0; n < len * SR; n++) {
    const t = n / SR, env = Math.min(1, t / 0.012) * Math.exp(-t / 0.7) * Math.min(1, (len - t) / 0.05);
    add(Math.round((t0 + t) * SR), vel * env * Math.tanh(1.6 * Math.sin(TAU * f * t)) * 0.7);
  }
}
function kick(t0, vel) {
  let ph = 0;
  for (let n = 0; n < 0.3 * SR; n++) {
    const t = n / SR, f = 48 + 70 * Math.exp(-t / 0.04);
    ph += (TAU * f) / SR;
    add(Math.round((t0 + t) * SR), vel * Math.exp(-t / 0.11) * Math.sin(ph));
  }
}
function brush(t0, vel, len, pan) {
  const h = hp(1800), l = lp(7000);
  for (let n = 0; n < len * SR; n++) {
    const t = n / SR, env = Math.min(1, t / 0.02) * Math.exp(-t / (len * 0.35));
    add(Math.round((t0 + t) * SR), vel * env * l(h(noise())), pan);
  }
}

// Ackord en takt var: Fmaj7, Em7, Dm7, Cmaj7.
const CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
const ROOTS = [41, 40, 38, 36];
const SWING = BEAT * 0.58; // svängd åttondel
for (let bar = 0; bar * BAR < M.TOUR; bar++) {
  const t = bar * BAR, c = CHORDS[bar % 4];
  c.forEach((m, i) => ep(t + i * 0.012, m, 0.055, i % 2 ? 0.25 : -0.25));
  c.slice(1).forEach((m, i) => ep(t + BEAT + SWING + i * 0.01, m + 12 * (i === 2), 0.032, i % 2 ? -0.3 : 0.3));
  bass(t, ROOTS[bar % 4], BEAT * 1.4, 0.17);
  bass(t + 2 * BEAT + SWING, ROOTS[bar % 4] + 7, BEAT * 0.9, 0.12);
  if (bar >= 1) {
    kick(t, 0.32); kick(t + 2 * BEAT + SWING, 0.22);
    brush(t + BEAT, 0.07, 0.32, 0.1); brush(t + 3 * BEAT, 0.07, 0.32, 0.1);
    for (let e = 0; e < 4; e++) { brush(t + e * BEAT, 0.018, 0.12, -0.35); brush(t + e * BEAT + SWING, 0.012, 0.1, -0.35); }
  }
}
// Vinylknaster: gles prassel och ett svagt sus.
{
  const h = hp(900), l = lp(5000);
  for (let n = 0; n < N; n++) {
    const hiss = 0.0035 * l(h(noise()));
    const pop = rnd() < 7 / SR ? (0.03 + 0.05 * rnd()) * (rnd() < 0.5 ? -1 : 1) : 0;
    add(n, hiss + pop, noise() * 0.6);
  }
}
// Lo-fi-filter på musiken, in- och uttoning.
{
  const fl = lp(5200), fr = lp(5200);
  for (let n = 0; n < N; n++) {
    const t = n / SR, g = Math.min(1, t / 0.4) * Math.min(1, (M.TOUR - t) / 1.6);
    L[n] = fl(L[n]) * g; R[n] = fr(R[n]) * g;
  }
}

// Ljud ur modellen, exakt på bildens sekunder.
const s = M.setup();
const fx = new Float32Array(N);
for (const c of M.CLICK) { // klick när markören trycker
  for (let n = 0; n < 0.03 * SR; n++) { const t = n / SR; fx[Math.round((c + t) * SR)] += 0.22 * Math.exp(-t / 0.004) * (0.6 * noise() + Math.sin(TAU * 2200 * t)); }
}
{
  const whooshF = lp(1100), trickleH = hp(2400), trickleL = lp(6000);
  let prevH = M.at(0, s).h, bubble = 0;
  for (let n = 0; n < N; n++) {
    const t = n / SR, st = M.at(t, s);
    const out = st.step === 1 || st.step === 2 ? Math.max(0, prevH - st.h) * SR * 2.2 : 0; // utflöde ur nivåns fall
    prevH = st.h;
    fx[n] += 0.5 * Math.min(1, out) * whooshF(noise());
    if (rnd() < 18 / SR) bubble = 1;
    bubble *= 0.9994;
    fx[n] += 0.09 * st.valve * (0.5 + 0.5 * bubble) * trickleL(trickleH(noise()));
  }
}
const thud = M.START[2] + 0.7 * M.SHOW[2]; // proppen landar
for (let n = 0; n < 0.12 * SR; n++) { const t = n / SR; fx[Math.round((thud + t) * SR)] += 0.25 * Math.exp(-t / 0.03) * Math.sin(TAU * 150 * t); }
{ // tick när kranen stänger: första stunden i steg 5 då ventilen är nära stängd
  let tick = M.END[4];
  for (let t = M.START[4]; t < M.END[4]; t += 0.005) if (M.at(t, s).valve < 0.02) { tick = t; break; }
  for (let n = 0; n < 0.02 * SR; n++) { const t = n / SR; fx[Math.round((tick + t) * SR)] += 0.16 * Math.exp(-t / 0.003) * Math.sin(TAU * 3500 * t); }
}
for (let n = 0; n < N; n++) { L[n] += fx[n]; R[n] += fx[n]; }

// 16-bitars stereo-WAV. Normaliseras grovt här; slutlig nivå sätts med ffmpeg loudnorm.
let peak = 0;
for (let n = 0; n < N; n++) peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
const gain = 0.7 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[n] * gain)) * 32767), 44 + n * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[n] * gain)) * 32767), 46 + n * 4);
}
writeFileSync(process.argv[2] ?? "ut/ljud-ra.wav", buf);
console.log("wrote", process.argv[2] ?? "ut/ljud-ra.wav", M.TOUR + " s");
