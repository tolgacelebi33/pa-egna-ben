import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import Figur3D from '../delat/tre/Figur3D.jsx';
import { byggBrandvarnare } from './modell3d.js';
import '../delat/tre/figur3d.css';
import './brandvarnare.css';

const tx = (n, v) => t(`brandvarnare.${n}`, v);
const LARM_MS = 3500;
const VARNING_MS = 4200;

// Platshållarmönster: [start, längd] i sekunder. TODO-KONTROLL i textversionen.
const LJUD_LARM = Array.from({ length: 9 }, (_, i) => [Math.floor(i / 3) * 1.1 + (i % 3) * 0.3, 0.2]);
const LJUD_VARNING = [
  [0, 0.08],
  [2.2, 0.08],
];
const STAPLAR = {
  larm: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
  varning: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
};

// Svag ton, bara när användaren själv har slagit på ljudet.
function useLjud(pa) {
  const ctx = useRef(null);
  return (monster) => {
    if (!pa) return;
    try {
      ctx.current ??= new (window.AudioContext || window.webkitAudioContext)();
      const ac = ctx.current;
      const start = ac.currentTime;
      for (const [borjan, langd] of monster) {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.frequency.value = 1800;
        g.gain.setValueAtTime(0.04, start + borjan);
        g.gain.setValueAtTime(0, start + borjan + langd);
        osc.connect(g).connect(ac.destination);
        osc.start(start + borjan);
        osc.stop(start + borjan + langd + 0.02);
      }
    } catch {
      /* ljud är frivilligt */
    }
  };
}

export default function Brandvarnare3D() {
  const reduceraRorelse = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [oppen, setOppen] = useState(false);
  const [bytt, setBytt] = useState(false);
  const [ljud, setLjud] = useState(false); // avstängt som standard enligt CLAUDE.md
  const [lage, setLage] = useState('vilar'); // vilar | larm | varning
  const [visaPip, setVisaPip] = useState(false);
  const [genomskinlig, setGenomskinlig] = useState(false);
  const [status, setStatus] = useState(tx('status.start3d'));
  const api = useRef(null);
  const timer = useRef(0);
  const spela = useLjud(ljud);
  const spelaRef = useRef(spela);
  spelaRef.current = spela;
  const oppenRef = useRef(oppen);
  oppenRef.current = oppen;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => api.current?.sattGenomskinlig(genomskinlig), [genomskinlig]);

  const larma = (typ) => {
    window.clearTimeout(timer.current);
    setLage(typ);
    const ms = typ === 'larm' ? LARM_MS : VARNING_MS;
    api.current?.larma(typ, ms);
    if (typ === 'larm') {
      setStatus(tx(reduceraRorelse ? 'status.larm.stilla' : 'status.larm'));
      spelaRef.current(LJUD_LARM);
    } else {
      setStatus(tx('status.varning'));
      spelaRef.current(LJUD_VARNING);
    }
    const larmText = new Set([tx('status.larm'), tx('status.larm.stilla'), tx('status.varning')]);
    timer.current = window.setTimeout(() => {
      setLage('vilar');
      // Skriv bara över statusen om den fortfarande handlar om larmet.
      setStatus((s) => (larmText.has(s) ? tx('status.tyst') : s));
    }, ms);
  };

  const testa = () => {
    api.current?.tryckKnapp();
    larma('larm');
  };

  const vaxlaLock = () => {
    const ny = !oppenRef.current;
    setOppen(ny);
    api.current?.sattOppen(ny);
    setStatus(tx(ny ? 'status.oppen' : 'status.stangd'));
  };

  const bytBatteri = () => {
    if (!oppenRef.current) return setStatus(tx('status.saknas.oppen'));
    if (bytt) return setStatus(tx('status.redan.bytt'));
    setBytt(true);
    api.current?.bytBatteri();
    setStatus(tx('status.bytt'));
  };

  const borjaOm = () => {
    window.clearTimeout(timer.current);
    api.current?.aterstall();
    setOppen(false);
    setBytt(false);
    setLage('vilar');
    setVisaPip(false);
    setStatus(tx('status.start3d'));
  };

  const texter = Object.fromEntries(
    ['testknapp', 'lysdiod', 'ventiler', 'rokkammare', 'ljudsandare', 'batteri', 'bottenplatta'].map((k) => [k, tx(`etikett.${k}`)]),
  );

  const steg = [
    { text: tx('steg.testa'), gjort: lage === 'larm', gor: testa },
    { text: tx(oppen ? 'steg.stang' : 'steg.oppna'), gjort: oppen, gor: vaxlaLock, tryckt: oppen },
    { text: tx('steg.batteri'), gjort: bytt, gor: bytBatteri },
    {
      text: tx('steg.pip'),
      gjort: visaPip,
      gor: () => {
        setVisaPip(true);
        setStatus(tx('status.pip'));
      },
    },
  ];

  return (
    <div className="figur3d-ram figur-brandvarnare">
      <ol className="figur3d-steg" aria-label={tx('steg.rubrik')}>
        {steg.map((s, i) => (
          <li key={i}>
            <button type="button" className={`chip ${s.gjort ? 'gjort' : ''}`} onClick={s.gor} aria-pressed={s.tryckt}>
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
        hojd={10}
        bredd={9}
        mal={[0, 0.2, 0]}
        bygg={(motor) => byggBrandvarnare(motor, { texter, reduceraRorelse, handelser: { onKnapp: testa } })}
        onKlar={(a) => {
          api.current = a;
        }}
      />

      {visaPip && (
        <section className="pip" id="bv-pip" aria-labelledby="bv-pip-rubrik">
          <h3 id="bv-pip-rubrik">{tx('pip.rubrik')}</h3>
          {['larm', 'varning'].map((typ) => (
            <div className="pip-rad" key={typ}>
              <button type="button" onClick={() => larma(typ)} className={`chip ${lage === typ ? 'pa' : ''}`}>
                {tx(`pip.${typ}`)}
              </button>
              <span className="staplar" aria-label={tx(`pip.${typ}.namn`)} role="img">
                {STAPLAR[typ].map((s, i) => (
                  <span key={i} className={s ? 'ton' : 'paus'} />
                ))}
              </span>
            </div>
          ))}
          <p className="todo">{tx('pip.platshallare')}</p>
        </section>
      )}

      <div className="figur3d-fot">
        <p className="figur3d-status" role="status" aria-live="polite">
          {status}
        </p>
        <div className="figur3d-val">
          <button type="button" className={`chip ${genomskinlig ? 'pa' : ''}`} aria-pressed={genomskinlig} onClick={() => setGenomskinlig(!genomskinlig)}>
            {tx('reglage.genomskinlig')}
          </button>
          <button type="button" className={`chip ${ljud ? 'pa' : ''}`} aria-pressed={ljud} onClick={() => setLjud(!ljud)} title={tx('reglage.ljud.hjalp')}>
            {tx('reglage.ljud')}
          </button>
          <button type="button" className="chip streckad" onClick={borjaOm}>
            {tx('steg.omstart')}
          </button>
        </div>
      </div>
    </div>
  );
}
