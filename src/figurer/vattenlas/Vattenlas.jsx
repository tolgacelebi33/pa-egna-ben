import { useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, OppenLada, Platta, Yta } from '../delat/former.jsx';
import './vattenlas.css';

const tx = (n, v) => t(`vattenlas.${n}`, v);

// Diskbänken och rören. Rören ritas i genomskärning på planet y = SNITT_Y,
// med (u, v): u längs x, v nedåt från bänkskivans underkant (z = 300).
const SNITT_Y = 62;
const TOPP = 300;
const P = (u, v) => iso(u, SNITT_Y, TOPP - v);
const VATTENNIVA = 146; // vattnets yta i U-böjen när vattenlåset är fullt
const TORR = 205; // under U-böjens botten: inget vatten
const LOSS = 70; // hur långt vattenlåset sänks när det skruvas loss

// Rörens mittlinje
const ROR_UPP = 'M110 -6 L110 118';
const ROR_U = 'M110 118 L110 172 Q110 198 136 198 L146 198 Q172 198 172 172 L172 140';
const ROR_UT = 'M172 140 L172 128 Q172 112 188 112 L236 112';

const VIEWBOX_BRED = '-420 -380 860 620';
const VIEWBOX_SMAL = '-250 -380 560 620';

export default function Vattenlas() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const reduceraRorelse = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [torr, setTorr] = useState(false);
  const [lost, setLost] = useState(false);
  const [smutsig, setSmutsig] = useState(true);
  const [flodar, setFlodar] = useState(false);
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.start'));
  const timer = useRef(0);

  const spola = () => {
    if (lost) return setStatus(tx('status.saknas.fast'));
    window.clearTimeout(timer.current);
    setFlodar(true);
    setTorr(false);
    setStatus(tx('status.spolar'));
    timer.current = window.setTimeout(
      () => {
        setFlodar(false);
        setStatus(tx('status.fullt'));
      },
      reduceraRorelse ? 600 : 2200,
    );
  };
  const torka = () => {
    if (lost) return setStatus(tx('status.saknas.fast'));
    setTorr(true);
    setStatus(tx('status.torr'));
  };
  const skruva = () => {
    if (lost) return setStatus(tx('status.redan.loss'));
    setLost(true);
    setTorr(true);
    setStatus(tx('status.loss'));
  };
  const rensa = () => {
    if (!lost) return setStatus(tx('status.saknas.loss'));
    setSmutsig(false);
    setLost(false);
    setStatus(tx('status.rensad'));
  };
  const borjaOm = () => {
    window.clearTimeout(timer.current);
    setTorr(false);
    setLost(false);
    setSmutsig(true);
    setFlodar(false);
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const niva = torr ? TORR : VATTENNIVA;
  const ner = lost ? LOSS : 0;

  const etiketter = [
    { id: 'vask', at: iso(110, 60, TOPP + 20), sida: 'v', y: -300, nr: [-24, -10] },
    { id: 'ror', at: P(110, 60), sida: 'v', y: -150, nr: [-24, 0] },
    { id: 'vattenlas', at: P(172, 165 + ner), sida: 'h', y: -60 + ner, nr: [24, 0] },
    ...(!torr ? [{ id: 'vatten', at: P(141, 190 + ner), sida: 'h', y: 20 + ner, nr: [24, 10] }] : []),
    { id: 'mutter', at: P(110, 118 + ner), sida: 'v', y: -40 + ner, nr: [-24, 4] },
    { id: 'avlopp', at: P(232, 112), sida: 'h', y: -150, nr: [20, -12] },
    ...(torr && !lost ? [{ id: 'lukt', at: P(110, 40), sida: 'v', y: -230, nr: [-22, -10] }] : []),
    ...(smutsig ? [{ id: 'smuts', at: P(132, 196 + ner), sida: 'v', y: 70 + ner, nr: [-24, 12] }] : []),
    ...(lost ? [{ id: 'hink', at: iso(150, 110, 30), sida: 'v', y: 200, nr: [-24, 10] }] : []),
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  const ror = (d, klass) => (
    <>
      <path d={d} className={`ror-yttre ${klass ?? ''}`} />
      <path d={d} className="ror-inre" />
    </>
  );

  return (
    <FigurRam
      klass="figur-vattenlas"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx('steg.spola'), gjort: !torr && !lost, gor: spola },
        { text: tx('steg.torka'), gjort: torr && !lost, gor: torka },
        { text: tx('steg.skruva'), gjort: lost, gor: skruva },
        { text: tx('steg.rensa'), gjort: !smutsig, gor: rensa },
      ]}
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
          <clipPath id="vl-vatten">
            <rect className="vattenyta" x="80" y="0" width="120" height="260" style={{ transform: `translateY(${niva}px)` }} />
          </clipPath>
        </defs>
        <g className="bleck">
          <g filter={f}>
            {/* Golv, vägg och skåpets sidor */}
            <polygon className="golv" points={poly([-40, -20, 0], [300, -20, 0], [300, 200, 0], [-40, 200, 0])} />
            <polygon className="vagg" points={poly([-40, 0, 0], [300, 0, 0], [300, 0, 420], [-40, 0, 420])} />
            <polygon className="skap-sida" points={poly([0, 0, 0], [0, 120, 0], [0, 120, TOPP], [0, 0, TOPP])} />
            {/* Hinken när vattenlåset är löst */}
            {lost && <OppenLada x={95} y={30} z={0} b={90} d={80} h={55} farg="#5e7fa0" inre="#3f5a74" />}
          </g>

          {/* Rören i genomskärning */}
          <Yta yta="fram" x={0} y={SNITT_Y} z={TOPP}>
            <g filter={f}>
              {ror(ROR_UPP)}
              {ror(ROR_UT)}
            </g>
            <g className="flyttbar" style={{ transform: `translate(0px, ${ner}px)` }}>
              <g filter={f}>
                {ror(ROR_U)}
                <rect className="mutter" x="94" y="110" width="32" height="16" rx="3" />
                <rect className="mutter" x="156" y="132" width="32" height="16" rx="3" />
              </g>
              <path d={ROR_U} className="vatten-i-ror" clipPath="url(#vl-vatten)" />
              {smutsig && <path className="smuts" d="M124 196 q6 -8 12 0 q6 8 12 0 q4 -6 10 -1" />}
            </g>
            {flodar && <path d={`${ROR_UPP} ${ROR_U.replace('M110 118', 'L110 118')} ${ROR_UT.replace('M172 140', 'L172 140')}`} className="flode" />}
            {torr && !lost && (
              <g className="lukt">
                {[0, 1, 2].map((i) => (
                  <path key={i} d={`M${200 - i * 6} 112 C ${170 - i * 10} 100, ${130 + i * 8} 90, 112 ${70 - i * 30} S ${100 + i * 12} ${-30 - i * 10}, ${110 + i * 10} ${-70 - i * 12}`} style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
              </g>
            )}
          </Yta>

          {/* Bänkskivan med vasken, ritas sist eftersom den ligger närmast */}
          <g filter={f}>
            <Lada x={0} y={0} z={TOPP} b={220} d={120} h={20} farg={{ topp: '#d8d2c7', fram: '#bfb6a7', sida: '#a8a093' }} />
            <Platta x={110} y={60} z={TOPP + 20} r={46} farg="#9ea7ae" />
            <Platta x={110} y={60} z={TOPP + 20} r={36} farg="#c5ccd1" />
            <Platta x={110} y={60} z={TOPP + 20} r={8} farg="#3d3833" />
            <Lada x={180} y={8} z={TOPP + 20} b={14} d={14} h={50} farg="#c5ccd1" />
            <Lada x={146} y={8} z={TOPP + 62} b={48} d={10} h={8} farg="#c5ccd1" />
          </g>
          {flodar && <polygon className="kranvatten ingen-kontur" points={poly([148, 12, TOPP + 60], [154, 12, TOPP + 60], [154, 12, TOPP + 22], [148, 12, TOPP + 22])} />}
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-240} hogerX={270} />
      </svg>
    </FigurRam>
  );
}
