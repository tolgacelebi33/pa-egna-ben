import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada } from '../delat/former.jsx';
import './tvattsymboler-quiz.css';

const tx = (n, v) => t(`tvattsymboler-quiz.${n}`, v);

// Utkast: grupperna och deras betydelse är inte kontrollerade mot källa (KONTROLLERAD = false).
// TODO-KONTROLL: symbolernas betydelse enligt den organisation som förvaltar tvättrådssymbolerna.
const KONTROLLERAD = false;
const GRUPPER = ['tvatt', 'blekning', 'torktumling', 'strykning', 'professionell'];
const FRAGOR = ['strykning', 'tvatt', 'torktumling', 'professionell', 'blekning'];

function Symbol({ typ }) {
  switch (typ) {
    case 'tvatt':
      return <path d="M-40 -20 L-30 30 H30 L40 -20 M-40 -20 q10 -10 20 0 t20 0 t20 0 t20 0" />;
    case 'blekning':
      return <path d="M0 -38 L40 32 H-40 Z" />;
    case 'torktumling':
      return (
        <g>
          <rect x="-36" y="-36" width="72" height="72" rx="4" />
          <circle cx="0" cy="0" r="26" />
        </g>
      );
    case 'strykning':
      return <path d="M-42 26 H42 L34 -10 Q30 -26 10 -26 H-8 Q-24 -26 -28 -10 Z M-14 -26 V-36 H16" />;
    default:
      return <circle cx="0" cy="0" r="36" />;
  }
}

export default function TvattsymbolerQuiz() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [nr, setNr] = useState(0);
  const [svar, setSvar] = useState(null);
  const [poang, setPoang] = useState(0);
  const [handritad, setHandritad] = useState(2);
  const [quiz, setQuiz] = useState(false);
  const klar = nr >= FRAGOR.length;
  const ratt = FRAGOR[nr];

  const valj = (g) => {
    if (svar || klar) return;
    setSvar(g);
    if (g === ratt) setPoang((p) => p + 1);
  };
  const nasta = () => {
    setSvar(null);
    setNr((n) => n + 1);
  };
  const borjaOm = () => {
    setNr(0);
    setSvar(null);
    setPoang(0);
  };

  const status = !quiz
    ? tx('status.oversikt')
    : klar
    ? tx('status.klar', { poang, antal: FRAGOR.length })
    : !svar
      ? tx('status.fraga', { nr: nr + 1, antal: FRAGOR.length })
      : svar === ratt
        ? tx('status.ratt', { grupp: tx(`grupp.${ratt}`) })
        : tx('status.fel', { grupp: tx(`grupp.${ratt}`) });

  const f = handritad > 0 ? 'url(#handritad)' : undefined;

  return (
    <FigurRam
      klass="figur-tvattsymboler"
      smal={smal}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[]}
      val={[{ text: tx(quiz ? 'visa.oversikt' : 'testa.dig'), pa: quiz, gor: () => { setQuiz(!quiz); borjaOm(); } }]}
      extra={
        !quiz ? (
          <ul className="oversikt">
            {GRUPPER.map((g) => (
              <li key={g}>
                <svg viewBox="-50 -50 100 100" aria-hidden="true" className="oversikt-symbol">
                  <Symbol typ={g} />
                </svg>
                <strong>{tx(`grupp.${g}`)}</strong>
                <span>{tx(`form.${g}`)}</span>
              </li>
            ))}
            {!KONTROLLERAD && <li className="quiz-utkast">{tx('utkast')}</li>}
          </ul>
        ) : (
        <div className="quiz">
          {!KONTROLLERAD && <p className="quiz-utkast">{tx('utkast')}</p>}
          {!klar && (
            <div className="quiz-svar" role="group" aria-label={tx('fraga')}>
              {GRUPPER.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`chip ${svar && g === ratt ? 'ratt' : ''} ${svar === g && g !== ratt ? 'fel' : ''}`}
                  onClick={() => valj(g)}
                  aria-pressed={svar === g}
                >
                  {tx(`grupp.${g}`)}
                </button>
              ))}
            </div>
          )}
          {svar && !klar && (
            <button type="button" className="primar" onClick={nasta}>
              {nr + 1 < FRAGOR.length ? tx('nasta') : tx('se.resultat')}
            </button>
          )}
        </div>
        )
      }
    >
      <svg viewBox={smal ? '-260 -230 520 420' : '-430 -230 860 420'} role="img" aria-label={klar ? tx('aria.klar') : tx('aria', { nr: nr + 1 })}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          {/* Tröjan på bordet, och tvättlappen förstorad bredvid */}
          <g filter={f}>
            <Lada x={-60} y={-40} z={0} b={260} d={220} h={40} farg={{ topp: '#d6b48a', fram: '#b98a5e', sida: '#9c7149' }} />
            <polygon className="troja" points={poly([0, 20, 41], [140, 20, 41], [170, 60, 41], [140, 80, 41], [140, 160, 41], [0, 160, 41], [0, 80, 41], [-30, 60, 41])} />
            <polygon className="lapp-liten" points={poly([60, 22, 42], [80, 22, 42], [80, 40, 42], [60, 40, 42])} />
          </g>
          <line className="pekare" x1={iso(70, 30, 42)[0]} y1={iso(70, 30, 42)[1]} x2={smal ? 120 : 190} y2={-60} />
          <g transform={`translate(${smal ? 150 : 240} -40)`}>
            <rect className="lapp" x="-80" y="-110" width="160" height="200" rx="10" />
            <text className="lapp-text" x="0" y="-80" textAnchor="middle">
              {tx('lapp')}
            </text>
            {!klar && (
              <g className="symbol" transform="translate(0 10)">
                <Symbol typ={ratt} />
              </g>
            )}
            {klar && (
              <text className="resultat" x="0" y="20" textAnchor="middle">
                {poang}/{FRAGOR.length}
              </text>
            )}
          </g>
        </g>
      </svg>
    </FigurRam>
  );
}
