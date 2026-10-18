// Tvättmaskinen i 3D. Modellen är en vy: React äger läget och anropar funktionerna här.
// Klick i figuren skickas tillbaka via handelser (onRatt, onLucka, onTemp, onStart, onFack).
import {
  Group,
  Mesh,
  Plane,
  Vector3,
  CylinderGeometry,
  CircleGeometry,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  CatmullRomCurve3,
  CanvasTexture,
  MeshBasicMaterial,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';
import { farg, lada, rundCylinder, medKontur } from '../delat/tre/material.js';

const B = 6; // bredd
const H = 8.4; // höjd
const D = 5.6; // djup
const FRAM = D / 2;
const LUCKA_Y = 3.7;
const RATT_LAGEN = 6;
const vinkelFor = (n) => ((-135 + n * 54) * Math.PI) / 180;
const MAX_NIVA = 1.25; // vattnets högsta nivå över trummans botten, i figurens enheter

function skuggtextur() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  r.addColorStop(0, 'rgba(42,37,34,0.32)');
  r.addColorStop(1, 'rgba(42,37,34,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

function haltextur() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#a39b90';
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#6f675e';
  for (const [x, y] of [[16, 16], [48, 16], [32, 40], [0, 40], [64, 40], [16, 64], [48, 64]]) {
    g.beginPath();
    g.arc(x, y, 4, 0, Math.PI * 2);
    g.fill();
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(10, 4);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function byggTvattmaskin(motor, { texter, handelser, reduceraRorelse }) {
  const modell = new Group();
  modell.position.y = -4.4;
  motor.rot.add(modell);
  const golvY = modell.position.y;

  // Genomskärningen: tar bort hörnet där x > 0.4 och y < 6.6 (i modellens koordinater).
  const snittX = new Plane(new Vector3(-1, 0, 0), 1000);
  const snittY = new Plane(new Vector3(0, 1, 0), -(6.6 + golvY));
  const klipp = { id: 'snitt', planes: [snittX, snittY], intersection: true };
  const klippbar = (hex, extra = {}) => farg(hex, { clippingPlanes: klipp.planes, clipIntersection: true, side: DoubleSide, ...extra });

  // Skugga på golvet
  const skugga = new Mesh(new PlaneGeometry(13, 11), new MeshBasicMaterial({ map: skuggtextur(), transparent: true, depthWrite: false }));
  skugga.rotation.x = -Math.PI / 2;
  skugga.position.set(1.2, 0.01, 0.8);
  modell.add(skugga);

  // Kroppen
  const kropp = lada(B, H, D, 0.45, klippbar('#e9e3d7'), 0.06, klipp);
  kropp.position.y = H / 2;
  modell.add(kropp);
  const sockel = lada(B - 0.3, 0.5, 0.3, 0.12, klippbar('#d6cfc2'), 0.04, klipp);
  sockel.position.set(0, 0.45, FRAM - 0.05);
  modell.add(sockel);

  // Kontrollpanelen
  const panel = lada(B - 0.5, 1.3, 0.25, 0.15, farg('#f3eee5'), 0.04);
  panel.position.set(0, 7.55, FRAM);
  modell.add(panel);

  const fack = lada(1.7, 0.75, 0.6, 0.12, farg('#fbf8f2'), 0.04);
  fack.position.set(-1.85, 7.55, FRAM);
  fack.userData.klick = 'fack';
  modell.add(fack);
  const grepp = lada(0.9, 0.12, 0.1, 0.04, farg('#8d867c'), 0.02);
  grepp.position.set(0, -0.2, 0.31);
  fack.add(grepp);

  // Display med text som ritas på en canvas
  const displayCanvas = document.createElement('canvas');
  displayCanvas.width = 256;
  displayCanvas.height = 96;
  const displayTextur = new CanvasTexture(displayCanvas);
  displayTextur.colorSpace = SRGBColorSpace;
  const display = lada(1.6, 0.62, 0.12, 0.06, farg('#34443a'), 0.035);
  display.position.set(0.05, 7.6, FRAM + 0.12);
  modell.add(display);
  const displayYta = new Mesh(new PlaneGeometry(1.45, 0.52), new MeshBasicMaterial({ map: displayTextur, transparent: true }));
  displayYta.position.z = 0.065;
  display.add(displayYta);
  function ritaDisplay(rad1, rad2) {
    const g = displayCanvas.getContext('2d');
    g.clearRect(0, 0, 256, 96);
    g.fillStyle = '#d6e8c2';
    g.font = '600 34px ui-monospace, Menlo, monospace';
    g.fillText(rad1, 14, 42);
    g.font = '28px ui-monospace, Menlo, monospace';
    g.fillText(rad2, 14, 82);
    displayTextur.needsUpdate = true;
    motor.rita();
  }

  const knappMaterial = (hex) => farg(hex);
  const knapp = (x, y, hex, namn) => {
    const k = rundCylinder(0.24, 0.22, 0.06, knappMaterial(hex), 0.035, 32);
    k.rotation.x = Math.PI / 2;
    k.position.set(x, y, FRAM + 0.2);
    k.userData.klick = namn;
    modell.add(k);
    return k;
  };
  const tempKnapp = knapp(1.3, 7.85, '#d9a441', 'temp');
  const startKnapp = knapp(1.3, 7.25, '#8fa58a', 'start');

  // Programratten
  const rattGrupp = new Group();
  rattGrupp.position.set(2.25, 7.55, FRAM + 0.15);
  modell.add(rattGrupp);
  const ratt = rundCylinder(0.48, 0.34, 0.1, farg('#f3eee5'), 0.04, 40);
  ratt.rotation.x = Math.PI / 2;
  ratt.userData.klick = 'ratt';
  rattGrupp.add(ratt);
  const visare = lada(0.08, 0.36, 0.06, 0.02, farg('#c8664a'), 0.015);
  visare.position.set(0, 0.2, 0.19);
  rattGrupp.add(visare);
  for (let i = 0; i < RATT_LAGEN; i++) {
    const v = vinkelFor(i);
    const mark = new Mesh(new CircleGeometry(0.045, 12), new MeshBasicMaterial({ color: '#2a2522' }));
    mark.position.set(Math.sin(v) * 0.64 + 2.25, Math.cos(v) * 0.64 + 7.55, FRAM + 0.13);
    modell.add(mark);
  }

  // Det inre: yttre behållare, trumma, vatten och tvätt
  const inre = new Group();
  inre.position.set(0, LUCKA_Y, 0.2);
  modell.add(inre);
  const balja = new Mesh(new CylinderGeometry(2.15, 2.15, 4.2, 48, 1, true), klippbar('#6f675e'));
  balja.rotation.x = Math.PI / 2;
  medKontur(balja, 0.04, klipp);
  inre.add(balja);
  const baljaBak = new Mesh(new CircleGeometry(2.15, 48), klippbar('#5a534c'));
  baljaBak.position.z = -2.1;
  inre.add(baljaBak);

  const trumma = new Group();
  inre.add(trumma);
  const trummaVagg = new Mesh(new CylinderGeometry(1.85, 1.85, 3.8, 48, 1, true), klippbar('#8f877c', { map: haltextur() }));
  trummaVagg.rotation.x = Math.PI / 2;
  trumma.add(trummaVagg);
  const trummaBak = new Mesh(new CircleGeometry(1.85, 48), klippbar('#8b8378'));
  trummaBak.position.z = -1.9;
  trumma.add(trummaBak);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const m = lada(0.3, 0.4, 3.4, 0.1, klippbar('#d4ccbf'), 0.03, klipp);
    m.position.set(Math.cos(a) * 1.65, Math.sin(a) * 1.65, 0);
    m.rotation.z = a + Math.PI / 2;
    trumma.add(m);
  }
  const trumKlader = new Group();
  trumma.add(trumKlader);
  [[-0.5, -1.1, 0.4], [0.6, -1.2, -0.3], [0.1, -0.9, 0.9]].forEach(([x, y, z], i) => {
    const p = new Mesh(new SphereGeometry(0.5, 20, 14), farg('#efe7d6'));
    p.scale.set(1, 0.5, 0.8);
    p.position.set(x, y, z);
    p.rotation.z = i;
    medKontur(p, 0.035);
    trumKlader.add(p);
  });
  trumKlader.visible = false;

  // Vatten: en cylinder som skärs av vid vattenytan
  const vattenyta = new Plane(new Vector3(0, -1, 0), 0);
  const vattenMaterial = farg('#5e7fa0', {
    transparent: true,
    opacity: 0.72,
    side: DoubleSide,
    clippingPlanes: [vattenyta],
  });
  const vatten = new Mesh(new CylinderGeometry(1.8, 1.8, 3.7, 48), vattenMaterial);
  vatten.rotation.x = Math.PI / 2;
  vatten.visible = false;
  inre.add(vatten);
  function sattNiva(andel) {
    // Vattenytan i världens koordinater: trummans botten + andel av maxnivån
    const botten = LUCKA_Y + golvY - 1.8;
    vattenyta.constant = botten + andel * MAX_NIVA * 2;
    vatten.visible = andel > 0.001;
    etikettVatten.synlig = vatten.visible && genomskarning;
  }

  // Röret från facket till behållaren, syns i genomskärningen
  const ror = new Mesh(
    new TubeGeometry(new CatmullRomCurve3([new Vector3(-1.85, 7.3, 2.2), new Vector3(-1.2, 6.6, 1.2), new Vector3(-0.4, 6.1, 0.6)]), 24, 0.12, 10),
    klippbar('#5e7fa0'),
  );
  modell.add(ror);

  // Luckan, med gångjärn på vänster sida
  const gangjarn = new Group();
  gangjarn.position.set(-1.95, LUCKA_Y, FRAM + 0.15);
  modell.add(gangjarn);
  const lucka = new Group();
  lucka.position.x = 1.95;
  gangjarn.add(lucka);
  const ring = new Mesh(new TorusGeometry(1.78, 0.3, 20, 64), klippbar('#dcd5c8'));
  medKontur(ring, 0.045, klipp);
  ring.userData.klick = 'lucka';
  lucka.add(ring);
  const glas = new Mesh(new CircleGeometry(1.62, 48), farg('#9fbbd0', { transparent: true, opacity: 0.18, depthWrite: false, clippingPlanes: klipp.planes, clipIntersection: true }));
  glas.position.z = 0.05;
  glas.userData.klick = 'lucka';
  lucka.add(glas);
  const handtag = lada(0.3, 0.9, 0.3, 0.1, klippbar('#bfb6a7'), 0.03, klipp);
  handtag.position.set(1.9, 0, 0.2);
  handtag.userData.klick = 'lucka';
  lucka.add(handtag);

  // Korgar och tvätt på golvet till höger om maskinen
  const KORGAR = [
    { id: 'ljust', z: 2.3 },
    { id: 'morkt', z: 0 },
    { id: 'kulort', z: -2.3 },
  ];
  const korgar = KORGAR.map((k) => {
    const g = new Group();
    g.position.set(5.0, 0, k.z);
    modell.add(g);
    const yttre = lada(2.0, 1.3, 2.0, 0.12, farg('#c79b6b'), 0.045);
    yttre.position.y = 0.65;
    g.add(yttre);
    const oppning = new Mesh(new PlaneGeometry(1.7, 1.7), farg('#5e4a37'));
    oppning.rotation.x = -Math.PI / 2;
    oppning.position.y = 1.31;
    g.add(oppning);
    return { ...k, grupp: g };
  });

  const PLAGG = [
    ['ljust', '#efe7d6'], ['morkt', '#454a57'], ['kulort', '#c8664a'],
    ['ljust', '#efe7d6'], ['kulort', '#d9a441'], ['morkt', '#454a57'],
    ['ljust', '#efe7d6'], ['kulort', '#8fa58a'], ['morkt', '#454a57'],
  ];
  const hog = new Vector3(3.2, 0, 5.0);
  const plagg = PLAGG.map(([korg, hex], i) => {
    const p = new Mesh(new SphereGeometry(0.5, 20, 14), farg(hex));
    p.scale.set(1, 0.45, 0.8);
    medKontur(p, 0.035);
    const start = new Vector3(hog.x + (i % 3) * 0.9 - 0.9, 0.25 + Math.floor(i / 3) * 0.35, hog.z + Math.floor(i / 3) * 0.4 - (i % 3) * 0.3);
    p.position.copy(start);
    p.rotation.y = i * 0.7;
    modell.add(p);
    const nr = PLAGG.slice(0, i).filter((x) => x[0] === korg).length;
    const k = KORGAR.find((x) => x.id === korg);
    const mal = korg === 'ljust' ? new Vector3(0, LUCKA_Y, FRAM + 0.3) : new Vector3(5.0 + (nr - 1) * 0.45, 1.25 + nr * 0.12, k.z + (nr - 1) * 0.3);
    return { mesh: p, start, mal, korg };
  });

  // Etiketter
  const e = (obj, nyckel, offset, klass, ut) => motor.laggTillEtikett(obj, texter[nyckel], offset, klass, ut);
  // Etiketter med en kort linje ut åt sidan, så att de inte krockar på den lilla panelen.
  e(fack, 'fack', [-0.4, 0.2, 0.3], '', [-70, -40]);
  e(display, 'display', [0, 0.3, 0.1], '', [-40, -80]);
  e(rattGrupp, 'ratt', [0.3, 0.3, 0.2], '', [70, -70]);
  e(tempKnapp, 'temp', [0, 0, 0.1], '', [90, -30]);
  e(startKnapp, 'start', [0, 0, 0.1], '', [100, 10]);
  e(lucka, 'lucka', [-1.6, -1.0, 0.3], '', [-80, 30]);
  const etikettTrumma = e(trumma, 'trumma', [0.9, 1.3, 1.6], '', [90, -20]);
  const etikettBalja = e(inre, 'balja', [1.6, -1.4, 1.2], '', [110, 20]);
  const etikettVatten = e(inre, 'vatten', [1.2, -1.2, 1.6], '', [-70, 40]);
  const etikettRor = e(ror, 'ror', [-0.9, 6.7, 1.3], '', [-90, -10]);
  korgar.forEach((k) => e(k.grupp, `korg.${k.id}`, [0, 1.9, 0], 'korg'));

  let genomskarning = false;
  function sattGenomskarning(pa) {
    genomskarning = pa;
    snittX.constant = pa ? 0.4 : 1000;
    for (const et of [etikettTrumma, etikettBalja, etikettRor]) et.synlig = pa;
    etikettVatten.synlig = pa && vatten.visible;
    motor.rita();
  }

  // Mjuka övergångar. Vid minskad rörelse hoppar allt direkt till slutläget.
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

  let luckaOppen = false;
  function sattLucka(oppen, klar) {
    const fran = gangjarn.rotation.y;
    luckaOppen = oppen;
    tween(fran, oppen ? -1.9 : 0, 650, (v) => (gangjarn.rotation.y = v), klar);
  }

  let fackUte = false;
  function vaxlaFack() {
    fackUte = !fackUte;
    tween(fack.position.z, fackUte ? FRAM + 0.9 : FRAM, 400, (v) => (fack.position.z = v));
  }

  function sattProgram(n) {
    tween(rattGrupp.rotation.z, -vinkelFor(n), 220, (v) => (rattGrupp.rotation.z = v));
  }

  function sortera(klar) {
    const borjaFlytta = () => {
      plagg.forEach((p, i) => {
        const s = p.mesh.position.clone();
        window.setTimeout(
          () =>
            tween(0, 1, 900, (t) => {
              p.mesh.position.lerpVectors(s, p.mal, t);
              p.mesh.position.y += Math.sin(t * Math.PI) * 2.2;
              if (p.korg === 'ljust') p.mesh.visible = t < 0.95;
            }, () => {
              if (p.korg === 'ljust') trumKlader.visible = true;
            }),
          reduceraRorelse ? 0 : i * 80,
        );
      });
      window.setTimeout(() => sattLucka(false, klar), reduceraRorelse ? 0 : 1800);
    };
    if (!luckaOppen) sattLucka(true, borjaFlytta);
    else borjaFlytta();
  }

  let stoppaTvatt = null;
  function starta(klar) {
    let tid = 0;
    let vinkel = 0;
    const FYLL = 2.5;
    const TVATT = 10;
    const SLUT = 12;
    if (reduceraRorelse) {
      sattNiva(1);
      motor.rita();
      const t = window.setTimeout(() => {
        sattNiva(0);
        motor.rita();
        klar();
      }, 4000);
      stoppaTvatt = () => window.clearTimeout(t);
      return;
    }
    stoppaTvatt = motor.animera((dt) => {
      tid += dt;
      const niva = tid < FYLL ? tid / FYLL : tid < TVATT ? 1 : Math.max(0, 1 - (tid - TVATT) / (SLUT - TVATT));
      sattNiva(niva);
      const riktning = Math.floor(tid / 2.5) % 2 === 0 ? 1 : -1;
      vinkel += riktning * (tid < TVATT ? 2.4 : 6) * dt;
      trumma.rotation.z = vinkel;
      if (tid >= SLUT) {
        sattNiva(0);
        klar();
        return false;
      }
      return true;
    });
  }

  function stoppa() {
    stoppaTvatt?.();
    stoppaTvatt = null;
    sattNiva(0);
    motor.rita();
  }

  function aterstall() {
    stoppa();
    trumma.rotation.z = 0;
    trumKlader.visible = false;
    plagg.forEach((p) => {
      p.mesh.position.copy(p.start);
      p.mesh.visible = true;
    });
    gangjarn.rotation.y = 0;
    luckaOppen = false;
    fack.position.z = FRAM;
    fackUte = false;
    rattGrupp.rotation.z = -vinkelFor(0);
    motor.rita();
  }

  // Klick och drag i figuren
  const klickbara = [fack, tempKnapp, startKnapp, ratt, ring, glas, handtag];
  const canvas = motor.renderare.domElement;
  let ner = null;
  let rattDrag = false;
  const rattCentrum = new Vector3();
  function rattVinkelFranPekare(ev) {
    rattGrupp.getWorldPosition(rattCentrum);
    rattCentrum.project(motor.kamera);
    const r = canvas.getBoundingClientRect();
    const cx = ((rattCentrum.x + 1) / 2) * r.width + r.left;
    const cy = ((1 - rattCentrum.y) / 2) * r.height + r.top;
    const grader = (Math.atan2(ev.clientX - cx, -(ev.clientY - cy)) * 180) / Math.PI;
    let basta = 0;
    for (let i = 0; i < RATT_LAGEN; i++) {
      if (Math.abs(-135 + i * 54 - grader) < Math.abs(-135 + basta * 54 - grader)) basta = i;
    }
    return basta;
  }
  canvas.addEventListener('pointerdown', (ev) => {
    const t = motor.traff(ev, klickbara);
    ner = { x: ev.clientX, y: ev.clientY, mal: t?.object.userData.klick ?? null };
    if (ner.mal === 'ratt') {
      rattDrag = true;
      motor.kontroller.enabled = false;
      canvas.setPointerCapture(ev.pointerId);
      handelser.onRatt(rattVinkelFranPekare(ev));
    }
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (rattDrag) {
      handelser.onRatt(rattVinkelFranPekare(ev));
      return;
    }
    if (ev.pointerType === 'mouse' && !ev.buttons) {
      canvas.style.cursor = motor.traff(ev, klickbara) ? 'pointer' : 'grab';
    }
  });
  canvas.addEventListener('pointerup', (ev) => {
    if (rattDrag) {
      rattDrag = false;
      motor.kontroller.enabled = true;
      return;
    }
    if (!ner) return;
    const flyttat = Math.hypot(ev.clientX - ner.x, ev.clientY - ner.y) > 6;
    const mal = ner.mal;
    ner = null;
    if (flyttat || !mal) return;
    if (mal === 'fack') {
      vaxlaFack();
      handelser.onFack(fackUte);
    } else if (mal === 'lucka') handelser.onLucka(!luckaOppen);
    else if (mal === 'temp') handelser.onTemp();
    else if (mal === 'start') handelser.onStart();
  });

  rattGrupp.rotation.z = -vinkelFor(0);
  motor.rita();

  return {
    sattProgram,
    ritaDisplay,
    sortera,
    starta,
    stoppa,
    sattLucka,
    luckaOppen: () => luckaOppen,
    sattGenomskarning,
    aterstall,
  };
}
