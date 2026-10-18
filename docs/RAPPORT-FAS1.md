# Rapport fas 1: grundstruktur

Datum: 2026-10-18. Skärmdumpar finns i `rapport/fas1/`, och resultatet av webbläsartestet i `rapport/fas1/resultat.json`.

## Gjort

**Projekt**
- Astro 7 med React i OMO-roten. Testsidan från fas 0 ligger kvar i `spike/`.
- Innehållet ligger i `innehall/<kategori>/<id>.md`.
- Nio exempelämnen, alla med status utkast, så att varje funktion går att prova. De följer formatet för fas 2 och kan ingå där.

**Designsystem**
- Tokens i `src/styles/tokens.css` med ljust och mörkt läge. Mörkt läge följer telefonen eller väljs under Inställningar.
- Sex färger:

  | Färg | Används till |
  |---|---|
  | papper | varm bakgrund, så att figurerna ser ritade på papper ut |
  | bläck | text och konturer |
  | tegel | akut och varning, dov utan att skrika |
  | salvia | klart och lugnt |
  | ockra | markering och utkast, aldrig text |
  | skiffer | länkar och vatten. Går att skilja från tegel även vid färgblindhet. |

- Typsnitt:
  - **Atkinson Hyperlegible Next** för brödtext. Det är byggt för läsbarhet och skiljer tydligt på lika bokstäver, vilket passar dem som har svenska som andraspråk eller har lässvårigheter.
  - **Bricolage Grotesque** för rubriker. Det har lite ojämn, handgjord karaktär som passar figurerna.
  - Båda har licensen OFL-1.1 och ligger lokalt i bygget.

**Innehållsschema och byggregler**
- Schemat ligger i `src/lib/schema.js` och används både av Astro och av valideringsskriptet, så reglerna finns bara på ett ställe.
- Alla åtta byggregler och båda varningarna finns i `src/lib/regler.js`.
- `npm run build` stoppar med felkod 1 när en regel bryts.
- Regel 7 kontrolleras efter bygget mot service workerns cache.
- En extra regel kommer från avsnitt 4 i riskdokumentet: telefonnummer i `src/data/kontakter.json` måste ha källa innan ett akutämne får publiceras.
- Produktionsbygget tar bara med publicerat innehåll. `npm run build:utkast` visar även utkast, med ett band överst och `noindex`.

**Sidor och funktioner**
- **Startsida:** sökning överst och "Vad gör jag när..." som första ingång. Därunder kommer kategorierna och sist figurerna.
- **Onboarding med fem frågor:**
  - frågorna gäller boendeform, tvättmaskin eller tvättstuga, diskmaskin, kommun och språk
  - allt går att hoppa över och ändra senare
  - svaren sparas lokalt och filtrerar listorna
  - "Visa alla ämnen" visar det som är dolt
- **Kommun:** visas i kommunrutan, men används inte för att slå upp något.
- **Sidtyper:**
  - kategorivy grupperad efter nivå
  - ämnessida med akutruta först, brödtext, figurlänk, källor, granskning, relaterade ämnen och "Rapportera fel" (ett förifyllt e-postmeddelande med ämnets id)
  - figurvy med figurlistan som en vågrät rad på mobil och som sidopanel på dator
- **Säkerhetsrutor:** `Akut`, `Varning`, `AnlitaProffs`, `VarierarPerKommun`, `Kallor` och `Granskning`. Varning och Anlita proffs skrivs i Markdown som `:::varning` och `:::anlita-proffs`. Ett okänt direktiv stoppar bygget.
- **Informationssidor:** Om appen, Ansvarsfriskrivning, Integritet, Källor och granskning (med en tabell över alla ämnens status) och Rapportera fel. Felrapporteringen använder en platshållaradress i `src/config.js`.
- **Föräldraläge:** checklista byggd av flytt-, bostad- och pengar-ämnen på nivå vecka 1. Den går att dela med en länk och skriva ut. Länken innehåller bara ämnenas id.
- **Inställningar:** tema, ändra val och Radera mina uppgifter.
- **Översättningslager:** svenska är ifyllt och engelska tomt. Figurernas texter ligger bredvid figuren.
- **PWA:**
  - manifest med PNG-ikoner, inklusive apple-touch-icon
  - service worker med workbox-build som förcachar hela bygget, inklusive sökindexet
  - sökningen fungerar offline
- **Tvättmaskinsfiguren:** flyttad in i appen. Isometri, mediefråga och filter är utbrutna till `src/figurer/delat/`, och statustexten är rättad för reducerad rörelse.
- **Licenser:** förteckning i `LICENSER.md`.

## Testat och hur

**`npm test`: 64 enhetstester, alla godkända.**
- Varje byggregel prövas både när den uppfylls och när den bryts.
- Hela kedjan är provad: valideringsskriptet avslutar med felkod 1 när reglerna bryts.
- Filtreringen och sökningen är testade, bland annat att "tvatt" hittar "tvätt".
- Kontrasten är kontrollerad för 16 färgpar i både ljust och mörkt läge enligt WCAG AA.

