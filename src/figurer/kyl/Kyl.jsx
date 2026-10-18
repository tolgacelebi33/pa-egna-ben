import { useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, OppenLada, Cylinder, Yta, knapp } from '../delat/former.jsx';
import './kyl.css';

const tx = (n, v) => t(`kyl.${n}`, v);

// Kylen: x 0–160, y 0–130, kylen z 130–340, frysen z 0–120.
const B = 160;
const D = 130;
const KYL_Z0 = 130;
const KYL_Z1 = 340;
const VAGG = 9;
const HYLLOR = [292, 240, 188]; // hyllornas ovansida
const GRONSAK_Z = 138;
const PLATSER = [
  ...HYLLOR.flatMap((z, h) => [32, 80, 128].map((x) => ({ x, y: 72, z: z + 3, hylla: h + 1 }))),
  ...[48, 108].map((x) => ({ x, y: 72, z: GRONSAK_Z + 4, hylla: 4 })),
];
// Bänken till höger där maten står från början
const BANK = { x: 200, y: 30, b: 140, d: 100, h: 92 };
const MAT = [
  { id: 'mjolk', start: [222, 70] },
  { id: 'agg', start: [262, 52] },
  { id: 'kyckling', start: [300, 62] },
  { id: 'gronsaker', start: [226, 108] },
  { id: 'matlada', start: [268, 100] },
  { id: 'smor', start: [306, 104] },
];
const AUTO = { mjolk: 0, agg: 3, kyckling: 6, gronsaker: 9, matlada: 4, smor: 1 };

const VIEWBOX_BRED = '-430 -390 900 660';
const VIEWBOX_SMAL = '-260 -390 620 660';

function Vara({ id }) {
  switch (id) {
    case 'mjolk':
      return (
        <g>
          <Lada x={-11} y={-11} b={22} d={22} h={44} farg={{ topp: '#f4f1ea', fram: '#e9eef2', sida: '#c9d2da' }} />
          <polygon fill="#5e7fa0" points={poly([-11, 11, 14], [11, 11, 14], [11, 11, 26], [-11, 11, 26])} />
          <polygon fill="#f4f1ea" points={poly([-11, 0, 44], [11, 0, 44], [11, 0, 52], [-11, 0, 52])} />
        </g>
      );
    case 'agg':
      return (
        <g>
          <Lada x={-22} y={-13} b={44} d={26} h={11} farg="#c9b48f" />
          {[-12, 0, 12].map((x) =>
            [-5, 5].map((y) => <Cylinder key={`${x}${y}`} x={x} y={y} r={4.5} z0={11} z1={16} farg={{ topp: '#f6efe2', fram: '#e7dcc8' }} />),
          )}
        </g>
      );
    case 'kyckling':
      return (
        <g>
          <Lada x={-21} y={-15} b={42} d={30} h={9} farg="#e8e2d8" />
          <Cylinder x={0} y={0} r={11} z0={9} z1={15} farg={{ topp: '#efb3a2', fram: '#d98d79' }} />
          <polygon fill="#c8664a" points={poly([-21, 15, 2], [-5, 15, 2], [-5, 15, 7], [-21, 15, 7])} />
        </g>
      );
    case 'gronsaker':
      return (
        <g>
          <Cylinder x={-6} y={0} r={9} z0={0} z1={10} farg="#8fa58a" />
          <Cylinder x={8} y={4} r={7} z0={0} z1={9} farg="#c8664a" />
          <Cylinder x={2} y={-8} r={6} z0={0} z1={14} farg="#a9b97a" />
        </g>
      );
    case 'matlada':
      return (
        <g>
          <Lada x={-18} y={-13} b={36} d={26} h={13} farg={{ topp: '#dbe6ee', fram: '#c4d2dd', sida: '#a8b8c5' }} />
          <polygon fill="#d9a441" opacity="0.8" points={poly([-14, -9, 13], [14, -9, 13], [14, 9, 13], [-14, 9, 13])} />
        </g>
      );
    default:
      return <Lada x={-12} y={-8} b={24} d={16} h={10} farg="#e9c46a" />;
  }
}

