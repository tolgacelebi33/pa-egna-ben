// Figurer i byggordning enligt docs/INNEHALL.md. "klar" betyder att figuren är byggd.
export const FIGURER = [
  { id: 'tvattmaskin', titel: 'Tvättmaskinen', klar: true },
  { id: 'brandvarnare', titel: 'Brandvarnaren', klar: true },
  { id: 'elskap', titel: 'Elskåpet', klar: false },
  { id: 'kyl', titel: 'Kyl och frys', klar: false },
  { id: 'vattenlas', titel: 'Vattenlåset', klar: false },
  { id: 'cistern', titel: 'Toalettens cistern', klar: false },
  { id: 'huvudkran', titel: 'Huvudkranen', klar: false },
  { id: 'diskmaskin', titel: 'Diskmaskinen', klar: false },
  { id: 'spis', titel: 'Spis, ugn och induktion', klar: false },
  { id: 'dammsugare', titel: 'Dammsugaren', klar: false },
  { id: 'tavla', titel: 'Väggen i genomskärning', klar: false },
  { id: 'paslakan', titel: 'Påslakanet', klar: false },
  { id: 'cykel', titel: 'Cykeln', klar: false },
  { id: 'faktura', titel: 'Fakturan', klar: false },
  { id: 'budget', titel: 'Budgetkalkylator', klar: false },
  { id: 'stadschema', titel: 'Städschema', klar: false },
  { id: 'tvattsymboler-quiz', titel: 'Tvättsymboler som quiz', klar: false },
  { id: 'kallsortering-quiz', titel: 'Källsortering som quiz', klar: false },
  { id: 'beslutstrad', titel: 'Beslutsträd', klar: false },
];

export const FIGUR_IDN = FIGURER.map((f) => f.id);

export const figur = (id) => FIGURER.find((f) => f.id === id);
