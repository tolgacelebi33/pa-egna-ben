// Dispositioner för fas 2: tvätt och mat. Se bostad-pengar.mjs för formatet.
const LIVSMEDEL = 'Ansvarig myndighet för livsmedelssäkerhet';

// Recept har samma upplägg. Ingredienser, mängder, tider och temperaturer måste källbeläggas eller provlagas.
const recept = (vad, extra = [], relaterade = []) => ({
  nu: [
    `Ingredienser för ${vad}. TODO-KONTROLL: mängder, provlagade eller från källa.`,
    'Steg för steg, numrerat.',
    'TODO-KONTROLL: tider och temperaturer.',
    ...extra,
  ],
  mer: ['Vanliga misstag och hur man räddar dem.', 'Varianter och vad man kan byta ut.'],
  kallor: ['Provlagning i projektet', LIVSMEDEL],
  relaterade,
});

export default {
  // 3. Tvätt och kläder
  'tvatt-maskinen': {
    nu: ['Sortera tvätten. TODO-KONTROLL: vilka sorteringsgrunder som ska rekommenderas.', 'Läs tvättrådslappen.', 'Välj program och temperatur. TODO-KONTROLL: vanliga program och temperaturer.', 'Lägg i tvättmedel, stäng luckan, starta.'],
    mer: ['Program skiljer sig mellan maskiner. Bruksanvisningen gäller.', 'TODO-KONTROLL: vad centrifugering är och när lägre varvtal passar.'],
    kallor: ['Tillverkares bruksanvisningar för tvättmaskiner', 'Branschorganisation för tvätt- och textilvård'],
    relaterade: ['tvatt-tvattmedel', 'tvatt-symboler', 'tvatt-sortering'],
  },
  'tvatt-tvattmedel': {
    nu: ['Dosera efter förpackningen, vattnets hårdhet och hur smutsig tvätten är. TODO-KONTROLL: hur dosering avgörs.', 'Varför mer tvättmedel inte gör tvätten renare.'],
    mer: ['TODO-KONTROLL: vad överdosering gör med kläder, maskin och miljö.'],
    kallor: ['Tillverkares doseringsanvisningar', 'Myndighet för kemikalier'],
    relaterade: ['tvatt-maskinen', 'tvatt-lukt'],
  },
  'tvatt-symboler': {
    nu: ['De fem grupperna av symboler: tvätt, blekning, torktumling, strykning, kemtvätt.', 'TODO-KONTROLL: vad varje symbol betyder, enligt standard.'],
    mer: ['Quiz för att öva.'],
    kallor: ['Organisationen som förvaltar tvättrådssymbolerna'],
    relaterade: ['tvatt-maskinen', 'tvatt-sortering'],
  },
  'tvatt-sortering': {
    nu: ['Sortera efter färg, material och temperatur. TODO-KONTROLL: vilka grupper som rekommenderas.', 'Töm fickor och stäng blixtlås.'],
    mer: ['Nya plagg och plagg som färgar av sig.'],
    kallor: ['Branschorganisation för tvätt- och textilvård'],
    relaterade: ['tvatt-krympning-farg', 'tvatt-symboler'],
  },
  'tvatt-krympning-farg': {
    nu: ['Vilka material som brukar krympa. TODO-KONTROLL.', 'Vilka plagg som brukar färga av sig och hur man testar.'],
    mer: ['Vad man gör om något har färgats.'],
    kallor: ['Branschorganisation för tvätt- och textilvård'],
    relaterade: ['tvatt-sortering', 'tvatt-ull-dun'],
  },
  'tvatt-torktumlare': {
    nu: ['Rensa luddfiltret varje gång. TODO-KONTROLL: brandrisk och källa.', 'Kontrollera symbolen innan du torktumlar.'],
    mer: ['Vad som inte får torktumlas.'],
    kallor: ['Tillverkares bruksanvisningar', 'Myndighet för samhällsskydd och beredskap'],
    relaterade: ['tvatt-symboler', 'tvatt-hanga'],
    filter: { utrustning: ['torktumlare', 'tvattstuga'] },
  },
  'tvatt-hanga': {
    nu: ['Skaka ut och häng direkt efter tvätt.', 'Torkställning, torkrum och torkskåp.'],
    mer: ['Fukt inomhus när man torkar tvätt.'],
    kallor: [],
    relaterade: ['huset-vadring', 'tvatt-tvattstugan'],
  },
  'tvatt-tvattstugan': {
    nu: ['Ta reda på hur bokningen fungerar där du bor.', 'Läs ordningsreglerna i tvättstugan.', 'Kom i tid, töm maskinerna och städa efter dig.'],
    mer: ['Vad som brukar ingå i städningen. TODO-KONTROLL.'],
    kallor: ['Hyresvärdens eller föreningens egna regler'],
    relaterade: ['tvatt-maskinen', 'grannar-gemensamma-utrymmen'],
    filter: { utrustning: ['tvattstuga'] },
  },
  'tvatt-flackar': {
    nu: ['Agera snabbt och badda, gnid inte.', 'Fläck för fläck: rödvin, fett, blod, kaffe, gräs, deodorant. TODO-KONTROLL: metod för varje fläck.'],
    mer: ['Testa på en dold del först.', 'Blanda aldrig fläckmedel. Länk till rengöringsmedel.'],
    kallor: ['Branschorganisation för tvätt- och textilvård', 'Tillverkares anvisningar'],
    relaterade: ['stad-kemikalier'],
  },
  'tvatt-stryka': {
    nu: ['Läs strykningssymbolen och ställ in värmen. TODO-KONTROLL: vad prickarna betyder.', 'Ställ strykjärnet upprätt och dra ur sladden efteråt.'],
    mer: ['Ångstrykning och vatten i strykjärnet.'],
    kallor: ['Tillverkares bruksanvisningar', 'Organisationen som förvaltar tvättrådssymbolerna'],
    relaterade: ['tvatt-symboler'],
  },
  'tvatt-sy-knapp': {
    nu: ['Det du behöver: nål, tråd, sax.', 'Steg för steg.'],
    mer: [],
    kallor: [],
    relaterade: ['tvatt-laga-hal'],
  },
  'tvatt-laga-hal': {
    nu: ['Små hål i sömmar och i tyg.', 'Steg för steg.'],
    mer: ['När det är bättre att lämna till skräddare.'],
    kallor: [],
    relaterade: ['tvatt-sy-knapp'],
  },
  'tvatt-vika': {
    nu: ['Vika tröjor, byxor och handdukar.', 'Förvara så att det håller formen.'],
    mer: [],
    kallor: [],
    relaterade: ['tvatt-garderob'],
  },
  'tvatt-skor': {
    nu: ['Rengöring efter material: läder, tyg, gummi.', 'Torka skor rätt.'],
    mer: ['Impregnering. TODO-KONTROLL: hur och hur ofta.'],
    kallor: ['Tillverkares skötselråd'],
    relaterade: [],
  },
  'tvatt-ull-dun': {
    nu: ['Ull: program, medel och torkning. TODO-KONTROLL.', 'Dunjacka: tvätt och torkning. TODO-KONTROLL.'],
    mer: ['Läs alltid tvättrådslappen.'],
    kallor: ['Branschorganisation för tvätt- och textilvård', 'Tillverkares skötselråd'],
    relaterade: ['tvatt-krympning-farg', 'tvatt-symboler'],
  },
  'tvatt-lukt': {
    nu: ['Varför maskinen och tvätten luktar.', 'Rengör filter, fack och gummilist. TODO-KONTROLL: hur och hur ofta.'],
    mer: ['Låt luckan stå öppen efter tvätt.'],
    kallor: ['Tillverkares bruksanvisningar'],
    relaterade: ['tvatt-tvattmedel', 'tvatt-maskinen'],
  },
  'tvatt-sangklader': {
    nu: ['TODO-KONTROLL: hur ofta sängkläder och handdukar brukar tvättas, märks som riktlinje.', 'Vilken temperatur. TODO-KONTROLL.'],
    mer: [],
    kallor: ['Branschorganisation för tvätt- och textilvård'],
    relaterade: ['tvatt-pa-slakan', 'stad-madrass'],
  },
  'tvatt-pa-slakan': {
    nu: ['Vänd påslakanet ut och in, ta tag i hörnen inifrån, dra över täcket.', 'Bädda klart.'],
    mer: ['Figur som visar stegen.'],
    kallor: [],
    relaterade: ['tvatt-sangklader'],
  },
  'tvatt-garderob': {
    nu: ['Grundplagg som går att kombinera.', 'Förvara säsongskläder rent och torrt.'],
    mer: ['Skydd mot mal. Länk till klädesmal.'],
    kallor: [],
    relaterade: ['skadedjur-klademal', 'tvatt-vika'],
  },

  // 4. Mat: grundtekniker
  'mat-koka-pasta': {
    nu: ['Mycket vatten, salt, låt koka upp innan pastan läggs i.', 'TODO-KONTROLL: tid enligt förpackningen, hur man provar.'],
    mer: ['Spara lite kokvatten till såsen.'],
    kallor: ['Provlagning i projektet'],
    relaterade: ['recept-pasta-tomatsas'],
  },
  'mat-koka-ris': {
    nu: ['Två sätt: mätmetoden och kokning i mycket vatten. TODO-KONTROLL: proportioner och tider.'],
    mer: ['Länk till hur kokt ris förvaras säkert.'],
    kallor: ['Provlagning i projektet', LIVSMEDEL],
    relaterade: ['mat-ris-rester', 'recept-wok'],
  },
  'mat-koka-potatis': {
    nu: ['Lika stora bitar, kallt vatten, salt.', 'TODO-KONTROLL: tid och hur man känner att den är klar.'],
    mer: [],
    kallor: ['Provlagning i projektet'],
    relaterade: ['recept-potatis-varianter'],
  },
  'mat-koka-agg': {
    nu: ['Lös, krämig och hårdkokt. TODO-KONTROLL: tider.', 'Kyl i kallt vatten.'],
    mer: [],
    kallor: ['Provlagning i projektet', LIVSMEDEL],
    relaterade: ['recept-agg-varianter'],
  },
  'mat-steka': {
    nu: ['Varm panna innan fett och mat.', 'Rätt fett för rätt värme. TODO-KONTROLL.', 'Rör inte för tidigt.'],
    mer: ['Om det börjar brinna: länk till fettbrand.'],
    kallor: ['Provlagning i projektet', 'Myndighet för samhällsskydd och beredskap'],
    relaterade: ['akut-fettbrand', 'mat-induktion'],
  },
  'mat-ugn': {
    nu: ['Ugnens lägen: över- och undervärme, varmluft, grill. TODO-KONTROLL: vad de används till.', 'Sätt på ugnen i förväg.'],
    mer: ['Temperaturen kan skilja mellan ugnar.'],
    kallor: ['Tillverkares bruksanvisningar'],
    relaterade: ['mat-induktion', 'stad-ugn'],
  },
  'mat-skara-lok': {
    nu: ['Håll kniven rätt och böj in fingertopparna.', 'Steg för steg: halvera, skär, hacka.'],
    mer: ['Vass kniv är säkrare än slö. TODO-KONTROLL: källa.'],
    kallor: ['Provlagning i projektet'],
    relaterade: ['mat-knivar'],
  },
  'mat-sas': {
    nu: ['Grundsås: fett, mjöl, vätska. TODO-KONTROLL: proportioner.', 'Smaka av.'],
    mer: ['Om såsen blir klumpig.'],
    kallor: ['Provlagning i projektet'],
    relaterade: ['mat-krydda', 'mat-nar-det-blir-fel'],
  },
  'mat-krydda': {
    nu: ['Salt, syra, sötma och hetta.', 'Smaka av i slutet och lite i taget.'],
    mer: ['Kryddor att börja med.'],
    kallor: [],
    relaterade: ['mat-skafferi'],
  },
  'mat-matt': {
    nu: ['Vad dl, msk, tsk och krm betyder.', 'TODO-KONTROLL: omvandlingar mellan mått och gram.'],
    mer: [],
    kallor: [LIVSMEDEL],
    relaterade: [],
  },
  'mat-nar-det-blir-fel': {
    nu: ['För salt, bränt, för rinnigt, för torrt: vad man kan göra.'],
    mer: ['Bränd mat: släng det svarta.'],
    kallor: ['Provlagning i projektet'],
    relaterade: ['mat-sas', 'mat-krydda'],
  },

  // Grundrätter
  'recept-grot': recept('gröt', [], ['mat-matt']),
  'recept-agg-varianter': recept('kokt, stekt och äggröra', [], ['mat-koka-agg', 'recept-omelett']),
  'recept-omelett': recept('omelett', [], ['recept-agg-varianter']),
  'recept-pannkakor': recept('pannkakor', [], ['recept-ugnspannkaka']),
  'recept-mackor': recept('mackor och pålägg', [], []),
  'recept-pasta-tomatsas': recept('pasta med tomatsås', [], ['mat-koka-pasta']),
  'recept-kottfarssas': recept('köttfärssås', ['TODO-KONTROLL: hur man vet att färsen är genomstekt.'], ['mat-koka-pasta']),
  'recept-carbonara': recept('pasta carbonara', ['TODO-KONTROLL: hantering av ägg.'], ['mat-koka-pasta']),
  'recept-wok': recept('ris och wok', [], ['mat-koka-ris', 'mat-ris-rester']),
  'recept-kyckling-ugnsgronsaker': recept(
    'kyckling med ugnsrostade grönsaker',
    ['TODO-KONTROLL: innertemperatur för kyckling och hur man kontrollerar den, från ansvarig myndighet.', 'Hantera rå kyckling: länk till eget ämne.'],
    ['mat-ra-kyckling', 'mat-ugn'],
  ),
  'recept-ugnsbakad-lax': recept('ugnsbakad lax', ['TODO-KONTROLL: när fisken är klar.'], ['mat-ugn']),
  'recept-potatis-varianter': recept('kokt, ugnsbakad potatis och mos', [], ['mat-koka-potatis']),
  'recept-kottbullar': recept('köttbullar', ['TODO-KONTROLL: hur man vet att de är genomstekta.'], ['mat-steka']),
  'recept-korv-stroganoff': recept('korv stroganoff', [], ['mat-koka-ris']),
  'recept-pytt': recept('pytt i panna', [], ['mat-rester']),
  'recept-tacos': recept('tacos', [], []),
  'recept-linssoppa': recept('linssoppa', [], ['mat-vegetariskt']),
  'recept-gronsakssoppa': recept('grönsakssoppa', [], ['mat-matsvinn']),
  'recept-chili': recept('gryta eller chili', [], ['mat-frysen']),
  'recept-ugnspannkaka': recept('ugnspannkaka', [], ['recept-pannkakor']),
  'recept-pizza': recept('enkel pizza', [], ['mat-ugn']),
  'recept-gratang': recept('gratäng', [], ['mat-ugn']),
  'recept-sallad-vinagrett': recept('sallad med vinägrett', [], []),

  // Mat för olika behov
  'mat-vegetariskt': {
    nu: ['Enkla vegetariska rätter att börja med.', 'Protein från baljväxter, ägg och mejeri.'],
    mer: ['TODO-KONTROLL: inga näringsråd utan källa.'],
    kallor: [LIVSMEDEL],
    relaterade: ['recept-linssoppa'],
  },
  'mat-allergier': {
    nu: ['Appen ger inga råd om allergier eller specialkost.', 'Hänvisning till vården och till dietist via vården.'],
    mer: ['Vid svår allergisk reaktion: ring nödnumret. Numret visas i akutrutan och hämtas från den centrala filen.'],
    kallor: ['Vårdens information om allergi', LIVSMEDEL],
    relaterade: ['halsa-vardcentral', 'halsa-1177'],
    anteckning: 'Endast hänvisning till vården, inga råd.',
  },
  'mat-liten-budget': {
    nu: ['Billiga baslivsmedel.', 'Laga stort och frys.', 'Använd rester.'],
    mer: [],
    kallor: ['Myndighet för konsumentfrågor'],
    relaterade: ['pengar-matbudget', 'mat-matlador'],
  },

  // Matsäkerhet och förvaring
  'mat-kyltemperatur': {
    nu: ['TODO-KONTROLL: rekommenderad temperatur i kyl och frys, från ansvarig myndighet.', 'Kontrollera med termometer.'],
    mer: ['Varför temperaturen spelar roll.'],
    kallor: [LIVSMEDEL],
    relaterade: ['mat-kylens-hyllor', 'mat-frysen'],
  },
  'mat-kylens-hyllor': {
    nu: ['Var olika livsmedel ska ligga i kylen. TODO-KONTROLL: med källa.', 'Rått kött och fisk längst ned. TODO-KONTROLL: källa.'],
    mer: ['Figur: dra maten till rätt plats.'],
    kallor: [LIVSMEDEL],
    relaterade: ['mat-kyltemperatur'],
  },
  'mat-hallbarhet': {
    nu: ['Skillnaden mellan bäst före och sista förbrukningsdag. TODO-KONTROLL: exakt innebörd.', 'Titta, lukta, smaka: när det går och när det inte går. TODO-KONTROLL.'],
    mer: [],
    kallor: [LIVSMEDEL],
    relaterade: ['mat-matsvinn'],
  },
  'mat-upptining': {
    nu: ['Tina i kylen. TODO-KONTROLL: andra säkra sätt och tider.', 'Frys inte om det som har tinat. TODO-KONTROLL: när det gäller.'],
    mer: [],
    kallor: [LIVSMEDEL],
    relaterade: ['mat-frysen'],
  },
  'mat-ra-kyckling': {
    nu: ['Egen skärbräda och tvätta händer och redskap efter.', 'Skölj inte kycklingen. TODO-KONTROLL: källa.', 'TODO-KONTROLL: när kycklingen är genomstekt.'],
    mer: [],
    kallor: [LIVSMEDEL],
    relaterade: ['recept-kyckling-ugnsgronsaker', 'mat-upptining'],
  },
  'mat-ris-rester': {
    nu: ['TODO-KONTROLL: hur kokt ris ska kylas och hur länge det håller, från ansvarig myndighet.'],
    mer: ['Varför kokt ris kräver extra försiktighet. TODO-KONTROLL.'],
    kallor: [LIVSMEDEL],
    relaterade: ['mat-koka-ris', 'mat-rester'],
  },
  'mat-rester': {
    nu: ['Kyl snabbt i flata förpackningar. TODO-KONTROLL: hur snabbt.', 'TODO-KONTROLL: hur länge rester håller i kylen.', 'Värm ordentligt. TODO-KONTROLL: temperatur.'],
    mer: [],
    kallor: [LIVSMEDEL],
    relaterade: ['mat-matlador', 'mat-frysen'],
  },
  'mat-frysen': {
    nu: ['Vad som går att frysa och vad som blir dåligt.', 'TODO-KONTROLL: hur länge olika livsmedel håller i frysen.', 'Märk med datum.'],
    mer: [],
    kallor: [LIVSMEDEL],
    relaterade: ['mat-upptining', 'mat-avfrostning'],
  },
  'mat-avfrostning': {
    nu: ['När frysen behöver frostas av.', 'Steg för steg. TODO-KONTROLL: enligt tillverkarens anvisning.'],
    mer: ['Hacka aldrig bort is med vassa föremål. TODO-KONTROLL: källa.'],
    kallor: ['Tillverkares bruksanvisningar'],
    relaterade: ['mat-frysen', 'stad-kyl'],
  },

  // Planering och kök
  'mat-veckomeny': {
    nu: ['Planera några middagar i taget.', 'Återanvänd ingredienser mellan rätterna.'],
    mer: [],
    kallor: [],
    relaterade: ['mat-inkopslista', 'pengar-matbudget'],
  },
  'mat-inkopslista': {
    nu: ['Kolla vad som finns hemma först.', 'Skriv listan efter butikens ordning.'],
    mer: [],
    kallor: [],
    relaterade: ['mat-veckomeny', 'pengar-jamforpris'],
  },
  'mat-matlador': {
    nu: ['Laga större satser och dela upp.', 'Kyl och förvara rätt: länk till rester.'],
    mer: ['Lådor som tål mikro.'],
    kallor: [LIVSMEDEL],
    relaterade: ['mat-rester', 'mat-mikro'],
  },
  'mat-matsvinn': {
    nu: ['Förvara rätt, planera, använd rester.'],
    mer: ['Bäst före är inte samma sak som dåligt.'],
    kallor: [LIVSMEDEL],
    relaterade: ['mat-hallbarhet', 'mat-rester'],
  },
  'mat-skafferi': {
    nu: ['Basvaror som räcker länge: pasta, ris, konserver, kryddor, olja.'],
    mer: ['Förvara torrt och tätt. Länk till matmal.'],
    kallor: [],
    relaterade: ['skadedjur-matmal', 'mat-krydda'],
  },
  'mat-koksredskap': {
    nu: ['Det du behöver först och det som kan vänta.'],
    mer: [],
    kallor: [],
    relaterade: ['flytt-kop-forst-koket'],
  },
  'mat-knivar': {
    nu: ['Vilka knivar som räcker.', 'Skärpa och förvaring. Diska för hand. TODO-KONTROLL: källa.'],
    mer: [],
    kallor: ['Tillverkares skötselråd'],
    relaterade: ['mat-skara-lok'],
  },
  'mat-induktion': {
    nu: ['Hur du ser om en kastrull fungerar på induktion. TODO-KONTROLL: magnettestet.', 'Hur hällen reagerar och vad symbolerna betyder.'],
    mer: [],
    kallor: ['Tillverkares bruksanvisningar'],
    relaterade: ['mat-ugn'],
    filter: { utrustning: ['induktion'] },
  },
  'mat-mikro': {
    nu: ['Det som aldrig får in i mikron: metall, slutna förpackningar, ägg i skal. TODO-KONTROLL: lista med källa.', 'Rör om och låt stå.'],
    mer: [],
    kallor: ['Tillverkares bruksanvisningar', LIVSMEDEL],
    relaterade: ['stad-mikro', 'mat-matlador'],
  },
  'mat-diska-for-hand': {
    nu: ['Ordning: glas, bestick, porslin, kastruller.', 'Varmt vatten och lite diskmedel.'],
    mer: ['Torka och ställ undan.'],
    kallor: [],
    relaterade: ['stad-kok'],
  },
  'mat-gaster': {
    nu: ['Välj rätter som går att förbereda.', 'Fråga om allergier. Länk till allergier.'],
    mer: ['Räkna portioner.'],
    kallor: [],
    relaterade: ['vardag-bjuda-hem', 'mat-allergier'],
  },
};
