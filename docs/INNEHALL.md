# Innehållskatalog

Alla ämnen som ska finnas i appen. I fas 2 skapas en innehållsfil för varje rad. Inget får utelämnas. Risknivå och nivå är förslag som kan justeras vid granskning.

## Förklaring

Varje ämne anges som: `id` Titel. Därefter koder:

- **Risk:** `L` låg, `M` medel, `H` hög
- **Nivå:** `V1` behövs vecka 1, `ÅR` behövs inom första året, `BRA` bra att veta
- **Flaggor:** `R` regelberoende (måste källbeläggas, dateras och kontrolleras), `K` varierar per kommun, `A` akut (offline, nås från "Vad gör jag när...")
- **Figur:** `fig:<id>` om ämnet har en interaktiv figur

Utkastet till filnamn är `innehall/<kategori>/<id>.md`.

---

## 1. Hitta bostad och flytta (`bostad`)

- `bostad-sokande` Hur bostadssökande fungerar: bostadsköer, hyresrätt, andrahand, bostadsrätt, inneboende, studentboende. M, V1, R, K
- `bostad-bluffar` Bluffannonser och förskottsbedrägerier vid bostadsjakt, varningstecken. M, V1, R
- `bostad-kontrakt` Vad som ska stå i ett hyreskontrakt, förstahand mot andrahand. M, V1, R
- `bostad-andrahand` Hyra i andra hand: godkännande, skälig hyra, risker. M, V1, R
- `bostad-deposition` Deposition och förskottshyra. M, V1, R
- `bostad-uppsagning` Uppsägningstid och hur man säger upp. M, ÅR, R
- `bostad-besiktning` In- och utflyttningsbesiktning, dokumentera skador med foton. L, V1
- `bostad-flyttanmalan` Flyttanmälan, folkbokföring, adressändring, eftersändning. M, V1, R
- `bostad-folkbokforing-studenter` Var studenter ska vara folkbokförda. M, V1, R
- `bostad-hemforsakring` Hemförsäkring: vad den täcker, självrisk, varför den behövs. M, V1, R
- `bostad-foraldrarnas-forsakring` Omfattas man fortfarande av föräldrarnas hemförsäkring, och när slutar den gälla. M, V1, R
- `bostad-vad-ingar-i-hyran` Vad hyran innehåller: värme, vatten, el, internet, parkering. L, V1
- `bostad-nycklar` Nycklar, reservnyckel, låsbyte, borttappad nyckel. L, V1, A
- `bostad-felanmalan` Felanmälan till hyresvärden: hur man skriver den, vad som är hyresvärdens ansvar, uppföljning. M, V1, R
- `bostad-sen-hyra` Om hyran betalas för sent, och risken att förlora kontraktet. H, V1, R
- `bostad-ordningsregler` Ordningsregler och trivselregler. L, V1
- `flytt-checklista-fore` Checklista före flytten. L, V1
- `flytt-flyttdagen` Flyttdagen: flyttkartonger, packning, bära tungt, hyra flyttbil eller släp. M, V1, R
- `flytt-flyttstadning` Flyttstädning: vad som förväntas. L, ÅR
- `flytt-forsta-veckan` Checklista första veckan. L, V1
- `flytt-forsta-manaden` Checklista första månaden. L, V1
- `flytt-forsta-aret` Checklista första året. L, ÅR
- `flytt-kop-forst-koket` Köplista första köket. L, V1
- `flytt-kop-forst-badrum` Köplista första badrummet. L, V1
- `flytt-kop-forst-verktyg` Köplista första verktygslådan. L, V1
- `flytt-forsta-natten` Vad man ska ha med sig första natten. L, V1

## 2. Pengar (`pengar`)

Regel: förklara, rekommendera aldrig produkter eller placeringar.

