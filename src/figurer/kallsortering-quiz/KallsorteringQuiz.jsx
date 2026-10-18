import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, Cylinder, knapp } from '../delat/former.jsx';
import '../tvattsymboler-quiz/tvattsymboler-quiz.css';
import './kallsortering-quiz.css';

const tx = (n, v) => t(`kallsortering-quiz.${n}`, v);

// Utkast: vilket kärl som är rätt är inte kontrollerat och varierar mellan kommuner.
// TODO-KONTROLL: sortering enligt producentansvarsorganisationerna och kommunernas information.
const KONTROLLERAD = false;
const KARL = [
  { id: 'papper', farg: '#5e7fa0' },
  { id: 'plast', farg: '#d9a441' },
  { id: 'metall', farg: '#9ea7ae' },
  { id: 'glas', farg: '#8fa58a' },
  { id: 'mat', farg: '#a87b4f' },
  { id: 'farligt', farg: '#c8664a' },
];
const SAKER = [
  { id: 'mjolkpaket', svar: 'papper' },
  { id: 'yoghurtburk', svar: 'plast' },
  { id: 'konservburk', svar: 'metall' },
  { id: 'syltburk', svar: 'glas' },
  { id: 'bananskal', svar: 'mat' },
  { id: 'batteri', svar: 'farligt' },
];

function Sak({ id }) {
  switch (id) {
    case 'mjolkpaket':
      return <Lada x={-12} y={-12} z={0} b={24} d={24} h={46} farg={{ topp: '#f4f1ea', fram: '#e9eef2', sida: '#c9d2da' }} />;
    case 'yoghurtburk':
      return <Cylinder r={14} z0={0} z1={28} farg={{ topp: '#f6f3ee', fram: '#efe7d6' }} />;
    case 'konservburk':
      return <Cylinder r={14} z0={0} z1={30} farg="#b9c1c7" />;
    case 'syltburk':
      return <Cylinder r={13} z0={0} z1={32} farg={{ topp: '#c8664a', fram: '#cfe0ea' }} />;
    case 'bananskal':
      return <path d="M-20 0 q20 -24 40 -6 q-18 -6 -40 6 Z" fill="#e2c46a" />;
    default:
      return <Cylinder r={6} z0={0} z1={24} farg="#3d3833" />;
  }
}

export default function KallsorteringQuiz() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [nr, setNr] = useState(0);
  const [val, setVal] = useState(null);
  const [poang, setPoang] = useState(0);
  const [handritad, setHandritad] = useState(2);
  const klar = nr >= SAKER.length;
  const sak = SAKER[nr];

  const kasta = (k) => {
    if (val || klar) return;
    setVal(k);
    if (k === sak.svar) setPoang((p) => p + 1);
  };
  const nasta = () => {
    setVal(null);
    setNr((n) => n + 1);
  };
  const borjaOm = () => {
    setNr(0);
    setVal(null);
    setPoang(0);
  };

  const status = klar
    ? tx('status.klar', { poang, antal: SAKER.length })
    : !val
      ? tx('status.fraga', { sak: tx(`sak.${sak.id}`) })
      : val === sak.svar
        ? tx('status.ratt', { karl: tx(`karl.${sak.svar}`) })
        : tx('status.fel', { karl: tx(`karl.${sak.svar}`) });

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  // Kärlen i två rader om tre, så att figuren blir kompakt.
  const karlPos = (i) => [(i % 3) * 80, Math.floor(i / 3) * 80];
  const mal = val ? KARL.findIndex((k) => k.id === val) : -1;
  const HEM = [110, 230];
  const [sx, sy] = mal >= 0 ? iso(karlPos(mal)[0] + 25, karlPos(mal)[1] + 25, 70) : iso(HEM[0], HEM[1], 0);

  return (
    <FigurRam
      klass="figur-kallsortering"
      smal={smal}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[]}
      extra={
        <div className="quiz">
          {!KONTROLLERAD && <p className="quiz-utkast">{tx('utkast')}</p>}
          <p className="quiz-kommun">{tx('kommun')}</p>
          {!klar && (
            <div className="quiz-svar" role="group" aria-label={tx('fraga')}>
              {KARL.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className={`chip ${val && k.id === sak.svar ? 'ratt' : ''} ${val === k.id && k.id !== sak.svar ? 'fel' : ''}`}
                  onClick={() => kasta(k.id)}
                >
                  {tx(`karl.${k.id}`)}
                </button>
              ))}
            </div>
          )}
          {val && !klar && (
            <button type="button" className="primar" onClick={nasta}>
              {nr + 1 < SAKER.length ? tx('nasta') : tx('se.resultat')}
            </button>
          )}
        </div>
      }
    >
      <svg viewBox={smal ? '-280 -140 560 420' : '-380 -140 760 400'} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-30, -30, 0], [260, -30, 0], [260, 290, 0], [-30, 290, 0])} />
          </g>
          {/* Kärlen i en rad, klickbara */}
          {[...KARL.keys()].sort((a, b) => karlPos(a)[0] + karlPos(a)[1] - (karlPos(b)[0] + karlPos(b)[1])).map((i) => {
            const k = KARL[i];
            const [x, y] = karlPos(i);
            return (
              <g key={k.id} filter={f} {...knapp(() => kasta(k.id), tx(`karl.${k.id}`))}>
                <Lada x={x} y={y} z={0} b={50} d={50} h={70} farg={k.farg} />
                <Lada x={x - 2} y={y - 2} z={70} b={54} d={54} h={6} farg="#3d3833" />
                <text className="namn karl-namn" x={iso(x + 25, y + 25, 76)[0]} y={iso(x + 25, y + 25, 76)[1] + 4} textAnchor="middle">
                  {tx(`kort.${k.id}`)}
                </text>
              </g>
            );
          })}
          {/* Saken som ska sorteras */}
          {!klar && (
            <g className="sak flyttbar" style={{ transform: `translate(${sx}px, ${sy}px)`, opacity: val ? 0 : 1 }}>
              <Sak id={sak.id} />
            </g>
          )}
          {!klar && !val && (
            <text className="namn" x={iso(HEM[0], HEM[1], 0)[0]} y={iso(HEM[0], HEM[1], 0)[1] + 28} textAnchor="middle">
              {tx(`sak.${sak.id}`)}
            </text>
          )}
          {klar && (
            <text className="resultat" x={iso(HEM[0], HEM[1], 0)[0]} y={iso(HEM[0], HEM[1], 0)[1]} textAnchor="middle">
              {poang}/{SAKER.length}
            </text>
          )}
        </g>
      </svg>
    </FigurRam>
  );
}
