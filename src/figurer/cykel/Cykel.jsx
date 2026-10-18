import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Cylinder, Lada } from '../delat/former.jsx';
import './cykel.css';

const tx = (n, v) => t(`cykel.${n}`, v);

// Cykeln byggs i riktiga 3D-punkter: x längs cykeln, y tvärs (positivt mot betraktaren), z uppåt.
// Varje del ritas från sina 3D-punkter, så att däck, styre, vevaxel och pedaler får djup.
const BAK = [0, 0, 70];
const FRAM = [250, 0, 70];
const R = 66; // däckets ytterradie
const FALG = 54;
const VEV = [95, 0, 62];
const SADELROR = [70, 0, 190];
const STYRROR_UPP = [215, 0, 182];
const STYRROR_NED = [226, 0, 150];
const STYRE = [218, 0, 204];
const DACK_BREDD = 4;

const P = (p) => iso(...p);
const linje = (a, b) => {
  const [x1, y1] = P(a);
  const [x2, y2] = P(b);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
};
// En cirkel i planet y = konst, runt navet c. platt: däcket trycks ihop nedtill (punktering).
function ring(c, r, y, platt = 0) {
  const pkt = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const ned = Math.max(0, -Math.sin(a));
    const rr = r - platt * ned ** 6;
    pkt.push(iso(c[0] + rr * Math.cos(a), y, c[2] + rr * Math.sin(a)));
  }
  return `M${pkt.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L')} Z`;
}
const pa = (c, r, y, grader) => {
  const a = (grader * Math.PI) / 180;
  return [c[0] + r * Math.cos(a), y, c[2] + r * Math.sin(a)];
};

const VIEWBOX_BRED = '-340 -310 820 560';
const VIEWBOX_SMAL = '-170 -310 560 560';

