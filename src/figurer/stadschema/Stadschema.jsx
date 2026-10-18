import { useEffect, useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, Cylinder, Platta } from '../delat/former.jsx';
import { las, spara } from '../../lib/lagring.js';
import './stadschema.css';

const tx = (n, v) => t(`stadschema.${n}`, v);

// Det finns ingen officiell standard för hur ofta man städar. Användaren väljer själv hur ofta,
// appen föreslår inga frekvenser (CLAUDE.md: inga frekvenser utan källa).
const RUM = [
  { id: 'kok', x: 0, y: 0, b: 150, d: 120, uppgifter: ['bankar', 'spis', 'kyl', 'sopor'] },
  { id: 'badrum', x: 160, y: 0, b: 110, d: 120, uppgifter: ['toalett', 'dusch', 'handfat', 'golvbrunn'] },
  { id: 'vardagsrum', x: 0, y: 130, b: 150, d: 140, uppgifter: ['dammsuga', 'damma', 'moppa'] },
  { id: 'sovrum', x: 160, y: 130, b: 110, d: 140, uppgifter: ['sangklader', 'dammsuga.sovrum', 'vadra'] },
];
const INTERVALL = ['', 'dag', 'vecka', 'tva.veckor', 'manad'];
const NYCKEL = 'stadschema';

const VIEWBOX_BRED = '-440 -190 880 490';
const VIEWBOX_SMAL = '-280 -190 560 490';

export default function Stadschema() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [schema, setSchema] = useState({ hur: {}, klart: {} });
  const [handritad, setHandritad] = useState(2);
  const [status, setStatus] = useState(tx('status.start'));
  const [valtRum, setValtRum] = useState('kok');

  useEffect(() => {
    const s = las(NYCKEL, null);
    if (s?.hur && s?.klart) setSchema(s);
  }, []);
  const andra = (ny) => {
    setSchema(ny);
    spara(NYCKEL, ny);
  };

  const andel = (r) => {
    const valda = r.uppgifter.filter((u) => schema.hur[u]);
    if (!valda.length) return 0;
    return valda.filter((u) => schema.klart[u]).length / valda.length;
  };

  const bocka = (u, rum) => {
    const ny = { ...schema, klart: { ...schema.klart, [u]: !schema.klart[u] } };
    andra(ny);
    const r = RUM.find((x) => x.id === rum);
    const valda = r.uppgifter.filter((x) => ny.hur[x]);
    const klara = valda.filter((x) => ny.klart[x]).length;
    setStatus(valda.length && klara === valda.length ? tx('status.rum.klart', { rum: tx(`rum.${rum}`) }) : tx('status.bockad'));
  };

  const borjaOm = () => {
    andra({ hur: {}, klart: {} });
    setStatus(tx('status.start'));
  };
  const nyPeriod = () => {
    andra({ ...schema, klart: {} });
    setStatus(tx('status.ny.period'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const r = RUM.find((x) => x.id === valtRum);

  const etiketter = RUM.map((rr) => ({
    id: rr.id,
    at: iso(rr.x + rr.b / 2, rr.y + rr.d / 2, 2),
    sida: rr.x < 100 ? 'v' : 'h',
    y: rr.y < 100 ? -120 : 40,
    nr: [rr.x < 100 ? -22 : 22, 0],
    text: `${tx(`rum.${rr.id}`)} ${Math.round(andel(rr) * 100)} %`,
  }));

  return (
    <FigurRam
      klass="figur-stadschema"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={RUM.map((rr) => ({
        text: tx(`rum.${rr.id}`),
        gjort: andel(rr) === 1,
        tryckt: valtRum === rr.id,
        gor: () => {
          setValtRum(rr.id);
          setStatus(tx('status.valt', { rum: tx(`rum.${rr.id}`) }));
        },
      }))}
      val={[{ text: tx('ny.period'), pa: false, gor: nyPeriod }]}
      extra={
        <section className="schema" aria-labelledby="schema-rubrik">
          <h3 id="schema-rubrik">{tx(`rum.${r.id}`)}</h3>
          <ul>
            {r.uppgifter.map((u) => (
              <li key={u}>
                <label className="val">
                  <input type="checkbox" checked={!!schema.klart[u]} disabled={!schema.hur[u]} onChange={() => bocka(u, r.id)} />
                  <span>{tx(`uppgift.${u}`)}</span>
                </label>
                <select
                  aria-label={tx('hur.ofta', { uppgift: tx(`uppgift.${u}`) })}
                  value={schema.hur[u] ?? ''}
                  onChange={(e) => andra({ ...schema, hur: { ...schema.hur, [u]: e.target.value } })}
                >
                  {INTERVALL.map((i) => (
                    <option key={i} value={i}>
                      {tx(`intervall.${i || 'valj'}`)}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          <p className="schema-not">{tx('not')}</p>
        </section>
      }
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="img" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          {/* Lägenheten uppifrån: golv per rum, väggar runt om. Golvet blir rent när uppgifterna är klara. */}
          {RUM.map((rr) => {
            const a = andel(rr);
            return (
              <g
                key={rr.id}
                className={`rum ${valtRum === rr.id ? 'valt' : ''}`}
                onClick={() => setValtRum(rr.id)}
                role="button"
                tabIndex={0}
                aria-label={tx(`rum.${rr.id}`)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setValtRum(rr.id)}
              >
                <g filter={f}>
                  <polygon className="golvyta" points={poly([rr.x, rr.y, 0], [rr.x + rr.b, rr.y, 0], [rr.x + rr.b, rr.y + rr.d, 0], [rr.x, rr.y + rr.d, 0])} />
                </g>
                <polygon className="damm ingen-kontur" style={{ opacity: 0.55 * (1 - a) }} points={poly([rr.x + 4, rr.y + 4, 1], [rr.x + rr.b - 4, rr.y + 4, 1], [rr.x + rr.b - 4, rr.y + rr.d - 4, 1], [rr.x + 4, rr.y + rr.d - 4, 1])} />
                {a === 1 &&
                  [0, 1, 2].map((i) => {
                    const [sx, sy] = iso(rr.x + 30 + i * 40, rr.y + 30 + (i % 2) * 40, 20);
                    return <path key={i} className="glans" d={`M${sx} ${sy - 8} L${sx} ${sy + 8} M${sx - 8} ${sy} L${sx + 8} ${sy}`} />;
                  })}
              </g>
            );
          })}
          {/* Möbler, enkla former */}
          <g filter={f}>
            <Lada x={10} y={10} z={0} b={130} d={30} h={50} farg="#d9cdb8" />
            <Cylinder x={110} y={25} r={8} z0={50} z1={56} farg="#3d3833" />
            <Lada x={220} y={10} z={0} b={40} d={36} h={40} farg="#f2f4f5" />
            <Lada x={170} y={70} z={0} b={44} d={44} h={6} farg="#cfe0ea" />
            <Lada x={20} y={190} z={0} b={110} d={40} h={36} farg="#8fa58a" />
            <Lada x={170} y={150} z={0} b={90} d={110} h={30} farg="#efe9dc" />
            <Platta x={215} y={180} z={30} r={22} farg="#f6f3ee" />
          </g>
          {/* Väggar */}
          <polyline className="vagg" points={poly([0, 0, 0], [270, 0, 0], [270, 270, 0], [0, 270, 0], [0, 0, 0])} />
          <polyline className="vagg tunn" points={poly([155, 0, 0], [155, 270, 0])} />
          <polyline className="vagg tunn" points={poly([0, 125, 0], [270, 125, 0])} />
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-240} hogerX={250} />
      </svg>
    </FigurRam>
  );
}
