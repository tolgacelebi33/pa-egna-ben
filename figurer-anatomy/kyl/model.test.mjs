// Självkontroll: inga hopp mellan stegen, tidslinjen ryms i 36 s, källornas siffror i reglagets lägen.
import assert from "node:assert/strict";
import * as M from "./model.mjs";
assert.ok(Math.abs(M.CLICK[0] - 0.9) < 1e-9 && M.END.at(-1) <= M.TOUR - 1, "första klick 0.9 s, tur inom 36 s");
assert.deepEqual(M.ROOMS.map((r) => r.limitH), [4, 3, 2]);
assert.equal(M.SHOW.indexOf(Math.max(...M.SHOW)), 3, "klockan är det långsammaste steget");
for (const set of [0, 1, 2]) {
  const s = M.setup(set);
  let prev = M.at(0, s);
  for (let t = 0.01; t <= M.TOUR; t += 0.01) {
    const now = M.at(t, s);
    for (const key of ["knob", "temp", "meat", "box", "ice", "drawer", "bowl"]) assert.ok(Math.abs(now[key] - prev[key]) < 0.06, `${key} hoppar vid t=${t.toFixed(2)}`);
    assert.ok(Math.abs(now.hours - prev.hours) < s.outH * 0.01 + 1e-9, `timmar hoppar vid ${t.toFixed(2)}`);
    prev = now;
  }
  assert.ok(M.at(M.TOUR, s).hours < s.room.limitH, "maten ställs in före gränsen");
}
console.log("modell ok | start", M.START.map((x) => x.toFixed(1)).join(" "), "| slut", M.END.at(-1).toFixed(1), "| fart", M.STEPS.map((_, i) => M.speedOf(i, M.setup(0)) || "-").join(" "));