function Hjul({ c, platt = 0 }) {
  return (
    <g>
      {/* Bakre däcksidan, sedan ekrar och nav, sist främre däcksidan så att däcket får bredd */}
      <path className="dack-bak" d={ring(c, R, -DACK_BREDD, platt)} />
      <path className="falg" d={ring(c, FALG, -3)} />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} className="eker" d={linje([c[0], i % 2 ? -6 : 6, c[2]], pa(c, FALG - 2, 0, i * 22.5))} />
      ))}
      <path className="nav" d={linje([c[0], -8, c[2]], [c[0], 8, c[2]])} />
      <path className="falg" d={ring(c, FALG, 3)} />
      <path className="dack" d={ring(c, R, DACK_BREDD, platt)} />
      <path className="dack-mitt" d={ring(c, R - 4, DACK_BREDD + 2, platt)} />
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
  const platt = lagad ? 0 : 14;
  const kloss = bromsar ? 7 : 13;
  const hal = pa(FRAM, R, DACK_BREDD, -55);
  const ventil = pa(FRAM, FALG, 3, 125);
  const vevH = [VEV[0] + 22, 16, VEV[2] - 26];
  const vevV = [VEV[0] - 22, -16, VEV[2] + 26];

  const etiketter = [
    { id: 'handtag', at: P([226, 38, 200]), sida: 'h', y: -250, nr: [22, -12] },
    { id: 'broms', at: P([FRAM[0] - 4, 12, FRAM[2] + FALG]), sida: 'h', y: -190, nr: [22, -8] },
    { id: 'ventil', at: P(ventil), sida: 'h', y: -130, nr: [22, -6] },
    { id: 'dack', at: P(pa(FRAM, R, DACK_BREDD, 20)), sida: 'h', y: -60, nr: [22, 4] },
    ...(hittad && !lagad ? [{ id: 'hal', at: P(hal), sida: 'h', y: 10, nr: [22, 10] }] : []),
    { id: 'kedja', at: P([50, 12, 72]), sida: 'v', y: 40, nr: [-22, 8] },
    ...(lagad ? [{ id: 'pump', at: P([330, -60, 80]), sida: 'h', y: 60, nr: [22, 4] }] : []),
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
            <polygon className="golv" points={poly([-110, -80, 0], [380, -80, 0], [380, 80, 0], [-110, 80, 0])} />
            <polygon className="skugga" points={poly([-60, -10, 0], [320, -10, 0], [320, 26, 0], [-60, 26, 0])} />
          </g>

          {/* Pumpen står bakom cykeln */}
          {lagad && (
            <g filter={f}>
              <Lada x={318} y={-72} z={0} b={24} d={24} h={8} farg="#3d3833" />
              <Cylinder x={330} y={-60} r={9} z0={8} z1={110} farg="#c8664a" />
            </g>
          )}

          <g filter={f}>
            {/* Bortre sidan: vänster pedal, vänstra stagen och gaffelbenet */}
            <path className="ror" d={linje([VEV[0], -14, VEV[2]], vevV)} />
            <polygon className="pedal" points={poly([vevV[0] - 12, -22, vevV[2]], [vevV[0] + 12, -22, vevV[2]], [vevV[0] + 12, -8, vevV[2]], [vevV[0] - 12, -8, vevV[2]])} />
            <path className="ram tunn" d={linje([BAK[0], -9, BAK[2]], [VEV[0], -5, VEV[2]])} />
            <path className="ram tunn" d={linje([BAK[0], -9, BAK[2]], [SADELROR[0] - 2, -5, SADELROR[2] - 10])} />
            <path className="ram" d={linje([STYRROR_NED[0], -6, STYRROR_NED[2]], [FRAM[0], -9, FRAM[2]])} />

            <Hjul c={BAK} />
            <Hjul c={FRAM} platt={platt} />

            {/* Ramen i mitten */}
            <path className="ram" d={`${linje(VEV, SADELROR)} ${linje(SADELROR, STYRROR_UPP)} ${linje(STYRROR_NED, VEV)} ${linje(STYRROR_UPP, STYRROR_NED)}`} />
            <path className="ram" d={linje(SADELROR, [62, 0, 214])} />
            <path className="ram" d={linje(STYRROR_UPP, STYRE)} />

            {/* Hitre sidan: stagen och gaffelbenet */}
            <path className="ram tunn" d={linje([BAK[0], 9, BAK[2]], [VEV[0], 5, VEV[2]])} />
            <path className="ram tunn" d={linje([BAK[0], 9, BAK[2]], [SADELROR[0] - 2, 5, SADELROR[2] - 10])} />
            <path className="ram" d={linje([STYRROR_NED[0], 6, STYRROR_NED[2]], [FRAM[0], 9, FRAM[2]])} />

            {/* Kedjehjul, kedja och höger vev */}
            <path className="kedjehjul" d={ring(VEV, 22, 13)} />
            <path className="kedjehjul" d={ring(BAK, 10, 13)} />
            <path className={`kedja ${smord ? 'smord' : 'torr'}`} d={`${linje([VEV[0], 13, VEV[2] + 22], [BAK[0], 13, BAK[2] + 10])} ${linje([VEV[0], 13, VEV[2] - 22], [BAK[0], 13, BAK[2] - 10])}`} />
            <path className="ror" d={linje([VEV[0], 14, VEV[2]], vevH)} />
            <polygon className="pedal" points={poly([vevH[0] - 12, 8, vevH[2]], [vevH[0] + 12, 8, vevH[2]], [vevH[0] + 12, 24, vevH[2]], [vevH[0] - 12, 24, vevH[2]])} />

            {/* Sadel */}
            <polygon className="sadel" points={poly([40, -9, 216], [92, -4, 218], [92, 4, 218], [40, 9, 216])} />
            <polygon className="sadel-sida" points={poly([40, 9, 216], [92, 4, 218], [92, 4, 211], [40, 9, 208])} />

            {/* Styret går tvärs över cykeln */}
            <path className="styre" d={linje([STYRE[0], -40, STYRE[2]], [STYRE[0], 40, STYRE[2]])} />
            <path className="grepp" d={`${linje([STYRE[0], -42, STYRE[2]], [STYRE[0], -26, STYRE[2]])} ${linje([STYRE[0], 26, STYRE[2]], [STYRE[0], 42, STYRE[2]])}`} />
          </g>

          {/* Bromsen: handtaget dras in och klossarna trycks mot fälgen */}
          <path className="handtag" d={linje([STYRE[0] + 2, 30, STYRE[2] - 2], [STYRE[0] + (bromsar ? 18 : 24), 36, STYRE[2] - (bromsar ? 10 : 16)])} />
          <path className="vajer" d={`M${P([STYRE[0] + 2, 30, STYRE[2] - 2]).join(' ')} Q${P([240, 30, 190]).join(' ')} ${P([FRAM[0] - 4, 0, FRAM[2] + FALG + 8]).join(' ')}`} />
          <path className="bromsok" d={linje([FRAM[0] - 4, -14, FRAM[2] + FALG + 6], [FRAM[0] - 4, 14, FRAM[2] + FALG + 6])} />
          {[-1, 1].map((s) => (
            <polygon key={s} className="kloss" points={poly([FRAM[0] - 12, s * kloss, FRAM[2] + FALG - 2], [FRAM[0] + 4, s * kloss, FRAM[2] + FALG - 2], [FRAM[0] + 4, s * kloss, FRAM[2] + FALG + 6], [FRAM[0] - 12, s * kloss, FRAM[2] + FALG + 6])} />
          ))}

          {/* Ventil, hål och lapp */}
          <circle className="ventilen" cx={P(ventil)[0]} cy={P(ventil)[1]} r="4" />
          {hittad && !lagad && (
            <g className="punktering">
              <circle className="hal" cx={P(hal)[0]} cy={P(hal)[1]} r="4" />
              {[0, 1, 2].map((i) => (
                <path key={i} className="pys" d={`M${P(hal)[0] + 6} ${P(hal)[1] + i * 4} q8 ${i * 3 - 3} 16 0`} style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </g>
          )}
          {lagad && <circle className="lapp" cx={P(hal)[0]} cy={P(hal)[1]} r="6" />}
          {lagad && <path className="slang" d={`M${P([330, -60, 100]).join(' ')} Q${P([300, 20, 160]).join(' ')} ${P(ventil).join(' ')}`} />}

          {/* Oljeflaskan vid kedjan */}
          {smord && (
            <g filter={f}>
              <Cylinder x={40} y={40} r={9} z0={0} z1={30} farg="#d9a441" />
              {[0, 1, 2].map((i) => {
                const [ox, oy] = P([40 + i * 6, 13, 78 - i * 2]);
                return <circle key={i} className="olja" cx={ox} cy={oy} r="3" style={{ animationDelay: `${i * 0.25}s` }} />;
              })}
            </g>
          )}
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-170} hogerX={330} />
      </svg>
    </FigurRam>
  );
}