- `pengar-vad-kostar-det` Vad det kostar att bo själv: fasta och rörliga kostnader. M, V1, R. fig:budget
- `pengar-budget` Göra en budget och följa upp den. L, V1. fig:budget
- `pengar-bankkonto` Bankkonto och bankkort. M, V1, R
- `pengar-bankid` BankID och e-legitimation. M, V1, R
- `pengar-swish` Swish och andra betalsätt. L, V1
- `pengar-autogiro-efaktura` Autogiro och e-faktura. L, V1
- `pengar-lasa-faktura` Läsa en faktura: förfallodatum, OCR, belopp. L, V1. fig:faktura
- `pengar-sparra-kort` Spärra kort vid förlust eller bedrägeri. M, V1, R, A
- `pengar-lonespec` Lönespecifikation: brutto, netto, skatt. L, ÅR
- `pengar-skatt` Skatt och preliminärskatt i grunden. M, ÅR, R
- `pengar-deklaration` Deklaration: vad, när och hur. M, ÅR, R
- `pengar-csn` Studiemedel i grunden. M, V1, R
- `pengar-bostadsbidrag` Bostadsbidrag i grunden. M, V1, R
- `pengar-a-kassa` A-kassa i grunden. M, ÅR, R
- `pengar-kreditkort` Kreditkort och hur ränta fungerar. M, ÅR, R
- `pengar-kop-nu-betala-senare` Köp nu, betala senare och delbetalning: risker. M, V1, R
- `pengar-paminnelse-inkasso` Påminnelseavgift, inkasso och Kronofogden: vad som händer i vilken ordning. H, ÅR, R
- `pengar-kreditupplysning` Kreditupplysning och betalningsanmärkning. M, ÅR, R
- `pengar-skuldhjalp` Var man får hjälp med skulder. H, ÅR, R, K
- `pengar-prenumerationer` Prenumerationer som tyst äter pengar, hur man hittar och säger upp dem. L, V1
- `pengar-buffert` Buffert och sparande: grundbegrepp. L, ÅR
- `pengar-sparbegrepp` Sparkonto, fonder, ISK: vad orden betyder, utan rekommendationer. M, BRA, R
- `pengar-jamforpris` Handla smart: jämförpris, erbjudanden, impulsköp. L, V1
- `pengar-matbudget` Mat på liten budget. L, V1
- `pengar-begagnat` Köpa begagnat: var, hur, vad man ska kontrollera. L, V1
- `pengar-reklamation` Reklamation, ångerrätt, garanti, kvitton. M, ÅR, R
- `pengar-dokument` Vilka dokument och kvitton man ska spara och hur länge. M, ÅR, R
- `pengar-bedragerier` Bedrägerier: nätfiske, falska sms, falska samtal, falska bankmän. H, V1, R, A

## 3. Tvätt och kläder (`tvatt`)

- `tvatt-maskinen` Tvättmaskinen: program, temperaturer, centrifugering. L, V1. fig:tvattmaskin
- `tvatt-tvattmedel` Mängd tvättmedel och varför överdosering är dåligt. L, V1. fig:tvattmaskin
- `tvatt-symboler` Tvättsymboler. L, V1. fig:tvattsymboler-quiz
- `tvatt-sortering` Sortera tvätten: färg, material, temperatur. L, V1
- `tvatt-krympning-farg` Vad som krymper och vad som färgar av sig. L, V1
- `tvatt-torktumlare` Torktumlare och luddfilter. M, V1
- `tvatt-hanga` Hänga tvätt, torkställning, torkrum, torkskåp. L, V1
- `tvatt-tvattstugan` Tvättstugan: bokning, regler, etikett, städning efter sig. L, V1, K
- `tvatt-flackar` Fläckborttagning: rödvin, fett, blod, kaffe, gräs, deodorant. L, ÅR
- `tvatt-stryka` Stryka och använda strykjärn säkert. M, BRA
- `tvatt-sy-knapp` Sy i en knapp. L, BRA
- `tvatt-laga-hal` Laga ett litet hål. L, BRA
- `tvatt-vika` Vika och förvara tvätt. L, BRA
- `tvatt-skor` Skötsel av skor. L, BRA
- `tvatt-ull-dun` Tvätta ull och dunjacka. L, BRA
- `tvatt-lukt` Lukt i maskinen och i kläderna, rengöra tvättmaskinen. L, ÅR
- `tvatt-sangklader` Sängkläder och handdukar: hur ofta de tvättas. L, V1
- `tvatt-pa-slakan` Dra på ett påslakan och bädda. L, V1. fig:paslakan
- `tvatt-garderob` Grundgarderob och säsongsförvaring. L, BRA

