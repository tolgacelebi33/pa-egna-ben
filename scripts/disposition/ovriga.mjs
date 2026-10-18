// Dispositioner för fas 2: akut, hälsa, grannar, sopor, inredning, myndigheter, digitalt, transport, vardag, årshjul och "Vad gör jag när...".
// Akutämnen: stegen är korta och numrerade. Akutrutan med nödnumret läggs in av appen överst.
// Telefonnummer och tjänstenamn skrivs aldrig i texten, de hämtas från src/data/kontakter.json.
const MSB = 'Myndighet för samhällsskydd och beredskap';
const VARD = 'Vårdens nationella information om hälsa och vård';
const POLIS = 'Polisens information';
const GIFT = 'Giftinformationsverksamhet inom vården';
const HYRA = 'Organisation som ger råd till hyresgäster';
const AVFALL = 'Kommunens information om avfall och återvinning';

const steg = (antal, vad) =>
  Array.from({ length: antal }, (_, i) => `TODO-KONTROLL: ${vad}, steg ${i + 1}. Fastställs med källa och fackgranskas.`);

export default {
  // 9. Säkerhet och akuta lägen
  'akut-nummer': {
    nu: ['Lista över viktiga nummer, hämtas från den centrala kontaktfilen.', 'När man använder vilket nummer. TODO-KONTROLL: för varje nummer, med källa.'],
    mer: ['Spara numren i mobilen.'],
    kallor: [MSB, VARD, POLIS, GIFT],
    relaterade: ['akut-brand', 'akut-forgiftning', 'halsa-1177'],
  },
  'akut-brand': {
    nu: steg(3, 'vad man gör när det brinner'),
    mer: ['Förbered dig: utrymningsväg, brandvarnare, brandsläckare.'],
    kallor: [MSB, 'Räddningstjänst'],
    relaterade: ['nar-det-brinner', 'akut-fettbrand', 'huset-brandvarnare'],
    varning: 'TODO-KONTROLL: vad man aldrig ska göra vid brand, med källa.',
  },
  'akut-fettbrand': {
    nu: steg(3, 'vad man gör vid fettbrand'),
    mer: ['Hur fettbränder uppstår och hur man förebygger.'],
    kallor: [MSB, 'Räddningstjänst'],
    relaterade: ['akut-brand', 'akut-brandfilt-slackare', 'mat-steka'],
    varning: 'TODO-KONTROLL: vad man aldrig ska göra vid fettbrand, med källa.',
  },
  'akut-brandfilt-slackare': {
    nu: ['Vad brandfilt och brandsläckare används till.', 'TODO-KONTROLL: hur man använder dem, med källa och fackgranskning.', 'Var de ska förvaras.'],
    mer: ['TODO-KONTROLL: vilken typ av släckare som passar i ett hem.'],
    kallor: [MSB, 'Räddningstjänst'],
    relaterade: ['akut-fettbrand', 'akut-brand'],
  },
  'akut-litiumbatterier': {
    nu: ['Ladda där du kan se det och inte på natten. TODO-KONTROLL: källa för råden.', 'Använd rätt laddare.', 'Tecken på att ett batteri är skadat. TODO-KONTROLL.'],
    mer: ['Vad man gör om ett batteri börjar brinna. TODO-KONTROLL, fackgranskas.'],
    kallor: [MSB, 'Myndighet som ansvarar för elsäkerhet'],
    relaterade: ['transport-elsparkcykel', 'akut-brand'],
  },
  'akut-levande-ljus': {
    nu: ['Lämna aldrig levande ljus utan uppsikt.', 'Stadig ljusstake, avstånd till gardiner.'],
    mer: [],
    kallor: [MSB],
    relaterade: ['akut-brand', 'huset-brandvarnare'],
  },
  'akut-vattenlacka': {
    nu: ['Stäng huvudkranen eller avstängningen närmast läckan.', 'Stäng av strömmen om vatten når el. TODO-KONTROLL: hur, fackgranskas.', 'Kontakta hyresvärden direkt.'],
    mer: ['Dokumentera med foton.', 'Kontakta försäkringsbolaget.'],
    kallor: ['Branschorganisation för VVS', HYRA],
    relaterade: ['huset-huvudkran', 'nar-vatten-lacker'],
  },
  'akut-stromavbrott': {
    nu: ['Ta reda på om det bara är din lägenhet eller hela huset.', 'Kolla jordfelsbrytare och säkringar.', 'Kontakta hyresvärden eller elnätsbolaget.'],
    mer: ['Håll kyl och frys stängda.', 'Ficklampa i stället för levande ljus.'],
    kallor: [MSB, 'Myndighet som ansvarar för elsäkerhet'],
    relaterade: ['huset-elskap', 'fixa-propp-jordfelsbrytare', 'nar-stromlost'],
  },
  'akut-kolmonoxid': {
    nu: steg(3, 'tecken på kolmonoxid och vad man gör'),
    mer: ['Var risken finns.'],
    kallor: [MSB, VARD],
    relaterade: ['huset-gas'],
  },
  'akut-forgiftning': {
    nu: ['Ring giftinformation eller nödnumret beroende på läget. Numren hämtas från den centrala filen. TODO-KONTROLL: när vilket nummer gäller.', 'Spara förpackningen.', 'TODO-KONTROLL: vad man ska och inte ska göra, med källa.'],
    mer: [],
    kallor: [GIFT, VARD],
    relaterade: ['stad-kemikalier', 'nar-forgiftning'],
  },
  'akut-forbandslada': {
    nu: ['TODO-KONTROLL: vad en förbandslåda bör innehålla, med källa.', 'Var den ska stå och hur ofta den ska kontrolleras.'],
    mer: [],
    kallor: [VARD, 'Organisation som utbildar i första hjälpen'],
    relaterade: ['akut-forsta-hjalpen', 'halsa-hemapotek'],
  },
  'akut-forsta-hjalpen': {
    nu: ['Gå en kurs i första hjälpen. Appen ersätter inte en kurs.', 'TODO-KONTROLL: grunderna, med källa och fackgranskning.'],
    mer: [],
    kallor: ['Organisation som utbildar i första hjälpen', VARD],
    relaterade: ['akut-forbandslada', 'akut-nummer'],
  },
  'akut-inbrott': {
    nu: ['Gå inte in om du tror att någon är kvar. Ring nödnumret. Numret visas i akutrutan och hämtas från den centrala filen.', 'Rör så lite som möjligt.', 'Polisanmäl och kontakta försäkringsbolaget.'],
    mer: ['Spärra kort och byt lösenord om något har stulits.'],
    kallor: [POLIS, 'Oberoende konsumentvägledning om försäkringar'],
    relaterade: ['nar-inbrott', 'bostad-hemforsakring', 'pengar-sparra-kort'],
  },
  'akut-utelast': {
    nu: ['Reservnyckel hos någon du litar på.', 'Kontakta hyresvärden eller en låssmed. TODO-KONTROLL: vem som betalar.'],
    mer: ['Varning för oseriösa låssmeder. TODO-KONTROLL: källa.'],
    kallor: [HYRA, 'Myndighet för konsumentfrågor'],
    relaterade: ['bostad-nycklar', 'nar-utelast'],
  },
  'akut-gaslukt': {
    nu: steg(4, 'vad man gör vid gaslukt (ut, inga strömbrytare, larma)'),
    mer: [],
    kallor: [MSB, 'Gasleverantörens säkerhetsinformation'],
    relaterade: ['huset-gas', 'nar-det-luktar-gas'],
  },

  // 10. Hälsa och mående. Inga diagnoser, inga doser.
  'halsa-vardcentral': {
    nu: ['Vad en vårdcentral är och hur man listar sig. TODO-KONTROLL: hur det går till i din region.'],
    mer: ['När man går till vårdcentral och när man söker akut.'],
    kallor: [VARD, 'Regionens information om vård'],
    relaterade: ['halsa-1177', 'flytt-forsta-manaden'],
  },
  'halsa-1177': {
    nu: ['Vad tjänsten är och när man använder den. Namn och nummer hämtas från den centrala filen.'],
    mer: ['TODO-KONTROLL: vad man kan göra via tjänstens webbplats och e-tjänster.'],
    kallor: [VARD],
    relaterade: ['halsa-vardcentral', 'akut-nummer'],
  },
  'halsa-tandvard': {
    nu: ['Hur man hittar tandvård.', 'TODO-KONTROLL: vad det kostar och vilka åldersregler som gäller.'],
    mer: [],
    kallor: ['Myndighet för tandvårdsstöd', VARD],
    relaterade: ['halsa-vardcentral'],
  },
  'halsa-apotek-recept': {
    nu: ['Hur recept fungerar och hur man förnyar dem.', 'Fråga apoteket om råd. Appen ger inga råd om läkemedel.'],
    mer: ['TODO-KONTROLL: högkostnadsskydd.'],
    kallor: ['Myndighet för läkemedel', VARD],
    relaterade: ['halsa-hemapotek'],
  },
  'halsa-ungdomsmottagning': {
    nu: ['Vad ungdomsmottagningen hjälper till med.', 'TODO-KONTROLL: åldersgränser och hur man hittar en mottagning i sin kommun.'],
    mer: ['Det är gratis och man kan vara anonym. TODO-KONTROLL: källa.'],
    kallor: ['Ungdomsmottagningarnas gemensamma information', VARD],
    relaterade: ['halsa-preventivmedel', 'halsa-ma-daligt'],
  },
  'halsa-preventivmedel': {
    nu: ['Var man får råd: ungdomsmottagning, barnmorska, vårdcentral.', 'Appen ger inga råd om metoder.'],
    mer: [],
    kallor: [VARD],
    relaterade: ['halsa-ungdomsmottagning'],
  },
  'halsa-hemapotek': {
    nu: ['Fråga apoteket vad som är bra att ha hemma.', 'Appen ger inga råd om läkemedel eller doser.'],
    mer: ['Förvara läkemedel rätt och lämna gamla till apoteket.'],
    kallor: ['Myndighet för läkemedel', VARD],
    relaterade: ['halsa-apotek-recept', 'akut-forbandslada'],
  },
  'halsa-sjuk-och-ensam': {
    nu: ['Förbered dig när du är frisk: något att äta, dricka, termometer.', 'Säg till någon att du är sjuk.', 'När du ska söka vård. TODO-KONTROLL: med källa från vården.'],
    mer: [],
    kallor: [VARD],
    relaterade: ['nar-sjuk', 'halsa-1177'],
  },
  'halsa-somn': {
    nu: ['Regelbundna tider.', 'Skärmar och koffein på kvällen.'],
    mer: ['Om sömnen inte blir bättre: kontakta vården.'],
    kallor: [VARD],
    relaterade: ['halsa-ma-daligt'],
  },
  'halsa-hemlangtan': {
    nu: ['Det är vanligt att sakna hemma.', 'Saker som kan hjälpa: rutiner, nya sammanhang, att höra av sig.'],
    mer: ['Om det inte går över: länk till när man mår dåligt.'],
    kallor: [VARD],
    relaterade: ['halsa-ma-daligt', 'vardag-bjuda-hem'],
  },
  'halsa-ma-daligt': {
    nu: ['Om du tänker på att skada dig: ring nödnumret. Numret visas i akutrutan och hämtas från den centrala filen.', 'Var du kan prata med någon. TODO-KONTROLL: stödlinjer med källa och kontrolldatum för varje.'],
    mer: ['Prata med någon du litar på.', 'Vårdcentral och ungdomsmottagning.'],
    kallor: [VARD, 'Stödlinjernas egna webbplatser'],
    relaterade: ['nar-mar-daligt', 'halsa-ungdomsmottagning'],
  },
  'halsa-alkohol-fest': {
    nu: ['Ät, drick vatten, ha koll på varandra.', 'När någon behöver vård. TODO-KONTROLL: tecken, med källa.'],
    mer: ['TODO-KONTROLL: åldersgränser och regler.'],
    kallor: [VARD, 'Myndighet för folkhälsa'],
    relaterade: ['vardag-fest', 'akut-nummer'],
  },
  'halsa-rorelse-mat': {
    nu: ['Små vanor i vardagen.', 'Inga dieträd.'],
    mer: [],
    kallor: ['Myndighet för folkhälsa', 'Ansvarig myndighet för livsmedelssäkerhet'],
    relaterade: ['halsa-somn'],
  },

  // 11. Grannar och samboende
  'grannar-ljud': {
    nu: ['Läs husets ordningsregler om tystnad.', 'Säg till grannarna innan du har fest.'],
    mer: ['TODO-KONTROLL: om det finns generella tider eller bara husets egna regler.'],
    kallor: ['Hyresvärdarnas ordningsregler', HYRA],
    relaterade: ['bostad-ordningsregler', 'grannar-prata'],
  },
  'grannar-prata': {
    nu: ['Prata direkt och lugnt först.', 'Kontakta hyresvärden om det inte hjälper.'],
    mer: [],
    kallor: [HYRA],
    relaterade: ['nar-granne-bullrar', 'grannar-ljud'],
  },
  'grannar-storning': {
    nu: ['Ta klagomål på allvar och prata med grannen.', 'TODO-KONTROLL: vad som kan hända om störningarna fortsätter.'],
    mer: ['Var du kan få råd.'],
    kallor: ['Lagtext om hyra', HYRA],
    relaterade: ['grannar-ljud', 'vardag-fest'],
  },
  'grannar-boendeformer': {
    nu: ['Hur hyresrätt, bostadsrätt, andrahand och studentboende skiljer sig i vardagen: vem du kontaktar, vad du får göra.'],
    mer: ['TODO-KONTROLL: viktiga juridiska skillnader i stort.'],
    kallor: ['Lagtext om hyra', HYRA],
    relaterade: ['bostad-sokande', 'bostad-andrahand'],
  },
  'grannar-bo-ihop': {
    nu: ['Kom överens om städning, inköp och gäster från början.', 'Skriv ned hur ni delar kostnader.'],
    mer: ['Vems namn som står på kontraktet och vad det betyder. TODO-KONTROLL.'],
    kallor: [HYRA],
    relaterade: ['stad-schema', 'pengar-budget'],
  },
  'grannar-gaster': {
    nu: ['Gäster är oftast inga problem.', 'TODO-KONTROLL: när en gäst räknas som andrahandsuthyrning.'],
    mer: [],
    kallor: ['Lagtext om hyra', HYRA],
    relaterade: ['bostad-andrahand'],
  },
  'grannar-husdjur': {
    nu: ['Läs vad kontraktet säger om djur.', 'Vad ett djur kostar. TODO-KONTROLL: exempel med källa.'],
    mer: [],
    kallor: [HYRA, 'Myndighet för djurskydd'],
    relaterade: ['bostad-kontrakt'],
  },
  'grannar-gemensamma-utrymmen': {
    nu: ['Grovsoprum, cykelförråd, källare och parkering: regler där du bor.', 'Märk dina saker.'],
    mer: [],
    kallor: ['Hyresvärdarnas ordningsregler'],
    relaterade: ['bostad-ordningsregler', 'sopor-grovsopor'],
  },

  // 12. Sopor och miljö
  'sopor-kallsortering': {
    nu: ['Vanliga fraktioner: matavfall, papper, plast, metall, glas. TODO-KONTROLL: hur det ser ut i din kommun.', 'Quiz för att öva.'],
    mer: [],
    kallor: [AVFALL, 'Producentansvarsorganisationernas information'],
    relaterade: ['sopor-matavfall', 'sopor-pant'],
  },
  'sopor-pant': {
    nu: ['Vad som har pant och var man pantar. TODO-KONTROLL: vilka förpackningar.'],
    mer: [],
    kallor: ['Pantsystemets egen information'],
    relaterade: ['sopor-kallsortering'],
  },
  'sopor-farligt-avfall': {
    nu: ['Vad som är farligt avfall: batterier, lampor, kemikalier.', 'Var du lämnar det. TODO-KONTROLL: i din kommun.'],
    mer: [],
    kallor: [AVFALL, 'Myndighet för kemikalier'],
    relaterade: ['sopor-elavfall', 'stad-kemikalier'],
  },
  'sopor-elavfall': {
    nu: ['Vad som räknas som elavfall och var det lämnas. TODO-KONTROLL: i din kommun.'],
    mer: ['Butiker som tar emot elavfall. TODO-KONTROLL.'],
    kallor: [AVFALL],
    relaterade: ['sopor-farligt-avfall', 'sopor-grovsopor'],
  },
  'sopor-grovsopor': {
    nu: ['Vad som är grovsopor och var de lämnas: grovsoprum eller återvinningscentral. TODO-KONTROLL: i din kommun.'],
    mer: [],
    kallor: [AVFALL],
    relaterade: ['grannar-gemensamma-utrymmen', 'sopor-elavfall'],
  },
  'sopor-matavfall': {
    nu: ['Hur matavfall samlas in. TODO-KONTROLL: i din kommun.'],
    mer: ['Påsar och lukt.'],
    kallor: [AVFALL],
    relaterade: ['sopor-kallsortering', 'skadedjur-bananflugor'],
  },
  'sopor-mindre-avfall': {
    nu: ['Köp mindre förpackningar, återanvänd, laga.'],
    mer: [],
    kallor: ['Myndighet för miljöfrågor'],
    relaterade: ['mat-matsvinn', 'pengar-begagnat'],
  },

  // 13. Inredning
  'inredning-mobler': {
    nu: ['Mät rummet först.', 'Möbler som gör flera saker.'],
    mer: [],
    kallor: [],
    relaterade: ['inredning-grundmobler', 'inredning-forvaring'],
  },
  'inredning-belysning': {
    nu: ['Flera ljuskällor på olika höjder.', 'Varmt och kallt ljus.'],
    mer: ['Byta lampa: länk.'],
    kallor: [],
    relaterade: ['fixa-lampa'],
  },
  'inredning-grundmobler': {
    nu: ['Säng, något att sitta på, bord, förvaring.', 'Det som kan vänta.'],
    mer: ['Köpa begagnat.'],
    kallor: [],
    relaterade: ['pengar-begagnat', 'inredning-mobler'],
  },
  'inredning-forvaring': {
    nu: ['Använd höjden och ytan under sängen.'],
    mer: [],
    kallor: [],
    relaterade: ['inredning-mobler'],
  },
  'inredning-vaxter': {
    nu: ['Växter som tål lite ljus och lite vatten.', 'Vattna när jorden är torr.'],
    mer: ['Länk till sorgmyggor.'],
    kallor: [],
    relaterade: ['skadedjur-blomflugor'],
  },
  'inredning-hemtrevligt': {
    nu: ['Textilier, ljus och växter.', 'Begagnat och egna saker.'],
    mer: [],
    kallor: [],
    relaterade: ['inredning-belysning', 'akut-levande-ljus'],
  },

  // 14. Arbete, studier och myndigheter
  'myndigheter-anstallningsavtal': {
    nu: ['Det som ska stå i ett anställningsavtal. TODO-KONTROLL: vad lagen kräver.', 'Få avtalet skriftligt.'],
    mer: ['Var du får hjälp: fackförbund.'],
    kallor: ['Lagtext om anställningsskydd', 'Myndighet för arbetsmiljö'],
    relaterade: ['myndigheter-facket', 'pengar-lonespec'],
  },
  'myndigheter-semester': {
    nu: ['TODO-KONTROLL: grundreglerna för semester.'],
    mer: [],
    kallor: ['Lagtext om semester'],
    relaterade: ['myndigheter-anstallningsavtal'],
  },
  'myndigheter-sjukanmalan': {
    nu: ['Sjukanmäl dig enligt arbetsgivarens rutin.', 'TODO-KONTROLL: hur sjuklön och karensavdrag fungerar.'],
    mer: [],
    kallor: ['Lagtext om sjuklön', 'Myndighet för socialförsäkring'],
    relaterade: ['myndigheter-forsakringskassan'],
  },
  'myndigheter-forsakringskassan': {
    nu: ['Vad myndigheten för socialförsäkring gör. TODO-KONTROLL: namn och uppgifter, från källa.'],
    mer: [],
    kallor: ['Myndighet för socialförsäkring'],
    relaterade: ['pengar-bostadsbidrag', 'myndigheter-sjukanmalan'],
  },
  'myndigheter-facket': {
    nu: ['Skillnaden mellan fackförbund och a-kassa.', 'TODO-KONTROLL: hur man går med och vad det kostar ungefär.'],
    mer: [],
    kallor: ['Myndighet för tillsyn över arbetslöshetskassor', 'Fackförbundens information'],
    relaterade: ['pengar-a-kassa'],
  },
  'myndigheter-mina-sidor': {
    nu: ['Logga in med e-legitimation.', 'Digital brevlåda: vad det är. TODO-KONTROLL: hur man skaffar en.'],
    mer: [],
    kallor: ['Myndighet för digital förvaltning'],
    relaterade: ['pengar-bankid', 'vardag-post'],
  },
  'myndigheter-konsumentratt': {
    nu: ['Var du vänder dig som konsument. TODO-KONTROLL: rätt instanser.'],
    mer: [],
    kallor: ['Myndighet för konsumentfrågor', 'Kommunal konsumentvägledning'],
    relaterade: ['pengar-reklamation'],
  },
  'myndigheter-val': {
    nu: ['TODO-KONTROLL: hur röstkort och folkbokföring hänger ihop.'],
    mer: [],
    kallor: ['Myndighet för val'],
    relaterade: ['bostad-flyttanmalan'],
  },

  // 15. Digitalt
  'digitalt-losenord': {
    nu: ['Olika lösenord på olika ställen.', 'Lösenordshanterare: vad det är.'],
    mer: [],
    kallor: ['Myndighet för informationssäkerhet'],
    relaterade: ['digitalt-tvastegs'],
  },
  'digitalt-tvastegs': {
    nu: ['Slå på tvåstegsverifiering för e-post och bank.'],
    mer: [],
    kallor: ['Myndighet för informationssäkerhet'],
    relaterade: ['digitalt-losenord'],
  },
  'digitalt-mobilabonnemang': {
    nu: ['Bindningstid och uppsägningstid. TODO-KONTROLL.', 'Jämför utan att appen rekommenderar operatörer.'],
    mer: [],
    kallor: ['Oberoende konsumentvägledning om telekom'],
    relaterade: ['huset-bredband'],
  },
  'digitalt-backup': {
    nu: ['Säkerhetskopiera bilder och dokument på två ställen.'],
    mer: [],
    kallor: ['Myndighet för informationssäkerhet'],
    relaterade: ['pengar-dokument'],
  },
  'digitalt-dela-konton': {
    nu: ['Det du ska tänka på innan du delar konton.', 'Vad som händer när någon flyttar ut.'],
    mer: [],
    kallor: [],
    relaterade: ['pengar-prenumerationer', 'grannar-bo-ihop'],
  },

  // 16. Transport
  'transport-cykel': {
    nu: ['Laga punktering, smörj kedjan, kolla bromsar.', 'TODO-KONTROLL: krav på belysning och reflexer.'],
    mer: ['Lås cykeln i något fast.'],
    kallor: ['Myndighet för transportsäkerhet'],
    relaterade: ['arshjul-host'],
  },
  'transport-kollektivt': {
    nu: ['Hur biljetter och periodkort fungerar. TODO-KONTROLL: i din region.'],
    mer: [],
    kallor: ['Regionens kollektivtrafik'],
    relaterade: ['pengar-budget'],
  },
  'transport-korkort': {
    nu: ['TODO-KONTROLL: stegen till körkort.'],
    mer: [],
    kallor: ['Myndighet för transportsäkerhet'],
    relaterade: ['transport-bil'],
  },
  'transport-bil': {
    nu: ['Det som återkommer: besiktning, skatt, försäkring, däckbyte, service. TODO-KONTROLL: regler och tider.'],
    mer: [],
    kallor: ['Myndighet för transportsäkerhet'],
    relaterade: ['arshjul-host', 'transport-korkort'],
  },
  'transport-elsparkcykel': {
    nu: ['TODO-KONTROLL: trafikregler för elsparkcykel.', 'Laddning hemma: länk till batterisäkerhet.'],
    mer: [],
    kallor: ['Myndighet för transportsäkerhet', MSB],
    relaterade: ['akut-litiumbatterier'],
  },

  // 17. Vardag
  'vardag-veckorutin': {
    nu: ['En enkel vecka: tvätt, städning, inköp, matlagning.', 'Bocka av i appen.'],
    mer: [],
    kallor: [],
    relaterade: ['stad-schema', 'mat-veckomeny'],
  },
  'vardag-post': {
    nu: ['Öppna posten direkt.', 'En plats för räkningar som ska betalas.'],
    mer: [],
    kallor: [],
    relaterade: ['pengar-lasa-faktura', 'myndigheter-mina-sidor'],
  },
  'vardag-bjuda-hem': {
    nu: ['Enkel middag som går att förbereda.', 'Fråga om allergier.'],
    mer: [],
    kallor: [],
    relaterade: ['mat-gaster'],
  },
  'vardag-fest': {
    nu: ['Säg till grannarna i förväg.', 'Ha koll på varandra.', 'Städa efteråt.'],
    mer: [],
    kallor: [HYRA],
    relaterade: ['grannar-ljud', 'halsa-alkohol-fest', 'stad-efter-fest'],
  },
  'vardag-bra-granne': {
    nu: ['Hälsa, säg till, städa efter dig i gemensamma utrymmen.'],
    mer: [],
    kallor: [],
    relaterade: ['grannar-prata', 'grannar-bo-ihop'],
  },

  // 18. Årshjul
  'arshjul-host': {
    nu: ['Kolla ventilation och element.', 'Vinterkläder och reflexer.', 'TODO-KONTROLL: regler för vinterdäck.'],
    mer: [],
    kallor: ['Myndighet för transportsäkerhet'],
    relaterade: ['huset-ventilation', 'transport-bil'],
  },
  'arshjul-vinter': {
    nu: ['Halka.', 'Dragiga fönster och torr luft.'],
    mer: [],
    kallor: [],
    relaterade: ['fixa-drag', 'huset-vadring'],
  },
  'arshjul-var-sommar': {
    nu: ['Vädring och fönsterputs.', 'Värme inomhus. TODO-KONTROLL: råd vid värmebölja, med källa.'],
    mer: [],
    kallor: ['Myndighet för folkhälsa'],
    relaterade: ['stad-fonster', 'huset-vadring'],
  },
  'arshjul-aterkommande': {
    nu: ['Brandvarnarens batteri, deklaration, elavtal, försäkringsförnyelse. TODO-KONTROLL: när under året.'],
    mer: [],
    kallor: [MSB, 'Ansvarig myndighet för skatt', 'Oberoende konsumentvägledning om el och försäkringar'],
    relaterade: ['huset-brandvarnare', 'pengar-deklaration', 'huset-elavtal', 'bostad-hemforsakring'],
  },

  // 19. Vad gör jag när... Varje fråga är ett beslutsträd som pekar vidare.
  'nar-det-brinner': {
    nu: steg(3, 'vad man gör först om det brinner eller ryker'),
    mer: ['Beslutsträd: brinner det i en kastrull, i lägenheten eller i trapphuset?'],
    kallor: [MSB, 'Räddningstjänst'],
    relaterade: ['akut-brand', 'akut-fettbrand'],
  },
  'nar-det-luktar-gas': {
    nu: steg(3, 'vad man gör vid gaslukt'),
    mer: [],
    kallor: [MSB, 'Gasleverantörens säkerhetsinformation'],
    relaterade: ['akut-gaslukt', 'huset-gas'],
  },
  'nar-vatten-lacker': {
    nu: ['Stäng vattnet. Länk till huvudkranen.', 'Kontakta hyresvärden.', 'TODO-KONTROLL: när el och vatten är en fara, fackgranskas.'],
    mer: ['Beslutsträd: läcker det hos dig eller kommer det från grannen?'],
    kallor: ['Branschorganisation för VVS', HYRA],
    relaterade: ['akut-vattenlacka', 'huset-huvudkran'],
  },
  'nar-stromlost': {
    nu: ['Är det bara hos dig eller i hela huset?', 'Kolla elskåpet.', 'Kontakta hyresvärden.'],
    mer: [],
    kallor: [MSB],
    relaterade: ['akut-stromavbrott', 'fixa-propp-jordfelsbrytare'],
  },
  'nar-utelast': {
    nu: ['Reservnyckel hos någon?', 'Kontakta hyresvärden.', 'Låssmed: varning för oseriösa.'],
    mer: [],
    kallor: [HYRA],
    relaterade: ['akut-utelast', 'bostad-nycklar'],
  },
  'nar-stopp': {
    nu: ['Var är stoppet: vask, dusch eller toalett?', 'Länk till rätt ämne.', 'Felanmäl om det inte hjälper.'],
    mer: [],
    kallor: ['Branschorganisation för VVS'],
    relaterade: ['fixa-stopp-vask', 'fixa-stopp-dusch', 'fixa-stopp-toalett'],
  },
  'nar-rakning-utan-pengar': {
    nu: ['Öppna och läs räkningen.', 'Kontakta den du ska betala till innan förfallodagen.', 'Hyran först. TODO-KONTROLL: källa för rådet.', 'Var du får gratis hjälp.'],
    mer: [],
    kallor: ['Kommunal budget- och skuldrådgivning', 'Myndigheten för indrivning av skulder'],
    relaterade: ['pengar-paminnelse-inkasso', 'pengar-skuldhjalp', 'bostad-sen-hyra'],
  },
  'nar-bedragen': {
    nu: ['Ring banken direkt och spärra.', 'Byt lösenord.', 'Polisanmäl.'],
    mer: [],
    kallor: [POLIS, 'Bankernas spärrtjänst'],
    relaterade: ['pengar-bedragerier', 'pengar-sparra-kort'],
  },
  'nar-tappat-kort': {
    nu: ['Spärra kortet.', 'Spärra BankID om mobilen är borta.', 'Polisanmäl vid stöld.'],
    mer: [],
    kallor: ['Bankernas spärrtjänst', POLIS],
    relaterade: ['pengar-sparra-kort'],
  },
  'nar-sjuk': {
    nu: ['Är det akut? Ring nödnumret. Numret visas i akutrutan och hämtas från den centrala filen.', 'Råd om vård: tjänst från den centrala filen.', 'Be någon handla åt dig.'],
    mer: [],
    kallor: [VARD],
    relaterade: ['halsa-sjuk-och-ensam', 'halsa-1177'],
  },
  'nar-mar-daligt': {
    nu: ['Om du tänker på att skada dig: ring nödnumret. Numret visas i akutrutan och hämtas från den centrala filen.', 'Var du kan prata med någon. TODO-KONTROLL: stödlinjer med källa och kontrolldatum.'],
    mer: [],
    kallor: [VARD, 'Stödlinjernas egna webbplatser'],
    relaterade: ['halsa-ma-daligt'],
  },
  'nar-luktar-konstigt': {
    nu: ['Luktar det gas eller brandrök? Gå till de sidorna direkt.', 'Avlopp, kyl, mögel: länk till rätt ämne.'],
    mer: [],
    kallor: [MSB],
    relaterade: ['nar-det-luktar-gas', 'stad-lukt-avlopp', 'stad-lukt-kyl', 'stad-mogel'],
  },
  'nar-flugor': {
    nu: ['Var kommer flugorna ifrån: krukor, frukt eller sopor?', 'Länk till rätt ämne.'],
    mer: [],
    kallor: [],
    relaterade: ['skadedjur-bananflugor', 'skadedjur-blomflugor'],
  },
  'nar-granne-bullrar': {
    nu: ['Prata med grannen om du känner dig trygg.', 'Kontakta hyresvärden.', 'Ring polisen om du hör att någon är i fara. Numret hämtas från den centrala filen.'],
    mer: [],
    kallor: [HYRA, POLIS],
    relaterade: ['grannar-prata', 'grannar-ljud'],
  },
  'nar-brandvarnare-piper': {
    nu: ['Brinner det? Gå till "Det brinner".', 'TODO-KONTROLL: hur man skiljer larm från batterivarning, enligt tillverkare.'],
    mer: [],
    kallor: [MSB, 'Tillverkares bruksanvisningar'],
    relaterade: ['huset-brandvarnare', 'nar-det-brinner'],
  },
  'nar-forgiftning': {
    nu: steg(3, 'vad man gör när någon har fått i sig något farligt'),
    mer: ['Spara förpackningen.'],
    kallor: [GIFT, VARD],
    relaterade: ['akut-forgiftning'],
  },
  'nar-inbrott': {
    nu: ['Gå inte in om någon kan vara kvar.', 'Polisanmäl.', 'Kontakta försäkringsbolaget.'],
    mer: [],
    kallor: [POLIS],
    relaterade: ['akut-inbrott'],
  },
};
