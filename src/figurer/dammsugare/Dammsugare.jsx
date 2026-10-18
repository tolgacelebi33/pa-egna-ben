import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, OppenLada, Cylinder, Platta, knapp } from '../delat/former.jsx';
import './dammsugare.css';

const tx = (n, v) => t(`dammsugare.${n}`, v);

// Dammsugaren: kroppen x 0–140, y 0–90, z 12–80. Slangen går ut framåt till röret och munstycket.
const B = 140;
const D = 90;
const Z0 = 12;
const Z1 = 80;
const MUNSTYCKEN = ['golv', 'fog', 'borste'];
const HANDTAG = [-40, 210, 150];
const MUNSTYCKE = [-150, 330, 0];

const VIEWBOX_BRED = '-500 -260 940 560';
const VIEWBOX_SMAL = '-370 -260 600 560';

function Munstycke({ typ }) {
  const [x, y] = MUNSTYCKE;
  if (typ === 'fog') {
    return <Lada x={x - 6} y={y - 6} z={0} b={12} d={12} h={44} farg="#5f676d" />;
  }
  if (typ === 'borste') {
    return (
      <g>
        <Cylinder x={x} y={y} r={18} z0={0} z1={22} farg="#5f676d" />
        {[-10, -4, 2, 8].map((dx) => (
          <polyline key={dx} className="borst" points={poly([x + dx, y + 14, 0], [x + dx, y + 14, 8])} />
        ))}
      </g>
    );
  }
  return <Lada x={x - 50} y={y - 14} z={0} b={100} d={28} h={14} farg="#5f676d" />;
}

