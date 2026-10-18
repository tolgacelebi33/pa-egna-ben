import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { url } from '../../lib/url.js';
import { TRAD } from './trad.js';
import './beslutstrad.css';

const tx = (n, v) => t(`beslutstrad.${n}`, v);

/**
 * Ett beslutsträd som en vägvisare. Fungerar offline eftersom sidan och skriptet förcachas.
 * Nödnumret skickas in från kontaktfilen.
 * @param {{ id?: string, nodnummer: string, titlar: Record<string, string>, valbar?: boolean }} props
 */
export default function Beslutstrad({ id: startId, nodnummer, titlar, valbar = false }) {
  const [id, setId] = useState(startId ?? Object.keys(TRAD)[0]);
  const [vag, setVag] = useState(['start']);
  const trad = TRAD[id];
  const nod = trad[vag[vag.length - 1]];

  const valj = (till) => setVag([...vag, till]);
  const tillbaka = () => setVag(vag.slice(0, -1));
  const borjaOm = () => setVag(['start']);

  return (
    <div className="beslutstrad">
      {valbar && (
        <label className="trad-val">
          <span className="mono">{tx('valj')}</span>
          <select
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setVag(['start']);
            }}
          >
            {Object.keys(TRAD).map((k) => (
              <option key={k} value={k}>
                {titlar[k] ?? k}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Stigen hittills, som små stenar */}
      <ol className="stig" aria-label={tx('stig')}>
        {vag.map((n, i) => (
          <li key={i} className={i === vag.length - 1 ? 'har' : ''} aria-current={i === vag.length - 1 ? 'step' : undefined}>
            {String(i + 1).padStart(2, '0')}
          </li>
        ))}
      </ol>

      <div className={`kort-nod ${nod.slut ? 'slut' : ''} ${nod.fara ? 'fara' : ''}`} aria-live="polite">
        {nod.fraga && (
          <>
            <p className="nod-text">{tx(nod.fraga)}</p>
            <div className="nod-svar">
              {nod.svar.map((s) => (
                <button key={s.text} type="button" className="svar" onClick={() => valj(s.till)}>
                  {tx(s.text)}
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </>
        )}
        {nod.slut && (
          <>
            <p className="nod-text">{tx(nod.slut, { nodnummer })}</p>
            {nod.fara && !nod.amne && (
              <a className="ring" href={`tel:${nodnummer}`}>
                {tx('ring', { nodnummer })}
              </a>
            )}
            {nod.amne && (
              <a className="till-amne" href={url(`amne/${nod.amne}/`)}>
                <span className="mono">{tx('las.mer')}</span>
                <strong>{titlar[nod.amne] ?? nod.amne}</strong>
              </a>
            )}
          </>
        )}
      </div>

      {vag.length > 1 && (
        <div className="nod-nav">
          <button type="button" className="chip streckad" onClick={tillbaka}>
            {tx('tillbaka')}
          </button>
          <button type="button" className="chip streckad" onClick={borjaOm}>
            {tx('borja.om')}
          </button>
        </div>
      )}
    </div>
  );
}
