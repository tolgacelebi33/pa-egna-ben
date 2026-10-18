import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly, framsidaMatris } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import '../delat/figur.css';
import './tvattmaskin.css';

// Maskinens mått i figurens egna enheter.
const W = 220;
const D = 200;
const H = 280;

// Framsidan ritas platt i (u, v) med v nedåt och läggs på planet y = D.
const front = (u, v) => iso(u, D, H - v);
const M_FRONT = framsidaMatris(D, H);

const LUCKA = { cx: 110, cy: 165 };
const TRUMMA_R = 68;
const GLAS_R = 58;
const RING_R = 78;
const BALJA_R = 86;
const RATT = { cx: 190, cy: 30 };

const RATTLAGEN = [0, 1, 2, 3, 4, 5];
const vinkelFor = (lage) => -135 + lage * 54;
const TEMPERATURER = [0, 1, 2];

// Ojämn kant där framsidan är bortskuren i genomskärningen.
const SNITT =
  'M14 78 L40 70 L58 82 L84 68 L112 80 L140 66 L166 78 L192 68 L208 84 L202 112 L210 140 L200 170 L210 200 L198 226 L206 252 L178 246 L150 258 L122 246 L94 258 L66 246 L38 256 L12 244 L20 214 L10 186 L22 156 L12 128 L22 100 Z';

// Tidslinje för en tvätt i sekunder (enbart animation, inga verkliga tider).
const FYLL = 2.5;
const TVATT = 10;
const SLUT = 12;
const MAX_NIVA = 62;

const KORGAR = [
  { id: 'ljust', x0: 10, x1: 65 },
  { id: 'morkt', x0: 80, x1: 135 },
  { id: 'kulort', x0: 150, x1: 205 },
];
const KORG_Y0 = 250;
const KORG_Y1 = 305;
const KORG_H = 40;

const FARG = {
  ljust: '#EFE7D6',
  morkt: '#454A57',
  kulort: ['#C8664A', '#D9A441', '#8FA58A'],
};

const KLADER = [
  { korg: 'ljust', farg: FARG.ljust },
  { korg: 'morkt', farg: FARG.morkt },
  { korg: 'kulort', farg: FARG.kulort[0] },
  { korg: 'ljust', farg: FARG.ljust },
  { korg: 'kulort', farg: FARG.kulort[1] },
  { korg: 'morkt', farg: FARG.morkt },
  { korg: 'ljust', farg: FARG.ljust },
  { korg: 'kulort', farg: FARG.kulort[2] },
  { korg: 'morkt', farg: FARG.morkt },
];

const HOG = iso(262, 118, 0);
const hogPlats = (i) => {
  const kol = i % 3;
  const rad = Math.floor(i / 3);
  return [HOG[0] - 30 + kol * 28 + (rad % 2) * 10, HOG[1] - rad * 11 - kol * 3];
};
const korgPlats = (korgId, nr) => {
  const k = KORGAR.find((x) => x.id === korgId);
  const [x, y] = iso((k.x0 + k.x1) / 2, (KORG_Y0 + KORG_Y1) / 2, KORG_H - 14);
  return [x - 10 + nr * 12, y - nr * 5];
};

const ETIKETTER = [
  { id: 'fack', at: front(41, 28), sida: 'v', y: -150 },
  { id: 'display', at: front(110, 26), sida: 'v', y: -115, nr: [-4, -22] },
  { id: 'ror', at: front(64, 78), sida: 'v', y: -80, snitt: true },
  { id: 'trumma', at: front(62, 117), sida: 'v', y: -45, snitt: true },
  { id: 'lucka', at: front(33, 165), sida: 'v', y: 0, snitt: false },
  { id: 'temp', at: front(152, 22), sida: 'h', y: -150, nr: [2, -28] },
  { id: 'start', at: front(152, 44), sida: 'h', y: -120, nr: [-26, 16] },
  { id: 'ratt', at: front(190, 30), sida: 'h', y: -90, nr: [26, 10] },
  { id: 'balja', at: front(196, 165), sida: 'h', y: 20, snitt: true },
  { id: 'vatten', at: front(150, 215), sida: 'h', y: 70, snitt: true },
];

