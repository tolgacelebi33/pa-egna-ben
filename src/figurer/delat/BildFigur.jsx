import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { url } from '../../lib/url.js';
import FigurRam from './FigurRam.jsx';
import './bildfigur.css';

/**
 * Figur av AI-genererade bilder: varje steg visar sin bild, sin statustext och punkter att komma ihåg.
 * Texterna ligger i figurens sv.js som "lage.<namn>.steg", ".status", ".alt" och eventuellt ".punkter" (en lista).
 * @param {{ id: string, lagen: string[] }} props  första läget är startbilden
 */
export default function BildFigur({ id, lagen }) {
  const [aktiv, setAktiv] = useState(0);
  const tx = (n) => t(`${id}.${n}`);
  const lage = lagen[aktiv];
  const punkter = t(`${id}.lage.${lage}.punkter`);

  return (
    <FigurRam
      klass={`figur-bild figur-${id}`}
      status={tx(`lage.${lage}.status`)}
      borjaOm={lagen.length > 1 ? () => setAktiv(0) : undefined}
      extra={Array.isArray(punkter) && (
        <ul className="bildpunkter" aria-label={tx(`lage.${lage}.steg`)}>
          {punkter.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      steg={lagen.length > 1 ? lagen.map((l, i) => ({ text: tx(`lage.${l}.steg`), gjort: i <= aktiv && i > 0, tryckt: i === aktiv, gor: () => setAktiv(i) })) : []}
    >
      <div className="bildstack">
        {lagen.map((l, i) => (
          <img
            key={l}
            src={url(`figurer/bilder/${id}/${l}.webp`)}
            alt={i === aktiv ? tx(`lage.${l}.alt`) : ''}
            aria-hidden={i !== aktiv}
            className={i === aktiv ? 'synlig' : ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>
    </FigurRam>
  );
}
