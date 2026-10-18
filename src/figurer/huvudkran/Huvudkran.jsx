import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, OppenLada, Cylinder, Platta, Yta, knapp } from '../delat/former.jsx';
import './huvudkran.css';

const tx = (n, v) => t(`huvudkran.${n}`, v);

// Rören ritas på väggen (planet y = 8) med (u, v): u = x, v nedåt från z = 360.
const VY = 8;
const VZ = 360;
const P = (u, v) => iso(u, VY, VZ - v);
const HUVUD = { u: 50, v: 230 }; // huvudkranens läge på väggen
const LACKA = { u: 170, v: 112 };
const DISK = { x: 220, b: 130, y: 10, d: 110, h: 150 };

// Ledningar: in från golvet, upp förbi huvudkranen och mätaren, längs väggen till diskbänken.
const LEDNING_IN = 'M50 372 L50 120 Q50 100 70 100 L300 100';
const LEDNING_DISK = 'M276 100 L276 230';
const LEDNING_VARM = 'M316 100 L316 230';

const VIEWBOX_BRED = '-430 -390 980 600';
const VIEWBOX_SMAL = '-260 -390 580 600';

export default function Huvudkran() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [lacker, setLacker] = useState(false);
  const [huvud, setHuvud] = useState(true); // öppen
  const [disk, setDisk] = useState(true);
  const [hittad, setHittad] = useState(false);
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.start'));

  const flodarHuvud = huvud;
  const flodarDisk = huvud && disk;
  const droppar = lacker && huvud;

  const lacka = () => {
    setLacker(true);
    setStatus(tx(huvud ? 'status.lacker' : 'status.lacker.stangt'));
  };
  const hitta = () => {
    setHittad(true);
    setStatus(tx('status.hittad'));
  };
  const vaxlaHuvud = () => {
    const ny = !huvud;
    setHuvud(ny);
    setHittad(true);
    setStatus(tx(ny ? 'status.huvud.oppen' : lacker ? 'status.huvud.stangd.lacka' : 'status.huvud.stangd'));
  };
  const vaxlaDisk = () => {
    const ny = !disk;
    setDisk(ny);
    setStatus(tx(ny ? 'status.disk.oppen' : lacker && huvud ? 'status.disk.stangd.lacka' : 'status.disk.stangd'));
  };
  const borjaOm = () => {
    setLacker(false);
    setHuvud(true);
    setDisk(true);
    setHittad(false);
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const [hx, hy] = P(HUVUD.u, HUVUD.v);

  const etiketter = [
    { id: 'huvudkran', at: P(HUVUD.u + 14, HUVUD.v), sida: 'v', y: -40, nr: [-24, 0] },
    { id: 'matare', at: P(50, 160), sida: 'v', y: -150, nr: [-24, -8] },
    { id: 'ledning', at: P(170, 100), sida: 'v', y: -290, nr: [-10, -24] },
    { id: 'disk', at: iso(DISK.x + 56, DISK.y + DISK.d, 90), sida: 'h', y: 40, nr: [24, 8] },
    { id: 'kran', at: iso(DISK.x + 70, 40, DISK.h + 50), sida: 'h', y: -260, nr: [22, -12] },
    ...(lacker ? [{ id: 'lacka', at: P(LACKA.u, LACKA.v), sida: 'h', y: -180, nr: [24, -10] }] : []),
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  return (
    <FigurRam
      klass="figur-huvudkran"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx('steg.lacka'), gjort: lacker, gor: lacka },
        { text: tx('steg.hitta'), gjort: hittad, gor: hitta },
        { text: tx(huvud ? 'steg.stang.huvud' : 'steg.oppna.huvud'), gjort: !huvud, gor: vaxlaHuvud, tryckt: !huvud },
        { text: tx(disk ? 'steg.stang.disk' : 'steg.oppna.disk'), gjort: !disk, gor: vaxlaDisk, tryckt: !disk },
      ]}
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-40, -10, 0], [380, -10, 0], [380, 220, 0], [-40, 220, 0])} />
            <polygon className="vagg" points={poly([-40, 0, 0], [380, 0, 0], [380, 0, 400], [-40, 0, 400])} />
          </g>

          {/* Ledningarna på väggen */}
          <Yta yta="fram" x={0} y={VY} z={VZ}>
            <g filter={f}>
              <path d={LEDNING_IN} className="ror" />
              <path d={LEDNING_DISK} className="ror" />
              <path d={LEDNING_VARM} className="ror varm" />
              <rect className="matare" x="30" y="150" width="40" height="34" rx="6" />
              <circle className="matare-glas" cx="50" cy="167" r="10" />
            </g>
            {flodarHuvud && <path d={LEDNING_IN} className="flode" />}
            {flodarDisk && <path d={LEDNING_DISK} className="flode" />}
            {/* Huvudkranen: handtaget står längs röret när den är öppen, tvärs när den är stängd */}
            <g {...knapp(vaxlaHuvud, tx('etikett.huvudkran'))} className={`klickbar huvudkran ${hittad ? 'hittad' : ''}`}>
              {hittad && huvud && <circle className="markering" cx={HUVUD.u} cy={HUVUD.v} r="30" />}
              <rect className="ventilhus" x={HUVUD.u - 13} y={HUVUD.v - 13} width="26" height="26" rx="5" />
              <g style={{ transform: `rotate(${huvud ? 0 : 90}deg)`, transformOrigin: `${HUVUD.u}px ${HUVUD.v}px` }} className="vridbar">
                <rect className="handtag" x={HUVUD.u - 6} y={HUVUD.v - 44} width="12" height="40" rx="5" />
              </g>
            </g>
            {lacker && (
              <g className="lacka">
                <circle cx={LACKA.u} cy={LACKA.v - 6} r="7" className="skarv" />
                {droppar && [0, 1, 2].map((i) => <circle key={i} className="droppe" cx={LACKA.u} cy={LACKA.v + 6} r="4" style={{ animationDelay: `${i * 0.33}s` }} />)}
              </g>
            )}
          </Yta>

          {lacker && <Platta x={LACKA.u - 30} y={40} z={1} r={droppar ? 40 : 32} farg="#9cc0e2" klass="pol" />}

          {/* Diskbänksskåpet, öppet så att ventilerna under diskhon syns */}
          <g filter={f}>
            <OppenLada x={DISK.x} y={DISK.y} z={0} b={DISK.b} d={DISK.d} h={DISK.h} farg="#d9cdb8" inre="#b9ab93" klass="skap" />
            <Lada x={DISK.x - 6} y={DISK.y - 4} z={DISK.h} b={DISK.b + 12} d={DISK.d + 10} h={14} farg="#c9c1b3" />
            <Platta x={DISK.x + 60} y={DISK.y + 55} z={DISK.h + 14} r={36} farg="#9ea7ae" />
            <Lada x={DISK.x + 64} y={DISK.y + 4} z={DISK.h + 14} b={12} d={12} h={44} farg="#c5ccd1" />
            <Lada x={DISK.x + 40} y={DISK.y + 4} z={DISK.h + 50} b={36} d={9} h={8} farg="#c5ccd1" />
            {flodarDisk && <polygon className="kranvatten ingen-kontur" points={poly([DISK.x + 42, DISK.y + 9, DISK.h + 50], [DISK.x + 47, DISK.y + 9, DISK.h + 50], [DISK.x + 47, DISK.y + 9, DISK.h + 16], [DISK.x + 42, DISK.y + 9, DISK.h + 16])} />}
          </g>
          {/* Avstängningsventiler under diskhon */}
          {[
            { x: DISK.x + 52, farg: '#5e7fa0' },
            { x: DISK.x + 92, farg: '#c8664a' },
          ].map((v, i) => (
            <g key={i} {...knapp(vaxlaDisk, tx('etikett.disk'))}>
              <Cylinder x={v.x} y={DISK.y + 40} r={7} z0={60} z1={120} farg="#c5ccd1" />
              <Lada x={v.x - 8} y={DISK.y + 44} z={disk ? 92 : 84} b={16} d={disk ? 8 : 22} h={disk ? 22 : 8} farg={v.farg} klass="vred" />
            </g>
          ))}
          {hittad && <text className="namn hitta" x={hx} y={hy + 62} textAnchor="middle">{tx('har')}</text>}
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-240} hogerX={330} />
      </svg>
    </FigurRam>
  );
}
