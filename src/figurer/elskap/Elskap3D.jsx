import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import Figur3D from '../delat/tre/Figur3D.jsx';
import { byggElskap } from './modell3d.js';
import '../delat/tre/figur3d.css';

const tx = (n, v) => t(`elskap.${n}`, v);
const KOK = 0;
const MAX_APPARATER = 2; // i figuren: fler än två apparater i köket ger överlast (platshållare, inte en verklig gräns)
const OVERLAST_MS = 900;

export default function Elskap3D() {
  const reduceraRorelse = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [l, setL] = useState({
    sakringar: [true, true, true, true],
    utlosta: [false, false, false, false],
    jfb: true,
    jfbUtlost: false,
    apparater: 1,
    varm: false,
  });
  const [status, setStatus] = useState(tx('status.start3d'));
  const api = useRef(null);
  const lRef = useRef(l);
  lRef.current = l;
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => api.current?.uppdatera(l), [l]);

  const andra = (f) => setL((g) => ({ ...g, ...f(g) }));
  const sattSakring = (g, i, pa, utlost = false) => ({
    sakringar: g.sakringar.map((v, j) => (j === i ? pa : v)),
    utlosta: g.utlosta.map((v, j) => (j === i ? utlost : v)),
  });

  // Ledningen blir varm, sedan löser säkringen ut. Med minskad rörelse sker det direkt.
  const overlast = (meddelande) => {
    window.clearTimeout(timer.current);
    const los = () => {
      andra((g) => ({ varm: false, ...sattSakring(g, KOK, false, true) }));
      setStatus(tx(meddelande));
    };
    if (reduceraRorelse) return los();
    andra(() => ({ varm: true }));
    timer.current = window.setTimeout(los, OVERLAST_MS);
  };

  const kopplaIn = () => {
    andra(() => ({ apparater: 3 }));
    const g = lRef.current;
    if (g.jfb && g.sakringar[KOK]) overlast('status.overlast');
    else setStatus(tx('apparater', { antal: 3 }));
  };

  const draUr = () => {
    const n = lRef.current.apparater;
    if (n <= 1) return setStatus(tx('status.ingen.att.dra'));
    andra(() => ({ apparater: n - 1 }));
    setStatus(`${tx('status.dragit')} ${tx(n - 1 === 1 ? 'apparat' : 'apparater', { antal: n - 1 })}`);
  };

  const slaPa = (i) => {
    const g = lRef.current;
    if (g.sakringar[i]) return setStatus(tx('status.redan.pa'));
    andra((h) => sattSakring(h, i, true));
    if (!g.jfb) return setStatus(tx('status.ingen.strom'));
    if (i === KOK && g.apparater > MAX_APPARATER) return overlast('status.overlast.igen');
    setStatus(tx('status.pa'));
  };

  const vaxlaSakring = (i) => {
    if (lRef.current.sakringar[i]) {
      andra((g) => sattSakring(g, i, false));
      setStatus(tx('status.av'));
    } else slaPa(i);
  };

  const testaJfb = () => {
    if (!lRef.current.jfb) return;
    window.clearTimeout(timer.current);
    andra(() => ({ varm: false, jfb: false, jfbUtlost: true }));
    setStatus(tx('status.jfb.ut'));
  };

  const vaxlaJfb = () => {
    const g = lRef.current;
    if (g.jfb) {
      andra(() => ({ jfb: false, jfbUtlost: false }));
      return setStatus(tx('status.jfb.av'));
    }
    andra(() => ({ jfb: true, jfbUtlost: false }));
    if (g.sakringar[KOK] && g.apparater > MAX_APPARATER) return overlast('status.overlast.igen');
    setStatus(tx('status.jfb.pa'));
  };

  const borjaOm = () => {
    window.clearTimeout(timer.current);
    setL({ sakringar: [true, true, true, true], utlosta: [false, false, false, false], jfb: true, jfbUtlost: false, apparater: 1, varm: false });
    setStatus(tx('status.start3d'));
  };

  const texter = {
    ...Object.fromEntries(['jfb', 'testknapp', 'sakring', 'utlost', 'ledning', 'apparater'].map((k) => [k, tx(`etikett.${k}`)])),
    ...Object.fromEntries([0, 1, 2, 3].map((i) => [`rum.${i}`, tx(`rum.${i}`)])),
  };

  const steg = [
    { text: tx('steg.koppla'), gjort: l.apparater > MAX_APPARATER, gor: kopplaIn },
    { text: tx('steg.dra'), gjort: false, gor: draUr },
    { text: tx('steg.sla'), gjort: false, gor: () => slaPa(KOK) },
    { text: tx(l.jfb ? 'steg.jfb.testa' : 'steg.jfb.sla'), gjort: l.jfbUtlost, gor: l.jfb ? testaJfb : vaxlaJfb },
  ];
  const tanda = l.jfb ? l.sakringar.filter(Boolean).length : 0;

  return (
    <div className="figur3d-ram figur-elskap">
      <ol className="figur3d-steg" aria-label={tx('steg.rubrik')}>
        {steg.map((s, i) => (
          <li key={i}>
            <button type="button" className={`chip ${s.gjort ? 'gjort' : ''}`} onClick={s.gor}>
              <span className="chip-nr" aria-hidden="true">
                {i + 1}
              </span>
              {s.text}
            </button>
          </li>
        ))}
      </ol>

      <Figur3D
        aria={tx('aria3d')}
        reduceraRorelse={reduceraRorelse}
        hojd={14}
        bredd={16.5}
        mal={[-0.4, -0.4, 1.8]}
        bygg={(motor) =>
          byggElskap(motor, {
            texter,
            reduceraRorelse,
            handelser: { onSakring: vaxlaSakring, onJfb: vaxlaJfb, onTest: testaJfb },
          })
        }
        onKlar={(a) => {
          api.current = a;
          a.uppdatera(lRef.current);
        }}
      />

      {/* Spakarna som riktiga brytare för tangentbord och skärmläsare. Samma läge som i figuren. */}
      <fieldset className="brytare">
        <legend className="mono">{tx('brytare.rubrik')}</legend>
        <button type="button" role="switch" aria-checked={l.jfb} className={`chip ${l.jfb ? 'pa' : ''}`} onClick={vaxlaJfb}>
          {tx('jfb.aria')}
        </button>
        <button type="button" className="chip" onClick={testaJfb}>
          {tx('testknapp.aria')}
        </button>
        {l.sakringar.map((pa, i) => (
          <button key={i} type="button" role="switch" aria-checked={pa} className={`chip ${pa ? 'pa' : ''} ${l.utlosta[i] ? 'utlost' : ''}`} onClick={() => vaxlaSakring(i)}>
            {tx('sakring.aria', { nr: i + 1, rum: tx(`rum.${i}`) })}
          </button>
        ))}
        <p className="visuellt-dold" aria-live="polite">
          {tx('lampor', { antal: tanda })}
        </p>
      </fieldset>

      <div className="figur3d-fot">
        <p className="figur3d-status" role="status" aria-live="polite">
          {status}
        </p>
        <div className="figur3d-val">
          <button type="button" className="chip streckad" onClick={borjaOm}>
            {tx('steg.omstart')}
          </button>
        </div>
      </div>
    </div>
  );
}
