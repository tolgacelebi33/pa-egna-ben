import { useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, Yta } from '../delat/former.jsx';
import './tavla.css';

const tx = (n, v) => t(`tavla.${n}`, v);

// En bit vägg: x 0–260, y 0–60 (tjocklek), z 0–260. Rummet är på framsidan (y = 60).
// Höger sida (x = 260) är genomskärningen som visar väggens lager.
const B = 260;
const T = 60;
const H = 260;
const HAL = { u: 130, v: 96 }; // hålets läge på framsidan, (u, v) med v nedåt från överkanten
const VAGGAR = ['gips', 'betong', 'tra'];
const FARG = {
  gips: { fram: '#ebe5d8', topp: '#f3eee4', sida: '#d6cfbf' },
  betong: { fram: '#d8d4cc', topp: '#e3dfd8', sida: '#a7a39b' },
  tra: { fram: '#ead9bd', topp: '#f2e4cc', sida: '#c79b6b' },
};

const VIEWBOX_BRED = '-420 -360 860 560';
const VIEWBOX_SMAL = '-260 -360 560 560';

function Lager({ typ }) {
  if (typ === 'gips') {
    return (
      <g>
        <rect className="gips" x="0" y="0" width="12" height={H} />
        <rect className="halrum" x="12" y="0" width="36" height={H} />
        {Array.from({ length: 13 }, (_, i) => (
          <path key={i} className="isolering" d={`M14 ${i * 20 + 4} q8 6 16 0 q8 -6 16 0`} />
        ))}
        <circle className="elledning" cx="30" cy="190" r="6" />
        <rect className="gips" x="48" y="0" width="12" height={H} />
      </g>
    );
  }
  if (typ === 'betong') {
    return (
      <g>
        <rect className="betong" x="0" y="0" width={T} height={H} />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} className="ballast" cx={6 + ((i * 37) % 50)} cy={8 + ((i * 53) % 245)} r={1.5 + (i % 3)} />
        ))}
      </g>
    );
  }
  return (
    <g>
      <rect className="trapanel" x="0" y="0" width="14" height={H} />
      <rect className="regel" x="14" y="0" width={T - 14} height={H} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} className="ading" d={`M${20 + i * 8} 0 q4 ${H / 2} 0 ${H}`} />
      ))}
    </g>
  );
}

