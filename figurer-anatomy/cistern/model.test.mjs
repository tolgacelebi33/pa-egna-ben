// Självkontroll av modellen: kontinuitet mellan steg, rätt liter och tidslinjen på 36 s.
import assert from "node:assert/strict";
import * as M from "./model.mjs";
const s = M.setup();
assert.ok(Math.abs(s.liters - 4) < 1e-9, "fabriksläget ger 4 l");
assert.ok(Math.abs(M.CLICK[0] - 0.9) < 1e-9 && M.END.at(-1) <= M.TOUR, "första klick 0.9 s, tur inom 36 s");
for (const set of [0, 0.3, 0.6131, 0.9, 1]) {
  const c = M.setup(set);
  let prev = M.at(0, c);
  for (let t = 0.01; t <= M.TOUR; t += 0.01) {
    const now = M.at(t, c);
    for (const key of ["h", "lift", "press", "out"]) assert.ok(Math.abs(now[key] - prev[key]) < 0.05, `${key} hoppar vid t=${t.toFixed(2)} (${set})`);
    prev = now;
  }
  assert.ok(Math.abs(M.at(M.TOUR, c).h - M.at(0, c).h) < 1e-9, "turen slutar där den börjar");
}
assert.equal(M.setup(1).runs, true, "för högt läge rinner över");
console.log("modell ok:", M.START.map((x) => x.toFixed(1)).join(" "), "| slut", M.END.at(-1).toFixed(1), "| fart", M.STEPS.map((_, i) => M.speedOf(i, s)).join(" "));
