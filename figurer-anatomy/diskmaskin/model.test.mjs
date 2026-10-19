// Självkontroll: inga hopp, tiden ryms, källans siffror vid stegens slut, årssiffror från reglaget.
import assert from "node:assert/strict";
import * as M from "./model.mjs";
assert.ok(Math.abs(M.CLICK[0] - 0.9) < 1e-9 && M.END.at(-1) <= M.TOUR - 1, "tur inom 36 s");
assert.equal(M.SHOW.indexOf(Math.max(...M.SHOW)), 2, "disken är det långsammaste steget");
const s = M.setup(4);
assert.equal(s.yearMachine, Math.round(11.8 * 4 * 52));
let prev = M.at(0, s);
for (let t = 0.01; t <= M.TOUR; t += 0.01) {
  const now = M.at(t, s);
  for (const key of ["dishes", "on", "water", "jets", "filterLift", "crumbs", "armLift", "clogged", "press"]) assert.ok(Math.abs(now[key] - prev[key]) < 0.06, `${key} hoppar vid t=${t.toFixed(2)}`);
  assert.ok(Math.abs(now.spin - prev.spin) < 0.1, `spin hoppar vid ${t.toFixed(2)}`);
  prev = now;
}
assert.equal(M.at(M.END[2], s).machineL, 11.8);
assert.equal(M.at(M.END[3], s).handL, 44.2);
console.log("modell ok | start", M.START.map((x) => x.toFixed(1)).join(" "), "| slut", M.END.at(-1).toFixed(1), "| fart", M.STEPS.map((_, i) => M.speedOf(i, s) || "-").join(" "));