export default function Dammsugare() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [munstycke, setMunstycke] = useState(0);
  const [oppen, setOppen] = useState(false);
  const [pase, setPase] = useState('full'); // full | ute | ny
  const [filter, setFilter] = useState('smutsigt'); // smutsigt | ute | rent
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.start'));

  const bytMunstycke = () => {
    const ny = (munstycke + 1) % MUNSTYCKEN.length;
    setMunstycke(ny);
    setStatus(tx(`status.munstycke.${MUNSTYCKEN[ny]}`));
  };
  const oppna = () => {
    setOppen(!oppen);
    setStatus(tx(oppen ? 'status.stangd' : 'status.oppen'));
  };
  const bytPase = () => {
    if (!oppen) return setStatus(tx('status.oppna.forst'));
    if (pase === 'full') {
      setPase('ute');
      setStatus(tx('status.pase.ute'));
      window.setTimeout(() => {
        setPase('ny');
        setStatus(tx('status.pase.ny'));
      }, 1000);
    }
  };
  const rengor = () => {
    if (filter === 'smutsigt') {
      setFilter('ute');
      setStatus(tx('status.filter.ute'));
      window.setTimeout(() => {
        setFilter('rent');
        setStatus(tx('status.filter.rent'));
      }, 1600);
    }
  };
  const borjaOm = () => {
    setMunstycke(0);
    setOppen(false);
    setPase('full');
    setFilter('smutsigt');
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const [hx, hy] = iso(...HANDTAG);
  const [sx, sy] = iso(20, D, 46);
  const [mx, my] = iso(MUNSTYCKE[0], MUNSTYCKE[1], MUNSTYCKEN[munstycke] === 'golv' ? 14 : MUNSTYCKEN[munstycke] === 'fog' ? 44 : 22);
  const filterUt = filter === 'ute' ? 60 : 0;

  const etiketter = [
    { id: 'slang', at: [(sx + hx) / 2 - 20, (sy + hy) / 2 + 30], sida: 'v', y: -120, nr: [-22, -8] },
    { id: 'ror', at: [(hx + mx) / 2, (hy + my) / 2], sida: 'v', y: 40, nr: [-22, 8] },
    { id: 'munstycke', at: [mx, my + 6], sida: 'v', y: 200, nr: [-22, 10] },
    { id: 'lock', at: oppen ? iso(70, 0, Z1 + 60) : iso(70, 45, Z1), sida: 'h', y: -190, nr: [24, -10] },
    ...(oppen ? [{ id: 'pase', at: iso(70, 45, pase === 'full' ? Z1 - 4 : Z0 + 18), sida: 'h', y: -110, nr: [24, -6] }] : []),
    { id: 'filter', at: iso(B + filterUt, 45, 50), sida: 'h', y: -30, nr: [24, 4] },
    { id: 'hjul', at: iso(B - 20, D, Z0), sida: 'h', y: 70, nr: [24, 8] },
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  return (
    <FigurRam
      klass="figur-dammsugare"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx('steg.munstycke'), gjort: munstycke > 0, gor: bytMunstycke },
        { text: tx(oppen ? 'steg.stang' : 'steg.oppna'), gjort: oppen, gor: oppna, tryckt: oppen },
        { text: tx('steg.pase'), gjort: pase === 'ny', gor: bytPase },
        { text: tx('steg.filter'), gjort: filter === 'rent', gor: rengor },
      ]}
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-260, -40, 0], [260, -40, 0], [260, 400, 0], [-260, 400, 0])} />
            <polygon className="skugga" points={poly([-6, -6, 0], [B + 20, -6, 0], [B + 20, D + 8, 0], [-6, D + 8, 0])} />
          </g>

          {/* Filtret på baksidan, dras ut åt höger */}
          <g className="flyttbar" style={{ transform: `translate(${(filterUt * 0.866).toFixed(1)}px, ${(filterUt * 0.5).toFixed(1)}px)` }}>
            <g {...knapp(rengor, tx('etikett.filter'))}>
              <Lada x={B - 8} y={20} z={26} b={14} d={50} h={44} farg={filter === 'rent' ? '#e7ebe4' : '#9d9584'} />
              {filter === 'ute' && [0, 1, 2, 3].map((i) => <circle key={i} className="damm" cx={iso(B + 14, 30 + i * 10, 40)[0]} cy={iso(B + 14, 30 + i * 10, 40)[1]} r="3" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </g>
          </g>

          {/* Kroppen */}
          {oppen ? (
            <g filter={f}>
              {/* Locket uppfällt bakåt, sedan kroppen som öppen låda med påsen i */}
              <polygon fill="#a6bba2" points={poly([4, 0, Z1], [B - 4, 0, Z1], [B - 4, 0, Z1 + 80], [4, 0, Z1 + 80])} />
              <OppenLada x={0} y={0} z={Z0} b={B} d={D} h={Z1 - Z0} farg="#8fa58a" inre="#5a6b57">
                {pase !== 'ute' && <Lada x={20} y={14} z={Z0 + 4} b={B - 50} d={D - 28} h={pase === 'full' ? Z1 - Z0 - 6 : 14} farg={pase === 'full' ? '#b9b1a1' : '#efe9dc'} klass="pase" />}
              </OppenLada>
              <Cylinder x={18} y={D - 2} r={14} z0={0} z1={24} farg="#3d3833" klass="hjul" />
              <Cylinder x={B - 22} y={D - 2} r={14} z0={0} z1={24} farg="#3d3833" />
            </g>
          ) : (
            <g filter={f}>
              <Lada x={0} y={0} z={Z0} b={B} d={D} h={Z1 - Z0} farg="#8fa58a" />
              <Cylinder x={18} y={D - 2} r={14} z0={0} z1={24} farg="#3d3833" klass="hjul" />
              <Cylinder x={B - 22} y={D - 2} r={14} z0={0} z1={24} farg="#3d3833" />
            </g>
          )}
          {oppen ? null : (
            <g filter={f} {...knapp(oppna, tx('etikett.lock'))}>
              <polygon fill="#a6bba2" points={poly([10, 8, Z1 + 1], [104, 8, Z1 + 1], [104, D - 8, Z1 + 1], [10, D - 8, Z1 + 1])} />
              <Lada x={46} y={30} z={Z1} b={22} d={30} h={8} farg="#3d3833" />
            </g>
          )}
          {pase === 'ute' && <Lada x={150} y={110} z={0} b={60} d={45} h={34} farg="#b9b1a1" klass="gammal-pase" />}
          {pase !== 'full' && (
            <text className="namn" x={iso(180, 155, 0)[0]} y={iso(180, 155, 0)[1] + 24} textAnchor="middle">
              {tx(pase === 'ute' ? 'gammal.pase' : 'ny.pase')}
            </text>
          )}

          {/* Slang, rör och munstycke */}
          <path className="slang" d={`M${sx} ${sy} C ${sx - 60} ${sy + 80}, ${hx + 40} ${hy + 120}, ${hx} ${hy}`} />
          <path className="slang-rand" d={`M${sx} ${sy} C ${sx - 60} ${sy + 80}, ${hx + 40} ${hy + 120}, ${hx} ${hy}`} />
          <line className="ror" x1={hx} y1={hy} x2={mx} y2={my} />
          <g filter={f} {...knapp(bytMunstycke, tx('etikett.munstycke'))}>
            <Munstycke typ={MUNSTYCKEN[munstycke]} />
          </g>
          <Platta x={HANDTAG[0]} y={HANDTAG[1]} z={HANDTAG[2]} r={9} farg="#3d3833" />
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-330} hogerX={270} />
      </svg>
    </FigurRam>
  );
}