const VIEWBOX_BRED = '-385 -330 740 630';
const VIEWBOX_SMAL = '-275 -300 485 590';

function Plagg({ farg }) {
  return (
    <g className="plagg">
      <path
        d="M-16 0 C-16 -9 -6 -11 0 -8 C7 -12 16 -8 15 0 C16 8 6 10 0 8 C-7 11 -16 8 -16 0 Z"
        fill={farg}
      />
      <path d="M-8 -2 Q0 3 8 -3" fill="none" />
    </g>
  );
}

export default function Tvattmaskin() {
  const [sorterad, setSorterad] = useState(false);
  const [program, setProgram] = useState(0);
  const [temp, setTemp] = useState(null);
  const [lage, setLage] = useState('vilar'); // vilar | igang | klar
  const [genomskarning, setGenomskarning] = useState(true);
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(t('tvattmaskin.status.start'));
  const [rattFokus, setRattFokus] = useState(false);

  // Mobil först: serverrenderingen antar smal skärm, så att mobilen inte får ett layouthopp.
  const smal = useMediaQuery('(max-width: 640px)', true);
  const reduceraRorelse = useMediaQuery('(prefers-reduced-motion: reduce)');

  const svgRef = useRef(null);
  const frontRef = useRef(null);
  const trummaRef = useRef(null);
  const vattenRef = useRef(null);
  const animRef = useRef({ vinkel: 0, niva: 0 });
  const dragRef = useRef(false);

  const igang = lage === 'igang';

  const tillampa = () => {
    const { vinkel, niva } = animRef.current;
    trummaRef.current?.setAttribute('transform', `rotate(${vinkel.toFixed(2)} ${LUCKA.cx} ${LUCKA.cy})`);
    vattenRef.current?.setAttribute('transform', `translate(0 ${(-niva * MAX_NIVA).toFixed(2)})`);
  };

  // Animationen skriver direkt till DOM via refs så att React inte renderar om varje bildruta.
  useEffect(() => {
    if (!igang) return undefined;
    let raf = 0;
    let timer = 0;
    const start = performance.now();
    let forra = start;

    if (reduceraRorelse) {
      animRef.current.niva = 1;
      tillampa();
      timer = window.setTimeout(() => {
        animRef.current.niva = 0;
        tillampa();
        setLage('klar');
        setStatus(t('tvattmaskin.status.klar'));
      }, 4000);
      return () => window.clearTimeout(timer);
    }

    const steg = (nu) => {
      const sek = (nu - start) / 1000;
      const dt = (nu - forra) / 1000;
      forra = nu;
      const a = animRef.current;
      if (sek < FYLL) a.niva = sek / FYLL;
      else if (sek < TVATT) a.niva = 1;
      else a.niva = Math.max(0, 1 - (sek - TVATT) / (SLUT - TVATT));
      const riktning = Math.floor(sek / 2.5) % 2 === 0 ? 1 : -1;
      const fart = sek < TVATT ? 140 : 360;
      a.vinkel = (a.vinkel + riktning * fart * dt) % 360;
      tillampa();
      if (sek >= SLUT) {
        a.niva = 0;
        tillampa();
        setLage('klar');
        setStatus(t('tvattmaskin.status.klar'));
        return;
      }
      raf = requestAnimationFrame(steg);
    };
    raf = requestAnimationFrame(steg);
    return () => cancelAnimationFrame(raf);
  }, [igang, reduceraRorelse]);

  // Återställ animationens läge när trumman ritas om (till exempel vid byte av genomskärning).
  useEffect(() => {
    tillampa();
  }, [genomskarning]);

  const sortera = () => {
    if (igang) return;
    setSorterad(true);
    setStatus(t('tvattmaskin.status.sorterad'));
  };

  const valjProgram = useCallback(
    (nytt) => {
      if (igang) return;
      const p = Math.max(0, Math.min(5, nytt));
      setProgram(p);
      setStatus(t('tvattmaskin.status.program', { program: t(`tvattmaskin.program.${p}`) }));
    },
    [igang],
  );

  const vridRatten = () => valjProgram(program >= 5 ? 1 : program + 1);

  const valjTemp = () => {
    if (igang) return;
    const ny = temp === null ? 0 : (temp + 1) % TEMPERATURER.length;
    setTemp(ny);
    setStatus(t('tvattmaskin.status.temp', { temp: t(`tvattmaskin.temp.${ny}`) }));
  };

  const starta = () => {
    if (igang) {
      animRef.current.niva = 0;
      tillampa();
      setLage('vilar');
      setStatus(t('tvattmaskin.status.stoppad'));
      return;
    }
    if (!sorterad) return setStatus(t('tvattmaskin.status.saknas.sortera'));
    if (program === 0) return setStatus(t('tvattmaskin.status.saknas.program'));
    if (temp === null) return setStatus(t('tvattmaskin.status.saknas.temp'));
    setLage('igang');
    setStatus(t(reduceraRorelse ? 'tvattmaskin.status.igang.stilla' : 'tvattmaskin.status.igang'));
  };

  const borjaOm = () => {
    animRef.current = { vinkel: 0, niva: 0 };
    tillampa();
    setSorterad(false);
    setProgram(0);
    setTemp(null);
    setLage('vilar');
    setStatus(t('tvattmaskin.status.start'));
  };

  // Läser pekarens läge i framsidans plana koordinater, så att ratten kan vridas direkt.
  const pekareTillRatt = (e) => {
    const svg = svgRef.current;
    const g = frontRef.current;
    if (!svg || !g) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const lokal = pt.matrixTransform(g.getScreenCTM().inverse());
    const grader = (Math.atan2(lokal.x - RATT.cx, -(lokal.y - RATT.cy)) * 180) / Math.PI;
    let basta = 0;
    RATTLAGEN.forEach((l) => {
      if (Math.abs(vinkelFor(l) - grader) < Math.abs(vinkelFor(basta) - grader)) basta = l;
    });
    if (basta !== program) valjProgram(basta);
  };

  const rattTangent = (e) => {
    const steg = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (steg) {
      e.preventDefault();
      valjProgram(program + steg);
    } else if (e.key === 'Home') {
      e.preventDefault();
      valjProgram(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      valjProgram(5);
    }
  };

  const synligaEtiketter = ETIKETTER.filter((e) => e.snitt === undefined || e.snitt === genomskarning).map((e) => ({
    ...e,
    text: t(`tvattmaskin.etikett.${e.id}`),
  }));

  const displayRad1 = igang ? t('tvattmaskin.display.tvattar') : lage === 'klar' ? t('tvattmaskin.display.klar') : t(`tvattmaskin.program.${program}`);
  const displayRad2 = temp === null ? '' : t(`tvattmaskin.temp.${temp}`);

  const insida = (klipp) => (
    <g clipPath={klipp}>
      <circle cx={LUCKA.cx} cy={LUCKA.cy} r={TRUMMA_R} className="trumma-bak" />
      <g ref={trummaRef}>
        {[25, 40, 55].map((r, ri) =>
          Array.from({ length: 8 + ri * 4 }, (_, i) => {
            const a = (i / (8 + ri * 4)) * Math.PI * 2 + ri * 0.3;
            return (
              <circle
                key={`${r}-${i}`}
                cx={LUCKA.cx + Math.cos(a) * r}
                cy={LUCKA.cy + Math.sin(a) * r}
                r="2.4"
                className="hal"
              />
            );
          }),
        )}
        {[0, 120, 240].map((a) => (
          <rect
            key={a}
            x={LUCKA.cx - 6}
            y={LUCKA.cy - TRUMMA_R}
            width="12"
            height="15"
            rx="3"
            className="medbringare"
            transform={`rotate(${a} ${LUCKA.cx} ${LUCKA.cy})`}
          />
        ))}
        {sorterad &&
          [
            [-24, 34],
            [20, 38],
            [-2, 22],
          ].map(([dx, dy], i) => (
            <g key={i} transform={`translate(${LUCKA.cx + dx} ${LUCKA.cy + dy}) rotate(${i * 40 - 30})`}>
              <Plagg farg={FARG.ljust} />
            </g>
          ))}
      </g>
      <g clipPath="url(#klipp-balja)">
        <g ref={vattenRef}>
        <path
          className="vatten"
          d={`M30 ${LUCKA.cy + TRUMMA_R} Q50 ${LUCKA.cy + TRUMMA_R - 5} 70 ${LUCKA.cy + TRUMMA_R} T110 ${LUCKA.cy + TRUMMA_R} T150 ${LUCKA.cy + TRUMMA_R} T190 ${LUCKA.cy + TRUMMA_R} L190 ${LUCKA.cy + TRUMMA_R + 70} L30 ${LUCKA.cy + TRUMMA_R + 70} Z`}
        />
        </g>
      </g>
      <circle cx={LUCKA.cx} cy={LUCKA.cy} r={TRUMMA_R} className="kontur-fri" />
    </g>
  );

  const rattVinkel = vinkelFor(program);
  // Filtret läggs bara på stillastående delar, se HandritadFilter.
  const f = handritad > 0 ? 'url(#handritad)' : undefined;

  return (
    <FigurRam
      klass="figur-tvattmaskin"
      smal={smal}
      etiketter={synligaEtiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: t('tvattmaskin.steg.sortera'), gjort: sorterad, gor: sortera, av: igang },
        { text: t('tvattmaskin.steg.ratt'), gjort: program > 0, gor: vridRatten, av: igang },
        { text: t('tvattmaskin.steg.temp'), gjort: temp !== null, gor: valjTemp, av: igang },
        { text: igang ? t('tvattmaskin.steg.stoppa') : t('tvattmaskin.steg.starta'), gjort: lage === 'klar', gor: starta },
      ]}
      val={[{ text: t('tvattmaskin.reglage.genomskarning'), pa: genomskarning, gor: () => setGenomskarning(!genomskarning) }]}
    >
        <svg
          ref={svgRef}
          viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED}
          role="group"
          aria-label={t('tvattmaskin.aria')}
          className={reduceraRorelse ? 'reducerad' : ''}
        >
          <defs>
            <HandritadFilter styrka={handritad} />
            <clipPath id="klipp-glas">
              <circle cx={LUCKA.cx} cy={LUCKA.cy} r={GLAS_R} />
            </clipPath>
            <clipPath id="klipp-balja">
              <circle cx={LUCKA.cx} cy={LUCKA.cy} r={BALJA_R - 2} />
            </clipPath>
            <clipPath id="klipp-snitt">
              <path d={SNITT} />
            </clipPath>
          </defs>

          <g className="bleck">
            <g filter={f}>
            {/* Skugga på golvet */}
            <polygon className="skugga" points={poly([-8, -8, 0], [W + 34, -8, 0], [W + 34, D + 10, 0], [-8, D + 10, 0])} />

            {/* Maskinens kropp */}
            <polygon className="yta-topp" points={poly([0, 0, H], [W, 0, H], [W, D, H], [0, D, H])} />
            <polyline className="detalj" points={poly([0, D - 16, H], [W, D - 16, H])} />
            <polygon className="yta-sida" points={poly([W, 0, 0], [W, D, 0], [W, D, H], [W, 0, H])} />
            <polyline className="detalj" points={poly([W, 30, 40], [W, 30, H - 40])} />
            </g>

            <g ref={frontRef} transform={M_FRONT}>
              {genomskarning && (
                <>
                  <g filter={f}>
                    <path d={SNITT} className="halrum" />
                    <circle cx={LUCKA.cx} cy={LUCKA.cy} r={BALJA_R} className="balja" />
                  </g>
                  {insida('url(#klipp-snitt)')}
                </>
              )}

              <g filter={f}>
              {genomskarning ? (
                <path
                  className="yta-front"
                  fillRule="evenodd"
                  d={`M0 0 H${W} V${H} H0 Z ${SNITT}`}
                />
              ) : (
                <rect className="yta-front" x="0" y="0" width={W} height={H} />
              )}
              {genomskarning && <path d={SNITT} className="snittkant" />}

              <line className="detalj" x1="0" y1="60" x2={W} y2="60" />
              <line className="detalj" x1="0" y1="256" x2={W} y2="256" />

              {/* Tvättmedelsfack */}
              <rect className="fack" x="12" y="12" width="58" height="32" rx="3" />
              <rect className="fack-grepp" x="27" y="33" width="28" height="5" rx="2" />

              {/* Display */}
              <rect className="display" x="80" y="13" width="60" height="26" rx="3" />
              <text className="display-text" x="85" y="24">{displayRad1}</text>
              <text className="display-text" x="85" y="35">{displayRad2}</text>

              {/* Knappar på panelen (även nåbara via knapparna under figuren) */}
              <g className="panelknapp" onClick={valjTemp}>
                <circle className="knapp-temp" cx="152" cy="22" r="7.5" />
                <line className="knapp-symbol" x1="152" y1="17" x2="152" y2="25" />
                <circle className="knapp-symbol-fylld" cx="152" cy="26" r="2" />
              </g>
              <g className="panelknapp" onClick={starta}>
                <circle className={`knapp-start ${igang ? 'aktiv' : ''}`} cx="152" cy="44" r="7.5" />
                <path className="knapp-symbol-fylld" d="M149.5 40.5 L156 44 L149.5 47.5 Z" />
              </g>

              {/* Programratten */}
              {RATTLAGEN.map((l) => {
                const a = ((vinkelFor(l) - 90) * Math.PI) / 180;
                return (
                  <line
                    key={l}
                    className={`markering ${l === program ? 'vald' : ''}`}
                    x1={RATT.cx + Math.cos(a) * 20}
                    y1={RATT.cy + Math.sin(a) * 20}
                    x2={RATT.cx + Math.cos(a) * 24}
                    y2={RATT.cy + Math.sin(a) * 24}
                  />
                );
              })}
              <g
                className="ratt"
                tabIndex={0}
                role="slider"
                aria-label={t('tvattmaskin.ratt.aria')}
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={program}
                aria-valuetext={t(`tvattmaskin.program.${program}`)}
                aria-disabled={igang}
                onKeyDown={rattTangent}
                onFocus={() => setRattFokus(true)}
                onBlur={() => setRattFokus(false)}
                onPointerDown={(e) => {
                  dragRef.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  pekareTillRatt(e);
                }}
                onPointerMove={(e) => dragRef.current && pekareTillRatt(e)}
                onPointerUp={() => {
                  dragRef.current = false;
                }}
              >
                <circle cx={RATT.cx} cy={RATT.cy} r="26" className="traffyta" />
                <g transform={`rotate(${rattVinkel} ${RATT.cx} ${RATT.cy})`}>
                  <circle cx={RATT.cx} cy={RATT.cy} r="17" className="ratt-knopp" />
                  <circle cx={RATT.cx} cy={RATT.cy} r="10" className="ratt-mitt" />
                  <line className="ratt-visare" x1={RATT.cx} y1={RATT.cy - 4} x2={RATT.cx} y2={RATT.cy - 15} />
                </g>
                {rattFokus && <circle cx={RATT.cx} cy={RATT.cy} r="29" className="fokusring" />}
              </g>

              {!genomskarning && (
                <>
                  <circle cx={LUCKA.cx} cy={LUCKA.cy} r={RING_R} className="lucka-ring" />
                  <circle cx={LUCKA.cx} cy={LUCKA.cy} r={GLAS_R + 7} className="lucka-fals" />
                </>
              )}
              </g>

              {genomskarning && (
                <path
                  clipPath="url(#klipp-snitt)"
                  className={`ror ${igang ? 'flodar' : ''}`}
                  d="M44 60 C44 92 80 70 104 82"
                />
              )}

              {!genomskarning && (
                <>
                  {insida('url(#klipp-glas)')}
                  <g filter={f}>
                    <circle cx={LUCKA.cx} cy={LUCKA.cy} r={GLAS_R} className="glas" />
                    <path className="glans" d={`M${LUCKA.cx - 40} ${LUCKA.cy - 18} A44 44 0 0 1 ${LUCKA.cx + 8} ${LUCKA.cy - 44}`} />
                    <rect className="handtag" x="183" y="150" width="11" height="30" rx="4" />
                  </g>
                </>
              )}
            </g>

            <g filter={f}>

            {/* Tvättkorgar */}
            {KORGAR.map((k) => (
              <g key={`${k.id}-in`}>
                <polygon className="korg-botten" points={poly([k.x0, KORG_Y0, 0], [k.x1, KORG_Y0, 0], [k.x1, KORG_Y1, 0], [k.x0, KORG_Y1, 0])} />
                <polygon className="korg-insida" points={poly([k.x0, KORG_Y0, 0], [k.x1, KORG_Y0, 0], [k.x1, KORG_Y0, KORG_H], [k.x0, KORG_Y0, KORG_H])} />
                <polygon className="korg-insida-v" points={poly([k.x0, KORG_Y0, 0], [k.x0, KORG_Y1, 0], [k.x0, KORG_Y1, KORG_H], [k.x0, KORG_Y0, KORG_H])} />
              </g>
            ))}
            {KLADER.map((plagg, i) => {
              const nr = KLADER.slice(0, i).filter((p) => p.korg === plagg.korg).length;
              let [x, y] = hogPlats(i);
              let synlig = 1;
              if (sorterad) {
                if (plagg.korg === 'ljust') {
                  [x, y] = front(LUCKA.cx, LUCKA.cy);
                  synlig = 0;
                } else {
                  [x, y] = korgPlats(plagg.korg, nr);
                }
              }
              return (
                <g
                  key={i}
                  className="flyttbar"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    opacity: synlig,
                    transitionDelay: reduceraRorelse ? '0ms' : `${i * 60}ms`,
                  }}
                >
                  <g transform={`rotate(${(i * 37) % 50 - 25})`}>
                    <Plagg farg={plagg.farg} />
                  </g>
                </g>
              );
            })}
            {KORGAR.map((k) => (
              <g key={`${k.id}-ut`}>
                <polygon className="korg-front" points={poly([k.x0, KORG_Y1, 0], [k.x1, KORG_Y1, 0], [k.x1, KORG_Y1, KORG_H], [k.x0, KORG_Y1, KORG_H])} />
                <polygon className="korg-sida" points={poly([k.x1, KORG_Y0, 0], [k.x1, KORG_Y1, 0], [k.x1, KORG_Y1, KORG_H], [k.x1, KORG_Y0, KORG_H])} />
                <polyline className="detalj" points={poly([k.x0 + 6, KORG_Y1, KORG_H - 12], [k.x1 - 6, KORG_Y1, KORG_H - 12])} />
              </g>
            ))}
            </g>
          </g>

          {/* Korgarnas namn och etiketter ritas utan filter så att de är lätta att läsa */}
          {KORGAR.map((k) => {
            const [x, y] = iso((k.x0 + k.x1) / 2, KORG_Y1, 0);
            return (
              <text key={`${k.id}-namn`} className="korg-namn" x={x} y={y + 22} textAnchor="middle">
                {t(`tvattmaskin.korg.${k.id}`)}
              </text>
            );
          })}

          <Etiketter lista={synligaEtiketter} smal={smal} />
        </svg>
    </FigurRam>
  );
}
