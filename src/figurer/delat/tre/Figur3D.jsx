// React-ram för en 3D-figur: canvas, papperskorn, vyknappar och reserv om WebGL saknas.
import { useEffect, useRef, useState } from 'react';
import { t } from '../../../i18n/index.js';
import { skapaMotor, harWebGL } from './motor.js';

/**
 * @param {{ bygg: (motor: any) => any, onKlar: (api: any, motor: any) => void, aria: string, hojd?: number,
 *           reduceraRorelse: boolean, children?: any }} props
 */
export default function Figur3D({ bygg, onKlar, aria, hojd = 12, mal, reduceraRorelse }) {
  const ref = useRef(null);
  const motorRef = useRef(null);
  const [stod, setStod] = useState(true);
  const [handritad, setHandritad] = useState(4);

  useEffect(() => {
    if (!harWebGL()) {
      setStod(false);
      return undefined;
    }
    const motor = skapaMotor(ref.current, { hojd, mal, reduceraRorelse });
    motorRef.current = motor;
    motor.sattHandritad(handritad);
    const api = bygg(motor);
    onKlar(api, motor);
    return () => motor.stang();
    // Motorn byggs en gång per figur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stod) {
    return <p className="figur-reserv">{t('figur3d.ingen.webgl')}</p>;
  }

  return (
    <div className="figur3d">
      <div className="figur3d-yta">
      <div className="figur3d-scen" ref={ref} role="img" aria-label={aria} />
      <div className="figur3d-verktyg">
        <button type="button" className="chip streckad" onClick={() => motorRef.current?.aterstallVy()}>
          {t('figur3d.aterstall')}
        </button>
        <label className="handritad">
          <span>{t('figur3d.handritad')}</span>
          <input
            type="range"
            min="0"
            max="10"
            value={handritad}
            onChange={(e) => {
              const v = Number(e.target.value);
              setHandritad(v);
              motorRef.current?.sattHandritad(v);
            }}
          />
        </label>
      </div>
      </div>
      <p className="figur3d-hjalp">{t('figur3d.hjalp')}</p>
    </div>
  );
}
