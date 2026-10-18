import { useState } from 'react';
import { t } from '../../i18n/index.js';
import { iso, poly } from '../delat/iso.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import HandritadFilter from '../delat/HandritadFilter.jsx';
import Etiketter from '../delat/Etiketter.jsx';
import FigurRam from '../delat/FigurRam.jsx';
import { Lada, Yta } from '../delat/former.jsx';
import './paslakan.css';

const tx = (n, v) => t(`paslakan.${n}`, v);

// Sängen: x 0–200, y 0–300, z 0–70. Täcket ligger på sängen, påslakanet bredvid på golvet först.
const SB = 200;
const SD = 300;
const SH = 70;
const TB = 170; // täckets bredd
const TD = 230; // täckets längd

const VIEWBOX_BRED = '-430 -240 900 600';
const VIEWBOX_SMAL = '-300 -240 620 600';

export default function Paslakan() {
  const smal = useMediaQuery('(max-width: 640px)', true);
  const [steg, setSteg] = useState(0); // 0 start, 1 vänt, 2 hörn, 3 draget, 4 skakat
  const [handritad, setHandritad] = useState(3);
  const [status, setStatus] = useState(tx('status.0'));

  const ga = (n) => {
    if (n > steg + 1) return setStatus(tx('status.ordning'));
    setSteg(n);
    setStatus(tx(`status.${n}`));
  };
  const borjaOm = () => {
    setSteg(0);
    setStatus(tx('status.0'));
  };

  const f = handritad > 0 ? 'url(#handritad)' : undefined;
  const tz = SH + 4; // täckets underkant
  const tjock = 16;
  // Hur mycket av täcket påslakanet täcker (0–1)
  const tackt = steg >= 3 ? 1 : steg === 2 ? 0.12 : 0;
  const vant = steg >= 1;
  const skakat = steg >= 4;

  const etiketter = [
    { id: 'tacke', at: iso(SB / 2 + 40, 50 + TD - 30, tz + tjock), sida: 'h', y: -170, nr: [24, -10] },
    { id: 'paslakan', at: steg >= 3 ? iso(SB / 2 - 30, 60, tz + tjock + 2) : iso(315, 160, 2), sida: 'h', y: 200, nr: [-24, -8] },
    ...(steg === 2 ? [{ id: 'horn', at: iso(15, 50, tz + tjock), sida: 'v', y: -60, nr: [-24, 4] }] : []),
    { id: 'sang', at: iso(SB, SD - 40, SH / 2), sida: 'h', y: 60, nr: [24, 8] },
  ].map((e) => ({ ...e, text: tx(`etikett.${e.id}`) }));

  const monster = vant ? 'insida' : 'utsida';

  return (
    <FigurRam
      klass="figur-paslakan"
      smal={smal}
      etiketter={etiketter}
      status={status}
      handritad={handritad}
      setHandritad={setHandritad}
      borjaOm={borjaOm}
      steg={[
        { text: tx('steg.vand'), gjort: steg >= 1, gor: () => ga(1) },
        { text: tx('steg.horn'), gjort: steg >= 2, gor: () => ga(2) },
        { text: tx('steg.dra'), gjort: steg >= 3, gor: () => ga(3) },
        { text: tx('steg.skaka'), gjort: steg >= 4, gor: () => ga(4) },
      ]}
    >
      <svg viewBox={smal ? VIEWBOX_SMAL : VIEWBOX_BRED} role="group" aria-label={tx('aria')}>
        <defs>
          <HandritadFilter styrka={handritad} />
          <pattern id="pl-utsida" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#9cc0e2" />
            <circle cx="10" cy="10" r="3" fill="#f6f1e7" />
          </pattern>
          <pattern id="pl-insida" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#cfe0ea" />
          </pattern>
        </defs>
        <g className="bleck">
          <g filter={f}>
            <polygon className="golv" points={poly([-60, -30, 0], [420, -30, 0], [420, 340, 0], [-60, 340, 0])} />
            {/* Sängen med kudde */}
            <Lada x={0} y={0} z={0} b={SB} d={SD} h={SH} farg={{ topp: '#efe9dc', fram: '#c79b6b', sida: '#a9805a' }} />
            <Lada x={0} y={-14} z={0} b={SB} d={14} h={130} farg="#a9805a" />
            <Lada x={30} y={8} z={SH} b={140} d={42} h={18} farg="#f6f3ee" />
          </g>

          {/* Täcket, och påslakanet som dras över det */}
          <g filter={f} className="flyttbar" style={{ transform: skakat ? 'translateY(-2px)' : 'none' }}>
            <Lada x={(SB - TB) / 2} y={50} z={tz} b={TB} d={TD} h={tjock} farg={{ topp: '#fbfaf7', fram: '#ece8e1', sida: '#dcd6cc' }} klass="tacke" />
            {tackt > 0 && (
              <Lada
                x={(SB - TB) / 2 - 2}
                y={48}
                z={tz - 1}
                b={TB + 4}
                d={(TD + 4) * tackt}
                h={tjock + 2}
                farg={{ topp: `url(#pl-${skakat || steg >= 3 ? 'utsida' : 'insida'})`, fram: '#7ea6c8', sida: '#6b93b6' }}
                klass="overdrag"
              />
            )}
            {skakat && [0, 1, 2].map((i) => <polyline key={i} className="skak" points={poly([SB / 2 - 60 + i * 50, 50 + TD + 20, tz + 10], [SB / 2 - 50 + i * 50, 50 + TD + 34, tz + 20])} />)}
          </g>

          {/* Påslakanet på golvet innan det dras på */}
          {steg < 3 && (
            <g filter={f}>
              <Yta yta="topp" x={240} y={60} z={1}>
                <rect className="tyg" x="0" y="0" width="150" height="200" fill={`url(#pl-${monster})`} />
                {steg === 2 && (
                  <>
                    <circle className="hand" cx="14" cy="14" r="12" />
                    <circle className="hand" cx="136" cy="14" r="12" />
                  </>
                )}
                <line className="oppning" x1="0" y1="198" x2="150" y2="198" />
              </Yta>
            </g>
          )}
          {steg === 2 && (
            <g>
              <circle className="hand" cx={iso((SB - TB) / 2 + 6, 56, tz + tjock)[0]} cy={iso((SB - TB) / 2 + 6, 56, tz + tjock)[1]} r="10" />
              <circle className="hand" cx={iso((SB + TB) / 2 - 6, 56, tz + tjock)[0]} cy={iso((SB + TB) / 2 - 6, 56, tz + tjock)[1]} r="10" />
            </g>
          )}
        </g>
        <Etiketter lista={etiketter} smal={smal} vansterX={-300} hogerX={250} />
      </svg>
    </FigurRam>
  );
}
