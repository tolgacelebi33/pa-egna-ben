// Material och former med handritad känsla: få färgtoner (toon), tjock bläckkontur och rundade kanter.
import {
  MeshToonMaterial,
  MeshBasicMaterial,
  DataTexture,
  RedFormat,
  NearestFilter,
  BackSide,
  Mesh,
  LatheGeometry,
  Vector2,
  Color,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const BLACK = '#2a2522';

// Tre tonsteg ger platta skuggor, som en ritad bild.
const toner = new Uint8Array([120, 200, 255]);
const tonkarta = new DataTexture(toner, toner.length, 1, RedFormat);
tonkarta.minFilter = NearestFilter;
tonkarta.magFilter = NearestFilter;
tonkarta.needsUpdate = true;

export function farg(hex, extra = {}) {
  return new MeshToonMaterial({ color: new Color(hex), gradientMap: tonkarta, ...extra });
}

// Bläckkonturen: en förstorad kopia av formen med baksidan utåt ("inverted hull").
// Tjockleken varierar lite längs formen för att se handritad ut. Reglaget styr hur mycket.
const uniformer = { uOjamnhet: { value: 0.35 } };
export function satt(varde) {
  uniformer.uOjamnhet.value = varde / 10;
}

const konturMaterial = new Map();
function kontur(tjocklek, klipp) {
  const nyckel = `${tjocklek}:${klipp ? klipp.id : ''}`;
  if (konturMaterial.has(nyckel)) return konturMaterial.get(nyckel);
  const m = new MeshBasicMaterial({ color: BLACK, side: BackSide });
  if (klipp) {
    m.clippingPlanes = klipp.planes;
    m.clipIntersection = klipp.intersection ?? false;
  }
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uOjamnhet = uniformer.uOjamnhet;
    shader.uniforms.uTjocklek = { value: tjocklek };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uOjamnhet;
         uniform float uTjocklek;
         float brus(vec3 p) { return sin(p.x * 3.1 + p.y * 1.7) * cos(p.z * 2.3 - p.y * 2.9) * 0.5 + 0.5; }`,
      )
      .replace(
        '#include <begin_vertex>',
        `vec3 transformed = position + normal * uTjocklek * (1.0 + uOjamnhet * (brus(position * 4.0) * 2.0 - 0.6));`,
      );
  };
  konturMaterial.set(nyckel, m);
  return m;
}

/**
 * Lägger en bläckkontur på en form och returnerar formen.
 * klipp: { id, planes, intersection } om formen skärs av i genomskärningen, så att konturen skärs likadant.
 */
export function medKontur(mesh, tjocklek = 0.05, klipp = null) {
  const k = new Mesh(mesh.geometry, kontur(tjocklek, klipp));
  k.raycast = () => {}; // konturen ska inte gå att klicka på
  k.name = 'kontur';
  mesh.add(k);
  return mesh;
}

/** Låda med rundade kanter och kontur. */
export function lada(b, h, d, radie, material, tjocklek, klipp) {
  const m = new Mesh(new RoundedBoxGeometry(b, h, d, 4, radie), material);
  return medKontur(m, tjocklek, klipp);
}

/**
 * Cylinder med rundad kant, byggd som en svarvad profil så att normalerna blir mjuka och konturen hel.
 * Axeln går längs y.
 */
export function rundCylinder(radie, hojd, kant, material, tjocklek, segment = 48, klipp = null) {
  const p = [];
  const h = hojd / 2;
  const k = Math.min(kant, radie * 0.5, h);
  p.push(new Vector2(0, -h));
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
    p.push(new Vector2(radie - k + Math.cos(a) * k, -h + k + Math.sin(a) * k));
  }
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    p.push(new Vector2(radie - k + Math.cos(a) * k, h - k + Math.sin(a) * k));
  }
  p.push(new Vector2(0, h));
  const m = new Mesh(new LatheGeometry(p, segment), material);
  return medKontur(m, tjocklek, klipp);
}
