// Självkontroll: inga hopp, tiden ryms, låset är tätt fullt och öppet uttorkat, turen slutar där den börjar.
import assert from "node:assert/strict";
import * as M from "./model.mjs";
assert.ok(Math.abs(M.CLICK[0] - 0.9) < 1e-9 && M.END.at(-1) <= M.TOUR - 1);
assert.equal(M.SHOW.indexOf(Math.max(...M.SHOW)), 1, "avdunstningen är det långsammaste steget");
for (const set of [0, 1]) {
  const s = M.setup(set);
  let prev = M.at(0, s);
  for (let t = 0.01; t <= M.TOUR; t += 0.01) {
    const now = M.at(t, s);
    for (const key of ["level", "cup", "lift", "hair", "pour"]) assert.ok(Math.abs(now[key] - prev[key]) < (key === "level" ? 1.5 : 0.06), `${key} hoppar vid t=${t.toFixed(2)}`);
    prev = now;
  }
  assert.equal(M.at(M.START[0] + 1, s).open, false, "fullt lås är tätt");
  assert.equal(M.at(M.START[2] + 1, s).open, true, "uttorkat lås släpper igenom lukt");
  assert.equal(M.at(M.TOUR, s).level, M.at(0, s).level, "turen slutar där den börjar");
  assert.equal(M.at(M.TOUR, s).smell, s.gap, "efter rensning luktar det bara om tätringen glappar");
}
console.log("modell ok | start", M.START.map((x) => x.toFixed(1)).join(" "), "| slut", M.END.at(-1).toFixed(1));
