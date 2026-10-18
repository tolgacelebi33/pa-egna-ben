import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly, framsidaMatris } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import '../delat/figur.css';
import './elskap.css';

// Elskåpet sitter på en vägg. Framsidan ritas platt (u åt höger, v nedåt) och läggs på planet y = D.
const W = 260;
const D = 60;
const H = 300;
const front = (u, v) => iso(u, D, H - v);
const M_FRONT = framsidaMatris(D, H);

// Moduler på skenan, i framsidans koordinater.
const MOD_V0 = 92;
const MOD_V1 = 176;
const JFB = { u0: 22, u1: 84 };
const SAKRINGAR = [96, 134, 172, 210].map((u0) => ({ u0, u1: u0 + 34 }));
const MITT = (m) => (m.u0 + m.u1) / 2;
const SPAK_UPP = 0;
const SPAK_NED = 26;
const TEST = { u: 53, v: 160 };

// Rummen ritas i skärmkoordinater under skåpet.
const RUM_Y = 300;
const RUM_X = [-30, 65, 160, 255];
const KOK = 0;
const MAX_APPARATER = 2; // i figuren: fler än två apparater i köket ger överlast (platshållare, inte en verklig gräns)
const OVERLAST_MS = 900;

const VIEWBOX_BRED = '-330 -390 800 760';
const VIEWBOX_SMAL = '-95 -390 420 760';

function Spak({ m, pa, utlost, onClick, aria, onFocus, onBlur, fokus }) {
  const cx = MITT(m);
  return (
    <g
      className={`spak ${pa ? 'pa' : 'av'} ${utlost ? 'utlost' : ''}`}
      role="switch"
      tabIndex={0}
      aria-checked={pa}
      aria-label={aria}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <rect className="traffyta" x={m.u0} y={MOD_V0} width={m.u1 - m.u0} height={MOD_V1 - MOD_V0 - 30} />
      <rect className="spak-spar" x={cx - 5} y={MOD_V0 + 18} width="10" height="44" rx="4" />
      <g className="spak-greppet" style={{ transform: `translate(0px, ${pa ? SPAK_UPP : SPAK_NED}px)` }}>
        <rect x={cx - 9} y={MOD_V0 + 16} width="18" height="22" rx="4" />
      </g>
      {fokus && <rect className="fokusring" x={m.u0 - 3} y={MOD_V0 - 3} width={m.u1 - m.u0 + 6} height={MOD_V1 - MOD_V0 + 6} rx="6" />}
    </g>
  );
}

