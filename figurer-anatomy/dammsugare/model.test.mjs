// Självkontroll: inga hopp, tiden ryms, svagare luftflöde i steg 2, fullt igen efter rensning.
import assert from "node:assert/strict";
import * as M from "./model.mjs";
assert.ok(Math.abs(M.CLICK[0] - 0.9) < 1e-9 && M.END.at(-1) <= M.TOUR - 1);
assert.equal(M.SHOW.indexOf(Math.max(...M.SHOW)), 1, "det svaga suget är det långsammaste steget");
for (const set of [0, 2, 4, 6, 8]) {
  const s = M.setup(set);
  let prev = M.at(0, s);
  for (let t = 0.01; t <= M.TOUR; t += 0.01) {
    const now = M.at(t, s);
    for (const key of ["sucked", "fill", "dirt", "hair", "plug", "lid", "bagSwap", "filterLift", "motor", "flow"]) {
      const lim = key === "fill" && Math.abs(now.bagSwap - 1) < 0.08 ? 1 : 0.06; // påsen byts mitt i steg 4
      assert.ok(Math.abs(now[key] - prev[key]) < lim, `${key} hoppar vid t=${t.toFixed(2)} (${set})`);
    }
    prev = now;
  }
  if (s.months >= M.BAG_MONTHS) assert.ok(M.at(M.END[1], s).weak, "gammal påse och smutsiga filter: svagt sug i steg 2");
  else assert.ok(!M.at(M.END[1], s).weak, "ny påse: suget håller");
  assert.ok(M.at(M.END[5], s).flow > 0.85, "fullt flöde efter rensning");
  assert.equal(M.at(M.END[5], s).sucked, 1, "mattan är ren till slut");
}
console.log("modell ok | start", M.START.map((x) => x.toFixed(1)).join(" "), "| slut", M.END.at(-1).toFixed(1));