export default function Tavla() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [vagg, setVagg] = useState(0);
  const [knackat, setKnackat] = useState(false);
  const [borrat, setBorrat] = useState(false);
  const [hangd, setHangd] = useState(false);
  const [rak, setRak] = useState(false);
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.start'));
  const timer = useRef(0);
  const typ = VAGGAR[vagg];

  const byt = () => {
    const ny = (vagg + 1) % VAGGAR.length;
    setVagg(ny);
    setKnackat(false);
    setBorrat(false);
    setHangd(false);
    setRak(false);
    setStatus(tx(`status.vagg.${VAGGAR[ny]}`));
  };
  const knacka = () => {
    setKnackat(true);
    setStatus(tx(`status.knack.${typ}`));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setKnackat(false), 1600);
  };
  const borra = () => {
    setBorrat(true);
    setStatus(tx(`status.borrat.${typ}`));
  };
  const hang = () => {
    if (!borrat) return setStatus(tx('status.borra.forst'));
    if (!hangd) {
      setHangd(true);
      setRak(false);
      setStatus(tx('status.sned'));
      window.setTimeout(() => {
        setRak(true);
        setStatus(tx('status.rak'));
      }, 1200);
    }
  };
  const borjaOm = () => {
    setVagg(0);
    setKnackat(false);
    setBorrat(false);
    setHangd(false);
    setRak(false);
    setStatus(tx('status.start'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const fram = (u, v) => iso(u, T, H - v);

  const etiketter = [
    { id: `lager.${typ}`, at: iso(B, 54, 230), sida: 'h', y: -270, nr: [22, -12] },
    ...(typ === 'gips'
      ? [
          { id: 'lager.halrum', at: iso(B, 30, 150), sida: 'h', y: -190, nr: [22, -6] },
          { id: 'lager.ledning', at: iso(B, 30, 70), sida: 'h', y: -110, nr: [22, 6] },
        ]
      : typ === 'tra'
        ? [{ id: 'lager.regel', at: iso(B, 25, 150), sida: 'h', y: -190, nr: [22, -6] }]
        : []),
    ...(borrat ? [{ id: typ === 'tra' ? 'skruv' : 'plugg', at: fram(HAL.u, HAL.v), sida: 'v', y: -80, nr: [-22, 6] }] : []),
    ...(hangd ? [{ id: 'tavla', at: fram(HAL.u - 50, HAL.v + 70), sida: 'v', y: 30, nr: [-22, 10] }] : []),
    ...(hangd ? [{ id: 'vattenpass', at: fram(HAL.u, HAL.v + 6), sida: 'v', y: -170, nr: [-22, -8] }] : []),
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  return (
    <FigurRam
      klass="figur-tavla"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx('steg.vagg', { typ: tx(`vagg.${typ}`) }), gor: byt },
        { text: tx('steg.knacka'), gjort: knackat, gor: knacka },
        { text: tx('steg.borra'), gjort: borrat, gor: borra },
        { text: tx('steg.hang'), gjort: hangd && rak, gor: hang },
      ]}
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-60, -20, 0], [320, -20, 0], [320, 260, 0], [-60, 260, 0])} />
            <Lada x={0} y={0} z={0} b={B} d={T} h={H} farg={FARG[typ]} />
          </g>
          {/* Genomskärningen på höger sida */}
          <g filter={f}>
            <Yta yta="sida" x={B} y={T} z={H}>
              <Lager typ={typ} />
              <rect className="kant" x="0" y="0" width={T} height={H} />
            </Yta>
          </g>

          {/* Framsidan: hål, plugg, tavla och vattenpass */}
          <Yta yta="fram" x={0} y={T} z={H}>
            {knackat && (
              <g className={`knack ${typ}`}>
                {[0, 1, 2].map((i) => (
                  <circle key={i} cx={HAL.u + 40} cy={HAL.v + 30} r={14 + i * 12} style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </g>
            )}
            {borrat && (
              <g>
                <circle className="hal" cx={HAL.u} cy={HAL.v} r="6" />
                {typ !== 'tra' && <rect className="plugg" x={HAL.u - 4} y={HAL.v - 4} width="8" height="8" rx="2" />}
                <circle className="skruv" cx={HAL.u} cy={HAL.v} r="3" />
                <circle className={`borrdamm ${typ}`} cx={HAL.u + 4} cy={HAL.v + 30} r="10" />
              </g>
            )}
            {hangd && (
              <g className="tavla" style={{ transform: `rotate(${rak ? 0 : -7}deg)`, transformOrigin: `${HAL.u}px ${HAL.v}px` }}>
                <line className="snore" x1={HAL.u - 50} y1={HAL.v + 30} x2={HAL.u} y2={HAL.v} />
                <line className="snore" x1={HAL.u + 50} y1={HAL.v + 30} x2={HAL.u} y2={HAL.v} />
                <rect className="ram" x={HAL.u - 70} y={HAL.v + 26} width="140" height="100" rx="4" />
                <rect className="bild" x={HAL.u - 58} y={HAL.v + 38} width="116" height="76" />
                <path className="motiv" d={`M${HAL.u - 58} ${HAL.v + 104} l30 -26 l22 16 l28 -30 l36 40 Z`} />
                <circle className="sol" cx={HAL.u + 30} cy={HAL.v + 58} r="9" />
                {/* Vattenpass ovanpå ramen */}
                <rect className="vattenpass" x={HAL.u - 40} y={HAL.v + 14} width="80" height="12" rx="3" />
                <rect className="libell" x={HAL.u - 10} y={HAL.v + 16} width="20" height="8" rx="3" />
                <circle className="bubbla" cx={rak ? HAL.u : HAL.u - 7} cy={HAL.v + 20} r="2.6" />
              </g>
            )}
          </Yta>

          {/* Borrmaskinen */}
          {borrat && !hangd && (
            <g className="borr" filter={f}>
              <Lada x={HAL.u - 8} y={T + 20} z={H - HAL.v - 8} b={16} d={70} h={16} farg="#d9a441" />
              <Lada x={HAL.u - 6} y={T + 60} z={H - HAL.v - 50} b={12} d={16} h={42} farg="#3d3833" />
              <polyline className="borrspets" points={poly([HAL.u, T, H - HAL.v], [HAL.u, T + 20, H - HAL.v])} />
            </g>
          )}
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-250} hogerX={290} />
      </svg>
    </FigurRam>
  );
}
