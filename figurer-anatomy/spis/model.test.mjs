// Självkontroll: inga hopp, tiden ryms, locket är det långsammaste steget, bara magnetiska kastruller blir varma och brinner.
import assert from "node:assert/strict";
import * as M from "./model.mjs";
assert.ok(Math.abs(M.CLICK[0] - 0.9) < 1e-9 && M.END.at(-1) <= M.TOUR - 1);
assert.equal(M.SHOW.indexOf(Math.max(...M.SHOW)), 4, "locket är det långsammaste steget");
for (const set of [0, 1, 2, 3]) {
  const s = M.setup(set);
  let prev = M.at(0, s);
  for (let t = 0.01; t <= M.TOUR; t += 0.01) {
    const now = M.at(t, s);
    for (const key of ["magnet", "drop", "on", "heat", "smoke", "fire", "lid", "air", "away"]) assert.ok(Math.abs(now[key] - prev[key]) < 0.06, `${key} hoppar vid t=${t.toFixed(2)} (${set})`);
    prev = now;
  }
  const peak = Math.max(...Array.from({ length: 360 }, (_, i) => M.at(i / 10, s).fire));
  assert.equal(peak > 0.5, s.magnetic, "elden finns bara med magnetisk kastrull");
  assert.equal(M.at(M.TOUR, s).fire, 0, "locket har kvävt elden");
}
console.log("modell ok | start", M.START.map((x) => x.toFixed(1)).join(" "), "| slut", M.END.at(-1).toFixed(1));
