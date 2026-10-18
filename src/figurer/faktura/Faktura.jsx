import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada } from '../delat/former.jsx';
import './faktura.css';

const tx = (n, v) => t(`faktura.${n}`, v);

// Bordet: x 0–360, y 0–260, z 0–90. Fakturan ligger på bordet, ritad platt på ovansidan.
const BORD = { b: 360, d: 260, h: 90 };
const PAPPER = { b: 230, d: 300 }; // pappret, ritat rakt i bildens koordinater
const PX = -10;
const PY = -150;
// Fälten på fakturan i pappersytans koordinater
const FALT = {
  belopp: { u: 120, v: 196, b: 80, h: 22 },
  ocr: { u: 14, v: 236, b: 120, h: 18 },
  forfallo: { u: 120, v: 168, b: 80, h: 18 },
};
const KEDJA = ['faktura', 'paminnelse', 'inkasso', 'foreläggande'];

const VIEWBOX_BRED = '-420 -190 860 520';
const VIEWBOX_SMAL = '-240 -190 600 520';

export default function Faktura() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [visat, setVisat] = useState(null); // belopp | ocr | forfallo
  const [hittade, setHittade] = useState(new Set());
  const [kedja, setKedja] = useState(0); // 0 = dold, 1–4 visar så många steg
  const [handritad, setHandritad] = useState(2);
  const [status, setStatus] = useState(tx('status.start'));

  const visa = (falt) => {
    setVisat(falt);
    setHittade((h) => new Set([...h, falt]));
    setStatus(tx(`status.${falt}`));
  };
  const nasta = () => {
    const n = Math.min(KEDJA.length, kedja + 1);
    setKedja(n);
    setVisat(null);
    setStatus(tx(`status.kedja.${n}`));
  };
  const borjaOm = () => {
    setVisat(null);
    setHittade(new Set());
    setKedja(0);
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  // Punkt på pappret i bildens koordinater (pappret är vridet -3 grader)
  const pt = (u, v) => {
    const a = (-3 * Math.PI) / 180;
    return [PX + u * Math.cos(a) - v * Math.sin(a), PY + u * Math.sin(a) + v * Math.cos(a)];
  };

  const etiketter = [
    { id: 'avsandare', at: pt(14, 24), sida: 'v', y: -140, nr: [-22, -8] },
    { id: 'belopp', at: pt(FALT.belopp.u + 84, FALT.belopp.v + 10), sida: 'h', y: 60, nr: [24, 0], aktiv: visat === 'belopp' },
    { id: 'ocr', at: pt(FALT.ocr.u - 4, FALT.ocr.v + 9), sida: 'v', y: 100, nr: [-24, 8], aktiv: visat === 'ocr' },
    { id: 'forfallo', at: pt(FALT.forfallo.u + 84, FALT.forfallo.v + 9), sida: 'h', y: 0, nr: [24, -6], aktiv: visat === 'forfallo' },
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  const markera = (falt) => (
    <rect
      className={`falt ${visat === falt ? 'visas' : ''} ${hittade.has(falt) ? 'hittad' : ''}`}
      x={FALT[falt].u - 4}
      y={FALT[falt].v - 4}
      width={FALT[falt].b + 8}
      height={FALT[falt].h + 8}
      rx="4"
    />
  );

  return (
    <FigurRam
      klass="figur-faktura"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx('steg.belopp'), gjort: hittade.has('belopp'), gor: () => visa('belopp') },
        { text: tx('steg.ocr'), gjort: hittade.has('ocr'), gor: () => visa('ocr') },
        { text: tx('steg.forfallo'), gjort: hittade.has('forfallo'), gor: () => visa('forfallo') },
        { text: tx('steg.obetald'), gjort: kedja === KEDJA.length, gor: nasta },
      ]}
      extra={
        kedja > 0 && (
          <ol className="kedja" aria-label={tx('kedja.rubrik')}>
            {KEDJA.slice(0, kedja).map((k, i) => (
              <li key={k} className={i === kedja - 1 ? 'senast' : ''}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <strong>{tx(`kedja.${k}`)}</strong>
                <span className="todo">{tx('kedja.todo')}</span>
              </li>
            ))}
          </ol>
        )
      }
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          <g filter={f}>
            {/* Skrivbordet i isometri, pappret ligger rakt ovanpå så att det går att läsa */}
            <Lada x={-40} y={-40} z={0} b={BORD.b + 80} d={BORD.d + 80} h={BORD.h} farg={{ topp: '#d6b48a', fram: '#b98a5e', sida: '#9c7149' }} />
            <Lada x={300} y={-20} z={BORD.h} b={60} d={40} h={30} farg="#f2efe8" />
            <Lada x={312} y={-10} z={BORD.h + 30} b={36} d={6} h={24} farg="#8fa58a" />
          </g>
          <g transform={`translate(${PX} ${PY}) rotate(-3)`}>
            <rect className="skugga ingen-kontur" x="8" y="10" width={PAPPER.b} height={PAPPER.d} rx="3" />
            <rect className="papper" x="0" y="0" width={PAPPER.b} height={PAPPER.d} rx="3" />
            <text className="rubrik" x="14" y="30">{tx('papper.foretag')}</text>
            <text className="liten" x="14" y="46">{tx('papper.adress')}</text>
            <text className="stor" x="14" y="80">{tx('papper.faktura')}</text>
            {[100, 112, 124, 136].map((y) => (
              <line key={y} className="rad" x1="14" y1={y} x2={PAPPER.b - 14} y2={y} />
            ))}
            {markera('forfallo')}
            {markera('belopp')}
            {markera('ocr')}
            <text className="liten" x="14" y="180">{tx('papper.forfallo')}</text>
            <text className="varde" x={FALT.forfallo.u} y={FALT.forfallo.v + 13}>{tx('papper.datum')}</text>
            <text className="liten" x="14" y="211">{tx('papper.att.betala')}</text>
            <text className="varde stort" x={FALT.belopp.u} y={FALT.belopp.v + 17}>{tx('papper.belopp')}</text>
            <line className="avskilj" x1="0" y1="228" x2={PAPPER.b} y2="228" />
            <text className="varde" x={FALT.ocr.u} y={FALT.ocr.v + 13}>{tx('papper.ocr')}</text>
            <text className="liten" x="14" y="276">{tx('papper.bankgiro')}</text>
          </g>
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={smal ? -90 : -160} hogerX={smal ? 320 : 270} />
      </svg>
    </FigurRam>
  );
}