export default function Elskap() {
  const [sakringar, setSakringar] = useState([true, true, true, true]);
  const [utlosta, setUtlosta] = useState([false, false, false, false]);
  const [jfb, setJfb] = useState(true);
  const [jfbUtlost, setJfbUtlost] = useState(false);
  const [apparater, setApparater] = useState(1);
  const [varm, setVarm] = useState(false);
  const [handritad, setHandritad] = useState(3);
  const [fokus, setFokus] = useState(null);
  const [status, setStatus] = useState(t('elskap.status.start'));

  const smal = useMediaQuery('(max-width: 640px)', true);
  const reduceraRorelse = useMediaQuery('(prefers-reduced-motion: reduce)');
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const sattSakring = (i, pa, utlost = false) => {
    setSakringar((s) => s.map((v, j) => (j === i ? pa : v)));
    setUtlosta((s) => s.map((v, j) => (j === i ? utlost : v)));
  };

  // Ledningen blir varm, sedan löser säkringen ut. Med minskad rörelse sker det direkt.
  const overlast = (meddelande) => {
    window.clearTimeout(timer.current);
    const los = () => {
      setVarm(false);
      sattSakring(KOK, false, true);
      setStatus(t(meddelande));
    };
    if (reduceraRorelse) return los();
    setVarm(true);
    timer.current = window.setTimeout(los, OVERLAST_MS);
  };

  const harStrom = (i) => jfb && sakringar[i];

  const kopplaIn = () => {
    // Kopplar in alla tre apparaterna, så att köket blir överbelastat.
    const ny = 3;
    setApparater(ny);
    if (ny > MAX_APPARATER && harStrom(KOK)) overlast('elskap.status.overlast');
    else setStatus(t(ny === 1 ? 'elskap.apparat' : 'elskap.apparater', { antal: ny }));
  };

  const draUr = () => {
    if (apparater <= 1) return setStatus(t('elskap.status.ingen.att.dra'));
    setApparater(apparater - 1);
    setStatus(`${t('elskap.status.dragit')} ${t(apparater - 1 === 1 ? 'elskap.apparat' : 'elskap.apparater', { antal: apparater - 1 })}`);
  };

  const slaPa = (i) => {
    if (sakringar[i]) return setStatus(t('elskap.status.redan.pa'));
    sattSakring(i, true);
    if (!jfb) return setStatus(t('elskap.status.ingen.strom'));
    if (i === KOK && apparater > MAX_APPARATER) return overlast('elskap.status.overlast.igen');
    setStatus(t('elskap.status.pa'));
  };

  const vaxlaSakring = (i) => {
    if (sakringar[i]) {
      sattSakring(i, false);
      setStatus(t('elskap.status.av'));
    } else slaPa(i);
  };

  const testaJfb = () => {
    if (!jfb) return;
    window.clearTimeout(timer.current);
    setVarm(false);
    setJfb(false);
    setJfbUtlost(true);
    setStatus(t('elskap.status.jfb.ut'));
  };

  const vaxlaJfb = () => {
    if (jfb) {
      setJfb(false);
      setJfbUtlost(false);
      setStatus(t('elskap.status.jfb.av'));
      return;
    }
    setJfb(true);
    setJfbUtlost(false);
    if (sakringar[KOK] && apparater > MAX_APPARATER) return overlast('elskap.status.overlast.igen');
    setStatus(t('elskap.status.jfb.pa'));
  };

  const borjaOm = () => {
    window.clearTimeout(timer.current);
    setSakringar([true, true, true, true]);
    setUtlosta([false, false, false, false]);
    setJfb(true);
    setJfbUtlost(false);
    setApparater(1);
    setVarm(false);
    setStatus(t('elskap.status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const [, botten] = front(0, H);

  // Ledningarnas väg: från säkringen ned genom skåpets botten och vidare till rummet.
  const ledning = (i) => {
    const m = SAKRINGAR[i];
    const [x1, y1] = front(MITT(m), MOD_V1);
    const [x2, y2] = front(MITT(m), H);
    const x3 = RUM_X[i];
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${x2.toFixed(1)} ${(botten + 40).toFixed(1)} L${x3} ${RUM_Y - 70} L${x3} ${RUM_Y - 48}`;
  };

  const etiketter = [
    { id: 'jfb', at: front(JFB.u0 + 6, MOD_V0 + 10), sida: 'v', y: -250, nr: [-22, -16] },
    { id: 'testknapp', at: front(TEST.u, TEST.v), sida: 'v', y: -150, nr: [-24, 8] },
    { id: 'sakring', at: front(MITT(SAKRINGAR[2]), MOD_V0 + 8), sida: 'h', y: -220, nr: [18, -22] },
    ...(utlosta[KOK] ? [{ id: 'utlost', at: front(MITT(SAKRINGAR[KOK]), MOD_V0 + 60), sida: 'v', y: -60, nr: [-26, 18] }] : []),
    { id: 'ledning', at: [RUM_X[KOK], RUM_Y - 62], sida: 'v', y: 210, nr: [-24, 0] },
    { id: 'apparater', at: [RUM_X[KOK] + 18, RUM_Y + 22], sida: 'v', y: 330, nr: [-58, 2] },
  ].map((e) => ({ ...e, text: t(`elskap.etikett.${e.id}`) }));

  return (
    <FigurRam
      klass="figur-elskap"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: t('elskap.steg.koppla'), gjort: apparater > MAX_APPARATER, gor: kopplaIn },
        { text: t('elskap.steg.dra'), gor: draUr },
        { text: t('elskap.steg.sla'), gor: () => slaPa(KOK) },
        { text: t(jfb ? 'elskap.steg.jfb.testa' : 'elskap.steg.jfb.sla'), gjort: jfbUtlost, gor: jfb ? testaJfb : vaxlaJfb },
      ]}
    >
        <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={t('elskap.aria')}>
          <defs>
            <HandritadFilter styrka={handritad} />
          </defs>

          <g className="bleck">
            <g filter={f}>
              {/* Väggen bakom skåpet */}
              <polygon className="vagg" points={poly([-50, 0, -30], [W + 70, 0, -30], [W + 70, 0, H + 40], [-50, 0, H + 40])} />
              {/* Skåpets kropp */}
              <polygon className="skap-topp" points={poly([0, 0, H], [W, 0, H], [W, D, H], [0, D, H])} />
              <polygon className="skap-sida" points={poly([W, 0, 0], [W, D, 0], [W, D, H], [W, 0, H])} />
            </g>

            <g transform={M_FRONT}>
              <g filter={f}>
                <rect className="skap-front" x="0" y="0" width={W} height={H} />
                <rect className="skap-inre" x="12" y="12" width={W - 24} height={H - 24} rx="4" />
                <rect className="skena" x="16" y={MOD_V0 + 34} width={W - 32} height="14" />
                {[JFB, ...SAKRINGAR].map((m, i) => (
                  <rect key={i} className={i === 0 ? 'modul modul-jfb' : 'modul'} x={m.u0} y={MOD_V0} width={m.u1 - m.u0} height={MOD_V1 - MOD_V0} rx="3" />
                ))}
                {SAKRINGAR.map((m, i) => (
                  <text key={i} className="modul-nr" x={MITT(m)} y={MOD_V1 - 10} textAnchor="middle">
                    {i + 1}
                  </text>
                ))}
                <line className="detalj" x1="16" y1="220" x2={W - 16} y2="220" />
              </g>

              <Spak
                m={JFB}
                pa={jfb}
                utlost={jfbUtlost}
                onClick={vaxlaJfb}
                aria={t('elskap.jfb.aria')}
                fokus={fokus === 'jfb'}
                onFocus={() => setFokus('jfb')}
                onBlur={() => setFokus(null)}
              />
              <g
                className="testknapp"
                role="button"
                tabIndex={0}
                aria-label={t('elskap.testknapp.aria')}
                onClick={testaJfb}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    testaJfb();
                  }
                }}
                onFocus={() => setFokus('test')}
                onBlur={() => setFokus(null)}
              >
                <rect className="traffyta" x={TEST.u - 16} y={TEST.v - 14} width="32" height="28" />
                <rect className="test" x={TEST.u - 9} y={TEST.v - 8} width="18" height="16" rx="3" />
                <text className="test-t" x={TEST.u} y={TEST.v + 4.5} textAnchor="middle">
                  T
                </text>
                {fokus === 'test' && <rect className="fokusring" x={TEST.u - 14} y={TEST.v - 13} width="28" height="26" rx="5" />}
              </g>
              {SAKRINGAR.map((m, i) => (
                <Spak
                  key={i}
                  m={m}
                  pa={sakringar[i]}
                  utlost={utlosta[i]}
                  onClick={() => vaxlaSakring(i)}
                  aria={t('elskap.sakring.aria', { nr: i + 1, rum: t(`elskap.rum.${i}`) })}
                  fokus={fokus === i}
                  onFocus={() => setFokus(i)}
                  onBlur={() => setFokus(null)}
                />
              ))}
            </g>

            {/* Ledningar till rummen. Strömmen ritas utan filter eftersom den animeras. */}
            {RUM_X.map((_, i) => (
              <path key={i} className={`ledning ${harStrom(i) ? 'strom' : ''} ${i === KOK && varm ? 'varm' : ''}`} d={ledning(i)} />
            ))}

            {RUM_X.map((x, i) => {
              const tand = harStrom(i);
              return (
                <g key={i} className={`rum ${tand ? 'tand' : 'slackt'}`}>
                  <g filter={f}>
                    <polygon className="golv" points={`${x - 46},${RUM_Y} ${x},${RUM_Y - 26} ${x + 46},${RUM_Y} ${x},${RUM_Y + 26}`} />
                  </g>
                  {tand &&
                    [0, 1, 2, 3, 4].map((s) => {
                      const a = (Math.PI / 5) * s + Math.PI * 1.1;
                      return (
                        <line
                          key={s}
                          className="stralar"
                          x1={x + Math.cos(a) * 20}
                          y1={RUM_Y - 40 + Math.sin(a) * 20}
                          x2={x + Math.cos(a) * 28}
                          y2={RUM_Y - 40 + Math.sin(a) * 28}
                        />
                      );
                    })}
                  <circle className="glodlampa" cx={x} cy={RUM_Y - 40} r="13" />
                  <rect className="sockel" x={x - 6} y={RUM_Y - 30} width="12" height="9" rx="2" />
                  <text className="rum-namn" x={x} y={RUM_Y + 48} textAnchor="middle">
                    {t(`elskap.rum.${i}`)}
                  </text>
                </g>
              );
            })}

            {/* Apparater i köket */}
            {[0, 1, 2].map((a) => {
              const x = RUM_X[KOK] - 26 + a * 26;
              const y = RUM_Y + 8 - a * 8;
              const med = a < apparater;
              return (
                <g key={a} className={`apparat ${med ? 'med' : 'ur'}`}>
                  <rect x={x - 9} y={y - 14} width="18" height="18" rx="4" />
                  <line x1={x} y1={y + 4} x2={x} y2={y + 10} className="sladd" />
                </g>
              );
            })}
          </g>

          <Etiketter lista={etiketter} smal={smal} vansterX={-110} hogerX={260} />
        </svg>
    </FigurRam>
  );
}
