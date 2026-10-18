// Elskåpet i 3D: skåpet på väggen, ledningar ned till fyra rum med varsin lampa.
// Modellen är en vy: React äger läget och skickar det med uppdatera().
import {
  Group,
  Mesh,
  SphereGeometry,
  CylinderGeometry,
  TubeGeometry,
  CatmullRomCurve3,
  PlaneGeometry,
  MeshBasicMaterial,
  CanvasTexture,
  Vector3,
} from 'three';
import { farg, lada, rundCylinder, medKontur } from '../delat/tre/material.js';

const MODUL_Y = 6.0;
const FRAM = 1.4;
const JFB_X = -2.1;
const SAKRING_X = [-0.95, -0.15, 0.65, 1.45];
const RUM_X = [-4.3, -1.45, 1.45, 4.3];
const RUM_Z = 5.4;
const VINKEL_PA = -0.55;
const VINKEL_AV = 0.55;

function skuggtextur() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  r.addColorStop(0, 'rgba(42,37,34,0.22)');
  r.addColorStop(1, 'rgba(42,37,34,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

export function byggElskap(motor, { texter, handelser, reduceraRorelse }) {
  const modell = new Group();
  modell.position.y = -3.6;
  motor.rot.add(modell);

  // Golv och vägg
  const golvskugga = new Mesh(new PlaneGeometry(16, 10), new MeshBasicMaterial({ map: skuggtextur(), transparent: true, depthWrite: false }));
  golvskugga.rotation.x = -Math.PI / 2;
  golvskugga.position.set(0, 0.01, 4.5);
  modell.add(golvskugga);
  const vagg = lada(9, 8.6, 0.3, 0.08, farg('#ebe4d6'), 0.04);
  vagg.position.set(0, 4.3, -0.15);
  modell.add(vagg);

  // Skåpet
  const skap = lada(6, 5, 1.4, 0.2, farg('#e3ded4'), 0.05);
  skap.position.set(0, 5.6, FRAM / 2);
  modell.add(skap);
  const inre = lada(5.3, 4.3, 0.1, 0.08, farg('#d2cbbf'), 0.03);
  inre.position.set(0, 5.6, FRAM + 0.02);
  modell.add(inre);
  const skena = lada(5.0, 0.35, 0.15, 0.04, farg('#a9a59d'), 0.02);
  skena.position.set(0, MODUL_Y, FRAM + 0.1);
  modell.add(skena);

  // Moduler och spakar
  const klickbara = [];
  const spakar = [];
  function modul(x, bredd, nr) {
    const m = lada(bredd, 1.7, 0.55, 0.08, farg(nr === -1 ? '#f4efe2' : '#fbf9f4'), 0.035);
    m.position.set(x, MODUL_Y, FRAM + 0.3);
    modell.add(m);
    const vridpunkt = new Group();
    vridpunkt.position.set(x, MODUL_Y + 0.1, FRAM + 0.6);
    modell.add(vridpunkt);
    const spakMaterial = farg('#3d3833');
    const spak = lada(0.3, 0.6, 0.24, 0.07, spakMaterial, 0.025);
    spak.position.y = 0.28;
    spak.userData.klick = nr;
    vridpunkt.add(spak);
    vridpunkt.rotation.x = VINKEL_PA;
    klickbara.push(spak, m);
    m.userData.klick = nr;
    spakar.push({ vridpunkt, material: spakMaterial, modul: m });
  }
  modul(JFB_X, 1.2, -1);
  SAKRING_X.forEach((x, i) => modul(x, 0.7, i));

  const test = rundCylinder(0.16, 0.14, 0.04, farg('#d9a441'), 0.025, 20);
  test.rotation.x = Math.PI / 2;
  test.position.set(JFB_X + 0.3, MODUL_Y - 0.55, FRAM + 0.62);
  test.userData.klick = 'test';
  modell.add(test);
  klickbara.push(test);

  // Rum med golv och lampa
  const rum = RUM_X.map((x, i) => {
    const g = new Group();
    g.position.set(x, 0, RUM_Z);
    modell.add(g);
    const golv = lada(2.5, 0.22, 2.5, 0.08, farg('#e2d6c2'), 0.035);
    golv.position.y = 0.11;
    g.add(golv);
    const stav = new Mesh(new CylinderGeometry(0.05, 0.05, 1.1, 8), farg('#5f5a53'));
    stav.position.y = 0.75;
    g.add(stav);
    const sockel = rundCylinder(0.22, 0.25, 0.05, farg('#8d877e'), 0.025, 16);
    sockel.position.y = 1.35;
    g.add(sockel);
    const lampMaterial = new MeshBasicMaterial({ color: '#f3cf62' });
    const lampa = new Mesh(new SphereGeometry(0.45, 24, 16), lampMaterial);
    lampa.position.y = 1.8;
    medKontur(lampa, 0.035);
    g.add(lampa);
    const sken = new Mesh(new SphereGeometry(0.85, 24, 16), new MeshBasicMaterial({ color: '#f6d77a', transparent: true, opacity: 0.25, depthWrite: false }));
    sken.position.y = 1.8;
    g.add(sken);
    return { grupp: g, lampMaterial, sken, golv, nr: i };
  });

  // Apparater i köket
  const apparater = [0, 1, 2].map((a) => {
    const m = lada(0.45, 0.55, 0.45, 0.1, farg(['#fbf9f4', '#c8664a', '#8fa58a'][a]), 0.03);
    m.position.set(-0.75 + a * 0.75, 0.5, 0.75);
    rum[0].grupp.add(m);
    return m;
  });

  // Ledningar från varje säkring, ned längs väggen och fram till rummet
  const ledningar = SAKRING_X.map((x, i) => {
    const kurva = new CatmullRomCurve3(
      [
        new Vector3(x, MODUL_Y - 0.9, FRAM + 0.1),
        new Vector3(x, 3.4, FRAM - 0.2),
        new Vector3(x * 0.9, 2.2, 0.35),
        new Vector3(x * 0.9 + (RUM_X[i] - x * 0.9) * 0.3, 0.25, 1.2),
        new Vector3(RUM_X[i], 0.25, RUM_Z - 1.6),
        new Vector3(RUM_X[i], 0.3, RUM_Z - 0.4),
      ],
      false,
      'catmullrom',
      0.2,
    );
    const material = farg('#2a2522');
    const m = new Mesh(new TubeGeometry(kurva, 64, 0.07, 8), material);
    modell.add(m);
    return { mesh: m, material, kurva };
  });

  // Etiketter
  const e = (obj, nyckel, offset, ut, klass = '') => motor.laggTillEtikett(obj, texter[nyckel], offset, klass, ut);
  e(spakar[0].modul, 'jfb', [-0.3, 0.6, 0.3], [-90, -50]);
  e(test, 'testknapp', [0, 0, 0], [-90, 20]);
  e(spakar[3].modul, 'sakring', [0, 0.75, 0.3], [70, -60]);
  const etikettUtlost = e(spakar[1].modul, 'utlost', [0, -0.5, 0.3], [-110, 70]);
  e(ledningar[0].mesh, 'ledning', [RUM_X[0] * 0.5, 0.3, 2.6], [-80, -30]);
  e(rum[0].grupp, 'apparater', [0, 0.8, 0.75], [-70, 30]);
  rum.forEach((r) => motor.laggTillEtikett(r.grupp, texter[`rum.${r.nr}`], [0, 0.2, 1.5], 'korg'));

  function tween(fran, till, ms, satt) {
    if (reduceraRorelse || ms === 0) {
      satt(till);
      motor.rita();
      return;
    }
    let tid = 0;
    motor.animera((dt) => {
      tid += dt * 1000;
      const t = Math.min(1, tid / ms);
      satt(fran + (till - fran) * (1 - (1 - t) ** 3));
      return t < 1;
    });
  }

  let stoppaVarm = null;
  function uppdatera(l) {
    const spakLagen = [
      { pa: l.jfb, utlost: l.jfbUtlost },
      ...l.sakringar.map((pa, i) => ({ pa, utlost: l.utlosta[i] })),
    ];
    spakar.forEach((s, i) => {
      const mal = spakLagen[i].pa ? VINKEL_PA : VINKEL_AV;
      if (Math.abs(s.vridpunkt.rotation.x - mal) > 0.01) tween(s.vridpunkt.rotation.x, mal, 220, (v) => (s.vridpunkt.rotation.x = v));
      s.material.color.set(spakLagen[i].utlost ? '#c8664a' : '#3d3833');
    });
    etikettUtlost.synlig = l.utlosta[0];
    rum.forEach((r, i) => {
      const tand = l.jfb && l.sakringar[i];
      r.lampMaterial.color.set(tand ? '#f3cf62' : '#b8b2a8');
      r.sken.visible = tand;
      ledningar[i].material.color.set(tand ? '#2a2522' : '#a19b92');
    });
    apparater.forEach((a, i) => {
      a.visible = i < l.apparater;
    });
    stoppaVarm?.();
    stoppaVarm = null;
    if (l.varm) {
      let tid = 0;
      stoppaVarm = motor.animera((dt) => {
        tid += dt;
        const puls = (Math.sin(tid * 18) + 1) / 2;
        ledningar[0].material.color.setRGB(0.78, 0.4 - puls * 0.15, 0.29 - puls * 0.1);
        ledningar[0].mesh.scale.setScalar(1 + puls * 0.02);
        return true;
      });
      if (reduceraRorelse) ledningar[0].material.color.set('#c8664a');
    } else {
      ledningar[0].mesh.scale.setScalar(1);
    }
    motor.rita();
  }

  // Klick på spakar, moduler och testknappen
  const canvas = motor.renderare.domElement;
  let ner = null;
  canvas.addEventListener('pointerdown', (ev) => {
    const t = motor.traff(ev, klickbara);
    ner = { x: ev.clientX, y: ev.clientY, mal: t ? t.object.userData.klick : null };
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (ev.pointerType === 'mouse' && !ev.buttons) canvas.style.cursor = motor.traff(ev, klickbara) ? 'pointer' : 'grab';
  });
  canvas.addEventListener('pointerup', (ev) => {
    if (!ner) return;
    const flyttat = Math.hypot(ev.clientX - ner.x, ev.clientY - ner.y) > 6;
    const mal = ner.mal;
    ner = null;
    if (flyttat || mal === null || mal === undefined) return;
    if (mal === 'test') handelser.onTest();
    else if (mal === -1) handelser.onJfb();
    else handelser.onSakring(mal);
  });

  return { uppdatera };
}
