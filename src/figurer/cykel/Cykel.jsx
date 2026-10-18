import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, Cylinder, Yta } from '../delat/former.jsx';
import './cykel.css';

const tx = (n, v) => t(`cykel.${n}`, v);

// Cykeln ritas från sidan på planet y = 40, med (u, v): u framåt längs x, v nedåt från z = 260.
const Y = 40;
const Z = 364;
const K = 1.4; // skala: cykeln ritas större än sina egna mått
const P = (u, v) => iso(u * K, Y, Z - v * K);
const BAK = { u: 70, v: 200 };
const FRAM = { u: 300, v: 200 };
const R = 60;
const VEV = { u: 175, v: 205 };
const SADEL = { u: 150, v: 95 };
const STYRE = { u: 268, v: 92 };

const VIEWBOX_BRED = '-310 -400 940 700';
const VIEWBOX_SMAL = '-120 -400 640 700';

function Hjul({ c, platt, klass = '' }) {
  return (
    <g className={klass}>
      {platt ? (
        <path className="dack" d={`M${c.u - R} ${c.v} A${R} ${R} 0 1 1 ${c.u + R} ${c.v} Q${c.u + R - 6} ${c.v + R - 4} ${c.u} ${c.v + R - 8} Q${c.u - R + 6} ${c.v + R - 4} ${c.u - R} ${c.v} Z`} />
      ) : (
        <circle className="dack" cx={c.u} cy={c.v} r={R} />
      )}
      <circle className="falg" cx={c.u} cy={c.v} r={R - 10} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} className="eker" x1={c.u} y1={c.v} x2={c.u + Math.cos(a) * (R - 11)} y2={c.v + Math.sin(a) * (R - 11)} />;
      })}
      <circle className="nav" cx={c.u} cy={c.v} r="6" />
    </g>
  );
}