## 4. Mat (`mat`)

### Grundtekniker
- `mat-koka-pasta` Koka pasta. L, V1
- `mat-koka-ris` Koka ris. L, V1
- `mat-koka-potatis` Koka potatis. L, V1
- `mat-koka-agg` Koka ägg. L, V1
- `mat-steka` Steka utan att bränna: värme, fett, panna. M, V1
- `mat-ugn` Ugnstemperaturer och ugnens funktioner. M, V1. fig:spis
- `mat-skara-lok` Skära lök och använda kniv säkert. M, V1
- `mat-sas` Göra en enkel sås. L, ÅR
- `mat-krydda` Krydda och smaka av. L, V1
- `mat-matt` Mått och omvandlingar: dl, msk, tsk, gram. L, V1
- `mat-nar-det-blir-fel` När maten blir fel: för salt, bränd, för rinnig, för torr. L, ÅR

### Grundrätter, frukost
- `recept-grot` Gröt. L, V1
- `recept-agg-varianter` Ägg: kokt, stekt, äggröra. L, V1
- `recept-omelett` Omelett. L, V1
- `recept-pannkakor` Pannkakor. L, ÅR
- `recept-mackor` Mackor och smörgåspålägg. L, V1

### Grundrätter, middag
- `recept-pasta-tomatsas` Pasta med tomatsås. L, V1
- `recept-kottfarssas` Köttfärssås. M, V1
- `recept-carbonara` Pasta carbonara. M, ÅR
- `recept-wok` Ris och wok. L, V1
- `recept-kyckling-ugnsgronsaker` Kyckling med ugnsrostade grönsaker. H, V1
- `recept-ugnsbakad-lax` Ugnsbakad lax. M, ÅR
- `recept-potatis-varianter` Potatis: kokt, ugnsbakad, mos. L, V1
- `recept-kottbullar` Köttbullar. M, ÅR
- `recept-korv-stroganoff` Korv stroganoff. L, V1
- `recept-pytt` Pytt i panna. L, V1
- `recept-tacos` Tacos. L, V1
- `recept-linssoppa` Linssoppa. L, ÅR
- `recept-gronsakssoppa` Grönsakssoppa. L, ÅR
- `recept-chili` Gryta eller chili. L, ÅR
- `recept-ugnspannkaka` Ugnspannkaka. L, ÅR
- `recept-pizza` Enkel pizza. L, BRA
- `recept-gratang` Gratäng. L, BRA
- `recept-sallad-vinagrett` Sallad med vinägrett. L, V1

### Mat för olika behov
- `mat-vegetariskt` Vegetariska grundrätter. L, ÅR
- `mat-allergier` Allergier och specialkost: endast hänvisning till vården, inga råd. H, BRA
- `mat-liten-budget` Mat på riktigt liten budget. L, V1

### Matsäkerhet och förvaring
- `mat-kyltemperatur` Rätt temperatur i kyl och frys. H, V1, R. fig:kyl
- `mat-kylens-hyllor` Vad som ska förvaras var i kylen. M, V1. fig:kyl
- `mat-hallbarhet` Bäst före mot sista förbrukningsdag. H, V1, R
- `mat-upptining` Tina mat säkert. H, V1, R
- `mat-ra-kyckling` Hantera rå kyckling och kött. H, V1, R
- `mat-ris-rester` Kokt ris och rester: hur länge och hur. H, V1, R
- `mat-rester` Rester och matlådor: kyla ner, förvara, värma. H, V1, R
- `mat-frysen` Frysa mat: vad som går och hur länge. M, ÅR, R. fig:kyl
- `mat-avfrostning` Frosta av frysen. L, BRA. fig:kyl

