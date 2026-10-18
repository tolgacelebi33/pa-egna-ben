// Etiketter för figurerna. På bred skärm: text med linje till delen. På smal skärm: numrerade markeringar
// och en förteckning under figuren (EtikettLista), eftersom text i SVG:n annars blir för liten.
// Etiketterna tar aldrig emot klick, så att de inte hamnar i vägen för rattar och knappar.

/**
 * @param {{ lista: { id: string, text: string, at: [number, number], sida: 'v'|'h', y: number, nr?: [number, number] }[],
 *           smal: boolean, vansterX?: number, hogerX?: number }} props
 */
export default function Etiketter({ lista: indata, smal, vansterX = -195, hogerX = 205 }) {
  // Linjerna får aldrig korsa varandra. På varje sida prövas alla sätt att fördela etikettplatserna (y)
  // och den fördelning väljs som ger minst antal korsningar, och därefter kortast linjer.
  const lista = indata.map((e) => ({ ...e }));
  for (const sida of ['v', 'h']) {
    const pa = lista.filter((e) => e.sida === sida);
    if (pa.length < 2) continue;
    const lx = sida === 'v' ? vansterX : hogerX;
    const platser = pa.map((e) => e.y).sort((a, b) => a - b);
    for (let i = 1; i < platser.length; i++) platser[i] = Math.max(platser[i], platser[i - 1] + 26);
    const basta = bastaFordelning(pa, platser, lx);
    pa.forEach((e, i) => {
      e.y = platser[basta[i]];
    });
  }
  return (
    <g className={smal ? 'etiketter-smal' : 'etiketter-bred'}>
      {lista.map((e, i) => {
        const [ax, ay] = e.at;
        if (smal) {
          const [dx, dy] = e.nr ?? [0, 0];
          const forskjuten = dx !== 0 || dy !== 0;
          return (
            <g key={e.id} className="etikett-nr" aria-hidden="true">
              {forskjuten && <path d={`M${ax} ${ay} L${ax + dx} ${ay + dy}`} />}
              {forskjuten && <circle cx={ax} cy={ay} r="3" className="prick" />}
              <circle cx={ax + dx} cy={ay + dy} r="12" />
              <text x={ax + dx} y={ay + dy + 0.5} textAnchor="middle" dominantBaseline="middle">
                {i + 1}
              </text>
            </g>
          );
        }
        const lx = e.sida === 'v' ? vansterX : hogerX;
        const ex = e.sida === 'v' ? lx + 6 : lx - 6;
        return (
          <g key={e.id} className="etikett">
            <path d={`M${ax} ${ay} L${ex} ${e.y}`} />
            <circle cx={ax} cy={ay} r="3.5" />
            <text x={lx} y={e.y} textAnchor={e.sida === 'v' ? 'end' : 'start'} dominantBaseline="middle">
              {e.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function EtikettLista({ lista, rubrik }) {
  return (
    <ol className="etikettlista" aria-label={rubrik}>
      {lista.map((e) => (
        <li key={e.id}>{e.text}</li>
      ))}
    </ol>
  );
}

// Korsar sträckan a1-a2 sträckan b1-b2?
function korsar([ax, ay], [bx, by], [cx, cy], [dx, dy]) {
  const d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (d === 0) return false;
  const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d;
  const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d;
  return t > 0 && t < 1 && u > 0 && u < 1;
}

function bastaFordelning(etiketter, platser, lx) {
  const n = etiketter.length;
  let basta = null;
  let bastaPoang = Infinity;
  const perm = [...Array(n).keys()];
  const prova = (k) => {
    if (k === n) {
      let kors = 0;
      let langd = 0;
      for (let i = 0; i < n; i++) {
        const a = etiketter[i].at;
        langd += Math.hypot(lx - a[0], platser[perm[i]] - a[1]);
        for (let j = i + 1; j < n; j++) {
          if (korsar(a, [lx, platser[perm[i]]], etiketter[j].at, [lx, platser[perm[j]]])) kors++;
        }
      }
      const poang = kors * 100000 + langd;
      if (poang < bastaPoang) {
        bastaPoang = poang;
        basta = [...perm];
      }
      return;
    }
    for (let i = k; i < n; i++) {
      [perm[k], perm[i]] = [perm[i], perm[k]];
      prova(k + 1);
      [perm[k], perm[i]] = [perm[i], perm[k]];
    }
  };
  // Fler än sju etiketter på en sida blir för många kombinationer; då räcker sortering efter höjd.
  if (n > 7) return [...etiketter.keys()].sort((a, b) => etiketter[a].at[1] - etiketter[b].at[1]).reduce((r, e, i) => ((r[e] = i), r), []);
  prova(0);
  return basta;
}
