// Beslutsträd för "Vad gör jag när...". Frågorna leder vidare till rätt ämne, de ger inga egna faktaråd.
// Varje träd börjar med frågan om någon är i fara. Nödnumret hämtas från kontaktfilen, aldrig härifrån.
// Nodtyper: { fraga, svar: [{ text, till }] } eller { slut, amne?, fara? }.
// TODO-KONTROLL: frågorna och vägarna granskas tillsammans med respektive ämne. Ämnen med hög risk fackgranskas.

const fara = (nasta) => ({
  start: { fraga: 'fara.fraga', svar: [{ text: 'svar.ja', till: 'nodnummer' }, { text: 'svar.nej', till: nasta }] },
  nodnummer: { slut: 'slut.nodnummer', fara: true },
});

export const TRAD = {
  'nar-det-brinner': {
    ...fara('var'),
    var: {
      fraga: 'brand.var',
      svar: [
        { text: 'brand.kastrull', till: 'fettbrand' },
        { text: 'brand.lagenhet', till: 'brand' },
        { text: 'brand.trapphus', till: 'brand' },
      ],
    },
    fettbrand: { slut: 'slut.las', amne: 'akut-fettbrand' },
    brand: { slut: 'slut.las', amne: 'akut-brand' },
  },
  'nar-det-luktar-gas': { ...fara('gas'), gas: { slut: 'slut.las', amne: 'akut-gaslukt' } },
  'nar-vatten-lacker': {
    ...fara('var'),
    var: {
      fraga: 'vatten.var',
      svar: [
        { text: 'vatten.hos.mig', till: 'stang' },
        { text: 'vatten.granne', till: 'hyresvard' },
      ],
    },
    stang: { slut: 'slut.las', amne: 'akut-vattenlacka' },
    hyresvard: { slut: 'slut.hyresvard', amne: 'akut-vattenlacka' },
  },
  'nar-stromlost': {
    ...fara('var'),
    var: {
      fraga: 'strom.var',
      svar: [
        { text: 'strom.bara.mig', till: 'elskap' },
        { text: 'strom.hela.huset', till: 'avbrott' },
      ],
    },
    elskap: { slut: 'slut.las', amne: 'fixa-propp-jordfelsbrytare' },
    avbrott: { slut: 'slut.las', amne: 'akut-stromavbrott' },
  },
  'nar-utelast': {
    start: {
      fraga: 'utelast.reserv',
      svar: [
        { text: 'svar.ja', till: 'reserv' },
        { text: 'svar.nej', till: 'las' },
      ],
    },
    reserv: { slut: 'slut.reserv', amne: 'bostad-nycklar' },
    las: { slut: 'slut.las', amne: 'akut-utelast' },
  },
  'nar-stopp': {
    start: {
      fraga: 'stopp.var',
      svar: [
        { text: 'stopp.vask', till: 'vask' },
        { text: 'stopp.dusch', till: 'dusch' },
        { text: 'stopp.toalett', till: 'toalett' },
      ],
    },
    vask: { slut: 'slut.las', amne: 'fixa-stopp-vask' },
    dusch: { slut: 'slut.las', amne: 'fixa-stopp-dusch' },
    toalett: { slut: 'slut.las', amne: 'fixa-stopp-toalett' },
  },
  'nar-rakning-utan-pengar': {
    start: {
      fraga: 'rakning.vilken',
      svar: [
        { text: 'rakning.hyra', till: 'hyra' },
        { text: 'rakning.faktura', till: 'faktura' },
        { text: 'rakning.inkasso', till: 'inkasso' },
      ],
    },
    hyra: { slut: 'slut.las', amne: 'bostad-sen-hyra' },
    faktura: { slut: 'slut.las', amne: 'pengar-paminnelse-inkasso' },
    inkasso: { slut: 'slut.hjalp', amne: 'pengar-skuldhjalp' },
  },
  'nar-bedragen': {
    start: {
      fraga: 'bedragen.vad',
      svar: [
        { text: 'bedragen.kod', till: 'sparra' },
        { text: 'bedragen.betalat', till: 'sparra' },
        { text: 'bedragen.osaker', till: 'las' },
      ],
    },
    sparra: { slut: 'slut.sparra', amne: 'pengar-sparra-kort' },
    las: { slut: 'slut.las', amne: 'pengar-bedragerier' },
  },
  'nar-tappat-kort': { start: { slut: 'slut.sparra', amne: 'pengar-sparra-kort' } },
  'nar-sjuk': {
    ...fara('rad'),
    rad: { slut: 'slut.vard', amne: 'halsa-sjuk-och-ensam' },
  },
  'nar-mar-daligt': {
    ...fara('prata'),
    prata: { slut: 'slut.prata', amne: 'halsa-ma-daligt' },
  },
  'nar-luktar-konstigt': {
    start: {
      fraga: 'lukt.vad',
      svar: [
        { text: 'lukt.gas', till: 'gas' },
        { text: 'lukt.rok', till: 'rok' },
        { text: 'lukt.avlopp', till: 'avlopp' },
        { text: 'lukt.kyl', till: 'kyl' },
        { text: 'lukt.mogel', till: 'mogel' },
      ],
    },
    gas: { slut: 'slut.las', amne: 'nar-det-luktar-gas', fara: true },
    rok: { slut: 'slut.las', amne: 'nar-det-brinner', fara: true },
    avlopp: { slut: 'slut.las', amne: 'stad-lukt-avlopp' },
    kyl: { slut: 'slut.las', amne: 'stad-lukt-kyl' },
    mogel: { slut: 'slut.las', amne: 'stad-mogel' },
  },
  'nar-flugor': {
    start: {
      fraga: 'flugor.var',
      svar: [
        { text: 'flugor.krukor', till: 'kruka' },
        { text: 'flugor.frukt', till: 'frukt' },
      ],
    },
    kruka: { slut: 'slut.las', amne: 'skadedjur-blomflugor' },
    frukt: { slut: 'slut.las', amne: 'skadedjur-bananflugor' },
  },
  'nar-granne-bullrar': {
    start: {
      fraga: 'granne.fara',
      svar: [
        { text: 'svar.ja', till: 'polis' },
        { text: 'svar.nej', till: 'prata' },
      ],
    },
    polis: { slut: 'slut.nodnummer', fara: true },
    prata: { slut: 'slut.las', amne: 'grannar-prata' },
  },
  'nar-brandvarnare-piper': {
    start: {
      fraga: 'pip.rok',
      svar: [
        { text: 'svar.ja', till: 'brand' },
        { text: 'svar.nej', till: 'batteri' },
      ],
    },
    brand: { slut: 'slut.las', amne: 'nar-det-brinner', fara: true },
    batteri: { slut: 'slut.las', amne: 'huset-brandvarnare' },
  },
  'nar-forgiftning': {
    ...fara('gift'),
    gift: { slut: 'slut.gift', amne: 'akut-forgiftning' },
  },
  'nar-inbrott': {
    start: {
      fraga: 'inbrott.kvar',
      svar: [
        { text: 'svar.ja', till: 'nod' },
        { text: 'svar.nej', till: 'anmal' },
      ],
    },
    nod: { slut: 'slut.nodnummer', fara: true },
    anmal: { slut: 'slut.las', amne: 'akut-inbrott' },
  },
};

/** Ämnes-id som ett träd (eller alla träd) pekar på, så att sidan bara behöver skicka med de titlarna. */
export function amnenI(id) {
  const trad = id ? [TRAD[id]] : Object.values(TRAD);
  return [...new Set(trad.flatMap((tr) => Object.values(tr).map((n) => n.amne).filter(Boolean)).concat(id ? [] : Object.keys(TRAD)))];
}
