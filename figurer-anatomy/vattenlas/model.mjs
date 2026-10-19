// Vattenlåset i en golvbrunn som rena funktioner. Allt som rör sig och alla siffror på sidan kommer härifrån.
// Källor (öppnade 2026-10-19): SIS, SS-EN 1253-1:2015: golvbrunnar med vattenlås med minst 50 mm vattenlåsdjup.
// AF Bostäder, Så rengör och rensar du golvbrunnen: rensa minst två gånger per år; ta bort brunnslocket, lyft upp
// vattenlåset, rengör, sätt tillbaka och tryck fast tätringen, spola så att vattenlåset fylls; vattenlåset kan torka ut
// när man varit bortrest, särskilt på sommaren. Fastpartner, Tips: gummilisten ska sluta tätt runt vattenlåset.
// Hur fort vattnet avdunstar har ingen källa (TODO-KONTROLL), därför visas ingen verklig tid och inget fartmärke.

export const STEPS = ["tight", "evaporate", "smell", "pour", "lift", "back"];
export const SHOW = [3.4, 7, 4.4, 4.4, 4.6, 5];
export const GAP = 0.7;
export const FIRST = 1.0;
export const TOUR = 36;
export const START = SHOW.reduce((list, d, i) => [...list, i ? list[i - 1] + SHOW[i - 1] + GAP : FIRST], []);
export const END = START.map((s, i) => s + SHOW[i]);
export const CLICK = START.map((s) => s - 0.1);

export const SEAL_MM = 50; // vattenlåsdjup när låset är fullt
export const DRY_MM = -8; // vattnet har sjunkit 8 mm under klockans kant
export const SETTING_DEFAULT = 0;

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const lerp = (a, b, u) => a + (b - a) * u;

/** Reglaget: 0 = tätringen sitter på plats, 1 = den glappar. */
export function setup(setting = SETTING_DEFAULT) {
  const gap = Math.round(clamp(setting)) === 1;
  return { setting: gap ? 1 : 0, gap, real: STEPS.map(() => null) };
}

export function phaseAt(t) {
  let step = -1, p = 1;
  for (let i = 0; i < STEPS.length; i++) if (t >= START[i]) { step = i; p = clamp((t - START[i]) / SHOW[i]); }
  if (step < 0) return { step: 0, p: 0, running: false };
  return { step, p, running: t < END[step] };
}

/**
 * level: vattnets höjd över klockans kant i mm (negativ = under kanten, då är låset öppet).
 * cup: hur full koppen är 0..1 (töms när vattenlåset lyfts upp och rensas). lift: 0 i brunnen, 1 uppe.
 * hair: hår och tvålrester 0..1. pour: vatten som spolas 0..1.
 */
export function stateOf(step, p, s) {
  const st = { step, p, level: SEAL_MM, cup: 1, lift: 0, hair: 1, pour: 0 };
  if (step === 0) {
    // inget rör sig: vattnet håller lukten ute
  } else if (step === 1) st.level = lerp(SEAL_MM, DRY_MM, p); // avdunstning i jämn takt
  else if (step === 2) st.level = DRY_MM;
  else if (step === 3) {
    st.pour = smooth(0, 0.08, p) * (1 - smooth(0.82, 0.92, p));
    st.level = lerp(DRY_MM, SEAL_MM, smooth(0.08, 0.85, p));
  } else if (step === 4) {
    st.lift = smooth(0, 0.35, p);
    st.cup = 1 - smooth(0.35, 0.55, p);
    st.hair = 1 - smooth(0.5, 0.85, p);
  } else {
    st.hair = 0;
    st.lift = 1 - smooth(0, 0.4, p);
    st.cup = smooth(0.5, 0.9, p);
    st.pour = smooth(0.42, 0.5, p) * (1 - smooth(0.88, 0.96, p));
  }
  // Uppe ur brunnen är koppen tom; vattnets nivå följer hur full den är.
  st.level = st.cup < 1 ? lerp(-40, SEAL_MM, st.cup) : st.level;
  const seated = st.lift < 0.02;
  st.seal = Math.max(0, st.level);
  st.open = seated && st.level < 0; // vattnet når inte klockans kant
  st.leak = seated && s.gap && st.cup > 0.95; // lukt förbi en glappande tätring
  st.smell = st.open || st.leak;
  return st;
}

export function at(t, s) {
  if (t < START[0]) return { ...stateOf(0, 0, s), running: false, t };
  const { step, p, running } = phaseAt(t);
  return { ...stateOf(step, p, s), running, t };
}

export const speedOf = () => "";
