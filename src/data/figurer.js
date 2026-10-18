// Figurer i byggordning enligt docs/INNEHALL.md. "klar" betyder att figuren är byggd.
export const FIGURER = [
  { id: 'tvattmaskin', titel: 'Tvättmaskinen', klar: true },
  { id: 'brandvarnare', titel: 'Brandvarnaren', klar: true },
  { id: 'elskap', titel: 'Elskåpet', klar: true },
  { id: 'kyl', titel: 'Kyl och frys', klar: true },
  { id: 'vattenlas', titel: 'Vattenlåset', klar: true },
  { id: 'cistern', titel: 'Toalettens cistern', klar: true },
  { id: 'huvudkran', titel: 'Huvudkranen', klar: true },
  { id: 'diskmaskin', titel: 'Diskmaskinen', klar: true },
  { id: 'spis', titel: 'Spis, ugn och induktion', klar: true },
  { id: 'dammsugare', titel: 'Dammsugaren', klar: true },
  { id: 'tavla', titel: 'Väggen i genomskärning', klar: true },
  { id: 'paslakan', titel: 'Påslakanet', klar: true },
  { id: 'cykel', titel: 'Cykeln', klar: true },
  { id: 'faktura', titel: 'Fakturan', klar: true },
  { id: 'budget', titel: 'Budgetkalkylator', klar: true },
  { id: 'stadschema', titel: 'Städschema', klar: true },
  { id: 'tvattsymboler-quiz', titel: 'Tvättsymboler som quiz', klar: true },
  { id: 'kallsortering-quiz', titel: 'Källsortering som quiz', klar: true },
  { id: 'beslutstrad', titel: 'Beslutsträd', klar: true },
];

export const FIGUR_IDN = FIGURER.map((f) => f.id);

export const figur = (id) => FIGURER.find((f) => f.id === id);
