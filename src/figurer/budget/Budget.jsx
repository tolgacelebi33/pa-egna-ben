import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada } from '../delat/former.jsx';
import { las, spara } from '../../lib/lagring.js';
import './budget.css';

const tx = (n, v) => t(`budget.${n}`, v);

// Användaren fyller i sina egna belopp. Appen föreslår inga belopp (inga påhittade siffror).
const FASTA = ['hyra', 'el', 'forsakring', 'mobil', 'bredband', 'resor'];
const RORLIGA = ['mat', 'hygien', 'klader', 'noje', 'ovrigt'];
const FARG = {
  hyra: '#c8664a', el: '#d9a441', forsakring: '#8fa58a', mobil: '#5e7fa0', bredband: '#9cc0e2', resor: '#b98a5e',
  mat: '#e2c46a', hygien: '#c9b48f', klader: '#a6bba2', noje: '#d98d79', ovrigt: '#bfb6a7',
};
const MAX_H = 260;
const NYCKEL = 'budget';

const VIEWBOX_BRED = '-460 -330 900 520';
const VIEWBOX_SMAL = '-250 -330 560 520';

const kr = (n) => `${Math.round(n).toLocaleString('sv-SE')} kr`;

export default function Budget() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [varden, setVarden] = useState({});
  const [handritad, setHandritad] = useState(2);
  const [status, setStatus] = useState(tx('status.start'));
  const grupper = { inkomst: useRef(null), fasta: useRef(null), rorliga: useRef(null), resultat: useRef(null) };

  // Beloppen sparas bara på enheten och raderas med "Radera mina uppgifter".
  useEffect(() => {
    setVarden(las(NYCKEL, {}) ?? {});
  }, []);
  const satt = (k, v) => {
    const n = Math.max(0, Number(String(v).replace(/\s/g, '').replace(',', '.')) || 0);
    const ny = { ...varden, [k]: n };
    setVarden(ny);
    spara(NYCKEL, ny);
  };

  const inkomst = varden.inkomst ?? 0;
  const kostnader = [...FASTA, ...RORLIGA].map((k) => ({ k, v: varden[k] ?? 0 }));
  const summa = kostnader.reduce((s, c) => s + c.v, 0);
  const kvar = inkomst - summa;
  const skala = MAX_H / Math.max(inkomst, summa, 1);

  useEffect(() => {
    if (!inkomst && !summa) return;
    setStatus(kvar >= 0 ? tx('status.kvar', { belopp: kr(kvar) }) : tx('status.saknas', { belopp: kr(-kvar) }));
  }, [inkomst, summa, kvar]);

  const fokus = (g) => {
    const el = grupper[g].current;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.querySelector('input')?.focus({ preventScroll: true });
  };

  const borjaOm = () => {
    setVarden({});
    spara(NYCKEL, {});
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  let z = 0;
  const staplar = kostnader
    .filter((c) => c.v > 0)
    .map((c) => {
      const h = c.v * skala;
      const s = { ...c, z0: z, h };
      z += h;
      return s;
    });

  const etiketter = [
    ...(inkomst > 0 ? [{ id: 'inkomst', at: iso(30, 60, inkomst * skala), sida: 'v', y: -290, nr: [-22, -10], text: `${tx('in')}: ${kr(inkomst)}` }] : []),
    ...staplar.map((s, i) => ({ id: s.k, at: iso(190, 30, s.z0 + s.h / 2), sida: 'h', y: -270 + i * 28, nr: [22, 0], text: `${tx(`falt.${s.k}`)} ${kr(s.v)}` })),
  ];

  const falt = (k) => (
    <label key={k} className="budget-falt">
      <span>{tx(`falt.${k}`)}</span>
      <span className="budget-input">
        <input inputMode="numeric" value={varden[k] || ''} placeholder="0" onChange={(e) => satt(k, e.target.value)} aria-label={tx(`falt.${k}`)} />
        <span aria-hidden="true">kr</span>
      </span>
    </label>
  );

  return (
    <FigurRam
      klass="figur-budget"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx('steg.inkomst'), gjort: inkomst > 0, gor: () => fokus('inkomst') },
        { text: tx('steg.fasta'), gjort: FASTA.some((k) => varden[k] > 0), gor: () => fokus('fasta') },
        { text: tx('steg.rorliga'), gjort: RORLIGA.some((k) => varden[k] > 0), gor: () => fokus('rorliga') },
        { text: tx('steg.resultat'), gjort: inkomst > 0 && summa > 0, gor: () => fokus('resultat') },
      ]}
      extra={
        <div className="budget-formular">
          <fieldset ref={grupper.inkomst}>
            <legend>{tx('grupp.inkomst')}</legend>
            {falt('inkomst')}
          </fieldset>
          <fieldset ref={grupper.fasta}>
            <legend>{tx('grupp.fasta')}</legend>
            {FASTA.map(falt)}
          </fieldset>
          <fieldset ref={grupper.rorliga}>
            <legend>{tx('grupp.rorliga')}</legend>
            {RORLIGA.map(falt)}
          </fieldset>
          <div className={`budget-resultat ${kvar < 0 ? 'minus' : ''}`} ref={grupper.resultat} tabIndex={-1}>
            <span className="mono">{tx(kvar < 0 ? 'resultat.saknas' : 'resultat.kvar')}</span>
            <strong>{kr(Math.abs(kvar))}</strong>
            <span>{tx('resultat.summa', { inkomst: kr(inkomst), kostnader: kr(summa) })}</span>
          </div>
          <p className="budget-integritet">{tx('integritet')}</p>
        </div>
      }
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="img" aria-label={tx('aria', { inkomst: kr(inkomst), kostnader: kr(summa) })}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-60, -40, 0], [300, -40, 0], [300, 160, 0], [-60, 160, 0])} />
          </g>
          {/* Inkomst till vänster */}
          {inkomst > 0 ? (
            <Lada x={0} y={30} z={0} b={60} d={60} h={inkomst * skala} farg="#5f7a59" klass="stapel" />
          ) : (
            <polygon className="tom" points={poly([0, 30, 0], [60, 30, 0], [60, 90, 0], [0, 90, 0])} />
          )}
          {/* Kostnaderna staplade till höger */}
          {staplar.length === 0 && <polygon className="tom" points={poly([160, 0, 0], [220, 0, 0], [220, 60, 0], [160, 60, 0])} />}
          {staplar.map((s) => (
            <Lada key={s.k} x={160} y={0} z={s.z0} b={60} d={60} h={s.h} farg={FARG[s.k]} klass="stapel" />
          ))}
          {/* Det som blir kvar, eller det som saknas */}
          {inkomst > 0 && summa > 0 && kvar !== 0 && (
            <Lada
              x={kvar > 0 ? 160 : 0}
              y={kvar > 0 ? 0 : 30}
              z={kvar > 0 ? summa * skala : inkomst * skala}
              b={60}
              d={60}
              h={Math.abs(kvar) * skala}
              farg={kvar > 0 ? { topp: '#e2ebdf', fram: '#cfdccb', sida: '#bccbb7' } : { topp: '#f5e0d6', fram: '#ebc5b6', sida: '#dcae9c' }}
              klass="kvar streckad"
            />
          )}
          <text className="namn" x={iso(30, 90, 0)[0]} y={iso(30, 90, 0)[1] + 24} textAnchor="middle">
            {tx('in')}
          </text>
          <text className="namn" x={iso(190, 60, 0)[0]} y={iso(190, 60, 0)[1] + 24} textAnchor="middle">
            {tx('ut')}
          </text>
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-90} hogerX={260} />
      </svg>
    </FigurRam>
  );
}
