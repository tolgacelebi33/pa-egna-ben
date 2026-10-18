import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { C, S, iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, Cylinder, Platta, Yta, knapp } from '../delat/former.jsx';
import './diskmaskin.css';

const tx = (n, v) => t(`diskmaskin.${n}`, v);

// Diskmaskinen: x 0–150, y 0–150, z 0–200. Luckan ligger fälld framåt, y 150–330.
const B = 150;
const D = 150;
const H = 200;
const V = 8; // väggtjocklek
const UT = 165; // så långt nedre korgen dras ut
const skarm = (dy) => `translate(${(-C * dy).toFixed(1)}px, ${(S * dy).toFixed(1)}px)`;

const VIEWBOX_BRED = '-470 -330 900 640';
const VIEWBOX_SMAL = '-300 -330 560 640';

function Korg({ z, h, farg = '#8d969d', children }) {
  const x0 = 12;
  const x1 = B - 12;
  const y0 = 16;
  const y1 = D - 8;
  return (
    <g className="korg">
      <polygon className="korg-botten" points={poly([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z])} />
      {[0.25, 0.5, 0.75].map((t) => (
        <polyline key={t} className="trad" points={poly([x0 + (x1 - x0) * t, y0, z], [x0 + (x1 - x0) * t, y1, z])} />
      ))}
      {children}
      <polyline className="trad tjock" style={{ stroke: farg }} points={poly([x0, y1, z], [x0, y1, z + h], [x1, y1, z + h], [x1, y1, z])} />
      <polyline className="trad tjock" style={{ stroke: farg }} points={poly([x1, y1, z + h], [x1, y0, z + h], [x1, y0, z])} />
      {[0.33, 0.66].map((t) => (
        <polyline key={t} className="trad" points={poly([x0 + (x1 - x0) * t, y1, z], [x0 + (x1 - x0) * t, y1, z + h])} />
      ))}
    </g>
  );
}

