import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { C, S, iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter, { EtikettLista } from '../delat/Etiketter.jsx';
import '../delat/figur.css';
import './brandvarnare.css';

// Brandvarnaren ligger på rygg, nedtagen från taket, så att undersidan med testknappen syns ovanifrån.
const BAS = { r: 118, z0: 0, z1: 14 };
const HOLJE = { r: 112, z0: 14, z1: 62 };
const KUPOL = { r: 80, z0: 62, z1: 70 };
const KNAPP = { r: 24, z0: 70 };
const LED = { x: 56, y: -14, z: 70, r: 6 };
const ROK = { x: -25, y: -25, r: 36, z0: 14, z1: 46 };
const LJUD = { x: -30, y: 60, r: 22, z0: 14, z1: 22 };
const BATTERI = { x0: 40, x1: 92, y0: -48, y1: -4, z0: 14, z1: 38 };
const LYFT = 175; // så högt locket lyfts när brandvarnaren öppnas
const UT = 120; // så långt batteriet dras ut, i figurens enheter

const LARM_MS = 3500;
const VARNING_MS = 4200;

// En liggande cirkel blir en ellips i isometrin.
const rx = (r) => r * C * Math.SQRT2;
const ry = (r) => r * S * Math.SQRT2;

function Cylinder({ x = 0, y = 0, r, z0, z1, klass }) {
  const [cx, yb] = iso(x, y, z0);
  const [, yt] = iso(x, y, z1);
  const a = rx(r);
  const b = ry(r);
  return (
    <g className={klass}>
      <path className="sida" d={`M${cx - a} ${yb} A${a} ${b} 0 0 0 ${cx + a} ${yb} L${cx + a} ${yt} L${cx - a} ${yt} Z`} />
      <ellipse className="topp" cx={cx} cy={yt} rx={a} ry={b} />
    </g>
  );
}

function Batteri({ klass }) {
  const { x0, x1, y0, y1, z0, z1 } = BATTERI;
  const pol = (x, y) => {
    const [px, py] = iso(x, y, z1);
    return <ellipse cx={px} cy={py} rx={rx(5)} ry={ry(5)} className="pol" />;
  };
  return (
    <g className={`batteri ${klass}`}>
      <polygon className="sida" points={poly([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1])} />
      <polygon className="sida-2" points={poly([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1])} />
      <polygon className="topp" points={poly([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1])} />
      {pol(52, -36)}
      {pol(52, -18)}
      <polyline className="markering" points={poly([62, -40, z1], [86, -40, z1])} />
    </g>
  );
}

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

const VIEWBOX_BRED = '-335 -360 670 475';
const VIEWBOX_SMAL = '-185 -360 380 475';

export default function Brandvarnare() {
  const [oppen, setOppen] = useState(false);
  const [bytt, setBytt] = useState(false);
  const [ljud, setLjud] = useState(false); // avstängt som standard enligt CLAUDE.md
  const [lage, setLage] = useState('vilar'); // vilar | larm | varning
  const [tryckt, setTryckt] = useState(false);
  const [visaPip, setVisaPip] = useState(false);
  const [genomskinlig, setGenomskinlig] = useState(false);
  const [handritad, setHandritad] = useState(3);
  const [fokus, setFokus] = useState(false);
  const [status, setStatus] = useState(t('brandvarnare.status.start'));

  const smal = useMediaQuery('(max-width: 640px)', true);
  const reduceraRorelse = useMediaQuery('(prefers-reduced-motion: reduce)');
  const spela = useLjud(ljud);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const larma = (typ) => {
    window.clearTimeout(timer.current);
    setLage(typ);
    if (typ === 'larm') {
      setStatus(t(reduceraRorelse ? 'brandvarnare.status.larm.stilla' : 'brandvarnare.status.larm'));
      spela(LJUD_LARM);
    } else {
      setStatus(t('brandvarnare.status.varning'));
      spela(LJUD_VARNING);
    }
    timer.current = window.setTimeout(
      () => {
        setLage('vilar');
        setStatus(t('brandvarnare.status.tyst'));
      },
      typ === 'larm' ? LARM_MS : VARNING_MS,
    );
  };

  const testa = () => {
    setTryckt(true);
    window.setTimeout(() => setTryckt(false), 250);
    larma('larm');
  };

  const vaxlaLock = () => {
    const ny = !oppen;
    setOppen(ny);
    setStatus(t(ny ? 'brandvarnare.status.oppen' : 'brandvarnare.status.stangd'));
  };

  const bytBatteri = () => {
    if (!oppen) return setStatus(t('brandvarnare.status.saknas.oppen'));
    if (bytt) return setStatus(t('brandvarnare.status.redan.bytt'));
    setBytt(true);
    setStatus(t('brandvarnare.status.bytt'));
  };

  const borjaOm = () => {
    window.clearTimeout(timer.current);
    setOppen(false);
    setBytt(false);
    setLage('vilar');
    setVisaPip(false);
    setStatus(t('brandvarnare.status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const syns = oppen || genomskinlig;
  const lyft = oppen ? -LYFT : 0;
  const knappZ = tryckt ? 72 : 78;
  const [ux, uy] = [UT * C, UT * S];

  // Etiketter. Lockets delar följer med när locket lyfts.
  const upp = ([x, y]) => [x, y + lyft];
  const vent = iso(112 * Math.cos(1.66), 112 * Math.sin(1.66), 38);
  const etiketter = [
    { id: 'testknapp', at: upp(iso(0, 0, 78)), sida: 'v', y: oppen ? -315 : -150, nr: [-30, -18] },
    { id: 'lysdiod', at: upp(iso(LED.x, LED.y, LED.z)), sida: 'h', y: oppen ? -285 : -110, nr: [26, -18] },
    { id: 'ventiler', at: upp(vent), sida: 'v', y: oppen ? -200 : 30, nr: [-22, 10] },
    ...(syns
      ? [
          { id: 'rokkammare', at: iso(ROK.x, ROK.y, ROK.z1), sida: 'v', y: -95, nr: [-24, -6] },
          { id: 'ljudsandare', at: iso(LJUD.x, LJUD.y, LJUD.z1), sida: 'v', y: -20, nr: [-20, 16] },
          { id: 'batteri', at: iso(66, -26, BATTERI.z1), sida: 'h', y: -40, nr: [24, -10] },
        ]
      : []),
    { id: 'bottenplatta', at: iso(116, 20, 7), sida: 'h', y: 70, nr: [20, 18] },
  ].map((e) => ({ ...e, text: t(`brandvarnare.etikett.${e.id}`) }));

  const [kx, ky] = iso(0, 0, KUPOL.z1);

  return (
    <div className="figur figur-brandvarnare">
      <div className="scen">
        <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={t('brandvarnare.aria')}>
          <defs>
            <HandritadFilter styrka={handritad} />
          </defs>

          <g className="bleck">
            <g filter={f}>
              <ellipse className="skugga" cx="10" cy="14" rx={rx(BAS.r + 14)} ry={ry(BAS.r + 14)} />
              <Cylinder {...BAS} klass="del-bas" />
              <ellipse className="kant-inre" cx="0" cy={-BAS.z1} rx={rx(HOLJE.r - 6)} ry={ry(HOLJE.r - 6)} />
              <Cylinder {...ROK} klass="del-rok" />
              <ellipse className="labyrint" cx={iso(ROK.x, ROK.y, ROK.z1)[0]} cy={iso(ROK.x, ROK.y, ROK.z1)[1]} rx={rx(ROK.r * 0.6)} ry={ry(ROK.r * 0.6)} />
              <Cylinder {...LJUD} klass="del-ljud" />
            </g>

            {/* Batterierna flyttas med CSS-övergång, därför utan filter */}
            <g className="flyttbar" style={{ transform: bytt ? `translate(${ux}px, ${uy}px)` : 'translate(0, 0)', opacity: bytt ? 0 : 1 }}>
              <Batteri klass="gammalt" />
            </g>
            <g className="flyttbar" style={{ transform: bytt ? 'translate(0, 0)' : `translate(${ux}px, ${uy}px)`, opacity: bytt ? 1 : 0 }}>
              <Batteri klass="nytt" />
            </g>

            <g className={`lock flyttbar ${genomskinlig && !oppen ? 'genomskinligt' : ''}`} style={{ transform: `translate(0, ${lyft}px)` }}>
              <g filter={f}>
                <Cylinder {...HOLJE} klass="del-holje" />
                {Array.from({ length: 11 }, (_, i) => {
                  const fi = ((-30 + i * 15) * Math.PI) / 180;
                  return (
                    <polyline
                      key={i}
                      className="ventil"
                      points={poly([HOLJE.r * Math.cos(fi), HOLJE.r * Math.sin(fi), 26], [HOLJE.r * Math.cos(fi), HOLJE.r * Math.sin(fi), 50])}
                    />
                  );
                })}
                <Cylinder {...KUPOL} klass="del-kupol" />
              </g>
              <ellipse className={`lysdiod ${lage !== 'vilar' ? 'blinkar' : ''}`} cx={iso(LED.x, LED.y, LED.z)[0]} cy={iso(LED.x, LED.y, LED.z)[1]} rx={rx(LED.r)} ry={ry(LED.r)} />
              <g
                className="testknapp"
                role="button"
                tabIndex={0}
                aria-label={t('brandvarnare.knapp.aria')}
                onClick={testa}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    testa();
                  }
                }}
                onFocus={() => setFokus(true)}
                onBlur={() => setFokus(false)}
              >
                <ellipse className="traffyta" cx={kx} cy={ky - 4} rx={rx(KNAPP.r + 10)} ry={ry(KNAPP.r + 10)} />
                <Cylinder r={KNAPP.r} z0={KNAPP.z0} z1={knappZ} klass="del-knapp" />
                {fokus && <ellipse className="fokusring" cx={kx} cy={-knappZ} rx={rx(KNAPP.r + 12)} ry={ry(KNAPP.r + 12)} />}
              </g>
            </g>

            {lage !== 'vilar' && (
              <g className={`vagor ${lage} ${reduceraRorelse ? 'stilla' : ''}`} aria-hidden="true">
                {(lage === 'larm' ? [0, 1, 2] : [0]).map((i) => (
                  <ellipse key={i} className="vag" cx={kx} cy={ky + lyft} rx={rx(140 + i * (reduceraRorelse ? 40 : 0))} ry={ry(140 + i * (reduceraRorelse ? 40 : 0))} style={{ animationDelay: `${i * 0.35}s` }} />
                ))}
              </g>
            )}
          </g>

          <Etiketter lista={etiketter} smal={smal} />
        </svg>
      </div>

      {smal && <EtikettLista lista={etiketter} rubrik={t('brandvarnare.etiketter.rubrik')} />}

      <p className="status" role="status" aria-live="polite">
        {status}
      </p>

      <ol className="steg">
        <li>
          <button type="button" onClick={testa} className={lage === 'larm' ? 'klar' : ''}>
            {t('brandvarnare.steg.testa')}
          </button>
        </li>
        <li>
          <button type="button" onClick={vaxlaLock} className={oppen ? 'klar' : ''} aria-pressed={oppen}>
            {t(oppen ? 'brandvarnare.steg.stang' : 'brandvarnare.steg.oppna')}
          </button>
        </li>
        <li>
          <button type="button" onClick={bytBatteri} className={bytt ? 'klar' : ''}>
            {t('brandvarnare.steg.batteri')}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              setVisaPip(true);
              setStatus(t('brandvarnare.status.pip'));
            }}
            className={visaPip ? 'klar' : ''}
            aria-expanded={visaPip}
            aria-controls="bv-pip"
          >
            {t('brandvarnare.steg.pip')}
          </button>
        </li>
      </ol>

      {visaPip && (
        <section className="pip" id="bv-pip" aria-labelledby="bv-pip-rubrik">
          <h3 id="bv-pip-rubrik">{t('brandvarnare.pip.rubrik')}</h3>
          {['larm', 'varning'].map((typ) => (
            <div className="pip-rad" key={typ}>
              <button type="button" onClick={() => larma(typ)} className={lage === typ ? 'primar' : ''}>
                {t(`brandvarnare.pip.${typ}`)}
              </button>
              <span className="staplar" aria-label={t(`brandvarnare.pip.${typ}.namn`)} role="img">
                {STAPLAR[typ].map((s, i) => (
                  <span key={i} className={s ? 'ton' : 'paus'} />
                ))}
              </span>
            </div>
          ))}
          <p className="todo">{t('brandvarnare.pip.platshallare')}</p>
        </section>
      )}

      <button type="button" className="borja-om" onClick={borjaOm}>
        {t('brandvarnare.steg.omstart')}
      </button>

      <fieldset className="reglage">
        <legend>{t('brandvarnare.reglage.rubrik')}</legend>
        <label className="vaxel">
          <input type="checkbox" checked={genomskinlig} onChange={(e) => setGenomskinlig(e.target.checked)} />
          {t('brandvarnare.reglage.genomskinlig')}
        </label>
        <label className="vaxel">
          <input type="checkbox" checked={ljud} onChange={(e) => setLjud(e.target.checked)} aria-describedby="bv-ljud-hjalp" />
          {t('brandvarnare.reglage.ljud')}
        </label>
        <p className="hjalp" id="bv-ljud-hjalp">
          {t('brandvarnare.reglage.ljud.hjalp')}
        </p>
        <label className="skjut">
          <span>{t('brandvarnare.reglage.handritad')}</span>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={handritad}
            onChange={(e) => setHandritad(Number(e.target.value))}
            aria-valuetext={handritad === 0 ? t('brandvarnare.reglage.handritad.av') : String(handritad)}
          />
          <output>{handritad === 0 ? t('brandvarnare.reglage.handritad.av') : handritad}</output>
        </label>
      </fieldset>
    </div>
  );
}