export default function Kyl() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const reduceraRorelse = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [oppen, setOppen] = useState(false);
  const [plats, setPlats] = useState({}); // vara -> index i PLATSER
  const [zoner, setZoner] = useState(false);
  const [frys, setFrys] = useState('stangd'); // stangd | oppen | avfrostad
  const [vald, setVald] = useState(null);
  const [drag, setDrag] = useState(null); // { id, x, y }
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.start'));
  const svgRef = useRef(null);
  const timer = useRef(0);

  const upptagna = new Set(Object.values(plats));
  const ledig = (onskad) => {
    if (!upptagna.has(onskad)) return onskad;
    return PLATSER.findIndex((_, i) => !upptagna.has(i));
  };

  const lagg = (id, index) => {
    setPlats((p) => ({ ...p, [id]: index }));
    setStatus(tx('status.lagd', { vara: tx(`mat.${id}`), hylla: tx(`hylla.${PLATSER[index].hylla}`) }));
  };

  const oppna = () => {
    const ny = !oppen;
    setOppen(ny);
    setStatus(tx(ny ? 'status.oppen' : 'status.stangd'));
  };

  const laggIn = () => {
    if (!oppen) return setStatus(tx('status.oppna.forst'));
    const ny = { ...plats };
    const anv = new Set(Object.values(ny));
    for (const m of MAT) {
      if (ny[m.id] !== undefined) continue;
      let i = AUTO[m.id];
      if (anv.has(i)) i = PLATSER.findIndex((_, j) => !anv.has(j));
      ny[m.id] = i;
      anv.add(i);
    }
    setPlats(ny);
    setStatus(tx('status.inlagd'));
  };

  const frosta = () => {
    window.clearTimeout(timer.current);
    if (frys === 'stangd' || frys === 'avfrostad') {
      setFrys('oppen');
      setStatus(tx('status.frys.oppen'));
      timer.current = window.setTimeout(
        () => {
          setFrys('avfrostad');
          setStatus(tx('status.frys.klar'));
        },
        reduceraRorelse ? 0 : 2600,
      );
    }
  };

  const borjaOm = () => {
    window.clearTimeout(timer.current);
    setOppen(false);
    setPlats({});
    setZoner(false);
    setFrys('stangd');
    setVald(null);
    setStatus(tx('status.start'));
  };

  // Dra och släpp: pekarens läge i figurens koordinater, och närmaste lediga plats.
  const tillSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  const narmast = (p) => {
    let basta = -1;
    let avst = 60;
    PLATSER.forEach((s, i) => {
      if (upptagna.has(i)) return;
      const [sx, sy] = iso(s.x, s.y, s.z);
      const a = Math.hypot(sx - p.x, sy - p.y);
      if (a < avst) {
        avst = a;
        basta = i;
      }
    });
    return basta;
  };

  const varaPos = (m) => {
    if (plats[m.id] !== undefined) {
      const s = PLATSER[plats[m.id]];
      return iso(s.x, s.y, s.z);
    }
    return iso(m.start[0], m.start[1], BANK.h);
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const frysUt = frys === 'stangd' ? 0 : 70;

  const etiketter = [
    { id: 'dorr', at: iso(0, D + 110, 300), sida: 'v', y: -330, nr: [-20, -10], syns: oppen },
    { id: 'dorrfack', at: iso(0, D + 70, 230), sida: 'v', y: -240, nr: [-24, 6], syns: oppen },
    { id: 'hylla', at: iso(140, 60, HYLLOR[1]), sida: 'h', y: -240, nr: [22, -12], syns: oppen },
    { id: 'gronsakslada', at: iso(150, 90, GRONSAK_Z + 20), sida: 'h', y: -120, nr: [22, 8], syns: oppen },
    { id: 'frys', at: iso(150, D + frysUt, 60), sida: 'h', y: 0, nr: [22, 8], syns: true },
    { id: 'is', at: iso(40, D + frysUt - 20, 70), sida: 'v', y: -40, nr: [-22, 0], syns: frys === 'oppen' },
    { id: 'termometer', at: iso(150, 30, HYLLOR[0] + 20), sida: 'h', y: -330, nr: [20, -14], syns: oppen },
  ]
    .filter((e) => e.syns)
    .map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  return (
    <FigurRam
      klass="figur-kyl"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx(oppen ? 'steg.stang' : 'steg.oppna'), gjort: oppen, gor: oppna, tryckt: oppen },
        { text: tx('steg.lagg'), gjort: Object.keys(plats).length === MAT.length, gor: laggIn },
        { text: tx('steg.zoner'), gjort: zoner, gor: () => (oppen ? (setZoner(!zoner), setStatus(tx(zoner ? 'status.zoner.av' : 'status.zoner'))) : setStatus(tx('status.oppna.forst'))) },
        { text: tx('steg.frosta'), gjort: frys === 'avfrostad', gor: frosta },
      ]}
      extra={
        oppen && (
          <fieldset className="kyl-val">
            <legend className="mono">{tx('val.rubrik')}</legend>
            <div className="kyl-varor">
              {MAT.map((m) => (
                <button key={m.id} type="button" className={`chip ${vald === m.id ? 'pa' : ''}`} aria-pressed={vald === m.id} onClick={() => setVald(vald === m.id ? null : m.id)}>
                  {tx(`mat.${m.id}`)}
                </button>
              ))}
            </div>
            {vald && (
              <div className="kyl-varor">
                {[1, 2, 3, 4].map((h) => (
                  <button
                    key={h}
                    type="button"
                    className="chip"
                    onClick={() => {
                      const i = ledig(PLATSER.findIndex((p) => p.hylla === h && !upptagna.has(PLATSER.indexOf(p))));
                      if (i >= 0) lagg(vald, i);
                      setVald(null);
                    }}
                  >
                    {tx(`hylla.${h}`)}
                  </button>
                ))}
              </div>
            )}
          </fieldset>
        )
      }
    >
      <svg ref={svgRef} viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
          <linearGradient id="kyl-zon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9cc0e2" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#d9e6ef" stopOpacity="0.25" />
            <stop offset="1" stopColor="#5e7fa0" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="skugga" points={poly([-8, -8, 0], [B + 30, -8, 0], [B + 30, D + 12, 0], [-8, D + 12, 0])} />
            {/* Skåpets yttre, sedan bänken som står närmare */}
            <Lada x={0} y={0} z={0} b={B} d={D} h={KYL_Z1} farg={{ topp: '#f4f0e8', fram: '#ebe6dc', sida: '#cfc8bb' }} />
            <polygon className="skugga" points={poly([BANK.x - 6, BANK.y - 6, 0], [BANK.x + BANK.b + 14, BANK.y - 6, 0], [BANK.x + BANK.b + 14, BANK.y + BANK.d + 6, 0], [BANK.x - 6, BANK.y + BANK.d + 6, 0])} />
            <Lada x={BANK.x} y={BANK.y} z={0} b={BANK.b} d={BANK.d} h={BANK.h} farg="#b98a5e" />
          </g>

          {/* Insidan syns när dörren är öppen */}
          {oppen && (
            <g filter={f}>
              <polygon fill="#eef2f4" points={poly([VAGG, VAGG, KYL_Z0], [B - VAGG, VAGG, KYL_Z0], [B - VAGG, VAGG, KYL_Z1 - VAGG], [VAGG, VAGG, KYL_Z1 - VAGG])} />
              <polygon fill="#dfe6ea" points={poly([VAGG, VAGG, KYL_Z0], [VAGG, D, KYL_Z0], [VAGG, D, KYL_Z1 - VAGG], [VAGG, VAGG, KYL_Z1 - VAGG])} />
              <polygon fill="#e6ecef" points={poly([VAGG, VAGG, KYL_Z0], [B - VAGG, VAGG, KYL_Z0], [B - VAGG, D, KYL_Z0], [VAGG, D, KYL_Z0])} />
              {/* Lampa i taket */}
              <polygon fill="#f6e7a8" points={poly([60, 20, KYL_Z1 - VAGG], [100, 20, KYL_Z1 - VAGG], [100, 40, KYL_Z1 - VAGG], [60, 40, KYL_Z1 - VAGG])} />
              {HYLLOR.map((z) => (
                <Lada key={z} x={VAGG} y={VAGG} z={z - 4} b={B - 2 * VAGG} d={D - VAGG - 4} h={4} farg={{ topp: '#cfe0ea', fram: '#9fbcd0', sida: '#9fbcd0' }} klass="glashylla" />
              ))}
              <OppenLada x={VAGG + 4} y={VAGG + 4} z={KYL_Z0} b={B - 2 * VAGG - 8} d={D - VAGG - 8} h={GRONSAK_Z - KYL_Z0 + 28} farg={{ fram: '#d9e8dc', sida: '#bccdc0' }} inre="#c7d8cb" klass="gronsakslada" />
              <g className="termometer">
                <Lada x={130} y={22} z={HYLLOR[0]} b={10} d={6} h={30} farg="#f4f0e8" />
                <Yta yta="fram" x={130} y={28} z={HYLLOR[0] + 30}>
                  <rect className="ingen-kontur" x="2" y="4" width="6" height="16" fill="#c8664a" />
                </Yta>
              </g>
              {zoner && (
                <g className="zoner">
                  <polygon fill="url(#kyl-zon)" stroke="none" points={poly([VAGG, D - 2, KYL_Z0], [B - VAGG, D - 2, KYL_Z0], [B - VAGG, D - 2, KYL_Z1 - VAGG], [VAGG, D - 2, KYL_Z1 - VAGG])} />
                  {[0, 1, 2].map((i) => {
                    const [zx, zy] = iso(B - VAGG - 4, D, KYL_Z1 - 30 - i * 60);
                    return (
                      <text key={i} className="namn zon-namn" x={zx} y={zy} textAnchor="end">
                        {tx('zon', { nr: i + 1 })}
                      </text>
                    );
                  })}
                </g>
              )}
            </g>
          )}

          {/* Maten */}
          {MAT.map((m) => {
            const [px, py] = drag?.id === m.id ? [drag.x, drag.y] : varaPos(m);
            const syns = oppen || plats[m.id] === undefined;
            return (
              <g
                key={m.id}
                className={`vara ${drag?.id === m.id ? 'dras' : 'flyttbar'} ${vald === m.id ? 'vald' : ''}`}
                style={{ transform: `translate(${px}px, ${py}px)`, opacity: syns ? 1 : 0 }}
                onPointerDown={(e) => {
                  if (!oppen) return setStatus(tx('status.oppna.forst'));
                  e.currentTarget.setPointerCapture(e.pointerId);
                  const p = tillSvg(e);
                  setDrag({ id: m.id, x: p.x, y: p.y });
                }}
                onPointerMove={(e) => {
                  if (drag?.id !== m.id) return;
                  const p = tillSvg(e);
                  setDrag({ id: m.id, x: p.x, y: p.y });
                }}
                onPointerUp={() => {
                  if (drag?.id !== m.id) return;
                  const i = narmast(drag);
                  if (i >= 0) lagg(m.id, i);
                  setDrag(null);
                }}
              >
                <Vara id={m.id} />
              </g>
            );
          })}

          {/* Kylens främre kant och den öppna dörren */}
          <g filter={f}>
            {oppen ? (
              <>
                <polygon fill="#ebe6dc" points={poly([0, D, KYL_Z0], [VAGG, D, KYL_Z0], [VAGG, D, KYL_Z1], [0, D, KYL_Z1])} />
                <polygon fill="#ebe6dc" points={poly([0, D, KYL_Z1 - VAGG], [B, D, KYL_Z1 - VAGG], [B, D, KYL_Z1], [0, D, KYL_Z1])} />
                <polygon fill="#ebe6dc" points={poly([B - VAGG, D, KYL_Z0], [B, D, KYL_Z0], [B, D, KYL_Z1], [B - VAGG, D, KYL_Z1])} />
                {/* Dörren, öppen åt vänster: insidan syns */}
                <polygon fill="#e3ddd1" points={poly([0, D, KYL_Z0 + 2], [0, D + 150, KYL_Z0 + 2], [0, D + 150, KYL_Z1 - 2], [0, D, KYL_Z1 - 2])} />
                <polygon fill="#d2cbbe" points={poly([0, D + 150, KYL_Z0 + 2], [-14, D + 150, KYL_Z0 + 2], [-14, D + 150, KYL_Z1 - 2], [0, D + 150, KYL_Z1 - 2])} />
                {[300, 236, 172].map((z) => (
                  <OppenLada key={z} x={0} y={D + 18} z={z - 22} b={18} d={114} h={22} farg={{ fram: '#e9eef2', sida: '#cfd8df' }} inre="#bfcbd4" klass="dorrfack" />
                ))}
              </>
            ) : (
              <g {...knapp(oppna, tx('dorr.aria'))}>
                <polygon fill="#ebe6dc" points={poly([0, D, KYL_Z0 + 2], [B, D, KYL_Z0 + 2], [B, D, KYL_Z1], [0, D, KYL_Z1])} />
                <Lada x={B - 22} y={D} z={KYL_Z1 - 110} b={8} d={8} h={70} farg="#bfb6a7" />
              </g>
            )}
          </g>

          {/* Frysen */}
          <g filter={f}>
            {frys === 'stangd' ? (
              <g {...knapp(frosta, tx('frys.aria'))}>
                <polygon fill="#e6e0d5" points={poly([0, D, 4], [B, D, 4], [B, D, KYL_Z0 - 6], [0, D, KYL_Z0 - 6])} />
                <Lada x={30} y={D} z={KYL_Z0 - 30} b={100} d={8} h={8} farg="#bfb6a7" />
              </g>
            ) : (
              <g className="flyttbar" style={{ transform: `translate(${(-frysUt * 0.866).toFixed(1)}px, ${(frysUt * 0.5).toFixed(1)}px)` }}>
                <OppenLada x={VAGG} y={VAGG} z={6} b={B - 2 * VAGG} d={D - VAGG} h={90} farg={{ fram: '#e6e0d5', sida: '#cbc4b7' }} inre="#d8e4ea">
                  {[
                    [30, 30, 40],
                    [70, 20, 55],
                    [120, 34, 38],
                    [24, 80, 30],
                  ].map(([x, y, z], i) => (
                    <Cylinder key={i} x={x} y={y} r={14} z0={6} z1={z} farg={{ topp: '#ffffff', fram: '#e8f1f6' }} klass={`is ${frys === 'avfrostad' ? 'smalt' : ''}`} />
                  ))}
                  {frys === 'avfrostad' && <polygon className="smaltvatten ingen-kontur" points={poly([20, 30, 7], [140, 30, 7], [140, 110, 7], [20, 110, 7])} />}
                </OppenLada>
              </g>
            )}
          </g>
        </g>

        <Etiketter lista={etiketter} smal={smal} vansterX={-270} hogerX={300} />
        {!smal && (
          <text className="namn" x={iso(BANK.x + BANK.b / 2, BANK.y + BANK.d, 0)[0]} y={iso(BANK.x + BANK.b / 2, BANK.y + BANK.d, 0)[1] + 24} textAnchor="middle">
            {tx('bank')}
          </text>
        )}
      </svg>
    </FigurRam>
  );
}
