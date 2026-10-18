import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { url } from '../../lib/url.js';
import FigurRam from './FigurRam.jsx';
import './bildfigur.css';

/**
 * Figur av AI-genererade bilder: varje steg visar sin bild och sin statustext.
 * Texterna ligger i figurens sv.js som "lage.<namn>.steg", "lage.<namn>.status" och "lage.<namn>.alt".
 * @param {{ id: string, lagen: string[] }} props  första läget är startbilden
 */
export default function BildFigur({ id, lagen }) {
  const [aktiv, setAktiv] = useState(0);
  const tx = (n) => t(`${id}.${n}`);
  const lage = lagen[aktiv];

  return (
    <FigurRam
      klass={`figur-bild figur-${id}`}
      status={tx(`lage.${lage}.status`)}
      borjaOm={lagen.length > 1 ? () => setAktiv(0) : undefined}
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