### Planering och kök
- `mat-veckomeny` Planera veckomeny. L, ÅR
- `mat-inkopslista` Inköpslista och handla. L, V1
- `mat-matlador` Packa och planera matlådor. L, V1
- `mat-matsvinn` Undvika matsvinn. L, ÅR
- `mat-skafferi` Skafferiets grundutrustning. L, V1
- `mat-koksredskap` Köksredskap att köpa först. L, V1
- `mat-knivar` Knivar och knivvård. M, ÅR
- `mat-induktion` Induktion och vilka kastruller som fungerar. L, V1. fig:spis
- `mat-mikro` Mikrovågsugn: vad som får och inte får in. M, V1
- `mat-diska-for-hand` Diska för hand. L, V1
- `mat-gaster` Laga mat till gäster och till flera personer. L, BRA

## 5. Städning och skötsel (`stad`)

- `stad-schema` Städschema med frekvens per uppgift. Ingen officiell standard; märks som riktlinjer. L, V1. fig:stadschema
- `stad-dammsuga` Dammsuga. L, V1
- `stad-dammsugaren` Dammsugaren: tömma, byta påse och filter. L, ÅR. fig:dammsugare
- `stad-moppa` Moppa och golvvård: parkett, klinker, plastmatta, vad man inte får använda. M, V1
- `stad-damma` Damma. L, V1
- `stad-badrum` Badrum: toalett, handfat, dusch, kalk, fogar. M, V1
- `stad-mogel` Mögel i badrum och vid fönster. H, ÅR
- `stad-golvbrunn` Rensa golvbrunn. L, ÅR. fig:vattenlas
- `stad-kok` Kök: bänkar, spis, diskho. L, V1
- `stad-kyl` Rengöra kylen. L, ÅR. fig:kyl
- `stad-ugn` Rengöra ugnen. M, ÅR
- `stad-spisflakt` Rengöra spisfläkt och fettfilter. M, ÅR
- `stad-mikro` Rengöra mikrovågsugnen. L, ÅR
- `stad-diskmaskin` Diskmaskinen: vad som får in, symboler, salt, sköljmedel, filter. L, V1. fig:diskmaskin
- `stad-fonster` Putsa fönster. M, BRA
- `stad-madrass` Madrass, täcke och kuddar. L, BRA
- `stad-soffa-matta` Rengöra soffa och matta. L, BRA
- `stad-lukt-avlopp` Lukt i avlopp och vattenlås. L, ÅR. fig:vattenlas
- `stad-lukt-kyl` Lukt i kylen. L, ÅR
- `stad-kemikalier` Rengöringsmedel: vad som används till vad, och vilka som aldrig får blandas. H, V1, R
- `stad-efter-fest` Städa efter fest. L, BRA
- `stad-infor-besiktning` Städa inför utflyttningsbesiktning. L, ÅR

## 6. Skadedjur och småkryp (`skadedjur`)

Regel: inga råd om bekämpningsmedel utöver det som är tillåtet för privatpersoner och verifierat. Hänvisa till hyresvärden.