**`npm run test:e2e`: 76 kontroller i Playwright (Chromium) mot utkastbygget, alla godkända.**
- **Sidorna:** 12 sidor provades på mobil (375 px) och dator, i ljust och mörkt läge. Ingen sida rullar i sidled och inga fel visades i konsolen.
- **Tillgänglighet:** axe-core (regler för WCAG 2.0 och 2.1, nivå A och AA) hittade inga brister på någon av sidorna.
- **Onboarding:**
  - Med egen tvättmaskin döljs tvättstugan.
  - Med hyresrätt döljs andrahandsämnet.
  - Utan diskmaskin döljs diskmaskinsämnet.
  - "Visa alla" fungerar, kommunen syns i kommunrutan och tidigare svar fylls i.
  - "Hoppa över" fungerar även efter omladdning.
- **Inställningar:** mörkt läge finns kvar efter omladdning. Radera mina uppgifter tar bort alla sparade nycklar och återställer temat.
- **Sökning:** på startsidan, via `/sok/?q=` och offline.
- **Offline:** jag öppnade startsidan, väntade på cachen och stängde av nätet. Därefter öppnades två akutsidor, en kategorisida och ett vanligt ämne som aldrig hade besökts. Alla fyra laddades från service workern. En okänd adress visar 404-sidan.
- **Föräldraläget:** jag bockade av två punkter och kopierade länken. När länken öppnades i en ny webbläsare var samma två punkter avbockade.
- **Ämnessidan:**
  - akutrutan kommer före brödtexten
  - numret i ringlänken hämtas från kontaktfilen
  - "Rapportera fel" innehåller ämnets id
  - utkastmarkeringen och datumet för senast kontrollerad syns
- **Tangentbord:** första tabbstoppet är "Hoppa till innehållet", och det flyttar fokus till innehållet.

**Produktionsbygget:** inga utkast kom med och 0 akutämnen kontrollerades. Utkastbygget kontrollerade 2 akutämnen.

**Fel som testerna hittade och som nu är rättade**
- **404 i stället för söksidan.** När service workern väl styrde sidan gav `/sok/?q=...` 404-sidan även med fungerande nät. Orsaken var `navigateFallback`. Nu visas 404-sidan bara utan nät.
- **Titlar med kolon.** Titlar med kolon måste citeras i YAML. Validatorn upptäckte det innan bygget. Det är bra att veta inför fas 2.

## Fungerar inte eller osäkert

- **Inget testat på riktig telefon eller i Safari.** All testning är gjord i headless Chromium. Installation på hemskärmen är inte provad. Testsidan från fas 0 går att öppna på http://192.168.1.167:4322 i ditt wifi, men offline fungerar inte den vägen eftersom det kräver https.
- **axe hittar inte allt.** Automatiska verktyg hittar ungefär en tredjedel av alla tillgänglighetsproblem. Ett test med skärmläsare, VoiceOver och TalkBack, återstår.
- **Kontaktfilen saknar källor.** Nödnumret 112 kommer från era egna texter men saknar källa i kontaktfilen. Övriga nummer och tjänstenamn är tomma. Inget akutämne kan publiceras förrän de är källbelagda, och det är avsiktligt.
- **Avvikelse från era texter.** I ansvarsfriskrivningen har jag bytt "1177" mot en uppgift från kontaktfilen, eftersom regeln säger att tjänstenamn inte får hårdkodas i löptext. Tills namnet är kontrollerat står det "sjukvårdsrådgivningen".
- **Hela bygget förcachas (cirka 0,7 MB nu).** Med de 290 ämnena i katalogen blir det troligen 2 till 4 MB. Det är en uppskattning, inte mätt. Om det blir för mycket kan vanliga ämnen cachas vid besök, medan akutämnen och sökindexet alltid förcachas.
- **Allt i "Vad gör jag när..." är akut.** Därför ser alla kort där likadana ut, med röd kant.
- **Föräldralägets delning är bara testad i Chromium.** Den använder delningsmenyn på telefon och urklipp på dator. Delningsmenyn är inte testad.
- **Sökningen är enkel.** Den hittar inte böjningsformer, till exempel söker "tvättade" inte fram "tvätta". Den räcker troligen för titlar och sammanfattningar.
- **Ikonen är en platshållare.** Ett enkelt hus som jag ritade, i väntan på namn och grafisk profil.
- **Typsnitten är inte utvärderade av användare.** Valet är mitt förslag.

## Beslut som behövs

1. Godkänna palett och typsnitt, eller ange en annan riktning.
2. Om ni vill behålla tjänstenamn ur kontaktfilen i ansvarsfriskrivningen, i stället för den hårdkodade "1177".
3. Öppna beslut från CLAUDE.md som börjar påverka arbetet:
   - e-postadress för felrapporter
   - hosting, som behövs för att kunna testa på riktig telefon över https
   - vem som fackgranskar innehåll med hög risk

## Förslag på nästa steg

- Fas 2: en innehållsfil för vart och ett av de 290 ämnena i katalogen, med disposition, `TODO-KONTROLL` och förslag på källtyper, samt en översiktstabell.
- Parallellt med fas 2:
  - lägga upp utkastbygget på en tillfällig https-adress, så att det går att testa på telefon och installera på hemskärmen
  - göra ett test med skärmläsare
