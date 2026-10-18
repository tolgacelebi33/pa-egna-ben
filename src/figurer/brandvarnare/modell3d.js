// Brandvarnaren i 3D. Den ligger nedtagen från taket med testknappen uppåt, och går att vrida runt.
// Modellen är en vy: React äger läget och anropar funktionerna här.
import { Group, Mesh, TorusGeometry, SphereGeometry, PlaneGeometry, MeshBasicMaterial, CanvasTexture, Vector3 } from 'three';
import { farg, lada, rundCylinder } from '../delat/tre/material.js';

function skuggtextur() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  r.addColorStop(0, 'rgba(42,37,34,0.3)');
  r.addColorStop(1, 'rgba(42,37,34,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

const LYFT = 3.2;
const UT = 4.5;

export function byggBrandvarnare(motor, { texter, handelser, reduceraRorelse }) {
  const modell = new Group();
  modell.position.y = -1.4;
  motor.rot.add(modell);

  const skugga = new Mesh(new PlaneGeometry(9, 9), new MeshBasicMaterial({ map: skuggtextur(), transparent: true, depthWrite: false }));
  skugga.rotation.x = -Math.PI / 2;
  skugga.position.set(0.4, 0.01, 0.4);
  modell.add(skugga);

  // Fästet mot taket
  const bas = rundCylinder(3.1, 0.4, 0.12, farg('#ddd5c8'), 0.05, 64);
  bas.position.y = 0.2;
  modell.add(bas);

  // Insidan: rökkammare, ljudsändare och batteri
  const rok = rundCylinder(0.95, 0.9, 0.12, farg('#5a544d'), 0.04, 40);
  rok.position.set(-0.7, 0.85, -0.6);
  modell.add(rok);
  const labyrint = new Mesh(new TorusGeometry(0.55, 0.06, 8, 32), farg('#d8d0c2'));
  labyrint.rotation.x = Math.PI / 2;
  labyrint.position.y = 0.46;
  rok.add(labyrint);
  const ljud = rundCylinder(0.6, 0.25, 0.08, farg('#b9c1c8'), 0.035, 32);
  ljud.position.set(-0.9, 0.53, 1.4);
  modell.add(ljud);

  const batteri = (hex) => {
    const g = new Group();
    const b = lada(1.5, 0.75, 1.0, 0.1, farg(hex), 0.04);
    g.add(b);
    for (const z of [-0.22, 0.22]) {
      const pol = rundCylinder(0.13, 0.12, 0.03, farg('#d8d0c2'), 0.02, 16);
      pol.position.set(-0.35, 0.42, z);
      g.add(pol);
    }
    const rand = lada(0.6, 0.04, 0.12, 0.02, farg('#2a2522'), 0.01);
    rand.position.set(0.3, 0.39, -0.25);
    g.add(rand);
    g.position.set(1.3, 0.77, -0.5);
    modell.add(g);
    return g;
  };
  const gammalt = batteri('#a9a291');
  const nytt = batteri('#d9a441');
  const BATTERI_HEMMA = gammalt.position.clone();
  const BATTERI_UTE = BATTERI_HEMMA.clone().add(new Vector3(UT, 0, 0.6));
  nytt.position.copy(BATTERI_UTE);
  nytt.visible = false;

  // Locket: hölje, öppningar för rök, kupol, lampa och testknapp
  const lock = new Group();
  modell.add(lock);
  const holjeMaterial = farg('#f3eee5', { transparent: true });
  const holje = rundCylinder(2.95, 1.3, 0.3, holjeMaterial, 0.05, 64);
  holje.position.y = 1.05;
  lock.add(holje);
  const ventiler = new Group();
  lock.add(ventiler);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const v = lada(0.1, 0.7, 0.3, 0.04, farg('#8d867c'), 0.015);
    v.position.set(Math.cos(a) * 2.98, 1.05, Math.sin(a) * 2.98);
    v.rotation.y = -a;
    ventiler.add(v);
  }
  const kupolMaterial = farg('#fbf8f2', { transparent: true });
  const kupol = rundCylinder(2.1, 0.35, 0.15, kupolMaterial, 0.04, 64);
  kupol.position.y = 1.85;
  lock.add(kupol);

  const ledMaterial = new MeshBasicMaterial({ color: '#6b5f58' });
  const led = new Mesh(new SphereGeometry(0.13, 16, 12), ledMaterial);
  led.position.set(1.3, 2.05, 0.5);
  lock.add(led);

  const knapp = rundCylinder(0.62, 0.32, 0.1, farg('#c8664a'), 0.04, 40);
  knapp.position.y = 2.15;
  knapp.userData.klick = 'knapp';
  lock.add(knapp);

  // Ljudvågor
  const vagor = [0, 1, 2].map(() => {
    const m = new Mesh(new TorusGeometry(3.4, 0.07, 6, 80), new MeshBasicMaterial({ color: '#c8664a', transparent: true, opacity: 0 }));
    m.rotation.x = Math.PI / 2;
    m.position.y = 2.4;
    m.visible = false;
    lock.add(m);
    return m;
  });

  // Etiketter
  const e = (obj, nyckel, offset, ut, klass = '') => motor.laggTillEtikett(obj, texter[nyckel], offset, klass, ut);
  e(knapp, 'testknapp', [0, 0.2, 0], [-90, -50]);
  e(led, 'lysdiod', [0, 0, 0], [80, -50]);
  e(ventiler, 'ventiler', [-2.3, 1.05, 2.3], [-90, 30]);
  e(bas, 'bottenplatta', [2.4, 0, 2.2], [90, 30]);
  const insida = [
    e(rok, 'rokkammare', [0, 0.45, 0], [-100, -30]),
    e(ljud, 'ljudsandare', [0, 0.15, 0], [-90, 20]),
    e(gammalt, 'batteri', [0, 0.4, 0], [90, -20]),
  ];

  function tween(fran, till, ms, satt, klar) {
    if (reduceraRorelse || ms === 0) {
      satt(till);
      klar?.();
      motor.rita();
      return () => {};
    }
    let tid = 0;
    return motor.animera((dt) => {
      tid += dt * 1000;
      const t = Math.min(1, tid / ms);
      const e2 = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      satt(fran + (till - fran) * e2);
      if (t >= 1) {
        klar?.();
        return false;
      }
      return true;
    });
  }

  let oppen = false;
  let genomskinlig = false;
  function uppdateraInsida() {
    const syns = oppen || genomskinlig;
    for (const et of insida) et.synlig = syns;
    insida[2].objekt = nytt.visible ? nytt : gammalt;
    const alfa = genomskinlig && !oppen ? 0.25 : 1;
    holjeMaterial.opacity = alfa;
    kupolMaterial.opacity = alfa;
    holjeMaterial.depthWrite = alfa === 1;
    kupolMaterial.depthWrite = alfa === 1;
    holje.children[0].visible = alfa === 1; // konturen
    kupol.children[0].visible = alfa === 1;
    motor.rita();
  }

  function sattOppen(ja) {
    oppen = ja;
    tween(lock.position.y, ja ? LYFT : 0, 700, (v) => {
      lock.position.y = v;
      lock.rotation.z = (v / LYFT) * 0.12;
    });
    uppdateraInsida();
  }

  function sattGenomskinlig(ja) {
    genomskinlig = ja;
    uppdateraInsida();
  }

  function bytBatteri() {
    nytt.visible = true;
    tween(0, 1, 1100, (t) => {
      gammalt.position.lerpVectors(BATTERI_HEMMA, BATTERI_UTE, Math.min(1, t * 1.6));
      nytt.position.lerpVectors(BATTERI_UTE, BATTERI_HEMMA, Math.max(0, t * 1.6 - 0.6));
    }, () => {
      gammalt.visible = false;
      uppdateraInsida();
    });
  }

  let stoppaLarm = null;
  function larma(typ, ms) {
    stoppaLarm?.();
    for (const v of vagor) v.visible = true;
    if (reduceraRorelse) {
      ledMaterial.color.set('#e0402a');
      vagor.forEach((v, i) => {
        v.material.opacity = typ === 'larm' || i === 0 ? 0.6 : 0;
        v.scale.setScalar(1 + i * 0.25);
      });
      motor.rita();
      const t = window.setTimeout(() => tyst(), ms);
      stoppaLarm = () => window.clearTimeout(t);
      return;
    }
    let tid = 0;
    const period = typ === 'larm' ? 1.05 : 2.2;
    const avbryt = motor.animera((dt) => {
      tid += dt;
      ledMaterial.color.set(Math.floor(tid / 0.3) % 2 === 0 ? '#e0402a' : '#6b5f58');
      vagor.forEach((v, i) => {
        if (typ !== 'larm' && i > 0) {
          v.material.opacity = 0;
          return;
        }
        const fas = ((tid + i * 0.35) % period) / period;
        v.scale.setScalar(0.45 + fas * 0.9);
        v.material.opacity = (1 - fas) * 0.9;
      });
      if (tid * 1000 >= ms) {
        tyst();
        return false;
      }
      return true;
    });
    stoppaLarm = avbryt;
  }
  function tyst() {
    stoppaLarm?.();
    stoppaLarm = null;
    for (const v of vagor) v.visible = false;
    ledMaterial.color.set('#6b5f58');
    motor.rita();
  }

  function tryckKnapp() {
    tween(0, 1, 260, (t) => {
      knapp.position.y = 2.15 - Math.sin(t * Math.PI) * 0.18;
    });
  }

  function aterstall() {
    tyst();
    oppen = false;
    lock.position.y = 0;
    lock.rotation.z = 0;
    gammalt.position.copy(BATTERI_HEMMA);
    gammalt.visible = true;
    nytt.position.copy(BATTERI_UTE);
    nytt.visible = false;
    uppdateraInsida();
  }

  // Klick på testknappen i figuren
  const canvas = motor.renderare.domElement;
  let ner = null;
  canvas.addEventListener('pointerdown', (ev) => {
    const t = motor.traff(ev, [knapp]);
    ner = { x: ev.clientX, y: ev.clientY, mal: t ? 'knapp' : null };
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (ev.pointerType === 'mouse' && !ev.buttons) canvas.style.cursor = motor.traff(ev, [knapp]) ? 'pointer' : 'grab';
  });
  canvas.addEventListener('pointerup', (ev) => {
    if (!ner) return;
    const flyttat = Math.hypot(ev.clientX - ner.x, ev.clientY - ner.y) > 6;
    if (!flyttat && ner.mal === 'knapp') handelser.onKnapp();
    ner = null;
  });

  uppdateraInsida();
  return { sattOppen, sattGenomskinlig, bytBatteri, larma, tyst, tryckKnapp, aterstall };
}