- `skadedjur-blomflugor` Blomflugor (sorgmyggor) i krukväxter. L, ÅR
- `skadedjur-bananflugor` Bananflugor. L, ÅR
- `skadedjur-matmal` Matmal, mjölbaggar och andra skadedjur i skafferiet. M, ÅR
- `skadedjur-silverfisk` Silverfisk. L, BRA
- `skadedjur-myror` Myror. M, BRA
- `skadedjur-klademal` Klädesmal. M, BRA
- `skadedjur-vagglos` Vägglöss: tecken och vad man gör. H, BRA, R
- `skadedjur-loppor` Loppor. M, BRA
- `skadedjur-moss-rattor` Möss och råttor. H, BRA
- `skadedjur-kackerlackor` Kackerlackor. H, BRA
- `skadedjur-getingar` Getingar och getingbon. H, BRA
- `skadedjur-fastingar` Fästingar. H, BRA, R
- `skadedjur-vem-ansvarar` Vem ansvarar: hyresgäst eller hyresvärd. M, ÅR, R

## 7. Fixa, laga och montera (`fixa`)

- `fixa-verktyg` Grundverktygen och vad de används till. L, V1
- `fixa-tavla` Sätta upp en tavla: väggtyper, plugg, vattenpass. M, V1. fig:tavla
- `fixa-vaggtyper` Känna igen väggtyper: gips, betong, trä. M, V1. fig:tavla
- `fixa-borra` Borra säkert, och se upp för ledningar i väggen. H, ÅR
- `fixa-hyresgast-regler` Vad hyresgästen får göra: borra, spika, måla, tapetsera. M, V1, R
- `fixa-ikea` Montera möbler så att de håller, och fästa höga möbler i väggen. M, V1
- `fixa-lampa` Byta lampa och välja rätt lampa. M, V1
- `fixa-propp-jordfelsbrytare` Byta propp och återställa jordfelsbrytare. H, V1, R, A. fig:elskap
- `fixa-el-granser` Vad man inte får göra själv med el. H, V1, R
- `fixa-silikon` Täta med silikon. L, BRA
- `fixa-drag` Dragiga fönster och tätningslist. L, ÅR
- `fixa-stopp-vask` Stopp i vasken. M, V1, A. fig:vattenlas
- `fixa-stopp-dusch` Stopp i duschen. M, ÅR. fig:vattenlas
- `fixa-stopp-toalett` Stopp i toaletten. M, V1, A. fig:cistern
- `fixa-rinnande-toalett` Toaletten rinner hela tiden. L, ÅR. fig:cistern
- `fixa-droppande-kran` Droppande kran: felanmälan eller enkel åtgärd. L, ÅR
- `fixa-spackla` Spackla ett hål. L, ÅR
- `fixa-mala` Måla en vägg. L, BRA
- `fixa-gardiner-hyllor` Hänga gardiner och hyllor. M, ÅR
- `fixa-utan-att-borra` Fästa saker utan att skada väggen. L, V1

## 8. Huset: el, vatten, värme och luft (`huset`)

- `huset-elskap` Elskåpet: säkringar och jordfelsbrytare, vad de gör. H, V1, R. fig:elskap
- `huset-elavtal` Elavtal: rörligt mot fast pris, hur man jämför. M, V1, R
- `huset-mata-el` Läsa av elmätaren och förstå elräkningen. L, ÅR, R
- `huset-spara-el` Sänka elräkningen. L, ÅR
- `huset-huvudkran` Huvudkranen: var den sitter och när den stängs. H, V1, A. fig:huvudkran
- `huset-element` Element och termostat. L, V1
- `huset-ventilation` Ventilation och ventiler: varför de inte ska sättas igen. M, V1
- `huset-vadring` Vädring, kondens och luftfuktighet. M, ÅR
- `huset-brandvarnare` Brandvarnaren: testa, byta batteri, vad pipen betyder. H, V1, R, A. fig:brandvarnare
- `huset-router` Routern: placering, wifi, starta om. L, V1
- `huset-bredband` Bredband och bindningstid. M, V1, R
- `huset-gas` Gasspis och gaslukt. H, V1, R, A

## 9. Säkerhet och akuta lägen (`akut`)

