// Gemensam ram för alla figurer: steg som små knappar överst, figuren på papper,
// reglaget för handritat i figurens hörn, och status och val under.
import { t } from '../../i18n/index.js';
import { EtikettLista } from './Etiketter.jsx';
import './figur.css';
import './ram.css';

/**
 * @param {{
 *   klass: string,
 *   steg: { text: string, gjort?: boolean, gor: () => void, av?: boolean, tryckt?: boolean }[],
 *   status: string,
 *   val?: { text: string, pa: boolean, gor: () => void, hjalp?: string }[],
 *   borjaOm?: () => void,
 *   handritad?: number,
 *   setHandritad?: (v: number) => void,
 *   etiketter?: { id: string, text: string }[],
 *   smal?: boolean,
 *   extra?: any,
 *   children: any,
 * }} props
 */
export default function FigurRam({ klass, steg, status, val = [], borjaOm, handritad, setHandritad, etiketter, smal, extra, children }) {
  return (
    <div className={`figur figur3d-ram ${klass}`}>
      {steg.length > 0 && (
        <ol className="figur3d-steg" aria-label={t('figur.steg')}>
          {steg.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className={`chip ${s.gjort ? 'gjort' : ''}`}
                onClick={s.gor}
                aria-disabled={s.av || undefined}
                aria-pressed={s.tryckt}
              >
                <span className="chip-nr" aria-hidden="true">
                  {i + 1}
                </span>
                {s.text}
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="figur3d-yta">
        <div className="scen">{children}</div>
        {setHandritad && (
          <div className="figur3d-verktyg">
            <span />
            <label className="handritad">
              <span>{t('figur3d.handritad')}</span>
              <input type="range" min="0" max="10" value={handritad} onChange={(e) => setHandritad(Number(e.target.value))} />
            </label>
          </div>
        )}
      </div>

      {smal && etiketter?.length > 0 && <EtikettLista lista={etiketter} rubrik={t('figur.etiketter')} />}

      {extra}

      <div className="figur3d-fot">
        <p className="figur3d-status" role="status" aria-live="polite">
          {status}
        </p>
        <div className="figur3d-val">
          {val.map((v, i) => (
            <button key={i} type="button" className={`chip ${v.pa ? 'pa' : ''}`} aria-pressed={v.pa} onClick={v.gor} title={v.hjalp}>
              {v.text}
            </button>
          ))}
          {borjaOm && (
            <button type="button" className="chip streckad" onClick={borjaOm}>
              {t('figur.borja.om')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
