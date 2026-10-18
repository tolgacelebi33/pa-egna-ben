import { useEffect, useState } from 'react';
import { t } from '../../i18n/index.js';
import FigurRam from '../delat/FigurRam.jsx';
import { las, spara } from '../../lib/lagring.js';
import { url } from '../../lib/url.js';
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
  const [schema, setSchema] = useState({ hur: {}, klart: {} });
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

  const r = RUM.find((x) => x.id === valtRum);


  return (
    <FigurRam
      klass="figur-stadschema"
          status={status}
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
      <img className="lagenhetsbild" src={url('figurer/bilder/stadschema/lagenhet.webp')} alt={tx('lage.lagenhet.alt')} />
    </FigurRam>
  );
}