- `akut-nummer` Viktiga nummer: 112, sjukvårdsrådgivning, polisens icke-akuta nummer, giftinformation. H, V1, R, A
- `akut-brand` Det brinner: vad man gör. H, V1, R, A
- `akut-fettbrand` Fettbrand: vad man gör och aldrig gör. H, V1, R, A
- `akut-brandfilt-slackare` Brandfilt och brandsläckare. H, V1, R
- `akut-litiumbatterier` Laddning av elsparkcykel, mobil och powerbank: brandrisk. H, V1, R
- `akut-levande-ljus` Levande ljus och brandsäkerhet. H, V1
- `akut-vattenlacka` Vattenläcka. H, V1, A. fig:huvudkran
- `akut-stromavbrott` Strömavbrott. M, V1, A. fig:elskap
- `akut-kolmonoxid` Kolmonoxid: tecken och vad man gör. H, BRA, R, A
- `akut-forgiftning` Förgiftning: vad man gör. H, V1, R, A
- `akut-forbandslada` Förbandslåda: vad den ska innehålla. M, V1, R
- `akut-forsta-hjalpen` Första hjälpen i grunden, med hänvisning till kurs. H, ÅR, R
- `akut-inbrott` Inbrott: vad man gör. M, BRA, R, A
- `akut-utelast` Utelåst. L, V1, A
- `akut-gaslukt` Det luktar gas. H, V1, R, A

## 10. Hälsa och mående (`halsa`)

Regel: inga diagnoser, inga doser. Hänvisning till vården.

- `halsa-vardcentral` Vårdcentral och hur man listar sig. M, V1, R, K
- `halsa-1177` 1177: vad det är och när man använder det. M, V1, R
- `halsa-tandvard` Tandvård och kostnader. M, ÅR, R
- `halsa-apotek-recept` Apotek, recept och receptförnyelse. M, ÅR, R
- `halsa-ungdomsmottagning` Ungdomsmottagning: vad de hjälper till med och vem som kan gå dit. M, V1, R, K
- `halsa-preventivmedel` Preventivmedel: var man får råd. M, ÅR, R
- `halsa-hemapotek` Vad man kan ha hemma, med hänvisning till apotek för råd. H, V1, R
- `halsa-sjuk-och-ensam` Sjuk och ensam: förbereda sig, när man söker vård. H, V1, R
- `halsa-somn` Sömn och rutiner. L, ÅR
- `halsa-hemlangtan` Hemlängtan och ensamhet den första tiden. M, V1
- `halsa-ma-daligt` När man mår dåligt: var man får hjälp. H, V1, R, A
- `halsa-alkohol-fest` Alkohol och fest. M, ÅR, R
- `halsa-rorelse-mat` Rörelse och mat i vardagen, utan dieträd. L, BRA

## 11. Grannar och samboende (`grannar`)

- `grannar-ljud` Ljud och tystnadstider. L, V1
- `grannar-prata` Prata med grannar och klaga på rätt sätt. L, ÅR
- `grannar-storning` Om man själv anklagas för att störa: vad som kan hända. M, ÅR, R
- `grannar-boendeformer` Hyresrätt, bostadsrätt, andrahand, studentboende: vad skillnaden betyder i vardagen. M, V1, R
- `grannar-bo-ihop` Bo ihop med kompisar: hushållsregler, delad ekonomi, städschema. L, V1
- `grannar-gaster` Gäster och övernattning. L, ÅR, R
- `grannar-husdjur` Husdjur: regler i kontraktet och vad det kostar. M, BRA, R
- `grannar-gemensamma-utrymmen` Grovsoprum, cykelförråd, källare, parkering. L, V1, K

## 12. Sopor och miljö (`sopor`)

- `sopor-kallsortering` Källsortering: vad som hör var. L, V1, R, K. fig:kallsortering-quiz
- `sopor-pant` Pant. L, V1, R
- `sopor-farligt-avfall` Farligt avfall: batterier, lampor, kemikalier. M, ÅR, R, K
- `sopor-elavfall` Elavfall. L, ÅR, R, K
- `sopor-grovsopor` Grovsopor och återvinningscentral. L, ÅR, R, K
- `sopor-matavfall` Matavfall och kompost. L, V1, R, K
- `sopor-mindre-avfall` Mindre plast och mindre svinn. L, BRA

