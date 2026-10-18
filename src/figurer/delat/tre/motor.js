// Gemensam 3D-motor för figurerna (three.js).
// Ritar bara när något har ändrats, så att telefonen inte arbetar i onödan när figuren står still.
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  HemisphereLight,
  DirectionalLight,
  Raycaster,
  Vector2,
  Vector3,
  Group,
  SRGBColorSpace,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { satt as sattBlack } from './material.js';

export function harWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/**
 * @param {HTMLElement} behallare elementet som canvas och etiketter läggs i
 * @param {{ hojd?: number, reduceraRorelse?: boolean, startvinkel?: [number, number, number] }} val
 */
export function skapaMotor(behallare, val = {}) {
  const { hojd = 12, bredd: minBredd = 0, reduceraRorelse = false, startvinkel = [1, 0.78, 1.15], mal = [0, 0, 0] } = val;

  const scen = new Scene();
  const renderare = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderare.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderare.outputColorSpace = SRGBColorSpace;
  renderare.localClippingEnabled = true;
  renderare.domElement.className = 'tre-canvas';
  behallare.appendChild(renderare.domElement);

  // Ortografisk kamera ger samma lugna, ritade känsla som isometri, men går att vrida runt.
  const kamera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  const startPos = new Vector3(...startvinkel).normalize().multiplyScalar(40);
  kamera.position.copy(startPos);

  scen.add(new HemisphereLight(0xfff8ee, 0x8a7f72, 1.6));
  const sol = new DirectionalLight(0xffffff, 1.9);
  sol.position.set(-6, 14, 9);
  scen.add(sol);

  const kontroller = new OrbitControls(kamera, renderare.domElement);
  kontroller.enableDamping = !reduceraRorelse;
  kontroller.dampingFactor = 0.12;
  kontroller.enablePan = false;
  kontroller.minZoom = 0.7;
  kontroller.maxZoom = 2.6;
  kontroller.minPolarAngle = 0.15;
  kontroller.maxPolarAngle = Math.PI / 2 - 0.02; // inte under golvet
  kontroller.target.set(...mal);
  kamera.position.add(kontroller.target);

  const etikettLager = document.createElement('div');
  etikettLager.className = 'tre-etiketter';
  etikettLager.setAttribute('aria-hidden', 'true');
  behallare.appendChild(etikettLager);
  const SVG = 'http://www.w3.org/2000/svg';
  const linjeLager = document.createElementNS(SVG, 'svg');
  linjeLager.setAttribute('class', 'tre-linjer');
  etikettLager.appendChild(linjeLager);

  let bredd = 1;
  let hojdPx = 1;
  function storlek() {
    bredd = behallare.clientWidth || 1;
    hojdPx = behallare.clientHeight || 1;
    const aspekt = bredd / hojdPx;
    // Minst hojd enheter på höjden och minBredd på bredden, så att hela figuren får plats även på smal skärm.
    const h = Math.max(aspekt < 0.9 ? hojd * (0.9 / aspekt) * 0.85 : hojd, minBredd / aspekt);
    kamera.top = h / 2;
    kamera.bottom = -h / 2;
    kamera.left = (-h * aspekt) / 2;
    kamera.right = (h * aspekt) / 2;
    kamera.updateProjectionMatrix();
    renderare.setSize(bredd, hojdPx, false);
    rita();
  }

  // Etiketter: HTML-element som följer en punkt i 3D, med en kort linje till delen.
  // Läsbara, översättningsbara och skarpa på alla skärmar. "ut" är etikettens förskjutning i pixlar från punkten.
  const etiketter = [];
  const tmp = new Vector3();
  function laggTillEtikett(objekt, text, offset = [0, 0, 0], klass = '', ut = [0, 0]) {
    const el = document.createElement('span');
    el.className = `tre-etikett ${klass}`;
    el.textContent = text;
    etikettLager.appendChild(el);
    const linje = document.createElementNS(SVG, 'line');
    const prick = document.createElementNS(SVG, 'circle');
    prick.setAttribute('r', '3');
    linjeLager.append(linje, prick);
    const e = { objekt, offset: new Vector3(...offset), el, linje, prick, ut, synlig: true };
    etiketter.push(e);
    return e;
  }
  function placeraEtiketter() {
    linjeLager.setAttribute('viewBox', `0 0 ${bredd} ${hojdPx}`);
    const placerade = [];
    const skala = Math.min(1, bredd / 700); // kortare linjer på smal skärm
    // Etiketter utan linje placeras först, så att de med linje flyttar undan för dem.
    const ordning = [...etiketter].sort((a, b) => Number(!!(a.ut[0] || a.ut[1])) - Number(!!(b.ut[0] || b.ut[1])));
    for (const e of ordning) {
      let syns = e.synlig && e.objekt.visible !== false;
      for (let o = e.objekt.parent; syns && o; o = o.parent) if (o.visible === false) syns = false;
      e.el.hidden = !syns;
      const harLinje = syns && (e.ut[0] || e.ut[1]);
      e.linje.style.display = harLinje ? '' : 'none';
      e.prick.style.display = harLinje ? '' : 'none';
      if (!syns) continue;
      tmp.copy(e.offset);
      e.objekt.localToWorld(tmp);
      tmp.project(kamera);
      const x = ((tmp.x + 1) / 2) * bredd;
      const y = ((1 - tmp.y) / 2) * hojdPx;
      let lx = x + e.ut[0] * skala;
      let ly = y + e.ut[1] * skala;
      // Håll etiketten inom figuren, så att den aldrig klipps i kanten.
      const w = e.el.offsetWidth || 80;
      const h = e.el.offsetHeight || 20;
      if (e.ut[0] < 0) lx = Math.max(lx, w + 6);
      else if (e.ut[0] > 0) lx = Math.min(lx, bredd - w - 6);
      else lx = Math.min(Math.max(lx, w / 2 + 6), bredd - w / 2 - 6);
      // Flytta ned etiketten om den krockar med en som redan är placerad.
      const vanster = () => (e.ut[0] < 0 ? lx - w : e.ut[0] > 0 ? lx : lx - w / 2);
      // Etiketter utan linje (namn under föremål) står kvar där de är.
      for (let varv = 0; harLinje && varv < 8; varv++) {
        const krock = placerade.find((p) => vanster() < p.x2 && vanster() + w > p.x1 && ly - h / 2 < p.y2 && ly + h / 2 > p.y1);
        if (!krock) break;
        ly = krock.y2 + h / 2 + 3;
      }
      placerade.push({ x1: vanster(), x2: vanster() + w, y1: ly - h / 2, y2: ly + h / 2 });
      const ankare = e.ut[0] > 0 ? '0%' : e.ut[0] < 0 ? '-100%' : '-50%';
      e.el.style.transform = `translate(${lx}px, ${ly}px) translate(${ankare}, -50%)`;
      if (harLinje) {
        e.linje.setAttribute('x1', x);
        e.linje.setAttribute('y1', y);
        e.linje.setAttribute('x2', lx);
        e.linje.setAttribute('y2', ly);
        e.prick.setAttribute('cx', x);
        e.prick.setAttribute('cy', y);
      }
    }
  }

  // Ritar en gång vid nästa bildruta. Animationer registreras och håller loopen igång medan de pågår.
  const animationer = new Set();
  let raf = 0;
  let forra = 0;
  function bildruta(nu) {
    raf = 0;
    const dt = forra ? Math.min(0.05, (nu - forra) / 1000) : 0.016;
    forra = nu;
    let fortsatt = kontroller.update();
    for (const a of animationer) {
      if (a(dt, nu) === false) animationer.delete(a);
      else fortsatt = true;
    }
    renderare.render(scen, kamera);
    placeraEtiketter();
    if (fortsatt || animationer.size) raf = requestAnimationFrame(bildruta);
    else forra = 0;
  }
  function rita() {
    if (!raf) raf = requestAnimationFrame(bildruta);
  }
  function animera(fn) {
    animationer.add(fn);
    rita();
    return () => animationer.delete(fn);
  }
  kontroller.addEventListener('change', rita);

  // Klick och drag på delar av figuren.
  const stralare = new Raycaster();
  const pekare = new Vector2();
  function traff(e, objekt) {
    const r = renderare.domElement.getBoundingClientRect();
    pekare.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    stralare.setFromCamera(pekare, kamera);
    return stralare.intersectObjects(objekt, true)[0] ?? null;
  }

  function aterstallVy() {
    kamera.position.copy(startPos);
    kamera.zoom = 1;
    kamera.updateProjectionMatrix();
    kamera.position.add(new Vector3(...mal));
    kontroller.target.set(...mal);
    kontroller.update();
    rita();
  }

  // Tangentbord på canvas: piltangenter vrider, plus och minus zoomar.
  renderare.domElement.tabIndex = 0;
  renderare.domElement.addEventListener('keydown', (e) => {
    const steg = 0.12;
    const sfar = new Vector3().subVectors(kamera.position, kontroller.target);
    const lagen = { ArrowLeft: [steg, 0], ArrowRight: [-steg, 0], ArrowUp: [0, -steg], ArrowDown: [0, steg] }[e.key];
    if (lagen) {
      e.preventDefault();
      const rot = sfar.clone().applyAxisAngle(new Vector3(0, 1, 0), lagen[0]);
      const hojdVinkel = Math.acos(rot.y / rot.length()) + lagen[1];
      if (hojdVinkel > kontroller.minPolarAngle && hojdVinkel < kontroller.maxPolarAngle) {
        const r = rot.length();
        const azimut = Math.atan2(rot.x, rot.z);
        rot.set(r * Math.sin(hojdVinkel) * Math.sin(azimut), r * Math.cos(hojdVinkel), r * Math.sin(hojdVinkel) * Math.cos(azimut));
      }
      kamera.position.copy(kontroller.target).add(rot);
      kontroller.update();
      rita();
    } else if (e.key === '+' || e.key === '-') {
      e.preventDefault();
      kamera.zoom = Math.min(kontroller.maxZoom, Math.max(kontroller.minZoom, kamera.zoom * (e.key === '+' ? 1.15 : 1 / 1.15)));
      kamera.updateProjectionMatrix();
      rita();
    }
  });

  const observator = new ResizeObserver(storlek);
  observator.observe(behallare);
  storlek();

  const rot = new Group();
  scen.add(rot);

  return {
    scen,
    rot,
    kamera,
    renderare,
    kontroller,
    rita,
    animera,
    traff,
    laggTillEtikett,
    aterstallVy,
    sattHandritad(varde) {
      sattBlack(varde);
      rita();
    },
    stang() {
      cancelAnimationFrame(raf);
      observator.disconnect();
      kontroller.dispose();
      renderare.dispose();
      scen.traverse((o) => {
        o.geometry?.dispose?.();
      });
      renderare.domElement.remove();
      etikettLager.remove();
    },
  };
}
