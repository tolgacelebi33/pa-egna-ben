// Isometriska byggstenar för figurerna. Alla mått i figurens egna enheter.
// x åt höger-ned, y åt vänster-ned, z uppåt. Synliga sidor: ovansidan, sidan mot +y ("fram") och sidan mot +x ("sida").
import { C, S, iso, poly } from './iso.js';

/**
 * Låda från (x, y, z) med bredd b längs x, djup d längs y och höjd h.
 * farg: { topp, fram, sida } eller en färg som skuggas automatiskt.
 */
export function Lada({ x = 0, y = 0, z = 0, b, d, h, farg, klass = '', children, ...rest }) {
  const f = typeof farg === 'string' ? skugga(farg) : farg;
  return (
    <g className={klass} {...rest}>
      <polygon fill={f.fram} points={poly([x, y + d, z], [x + b, y + d, z], [x + b, y + d, z + h], [x, y + d, z + h])} />
      <polygon fill={f.sida} points={poly([x + b, y, z], [x + b, y + d, z], [x + b, y + d, z + h], [x + b, y, z + h])} />
      <polygon fill={f.topp} points={poly([x, y, z + h], [x + b, y, z + h], [x + b, y + d, z + h], [x, y + d, z + h])} />
      {children}
    </g>
  );
}

/** Öppen låda (korg, låda, hylla) där insidan syns ovanifrån. */
export function OppenLada({ x = 0, y = 0, z = 0, b, d, h, farg, inre = '#5e4a37', klass = '', children }) {
  const f = typeof farg === 'string' ? skugga(farg) : farg;
  return (
    <g className={klass}>
      <polygon fill={inre} points={poly([x, y, z], [x + b, y, z], [x + b, y + d, z], [x, y + d, z])} />
      <polygon fill={blanda(inre, '#ffffff', 0.15)} points={poly([x, y, z], [x + b, y, z], [x + b, y, z + h], [x, y, z + h])} />
      <polygon fill={blanda(inre, '#000000', 0.1)} points={poly([x, y, z], [x, y + d, z], [x, y + d, z + h], [x, y, z + h])} />
      {children}
      <polygon fill={f.fram} points={poly([x, y + d, z], [x + b, y + d, z], [x + b, y + d, z + h], [x, y + d, z + h])} />
      <polygon fill={f.sida} points={poly([x + b, y, z], [x + b, y + d, z], [x + b, y + d, z + h], [x + b, y, z + h])} />
    </g>
  );
}

// En liggande cirkel blir en ellips i isometrin.
export const rx = (r) => r * C * Math.SQRT2;
export const ry = (r) => r * S * Math.SQRT2;

/** Stående cylinder med centrum (x, y), radie r, från z0 till z1. */
export function Cylinder({ x = 0, y = 0, r, z0, z1, farg, klass = '', ...rest }) {
  const f = typeof farg === 'string' ? skugga(farg) : farg;
  const [cx, yb] = iso(x, y, z0);
  const [, yt] = iso(x, y, z1);
  const a = rx(r);
  const b = ry(r);
  return (
    <g className={klass} {...rest}>
      <path fill={f.fram} d={`M${cx - a} ${yb} A${a} ${b} 0 0 0 ${cx + a} ${yb} L${cx + a} ${yt} L${cx - a} ${yt} Z`} />
      <ellipse fill={f.topp} cx={cx} cy={yt} rx={a} ry={b} />
    </g>
  );
}

/** Platt ellips (hål, platta, lock) på höjden z. */
export function Platta({ x = 0, y = 0, z = 0, r, farg, klass = '', ...rest }) {
  const [cx, cy] = iso(x, y, z);
  return <ellipse className={klass} fill={farg} cx={cx} cy={cy} rx={rx(r)} ry={ry(r)} {...rest} />;
}

/**
 * Rita platt på en sida av en låda. Barnen ritas med (u, v): u åt höger längs sidan, v nedåt.
 * yta: 'fram' (planet y = konst), 'sida' (planet x = konst) eller 'topp' (planet z = konst).
 * Origo (u = 0, v = 0) är det övre vänstra hörnet av ytan som det syns på skärmen.
 */
export function Yta({ yta, x = 0, y = 0, z = 0, children, ...rest }) {
  let m;
  if (yta === 'fram') {
    const [ox, oy] = iso(x, y, z);
    m = `matrix(${C} ${S} 0 1 ${ox} ${oy})`;
  } else if (yta === 'sida') {
    // Origo i det främre övre hörnet (x, y = framkant, z = överkant), u går bakåt längs -y.
    const [ox, oy] = iso(x, y, z);
    m = `matrix(${C} ${-S} 0 1 ${ox} ${oy})`;
  } else {
    const [ox, oy] = iso(x, y, z);
    m = `matrix(${C} ${S} ${-C} ${S} ${ox} ${oy})`;
  }
  return (
    <g transform={m} {...rest}>
      {children}
    </g>
  );
}

/** Skuggar en grundfärg till tre sidor. */
export function skugga(hex) {
  return { topp: blanda(hex, '#ffffff', 0.18), fram: hex, sida: blanda(hex, '#2a2522', 0.18) };
}

export function blanda(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** Golvskugga under ett föremål. */
export function Skugga({ x, y, b, d, ut = 14 }) {
  return <polygon className="skugga" points={poly([x - 6, y - 6, 0], [x + b + ut, y - 6, 0], [x + b + ut, y + d + 6, 0], [x - 6, y + d + 6, 0])} />;
}

/** Tangentbord och klick för SVG-element som fungerar som knappar. */
export function knapp(onClick, etikett) {
  return {
    role: 'button',
    tabIndex: 0,
    'aria-label': etikett,
    className: 'klickbar',
    onClick,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
  };
}