## 13. Inredning och trivsel (`inredning`)

- `inredning-mobler` Möblera ett litet rum. L, V1
- `inredning-belysning` Belysning. L, ÅR
- `inredning-grundmobler` Grundmöbler och vad man kan vänta med. L, V1
- `inredning-forvaring` Förvaring i små ytor. L, ÅR
- `inredning-vaxter` Lättskötta växter och vattning. L, BRA
- `inredning-hemtrevligt` Göra hemmet hemtrevligt billigt. L, BRA

## 14. Arbete, studier och myndigheter (`myndigheter`)

- `myndigheter-anstallningsavtal` Anställningsavtal: vad man ska kontrollera. M, ÅR, R
- `myndigheter-semester` Semester och ledighet i grunden. M, ÅR, R
- `myndigheter-sjukanmalan` Sjukanmälan och sjuklön i grunden. M, ÅR, R
- `myndigheter-forsakringskassan` Försäkringskassan: vad den gör. M, ÅR, R
- `myndigheter-facket` Fackförbund och a-kassa: skillnaden. M, ÅR, R
- `myndigheter-mina-sidor` Mina sidor hos myndigheterna och digital brevlåda. L, V1, R
- `myndigheter-konsumentratt` Var man får hjälp som konsument. M, ÅR, R
- `myndigheter-val` Rösta och folkbokföringens betydelse för det. M, BRA, R

## 15. Digitalt (`digitalt`)

- `digitalt-losenord` Lösenord och lösenordshanterare. M, V1
- `digitalt-tvastegs` Tvåstegsverifiering. M, V1
- `digitalt-mobilabonnemang` Mobilabonnemang och bindningstid. L, V1, R
- `digitalt-backup` Backup av bilder och dokument. L, ÅR
- `digitalt-dela-konton` Dela konton och prenumerationer med andra. L, BRA

## 16. Transport (`transport`)

- `transport-cykel` Cykel: punktering, kedja, bromsar, lås, belysning. M, ÅR. fig:cykel
- `transport-kollektivt` Kollektivtrafik och periodkort. L, V1, R, K
- `transport-korkort` Körkort i grunden. M, BRA, R
- `transport-bil` Bil: besiktning, skatt, försäkring, däckbyte, service. M, BRA, R
- `transport-elsparkcykel` Elsparkcykel: regler och säkerhet. M, ÅR, R

## 17. Vardagsrutiner och socialt (`vardag`)

- `vardag-veckorutin` Veckorutin för tvätt, städning, inköp och matlagning. L, V1. fig:stadschema
- `vardag-post` Hantera post och räkningar. L, V1
- `vardag-bjuda-hem` Bjuda hem och enkel middag. L, BRA
- `vardag-fest` Ha fest utan problem med grannar och hyresvärd. M, BRA
- `vardag-bra-granne` Vara en bra granne och rumskamrat. L, ÅR

## 18. Årshjul (`arshjul`)

- `arshjul-host` Höst: ventilation, vinterkläder, däck. L, ÅR
- `arshjul-vinter` Vinter: halka, dragiga fönster, torr luft. L, ÅR
- `arshjul-var-sommar` Vår och sommar: vädring, fönsterputs, värme inomhus. L, ÅR
- `arshjul-aterkommande` Återkommande: brandvarnarbatteri, deklaration, elavtal, försäkringsförnyelse. M, ÅR, R

## 19. Vad gör jag när... (`nar`)

Startsidans första ingång. Varje fråga är ett beslutsträd (fig:beslutstrad) som pekar vidare till rätt ämnen. Alla är `A` och fungerar offline.

