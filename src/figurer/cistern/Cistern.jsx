import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, Cylinder, Platta, Yta, knapp } from '../delat/former.jsx';
import './cistern.css';

const tx = (n, v) => t(`cistern.${n}`, v);

// Cisternen: x 20–180, y 0–50, z 190–340. Genomskärningen ritas på framsidan (y = 50)
// med (u, v): u = x - 20, v nedåt från cisternens överkant.
const CX0 = 20;
const CB = 160;
const CY = 50;
const CZ0 = 190;
const CZ1 = 340;
const CH = CZ1 - CZ0;
const P = (u, v) => iso(CX0 + u, CY, CZ1 - v);
const FULL = 42; // vattenytan när cisternen är full
const TOM = 136;
const LACKER = 50;

const VIEWBOX_BRED = '-400 -400 820 600';
const VIEWBOX_SMAL = '-240 -400 500 600';

export default function Cistern() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const reduceraRorelse = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [niva, setNiva] = useState(FULL);
  const [fas, setFas] = useState('vilar'); // vilar | toms | fylls
  const [lock, setLock] = useState(false);
  const [lacker, setLacker] = useState(false);
  const [stangd, setStangd] = useState(false);
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.start'));
  const timers = useRef([]);
  const rensa = () => {
    timers.current.forEach((x) => window.clearTimeout(x));
    timers.current = [];
  };
  useEffect(() => rensa, []);
  const efter = (ms, fn) => timers.current.push(window.setTimeout(fn, reduceraRorelse ? 0 : ms));

  const spola = () => {
    if (fas !== 'vilar') return;
    rensa();
    setFas('toms');
    setNiva(TOM);
    setStatus(tx('status.spolar'));
    efter(1300, () => {
      if (stangd) {
        setFas('vilar');
        setStatus(tx('status.ingen.pafyllning'));
        return;
      }
      setFas('fylls');
      setNiva(lacker ? LACKER : FULL);
      setStatus(tx('status.fylls'));
      efter(3000, () => {
        setFas('vilar');
        setStatus(tx(lacker ? 'status.lacker' : 'status.full'));
      });
    });
  };
  const lyftLock = () => {
    setLock(!lock);
    setStatus(tx(lock ? 'status.lock.pa' : 'status.lock.av'));
  };
  const lacka = () => {
    const ny = !lacker;
    setLacker(ny);
    if (!stangd) setNiva(ny ? LACKER : FULL);
    setStatus(tx(ny ? 'status.lacker' : 'status.tat'));
  };
  const stang = () => {
    const ny = !stangd;
    setStangd(ny);
    if (ny && lacker) {
      setNiva(TOM - 10);
      setStatus(tx('status.stangd.lacker'));
    } else {
      if (!ny) setNiva(lacker ? LACKER : FULL);
      setStatus(tx(ny ? 'status.stangd' : 'status.oppnad'));
    }
  };
  const borjaOm = () => {
    rensa();
    setNiva(FULL);
    setFas('vilar');
    setLock(false);
    setLacker(false);
    setStangd(false);
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const tatningOppen = fas === 'toms';
  const rinnerIn = !stangd && (fas === 'fylls' || (lacker && fas === 'vilar'));
  const rinnerUt = fas === 'toms' || (lacker && !(stangd && niva >= TOM - 10));
  const flottorV = Math.min(niva, TOM - 8) - 8;
  const lyft = lock ? -60 : 0;

  const etiketter = [
    { id: 'spolknapp', at: [iso(100, 25, CZ1 + 18)[0], iso(100, 25, CZ1 + 18)[1] + lyft], sida: 'h', y: lock ? -380 : -320, nr: [22, -10] },
    { id: 'flottor', at: P(70, flottorV), sida: 'v', y: -250, nr: [-22, -8] },
    { id: 'ventil', at: P(26, 30), sida: 'v', y: -310, nr: [-24, -10] },
    { id: 'bradd', at: P(95, 34), sida: 'h', y: -250, nr: [24, -10] },
    { id: 'tatning', at: P(95, 140), sida: 'h', y: -150, nr: [24, 4] },
    { id: 'vatten', at: P(130, Math.max(niva + 20, 100)), sida: 'h', y: -200, nr: [24, 0] },
    { id: 'avstangning', at: iso(6, 10, 120), sida: 'v', y: -100, nr: [-22, 8] },
    { id: 'skal', at: iso(100, 150, 150), sida: 'v', y: 40, nr: [-22, 10] },
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  return (
    <FigurRam
      klass="figur-cistern"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx('steg.spola'), gor: spola, av: fas !== 'vilar' },
        { text: tx(lock ? 'steg.lock.pa' : 'steg.lock.av'), gjort: lock, gor: lyftLock, tryckt: lock },
        { text: tx(lacker ? 'steg.laga' : 'steg.lacka'), gjort: lacker, gor: lacka, tryckt: lacker },
        { text: tx(stangd ? 'steg.oppna' : 'steg.stang'), gjort: stangd, gor: stang, tryckt: stangd },
      ]}
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
          <clipPath id="ci-insida">
            <rect x="6" y="6" width={CB - 12} height={CH - 12} />
          </clipPath>
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-60, -20, 0], [260, -20, 0], [260, 230, 0], [-60, 230, 0])} />
            <polygon className="vagg" points={poly([-60, 0, 0], [260, 0, 0], [260, 0, 440], [-60, 0, 440])} />
            {/* Vattenledningen från väggen med avstängningsventil */}
            <Lada x={0} y={4} z={40} b={10} d={10} h={160} farg="#c5ccd1" />
            <Lada x={-6} y={8} z={112} b={20} d={8} h={14} farg={stangd ? '#c8664a' : '#d9a441'} klass="avstangning" {...knapp(stang, tx('etikett.avstangning'))} />
            {/* Toalettstolen */}
            <Lada x={55} y={40} z={0} b={90} d={95} h={120} farg="#eef0f1" />
            <Cylinder x={100} y={105} r={58} z0={110} z1={150} farg={{ topp: '#f7f8f9', fram: '#e3e7ea' }} />
            <Platta x={100} y={110} z={150} r={44} farg="#d3dde4" />
            <Platta x={100} y={112} z={150} r={30} farg={rinnerUt ? '#9cc0e2' : '#b9cfdf'} klass={rinnerUt ? 'krusning' : ''} />
            {/* Cisternens sida och botten (framsidan är bortskuren) */}
            <polygon fill="#e3e7ea" points={poly([CX0 + CB, 0, CZ0], [CX0 + CB, CY, CZ0], [CX0 + CB, CY, CZ1], [CX0 + CB, 0, CZ1])} />
            <polygon fill="#d4dade" points={poly([CX0, 0, CZ0], [CX0 + CB, 0, CZ0], [CX0 + CB, 0, CZ1], [CX0, 0, CZ1])} />
          </g>

          {/* Genomskärningen */}
          <Yta yta="fram" x={CX0} y={CY} z={CZ1}>
            <rect className="insida" x="6" y="6" width={CB - 12} height={CH - 12} />
            <g clipPath="url(#ci-insida)">
              <rect className="vatten" x="0" y="0" width={CB} height={CH} style={{ transform: `translateY(${niva}px)`, transitionDuration: fas === 'fylls' ? '3s' : '1.2s' }} />
            </g>
            <g filter={f}>
              {/* Påfyllningsventil till vänster */}
              <rect className="metall" x="20" y="22" width="12" height={CH - 28} />
              <rect className="metall" x="14" y="16" width="24" height="12" rx="3" />
              {/* Bräddavlopp och spolventil i mitten */}
              <rect className="metall" x="87" y="26" width="16" height={CH - 40} />
            </g>
            {/* Flottör på arm */}
            <g className="flottor" style={{ transform: `translateY(${flottorV}px)` }}>
              <path className="arm" d={`M38 ${22 - flottorV} L68 0`} />
              <circle cx="70" cy="0" r="12" className="flottor-boll" />
            </g>
            {/* Tätningen i botten lyfts när man spolar */}
            <g className="tatning" style={{ transform: tatningOppen ? 'translateY(-16px) rotate(-18deg)' : 'none' }}>
              <rect x="78" y={CH - 16} width="34" height="8" rx="3" />
            </g>
            {rinnerIn && <path className="stralar" d="M26 16 q0 -8 6 -10 M26 16 q0 -8 -6 -10" />}
            {rinnerIn && <path className="flode" d={`M44 28 Q60 ${niva - 10} 60 ${CH - 8}`} />}
            {rinnerUt && <path className="flode ut" d={`M95 ${CH - 8} L95 ${CH + 30}`} />}
            <rect className="kant" x="0" y="0" width={CB} height={CH} />
          </Yta>

          {/* Locket och spolknappen */}
          <g className="flyttbar" style={{ transform: `translateY(${lyft}px)` }} filter={f}>
            <Lada x={CX0 - 4} y={-4} z={CZ1} b={CB + 8} d={CY + 8} h={12} farg="#f2f4f5" />
            <g {...knapp(spola, tx('etikett.spolknapp'))}>
              <Cylinder x={100} y={25} r={14} z0={CZ1 + 12} z1={CZ1 + 18} farg={{ topp: '#c5ccd1', fram: '#9ea7ae' }} />
            </g>
          </g>
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-200} hogerX={230} />
      </svg>
    </FigurRam>
  );
}
