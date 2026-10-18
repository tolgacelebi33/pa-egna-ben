# Rapport fas 2: innehållsstubbar för alla ämnen

Datum: 2026-10-18.

## Gjort

- **En innehållsfil för vart och ett av de 290 ämnena** i `docs/INNEHALL.md`, i `innehall/<kategori>/<id>.md`. Inget ämne är utelämnat.
- **Komplett frontmatter enligt schemat:**
  - `status: utkast`
  - risk, nivå, regelberoende, varierar per kommun, akut och figur enligt katalogen
  - alla ämnen i "Vad gör jag när..." har figuren `beslutstrad`, eftersom katalogen säger att varje fråga är ett beslutsträd
- **Brödtexten är en disposition** under rubrikerna "Vad gör jag nu" och "Bra att veta". Faktauppgifter är markerade `TODO-KONTROLL` och lämnade tomma.
  - Akutämnen har numrerade steg. Akutrutan med nödnumret lägger appen till själv.
  - Ämnen om el har rutan Anlita proffs och ämnen om kemikalier och brand har en varningsruta.
- **Förslag på typ av källa per ämne** finns i fältet `kalltyper`, beskrivna utan myndighetsnamn och utan länkar. Fältet visas bara i utkastläge.
- **Länkar mellan ämnen** (`relaterade`) för de flesta ämnen. Alla pekar på ämnen som finns, vilket regel 8 kontrollerar.
- **Filter på sju ämnen** där det är självklart:
  - tvättstugan
  - torktumlaren
  - diskmaskinen
  - induktion
  - andrahand
  - tvättmaskinen (inget filter, gäller både egen maskin och tvättstuga)
  - gas (medvetet utan filter, eftersom gaslukt kan komma från huset)
- **Översiktstabell:** `docs/OVERSIKT-AMNEN.md`, grupperad per kategori.
- **Allt genereras av ett skript.** `scripts/skapa-stubbar.mjs` läser katalogen och dispositionerna i `scripts/disposition/`. Det skriver aldrig över en fil som inte längre är utkast, så skriptet kan köras igen utan att granskat innehåll försvinner.
- **Ny säkerhetsregel:** telefonnummer i brödtexten stoppar bygget, även i utkast. Numren ska bara finnas i kontaktfilen.

## Siffror

Totalt 290 ämnen:

| Uppdelning | Antal |
|---|---|
| Hög risk | 49 |
| Medelrisk | 98 |
| Låg risk | 143 |
| Behövs vecka 1 | 163 |
| Första året | 85 |
| Bra att veta | 42 |
| Regelberoende | 96 |
| Varierar per kommun | 12 |
| Akut | 37 |
| Med figur | 51 |

## Testat och hur

**`npm test`: 71 tester, alla godkända.** Nya tester:
- varje ämne i katalogen har en fil och det finns inga filer utanför katalogen
- koderna i varje fil stämmer mot katalogen
- alla ämnen med hög risk eller som är regelberoende har förslag på källtyp
- alla akutämnen har numrerade steg
- telefonnummer i brödtexten stoppar bygget, men årtal och belopp gör det inte

**Byggena:**
- Valideringen gick igenom för alla 290 ämnen, med 0 fel.
- Utkastbygget gav 340 sidor. 37 akutämnen kontrollerades mot offline-cachen. Förcachen är 2,5 MB, vilket stämmer med uppskattningen i fas 1.
- Produktionsbygget innehåller fortfarande inga utkast.

**Webbläsartestet från fas 1:** 76 av 76 kontroller godkända mot bygget med alla ämnen. Det täcker offline, sökning, filter och tillgänglighet. Testet av sökning via adressen ändrades, eftersom "budget" nu ger flera träffar.

## Fungerar inte eller osäkert

- **Dispositionerna är mina förslag.** Punkterna beskriver vad texten ska ta upp. Några är allmänna råd utan markering, till exempel "lyft med benen" och "spara kvitton". Allt ska faktagranskas i fas 4 oavsett markering.
- **Fyra titlar från katalogen innehåller nummer eller myndighetsnamn.** Regeln om centrala nummer täcker bara brödtexten, inte titlar.

  | Ämne | Innehåller |
  |---|---|
  | `akut-nummer` | "112" |
  | `halsa-1177` | "1177" |
  | `myndigheter-forsakringskassan` | Försäkringskassan |
  | `pengar-paminnelse-inkasso` | Kronofogden |

- **Sammanfattningen är tom i alla ämnen.** Den skrivs i fas 4 tillsammans med texten, så att den inte lovar något som texten inte håller. Därför visar korten bara titeln.
- **Recepten har samma upplägg.** Mängder, tider och temperaturer kräver provlagning eller källa.
- **Förcachen växer.** 2,5 MB är rimligt nu, men blir större när texterna och figurerna kommer. Då kan vanliga ämnen cachas vid besök, medan akutämnen alltid förcachas.

## Beslut som behövs

1. **Prioritering inför fas 4** (öppet beslut 8). Mitt förslag är att börja med de 70 ämnena som behövs vecka 1, har låg risk och inte är regelberoende. De kan publiceras efter egen granskning, utan fackgranskare. Därefter kommer de 50 ämnena med medelrisk på nivå vecka 1, som kräver en faktagranskare. De 37 med hög risk på nivå vecka 1 väntar tills det finns en fackgranskare.
2. **Titlarna med nummer och myndighetsnamn:** behålla dem efter kontroll mot källa, eller skriva om dem.
3. **Hosting:** se svaret i chatten.

## Förslag på nästa steg

- Fas 3: figurerna i ordning. Först brandvarnaren och elskåpet, sedan stopp för stilgranskning efter de tre första.
- Fas 4 kan börja parallellt med fas 3 för ämnen med låg risk.
