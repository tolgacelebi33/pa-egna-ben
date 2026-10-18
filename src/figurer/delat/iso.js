// Isometrisk projektion som alla figurer delar: x åt höger-ned, y åt vänster-ned, z uppåt.
export const C = Math.cos(Math.PI / 6);
export const S = 0.5;

export const iso = (x, y, z) => [(x - y) * C, (x + y) * S - z];

export const poly = (...punkter) =>
  punkter.map((p) => iso(...p).map((n) => n.toFixed(1)).join(',')).join(' ');

// Matriser som lägger en platt ritning (u åt höger, v nedåt) på ett plan i isometrin.
// Framsida på planet y = djup, med överkanten på höjden hojd.
export const framsidaMatris = (djup, hojd) => `matrix(${C} ${S} 0 1 ${-C * djup} ${S * djup - hojd})`;
// Höger sida på planet x = bredd.
export const hogersidaMatris = (bredd, hojd) => `matrix(${-C} ${S} 0 1 ${C * bredd} ${S * bredd - hojd})`;
// Ovansida på höjden z = hojd.
export const ovansidaMatris = (hojd) => `matrix(${C} ${S} ${-C} ${S} 0 ${-hojd})`;
