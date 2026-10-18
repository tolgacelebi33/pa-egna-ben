import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { C, S, iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, Cylinder, Platta, Yta, knapp } from '../delat/former.jsx';
import './spis.css';

const tx = (n, v) => t(`spis.${n}`, v);

// Spisen: x 0–170, y 0–140, z 0–210. Hällen ovanpå, ugnen i fronten.
const B = 170;
const D = 140;
const H = 200;
const ZONER = [
  { x: 48, y: 42, r: 26 },
  { x: 122, y: 42, r: 22 },
  { x: 48, y: 100, r: 22 },
  { x: 122, y: 100, r: 28 },
];
const KOKZON = 3;
const UGN = { z0: 20, z1: 150 };
const FUNKTIONER = ['av', 'overunder', 'varmluft', 'grill'];
const skarm = (dy, dz = 0) => `translate(${(-C * dy).toFixed(1)}px, ${(S * dy - dz).toFixed(1)}px)`;

const VIEWBOX_BRED = '-460 -330 900 600';
const VIEWBOX_SMAL = '-290 -330 560 600';

export default function Spis() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [kastrull, setKastrull] = useState(null); // null | 'magnet' | 'ingen'
  const [pa, setPa] = useState(false);
  const [lucka, setLucka] = useState(false);
  const [funktion, setFunktion] = useState(0);
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.start'));

  const stall = () => {
    const ny = kastrull === 'magnet' ? 'ingen' : 'magnet';
    setKastrull(ny);
    setPa(false);
    setStatus(tx(ny === 'magnet' ? 'status.magnet' : 'status.ingen.magnet'));
  };
  const slaPa = () => {
    if (!kastrull) return setStatus(tx('status.saknas.kastrull'));
    const ny = !pa;
    setPa(ny);
    setStatus(tx(!ny ? 'status.av' : kastrull === 'magnet' ? 'status.varm' : 'status.inget.hander'));
  };
  const oppna = () => {
    setLucka(!lucka);
    setStatus(tx(lucka ? 'status.lucka.stangd' : 'status.lucka.oppen'));
  };
  const valj = () => {
    const ny = (funktion + 1) % FUNKTIONER.length;
    setFunktion(ny);
    setStatus(tx(`status.funktion.${FUNKTIONER[ny]}`));
  };
  const borjaOm = () => {
    setKastrull(null);
    setPa(false);
    setLucka(false);
    setFunktion(0);
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const fn = FUNKTIONER[funktion];
  const over = fn === 'overunder' || fn === 'grill';
  const under = fn === 'overunder';
  const flakt = fn === 'varmluft';
  const varm = pa && kastrull === 'magnet';
  const z = ZONER[KOKZON];

  const etiketter = [
    { id: 'hall', at: iso(30, 30, H + 6), sida: 'v', y: -270, nr: [-24, -10] },
    { id: 'kokzon', at: iso(ZONER[1].x, ZONER[1].y, H + 6), sida: 'h', y: -280, nr: [24, -10] },
    ...(kastrull ? [{ id: 'kastrull', at: iso(z.x + 20, z.y + 20, H + 40), sida: 'h', y: -200, nr: [24, -6] }] : []),
    { id: 'vred', at: iso(140, D, H - 18), sida: 'h', y: -120, nr: [24, 4] },
    { id: 'lucka', at: lucka ? iso(40, D + 130, 30) : iso(40, D, 90), sida: 'v', y: lucka ? 120 : -60, nr: [-24, 6] },
    ...(lucka ? [{ id: 'galler', at: iso(130, 90, 80), sida: 'h', y: 0, nr: [24, 6] }] : []),
    ...(lucka && flakt ? [{ id: 'flakt', at: iso(85, 12, 90), sida: 'v', y: -150, nr: [-24, -4] }] : []),
    ...(lucka && (over || under) ? [{ id: 'element', at: under ? iso(40, 80, UGN.z0 + 12) : iso(40, D - 6, UGN.z1 - 10), sida: 'v', y: 40, nr: [-24, 8] }] : []),
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  return (
    <FigurRam
      klass="figur-spis"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx(kastrull === 'magnet' ? 'steg.byt' : 'steg.stall'), gjort: !!kastrull, gor: stall },
        { text: tx(pa ? 'steg.sla.av' : 'steg.sla.pa'), gjort: pa, gor: slaPa, tryckt: pa },
        { text: tx(lucka ? 'steg.stang' : 'steg.oppna'), gjort: lucka, gor: oppna, tryckt: lucka },
        { text: tx('steg.funktion'), gjort: funktion > 0, gor: valj },
      ]}
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
          <radialGradient id="spis-glod">
            <stop offset="0" stopColor="#f0a35a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#c8664a" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-40, -20, 0], [260, -20, 0], [260, 360, 0], [-40, 360, 0])} />
            <polygon className="skugga" points={poly([-6, -6, 0], [B + 20, -6, 0], [B + 20, D + 8, 0], [-6, D + 8, 0])} />
            <Lada x={0} y={0} z={0} b={B} d={D} h={H} farg={{ topp: '#f2efe9', fram: '#e7e3dc', sida: '#cbc5bb' }} />
            {/* Hällen */}
            <Lada x={4} y={4} z={H} b={B - 8} d={D - 8} h={8} farg={{ topp: '#2f2c2a', fram: '#24211f', sida: '#1c1a19' }} />
          </g>
          {ZONER.map((zz, i) => (
            <g key={i}>
              <Platta x={zz.x} y={zz.y} z={H + 8} r={zz.r} farg="none" klass={`zon ${varm && i === KOKZON ? 'gloder' : ''}`} />
              {varm && i === KOKZON && <Platta x={zz.x} y={zz.y} z={H + 8} r={zz.r - 4} farg="url(#spis-glod)" klass="glod ingen-kontur" />}
            </g>
          ))}
          {/* Panelen med vred och display */}
          <g filter={f}>
            <Yta yta="fram" x={0} y={D} z={H}>
              <rect className="panel" x="6" y="4" width={B - 12} height="26" rx="4" />
              <rect className="display" x="64" y="9" width="42" height="16" rx="3" />
            </Yta>
          </g>
          <g {...knapp(valj, tx('etikett.vred'))}>
            <Yta yta="fram" x={0} y={D + 1} z={H}>
              <circle className="vred" cx="140" cy="17" r="11" />
              <line className="vred-visare" x1="140" y1="17" x2={140 + 9 * Math.sin((funktion * Math.PI) / 2)} y2={17 - 9 * Math.cos((funktion * Math.PI) / 2)} />
              <circle className="vred" cx="30" cy="17" r="11" />
            </Yta>
          </g>
          <g filter={f}>
            <Yta yta="fram" x={0} y={D + 1} z={H}>
              <text className="display-text" x="85" y="21" textAnchor="middle">
                {tx(`display.${fn}`)}
              </text>
            </Yta>
          </g>

          {/* Ugnen */}
          {lucka ? (
            <g>
              <g filter={f}>
                <polygon fill="#3a3532" points={poly([12, D, UGN.z0], [B - 12, D, UGN.z0], [B - 12, D, UGN.z1], [12, D, UGN.z1])} />
                <polygon fill="#5a524c" points={poly([12, 12, UGN.z0], [B - 12, 12, UGN.z0], [B - 12, D, UGN.z0], [12, D, UGN.z0])} />
                <polygon fill="#4a433e" points={poly([12, 12, UGN.z0], [12, 12, UGN.z1], [B - 12, 12, UGN.z1], [B - 12, 12, UGN.z0])} />
              </g>
              {/* Sidan är bortskuren så att ugnen syns. Snittet ritas som tjock linje. */}
              <polygon fill="#e7e3dc" points={poly([B, 0, UGN.z1], [B, D, UGN.z1], [B, D, H], [B, 0, H])} />
              <polyline className="snitt" points={poly([B, D, UGN.z1], [B, 0, UGN.z1], [B, 0, 0], [B, D, 0])} />
              {/* Bakväggen med fläkt */}
              <Yta yta="fram" x={20} y={12} z={UGN.z1 - 10}>
                <circle className={`flakt ${flakt ? 'snurrar' : ''}`} cx="65" cy="62" r="26" />
                <path className={`flakt-blad ${flakt ? 'snurrar' : ''}`} d="M65 62 L65 40 M65 62 L84 73 M65 62 L46 73" />
              </Yta>
              {/* Värmeelement nere och uppe */}
              <polyline className={`element ${under ? 'gloder' : ''}`} points={poly([25, 30, UGN.z0 + 4], [145, 30, UGN.z0 + 4], [145, 120, UGN.z0 + 4], [25, 120, UGN.z0 + 4])} />
              <polyline className={`element ${over ? 'gloder' : ''}`} points={poly([25, D - 6, UGN.z1 - 10], [145, D - 6, UGN.z1 - 10])} />
              {/* Gallret */}
              {[0.15, 0.35, 0.55, 0.75, 0.95].map((tt) => (
                <polyline key={tt} className="galler" points={poly([14 + (B - 28) * tt, 14, 80], [14 + (B - 28) * tt, D - 4, 80])} />
              ))}
              <polyline className="galler" points={poly([14, D - 4, 80], [B - 14, D - 4, 80])} />
              {/* Luckan, fälld ned */}
              <g filter={f}>
                <Lada x={6} y={D} z={UGN.z0 - 14} b={B - 12} d={150} h={12} farg={{ topp: '#e7e3dc', fram: '#d6d1c8', sida: '#bdb7ad' }} />
                <Yta yta="topp" x={6} y={D} z={UGN.z0 - 2}>
                  <rect className="fonster" x="22" y="22" width={B - 56} height="104" rx="8" />
                </Yta>
              </g>
              <g {...knapp(oppna, tx('etikett.lucka'))}>
                <Lada x={20} y={D + 150} z={UGN.z0 - 12} b={B - 40} d={8} h={6} farg="#bfb6a7" />
              </g>
            </g>
          ) : (
            <g filter={f} {...knapp(oppna, tx('etikett.lucka'))}>
              <Yta yta="fram" x={0} y={D} z={UGN.z1 + 8}>
                <rect className="ugnslucka" x="8" y="0" width={B - 16} height={UGN.z1 - UGN.z0 + 2} rx="4" />
                <rect className="fonster" x="26" y="26" width={B - 52} height="82" rx="8" />
                <rect className="handtag" x="22" y="10" width={B - 44} height="8" rx="4" />
              </Yta>
              {(over || under || flakt) && (
                <Yta yta="fram" x={0} y={D + 1} z={UGN.z1 + 8}>
                  <rect className="ugnsljus ingen-kontur" x="28" y="28" width={B - 56} height="78" rx="7" />
                </Yta>
              )}
            </g>
          )}

          {/* Kastrullen */}
          {kastrull && (
            <g className="kastrull">
              <Cylinder x={z.x} y={z.y} r={30} z0={H + 8} z1={H + 50} farg={kastrull === 'magnet' ? { topp: '#7d868d', fram: '#9aa3aa' } : { topp: '#c9a68a', fram: '#d8b89c' }} />
              <Platta x={z.x} y={z.y} z={H + 50} r={25} farg={varm ? '#c7d9e6' : '#5f676d'} />
              <Lada x={z.x + 28} y={z.y - 4} z={H + 40} b={54} d={8} h={6} farg="#3d3833" />
              {varm && [0, 1, 2].map((i) => <path key={i} className="anga" d={`M${iso(z.x - 10 + i * 10, z.y, H + 56)[0]} ${iso(z.x, z.y, H + 56)[1]} q-6 -14 0 -26 q6 -12 0 -26`} style={{ animationDelay: `${i * 0.4}s` }} />)}
            </g>
          )}
          {kastrull && (
            <g className="magnet">
              <Lada x={B + 30} y={30} z={0} b={18} d={12} h={kastrull === 'magnet' ? 30 : 30} farg="#c8664a" />
              <text className="namn" x={iso(B + 40, 42, 0)[0]} y={iso(B + 40, 42, 0)[1] + 22} textAnchor="middle">
                {tx(kastrull === 'magnet' ? 'magnet.fastnar' : 'magnet.inte')}
              </text>
            </g>
          )}
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-270} hogerX={260} />
      </svg>
    </FigurRam>
  );
}
