import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import FigurRam from '../delat/FigurRam.jsx';
import { SVG, CSS, PER_Y, LAGEN } from './anatomy.js';
import './kyl.css';

/**
 * Kylen som isometrisk figur (byggd med anatomy-kitet, se figurer-anatomy/kyl/build.mjs).
 * Stegknapparna väljer läge: vad som markeras och vilken låda som dras ut. Texterna ligger i sv.js som för bildfigurerna.
 */
export default function KylFigur() {
  const lagen = Object.keys(LAGEN);
  const [aktiv, setAktiv] = useState(0);
  const scen = useRef(null);
  const tx = (n) => t(`kyl.${n}`);
  const lage = lagen[aktiv];
  const punkter = t(`kyl.lage.${lage}.punkter`);

  useEffect(() => {
    const svg = scen.current;
    const { lyser, gron, frys } = LAGEN[lage];
    svg.querySelectorAll('[data-station] .iso-solid').forEach((n) => n.removeAttribute('data-lit'));
    for (const s of lyser) svg.querySelectorAll(`[data-station="${s}"] .iso-solid`).forEach((n) => n.setAttribute('data-lit', ''));
    const flytta = (del, y) =>
      svg.querySelectorAll(`[data-part="${del}"]`).forEach((n) => (n.style.transform = `translate(${PER_Y[0] * y}px, ${PER_Y[1] * y}px)`));
    flytta('gron', gron);
    flytta('frys', frys);
  }, [lage]);

  return (
    <FigurRam
      klass="figur-bild figur-kyl"
      status={tx(`lage.${lage}.status`)}
      borjaOm={() => setAktiv(0)}
      extra={Array.isArray(punkter) && (
        <ul className="bildpunkter" aria-label={tx(`lage.${lage}.steg`)}>
          {punkter.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      steg={lagen.map((l, i) => ({ text: tx(`lage.${l}.steg`), gjort: i <= aktiv && i > 0, tryckt: i === aktiv, gor: () => setAktiv(i) }))}
    >
      <style>{CSS}</style>
      <div ref={scen} className="iso kyl-anatomy" data-theme="light" dangerouslySetInnerHTML={{ __html: SVG }} />
    </FigurRam>
  );
}
