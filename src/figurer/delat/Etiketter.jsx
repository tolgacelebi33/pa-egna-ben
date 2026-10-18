// Etiketter för figurerna. På bred skärm: text med linje till delen. På smal skärm: numrerade markeringar
// och en förteckning under figuren (EtikettLista), eftersom text i SVG:n annars blir för liten.
// Etiketterna tar aldrig emot klick, så att de inte hamnar i vägen för rattar och knappar.

/**
 * @param {{ lista: { id: string, text: string, at: [number, number], sida: 'v'|'h', y: number, nr?: [number, number] }[],
 *           smal: boolean, vansterX?: number, hogerX?: number }} props
 */
export default function Etiketter({ lista, smal, vansterX = -195, hogerX = 205 }) {
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