export default function Diskmaskin() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [ute, setUte] = useState(false);
  const [disk, setDisk] = useState(false);
  const [medel, setMedel] = useState('tomt'); // tomt | oppet | fyllt
  const [filter, setFilter] = useState('i'); // i | ute | rent
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.start'));

  const draUt = () => {
    setUte(!ute);
    setStatus(tx(ute ? 'status.inne' : 'status.ute'));
  };
  const stallIn = () => {
    setDisk(true);
    setStatus(tx('status.disk'));
  };
  const fyll = () => {
    if (medel === 'tomt') {
      setMedel('oppet');
      setStatus(tx('status.fack.oppet'));
      window.setTimeout(() => {
        setMedel('fyllt');
        setStatus(tx('status.fack.fyllt'));
      }, 1100);
    }
  };
  const filtret = () => {
    if (filter === 'i') {
      setFilter('ute');
      setStatus(tx('status.filter.ute'));
    } else if (filter === 'ute') {
      setFilter('rent');
      setStatus(tx('status.filter.rent'));
    }
  };
  const borjaOm = () => {
    setUte(false);
    setDisk(false);
    setMedel('tomt');
    setFilter('i');
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const filterUte = filter !== 'i';

  const etiketter = [
    { id: 'ovre', at: iso(B - 12, D - 8, 150), sida: 'h', y: -250, nr: [24, -8] },
    { id: 'nedre', at: ute ? iso(B - 12, D - 8 + UT, 74) : iso(B - 12, D - 8, 74), sida: 'h', y: 60, nr: [24, 6] },
    { id: 'fack', at: iso(75, 215, 14), sida: 'v', y: 120, nr: [-24, 8] },
    { id: 'spolarm', at: iso(110, 70, 22), sida: 'h', y: -150, nr: [24, -10] },
    { id: 'filter', at: filterUte ? [iso(75, 255, 26)[0] + 60, iso(75, 255, 26)[1]] : iso(75, 80, 26), sida: filterUte ? 'h' : 'v', y: filterUte ? 150 : -60, nr: [-24, -4] },
    { id: 'salt', at: iso(35, 115, 12), sida: 'v', y: -110, nr: [-24, 4] },
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  return (
    <FigurRam
      klass="figur-diskmaskin"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx(ute ? 'steg.skjut' : 'steg.dra'), gjort: ute, gor: draUt, tryckt: ute },
        { text: tx('steg.stall'), gjort: disk, gor: stallIn },
        { text: tx('steg.medel'), gjort: medel === 'fyllt', gor: fyll },
        { text: tx(filter === 'ute' ? 'steg.skolj' : 'steg.filter'), gjort: filter === 'rent', gor: filtret },
      ]}
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-90, -20, 0], [260, -20, 0], [260, 360, 0], [-90, 360, 0])} />
            {/* Köksskåpet bredvid, med bänkskiva */}
            <Lada x={-90} y={0} z={0} b={90} d={D} h={H} farg="#d9cdb8" />
            <Lada x={-96} y={-6} z={H} b={96} d={D + 16} h={16} farg="#c9c1b3" />
            {/* Maskinens insida */}
            <polygon fill="#d9e1e6" points={poly([V, V, 10], [B - V, V, 10], [B - V, V, H - 6], [V, V, H - 6])} />
            <polygon fill="#c8d2d8" points={poly([V, V, 10], [V, D, 10], [V, D, H - 6], [V, V, H - 6])} />
            <polygon fill="#e3e9ec" points={poly([V, V, 10], [B - V, V, 10], [B - V, D, 10], [V, D, 10])} />
            {/* Höger sida och tak är bortskurna i figuren. Snittkanterna ritas som tjocka linjer. */}
            <polyline className="snitt" points={poly([B, 0, 0], [B, D, 0])} />
            <polyline className="snitt" points={poly([B, 0, 0], [B, 0, H], [0, 0, H])} />
            {/* Saltbehållarens lock och spolarmen */}
            <Platta x={35} y={115} z={11} r={14} farg="#d9a441" />
            <Lada x={30} y={66} z={18} b={95} d={10} h={5} farg="#9ea7ae" />
            <Cylinder x={78} y={71} r={8} z0={11} z1={24} farg="#9ea7ae" />
          </g>

          {/* Filtret, lyfts upp när det tas ur */}
          <g className="flyttbar" style={{ transform: filterUte ? `${skarm(175)} translate(60px, 0px)` : 'none' }}>
            <g {...knapp(filtret, tx('etikett.filter'))}>
              <Cylinder x={75} y={80} r={13} z0={0} z1={26} farg={filter === 'ute' ? '#a39b7c' : '#cfd8de'} />
              {filter === 'ute' && <path className="smuts ingen-kontur" d={`M${iso(75, 80, 12)[0] - 10} ${iso(75, 80, 12)[1]} q5 -5 10 0 t10 0`} />}
            </g>
          </g>

          {/* Övre korgen med glas */}
          <g filter={f}>
            <Korg z={120} h={40}>
              {disk &&
                [30, 65, 100].map((x) =>
                  [50, 100].map((y) => <Cylinder key={`${x}${y}`} x={x} y={y} r={10} z0={120} z1={150} farg={{ topp: '#e8f0f5', fram: '#c9dbe7' }} klass="glas" />),
                )}
            </Korg>
          </g>

          {/* Maskinens främre ram och bänkskivan */}
          <g filter={f}>
            <polygon fill="#e4e6e7" points={poly([0, D, 0], [V, D, 0], [V, D, H], [0, D, H])} />
            <polygon fill="#e4e6e7" points={poly([B - V, D, 0], [B, D, 0], [B, D, H], [B - V, D, H])} />
            <polygon fill="#e4e6e7" points={poly([0, D, H - 14], [B, D, H - 14], [B, D, H], [0, D, H])} />
            {/* Luckan, fälld framåt */}
            <Lada x={0} y={D} z={0} b={B} d={180} h={12} farg={{ topp: '#dfe3e5', fram: '#d0d5d8', sida: '#b9bfc3' }} />
            <Yta yta="topp" x={0} y={D} z={12}>
              <rect className="lucka-insida ingen-kontur" x="10" y="8" width={B - 20} height="164" rx="6" />
            </Yta>
            {/* Diskmedelsfacket på luckans insida */}
            <g {...knapp(fyll, tx('etikett.fack'))}>
              <Yta yta="topp" x={50} y={200} z={12}>
                <rect className="fack" x="0" y="0" width="50" height="30" rx="4" />
                {medel !== 'tomt' && <rect className="tablett" x="12" y="8" width="26" height="14" rx="3" />}
              </Yta>
              <g className="fack-lock" style={{ transform: medel === 'oppet' ? skarm(30) : 'none' }}>
                <Yta yta="topp" x={50} y={200} z={14}>
                  <rect className="lock" x="0" y="0" width="50" height="30" rx="4" />
                </Yta>
              </g>
            </g>
          </g>

          {/* Nedre korgen, kan dras ut på luckan */}
          <g className="flyttbar" style={{ transform: ute ? skarm(UT) : 'none' }}>
            <g filter={f} {...knapp(draUt, tx('etikett.nedre'))}>
              <Korg z={28} h={46}>
                {disk &&
                  [30, 50, 70, 90, 110].map((x) => (
                    <Yta key={x} yta="sida" x={x} y={115} z={88}>
                      <circle className="tallrik" cx="45" cy="38" r="34" />
                      <circle className="tallrik-inre" cx="45" cy="38" r="20" />
                    </Yta>
                  ))}
              </Korg>
            </g>
          </g>
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-290} hogerX={250} />
      </svg>
    </FigurRam>
  );
}