- `nar-det-brinner` Det brinner eller ryker. H, V1, A
- `nar-det-luktar-gas` Det luktar gas. H, V1, A
- `nar-vatten-lacker` Det droppar från taket eller läcker vatten. H, V1, A
- `nar-stromlost` Strömmen har gått. M, V1, A
- `nar-utelast` Jag har låst mig ute. L, V1, A
- `nar-stopp` Det är stopp i avloppet eller toaletten. M, V1, A
- `nar-rakning-utan-pengar` Räkningen kom och jag har inte pengar. H, V1, A
- `nar-bedragen` Jag tror att jag har blivit lurad. H, V1, A
- `nar-tappat-kort` Jag har tappat kortet eller mobilen. M, V1, A
- `nar-sjuk` Jag är sjuk och har ingenting hemma. H, V1, A
- `nar-mar-daligt` Jag mår dåligt. H, V1, A
- `nar-luktar-konstigt` Det luktar konstigt. M, V1, A
- `nar-flugor` Det är fullt med flugor. L, ÅR, A
- `nar-granne-bullrar` Grannen bullrar. L, ÅR, A
- `nar-brandvarnare-piper` Brandvarnaren piper. H, V1, A
- `nar-forgiftning` Någon har fått i sig något farligt. H, V1, A
- `nar-inbrott` Det har varit inbrott. M, BRA, A

---

## Funktioner som inte är ämnen

- **Onboarding:** boendeform, utrustning, kommun, språk. Filtrerar innehållet. Kan hoppas över.
- **Föräldraläge:** delbar checklista att gå igenom tillsammans före flytten, byggd av `flytt-*`, `pengar-*` och `bostad-*` med nivå V1.
- **Sök:** över alla ämnen, även offline för akutinnehåll.
- **Sparade ämnen och recept:** lokalt.
- **Avbockning:** checklistor och städschema, lokalt.
- **Kalkylatorer:** budget, mängd tvättmedel, portionsstorlek. Alla siffror i kalkylatorerna kräver källa.
- **Quiz:** tvättsymboler, källsortering, hållbarhet.
- **Rapportera fel** på varje ämnessida.
- **Radera mina uppgifter** i inställningar.
- **Senare:** lättläst version, engelska, pushpåminnelser (kräver att appen läggs på hemskärmen på iPhone), platsberoende kommuninformation.

## Figurer

Byggordning. Nr 1 är testfiguren i fas 0. Stanna efter nr 3 för granskning.

1. `tvattmaskin` Tvättmaskinen: ratt, program, temperatur, tvättmedelsfack, genomskärning av trumman.
2. `brandvarnare` Brandvarnaren: testknapp, batteri, olika pip.
3. `elskap` Elskåpet: säkringar, jordfelsbrytare, vad som händer vid överbelastning.
4. `kyl` Kyl och frys: hyllor, temperaturzoner, dra mat till rätt plats, avfrostning.
5. `vattenlas` Vattenlåset: genomskärning, varför det luktar, hur man rensar.
6. `cistern` Toalettens cistern: genomskärning, varför den rinner.
7. `huvudkran` Huvudkranen och var vatten kan stängas av.
8. `diskmaskin` Diskmaskinen: placering av disk, fack, symboler, filter.
9. `spis` Spis, ugn och induktion: rätt kastrull, ugnens funktioner.
10. `dammsugare` Dammsugaren: påse, filter, munstycken.
11. `tavla` Väggen i genomskärning: gips, betong, trä, rätt plugg.
12. `paslakan` Påslakanet: steg för steg.
13. `cykel` Cykeln: däck, kedja, bromsar.
14. `faktura` Fakturan: förfallodatum, OCR, belopp, vad som händer om den inte betalas.
15. `budget` Budgetkalkylator.
16. `stadschema` Städschema att bocka av.
17. `tvattsymboler-quiz` Tvättsymboler som quiz.
18. `kallsortering-quiz` Källsortering som quiz.
19. `beslutstrad` Beslutsträd för "Vad gör jag när...".
