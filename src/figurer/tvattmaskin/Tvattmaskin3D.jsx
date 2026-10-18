import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';
import { useMediaQuery } from '../delat/useMediaQuery.js';
import Figur3D from '../delat/tre/Figur3D.jsx';
import { byggTvattmaskin } from './modell3d.js';
import '../delat/tre/figur3d.css';

const TEMPERATURER = 3;
const tx = (n, v) => t(`tvattmaskin.${n}`, v);

export default function Tvattmaskin3D() {
  const reduceraRorelse = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [sorterad, setSorterad] = useState(false);
  const [program, setProgram] = useState(0);
  const [temp, setTemp] = useState(null);
  const [lage, setLage] = useState('vilar'); // vilar | sorterar | igang | klar
  const [genomskarning, setGenomskarning] = useState(false);
  const [status, setStatus] = useState(tx('status.start3d'));
  const api = useRef(null);
  const lageRef = useRef({});
  lageRef.current = { sorterad, program, temp, lage };

  const upptagen = () => lageRef.current.lage === 'igang' || lageRef.current.lage === 'sorterar';

  const valjProgram = (n) => {
    if (upptagen()) return;
    const p = Math.max(0, Math.min(5, n));
    if (p === lageRef.current.program) return;
    setProgram(p);
    api.current?.sattProgram(p);
    setStatus(tx('status.program', { program: tx(`program.${p}`) }));
  };
  const valjTemp = () => {
    if (upptagen()) return;
    const ny = lageRef.current.temp === null ? 0 : (lageRef.current.temp + 1) % TEMPERATURER;
    setTemp(ny);
    setStatus(tx('status.temp', { temp: tx(`temp.${ny}`) }));
  };
  const sortera = () => {
    if (upptagen() || lageRef.current.sorterad) return;
    setLage('sorterar');
    setStatus(tx('status.sorterar'));
    const klar = () => {
      setSorterad(true);
      setLage('vilar');
      setStatus(tx('status.sorterad'));
    };
    // Utan WebGL finns ingen figur, men stegen ska ändå gå att göra.
    if (api.current) api.current.sortera(klar);
    else klar();
  };
  const starta = () => {
    const s = lageRef.current;
    if (s.lage === 'igang') {
      api.current?.stoppa();
      setLage('vilar');
      setStatus(tx('status.stoppad'));
      return;
    }
    if (s.lage === 'sorterar') return;
    if (!s.sorterad) return setStatus(tx('status.saknas.sortera'));
    if (s.program === 0) return setStatus(tx('status.saknas.program'));
    if (s.temp === null) return setStatus(tx('status.saknas.temp'));
    if (api.current?.luckaOppen()) return setStatus(tx('status.saknas.lucka'));
    setLage('igang');
    setStatus(tx(reduceraRorelse ? 'status.igang.stilla' : 'status.igang'));
    const klar = () => {
      setLage('klar');
      setStatus(tx('status.klar'));
    };
    if (api.current) api.current.starta(klar);
    else window.setTimeout(klar, 4000);
  };
  const lucka = (oppna) => {
    if (upptagen()) return setStatus(tx('status.lucka.last'));
    api.current?.sattLucka(oppna);
    setStatus(tx(oppna ? 'status.lucka.oppen' : 'status.lucka.stangd'));
  };
  const borjaOm = () => {
    api.current?.aterstall();
    setSorterad(false);
    setProgram(0);
    setTemp(null);
    setLage('vilar');
    setStatus(tx('status.start3d'));
  };

  // Displayen visar samma läge som knapparna.
  useEffect(() => {
    const rad1 = lage === 'igang' ? tx('display.tvattar') : lage === 'klar' ? tx('display.klar') : tx(`program.${program}`);
    api.current?.ritaDisplay(rad1, temp === null ? '' : tx(`temp.${temp}`));
  }, [program, temp, lage]);

  useEffect(() => {
    api.current?.sattGenomskarning(genomskarning);
  }, [genomskarning]);

  const texter = {
    fack: tx('etikett.fack'),
    display: tx('etikett.display'),
    ratt: tx('etikett.ratt'),
    temp: tx('etikett.temp'),
    start: tx('etikett.start'),
    lucka: tx('etikett.lucka'),
    trumma: tx('etikett.trumma'),
    balja: tx('etikett.balja'),
    vatten: tx('etikett.vatten'),
    ror: tx('etikett.ror'),
    'korg.ljust': tx('korg.ljust'),
    'korg.morkt': tx('korg.morkt'),
    'korg.kulort': tx('korg.kulort'),
  };

  const steg = [
    { text: tx('steg.sortera'), gjort: sorterad, gor: sortera, av: upptagen() },
    { text: tx('steg.ratt'), gjort: program > 0, gor: () => valjProgram(program >= 5 ? 1 : program + 1), av: upptagen() },
    { text: tx('steg.temp'), gjort: temp !== null, gor: valjTemp, av: upptagen() },
    { text: lage === 'igang' ? tx('steg.stoppa') : tx('steg.starta'), gjort: lage === 'klar', gor: starta, av: lage === 'sorterar' },
  ];

  return (
    <div className="figur3d-ram">
      <ol className="figur3d-steg" aria-label={tx('steg.rubrik')}>
        {steg.map((s, i) => (
          <li key={i}>
            <button type="button" className={`chip ${s.gjort ? 'gjort' : ''}`} onClick={s.gor} disabled={s.av}>
              <span className="chip-nr" aria-hidden="true">
                {i + 1}
              </span>
              {s.text}
            </button>
          </li>
        ))}
      </ol>

      <Figur3D
        aria={tx('aria3d')}
        reduceraRorelse={reduceraRorelse}
        hojd={15}
        mal={[1.2, -0.6, 0.6]}
        bygg={(motor) =>
          byggTvattmaskin(motor, {
            texter,
            reduceraRorelse,
            handelser: {
              onRatt: valjProgram,
              onTemp: valjTemp,
              onStart: starta,
              onLucka: lucka,
              onFack: (ute) => setStatus(tx(ute ? 'status.fack.ute' : 'status.fack.inne')),
            },
          })
        }
        onKlar={(a) => {
          api.current = a;
          a.ritaDisplay(tx('program.0'), '');
        }}
      />

      <div className="figur3d-fot">
        <p className="figur3d-status" role="status" aria-live="polite">
          {status}
        </p>
        <div className="figur3d-val">
          <button type="button" className={`chip ${genomskarning ? 'pa' : ''}`} aria-pressed={genomskarning} onClick={() => setGenomskarning(!genomskarning)}>
            {tx('reglage.genomskarning')}
          </button>
          <button type="button" className="chip streckad" onClick={borjaOm}>
            {tx('steg.omstart')}
          </button>
        </div>
      </div>
    </div>
  );
}