export default function Cykel() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [hittad, setHittad] = useState(false);
  const [lagad, setLagad] = useState(false);
  const [smord, setSmord] = useState(false);
  const [bromsar, setBromsar] = useState(false);
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.start'));

  const hitta = () => {
    setHittad(true);
    setStatus(tx('status.hittad'));
  };
  const laga = () => {
    if (!hittad) return setStatus(tx('status.hitta.forst'));
    setLagad(true);
    setStatus(tx('status.lagad'));
  };
  const smorj = () => {
    setSmord(true);
    setStatus(tx('status.smord'));
  };
  const broms = () => {
    setBromsar(true);
    setStatus(tx('status.broms'));
    window.setTimeout(() => setBromsar(false), 1600);
  };
  const borjaOm = () => {
    setHittad(false);
    setLagad(false);
    setSmord(false);
    setBromsar(false);
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const platt = !lagad;

  const etiketter = [
    { id: 'dack', at: P(FRAM.u + 42, FRAM.v + 42), sida: 'h', y: 60, nr: [22, 8] },
    { id: 'kedja', at: P(120, 210), sida: 'v', y: 40, nr: [-22, 10] },
    { id: 'broms', at: P(FRAM.u - 6, FRAM.v - R + 2), sida: 'h', y: -170, nr: [22, -10] },
    { id: 'handtag', at: P(STYRE.u + 16, STYRE.v + 2), sida: 'h', y: -260, nr: [22, -12] },
    { id: 'ventil', at: P(FRAM.u - 40, FRAM.v - 40), sida: 'v', y: -150, nr: [-22, -6] },
    ...(hittad && !lagad ? [{ id: 'hal', at: P(FRAM.u + 36, FRAM.v + 48), sida: 'h', y: 140, nr: [22, 12] }] : []),
    ...(lagad ? [{ id: 'pump', at: iso(491, 1, 80), sida: 'h', y: -60, nr: [22, 4] }] : []),
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  return (
    <FigurRam
      klass="figur-cykel"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx('steg.hitta'), gjort: hittad, gor: hitta },
        { text: tx('steg.laga'), gjort: lagad, gor: laga },
        { text: tx('steg.smorj'), gjort: smord, gor: smorj },
        { text: tx('steg.broms'), gjort: bromsar, gor: broms },
      ]}
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-40, -60, 0], [560, -60, 0], [560, 160, 0], [-40, 160, 0])} />
            <polygon className="skugga" points={poly([20, 28, 0], [520, 28, 0], [520, 54, 0], [20, 54, 0])} />
          </g>
          {/* Pumpen står bakom cykeln */}
          {lagad && (
            <g filter={f}>
              <Lada x={480} y={-10} z={0} b={22} d={22} h={8} farg="#3d3833" />
              <Cylinder x={491} y={1} r={9} z0={8} z1={110} farg="#c8664a" />
            </g>
          )}
          <Yta yta="fram" x={0} y={Y} z={Z}>
            <g transform={`scale(${K})`}>
            <g filter={f}>
              <Hjul c={BAK} />
              <Hjul c={FRAM} platt={platt} />
              {/* Ram */}
              <path className="ram" d={`M${BAK.u} ${BAK.v} L${VEV.u} ${VEV.v} L${SADEL.u} ${SADEL.v + 10} Z M${SADEL.u} ${SADEL.v + 10} L${STYRE.u - 8} ${STYRE.v + 18} L${VEV.u} ${VEV.v} M${STYRE.u - 8} ${STYRE.v + 18} L${FRAM.u} ${FRAM.v}`} />
              <path className="sadel" d={`M${SADEL.u - 26} ${SADEL.v} q26 -10 48 0 l-6 6 h-38 Z`} />
              <path className="styre" d={`M${STYRE.u - 8} ${STYRE.v + 18} L${STYRE.u - 4} ${STYRE.v} q14 -8 24 2`} />
              {/* Kedja och kedjehjul */}
              <circle className="kedjehjul" cx={VEV.u} cy={VEV.v} r="20" />
              <circle className="kedjehjul" cx={BAK.u} cy={BAK.v} r="10" />
              <path className={`kedja ${smord ? 'smord' : 'torr'}`} d={`M${VEV.u} ${VEV.v - 20} L${BAK.u} ${BAK.v - 10} M${VEV.u} ${VEV.v + 20} L${BAK.u} ${BAK.v + 10}`} />
              <path className="pedal" d={`M${VEV.u} ${VEV.v} l18 22 h12 M${VEV.u} ${VEV.v} l-18 -22 h-12`} />
            </g>
            {/* Ventil */}
            <rect className="ventilen" x={FRAM.u - 44} y={FRAM.v - 46} width="6" height="12" rx="2" transform={`rotate(-45 ${FRAM.u - 41} ${FRAM.v - 40})`} />
            {/* Bromsen: klossarna går mot fälgen när du bromsar */}
            <g className="broms">
              <path className="bromsok" d={`M${FRAM.u - 14} ${FRAM.v - R - 14} h28 M${FRAM.u - 14} ${FRAM.v - R - 14} v14 M${FRAM.u + 14} ${FRAM.v - R - 14} v14`} />
              <rect className="kloss" x={FRAM.u - 20 + (bromsar ? 6 : 0)} y={FRAM.v - R + 4} width="8" height="14" rx="2" />
              <rect className="kloss" x={FRAM.u + 12 - (bromsar ? 6 : 0)} y={FRAM.v - R + 4} width="8" height="14" rx="2" />
              <path className="vajer" d={`M${FRAM.u} ${FRAM.v - R - 14} Q${FRAM.u - 6} ${STYRE.v + 40} ${STYRE.u + 10} ${STYRE.v + 6}`} />
              <path className="handtag" d={`M${STYRE.u + 10} ${STYRE.v + 2} l${bromsar ? 18 : 22} ${bromsar ? 10 : 16}`} />
            </g>
            {hittad && !lagad && (
              <g className="punktering">
                <circle className="hal" cx={FRAM.u + 30} cy={FRAM.v + 50} r="4" />
                {[0, 1, 2].map((i) => (
                  <path key={i} className="pys" d={`M${FRAM.u + 36} ${FRAM.v + 52 + i * 4} q8 ${i * 3 - 3} 16 0`} style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </g>
            )}
            {lagad && <rect className="lapp" x={FRAM.u + 24} y={FRAM.v + 47} width="12" height="10" rx="2" transform={`rotate(-30 ${FRAM.u + 30} ${FRAM.v + 52})`} />}
            {smord &&
              [0, 1, 2].map((i) => <circle key={i} className="olja" cx={128 + i * 6} cy={180 + i * 10} r="3" style={{ animationDelay: `${i * 0.25}s` }} />)}
            </g>
          </Yta>
          {/* Pumpens slang till ventilen, och oljeflaskan vid kedjan */}
          {lagad && (
            <path className="slang" d={`M${iso(491, 1, 100)[0]} ${iso(491, 1, 100)[1]} Q${P(FRAM.u, FRAM.v - 90)[0]} ${P(FRAM.u, FRAM.v - 90)[1]} ${P(FRAM.u - 40, FRAM.v - 42)[0]} ${P(FRAM.u - 40, FRAM.v - 42)[1]}`} />
          )}
          {smord && (
            <g filter={f}>
              <Cylinder x={175} y={Y + 26} r={11} z0={Z - 245} z1={Z - 205} farg="#d9a441" />
            </g>
          )}
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-80} hogerX={450} />
      </svg>
    </FigurRam>
  );
}
