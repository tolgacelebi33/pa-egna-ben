# Rapport fas 3: stilgranskning efter tre figurer

Datum: 2026-10-18. Skärmdumpar finns i `rapport/fas3/`, fyra lägen per figur på dator och mobil. Figurerna går att prova på https://tolgacelebi33.github.io/pa-egna-ben/figur/.

## Gjort

**Testversion på GitHub Pages**
- Publikt repo: tolgacelebi33/pa-egna-ben.
- Varje push till `main` kör testerna, bygger utkastversionen och publicerar den.
- Alla interna adresser fungerar nu i en undermapp. Det styrs av `BASE_PATH`, så att hostingen kan bytas utan ändringar i koden.

**Figur 2: Brandvarnaren**
- Brandvarnaren visas nedtagen från taket, så att undersidan med testknappen syns.
- Fyra steg:
  1. Tryck på testknappen, så kommer ljudvågor och lampan blinkar.
  2. Öppna brandvarnaren, så lyfts locket och insidan syns.
  3. Byt batteriet, så glider det gamla ut och det nya in.
  4. Hör skillnaden på pipen: larm och batterivarning visas som mönster.
- Testknappen går att trycka på direkt i figuren, även med tangentbordet.
- Reglaget "Visa insidan" gör locket genomskinligt.
- Ljudet är avstängt från början och är en svag ton, inte ett riktigt larm.

**Figur 3: Elskåpet**
- Skåpet på väggen har en jordfelsbrytare med testknapp och fyra säkringar. Varje säkring har en ledning till ett rum med en lampa.
- Fyra steg:
  1. Koppla in fler apparater i köket. Ledningen blir röd och pulserar, sedan löser säkringen ut och lampan slocknar.
  2. Dra ur en apparat.
  3. Slå på säkringen igen. Den löser ut på nytt om det fortfarande är för mycket inkopplat.
  4. Testa jordfelsbrytaren. Alla rum blir strömlösa, sedan slås den på igen.
- Alla spakar går att klicka och styra med tangentbordet direkt i figuren.
- Textversionen har en ruta om att anlita proffs.

**Gemensamt**
- Etiketter, isometri, filter och figurstilar är utbrutna till `src/figurer/delat/`, och tvättmaskinen använder dem nu också.
- Alla fakta är markerade `TODO-KONTROLL`: hur ofta man testar, batterityper, pipmönster, vad en lekman får göra i elskåpet och gränsen för överlast. Gränsen i figuren är en platshållare.

## Testat och hur

- **Webbläsartest:** 93 av 93 kontroller i Chromium mot utkastbygget. Testet har nu 17 nya kontroller för de nya figurerna:
  - Testknappen fungerar med Enter.
  - Batteriet går bara att byta när brandvarnaren är öppen.
  - Ljudet är avstängt från början.
  - Överlasten löser ut köksäkringen.
  - Säkringen går att slå på med mellanslag efter att en apparat dragits ur.
  - Jordfelsbrytarens testknapp släcker alla rum.
  - Statustexterna stämmer vid reducerad rörelse.
- **Tillgänglighet:** axe-core hittade inga brister på figursidorna.
- **Mot den riktiga sajten:** samma test mot GitHub Pages över https gav 92 av 93. Det enda felet låg i testet: det väntade sig en adress utan undermappen. Testet är rättat. Offline fungerade på riktigt över https.
- **Flyt i WebKit på mobilstorlek:** larmanimationen och den flödande strömmen gick båda i 60 bilder per sekund, med och utan filter (median 17 ms, p95 19 ms).
- **Enhetstester:** alla 71 godkända.

## Kodmängd

| Figur | Rader |
|---|---|
| Tvättmaskinen | 606 + 62 CSS |
| Brandvarnaren | 356 + 99 CSS |
| Elskåpet | 369 + 49 CSS |
| Delat | cirka 185 |

Med de delade delarna hamnar en figur på cirka 350 till 450 rader, vilket stämmer med uppskattningen i fas 0.

## Frågor för stilgranskningen

1. **Raka och handritade konturer blandas.** Rörliga delar (trumma, vatten, batteri, ljudvågor, ledningar) har raka konturer, eftersom filtret bara ligger på stillastående delar. Märks det och stör det? Alternativet är att rita in ojämnheten i själva formerna.
2. **Brandvarnaren ligger på rygg i stället för att sitta i taket.** Det gör testknappen synlig i isometrin. Är det begripligt, eller ska vi visa den i taket med en förstoring?
3. **Elskåpet blandar isometri och schema.** Skåpet är isometriskt, men rummen och ledningarna är ritade som ett enkelt schema under. Funkar blandningen?
4. **Spakarna i elskåpet är stiliserade.** De liknar inte en viss tillverkare. Är de tydliga nog?
5. **Etiketter och siffror.** På dator står etiketterna med linjer, på mobil som siffror med förteckning. Fungerar det?
6. **Färger.** Tegel för det som larmar eller har löst ut, ockra för testknappar och batteri, salvia för klart.

## Fungerar inte eller osäkert

- **Inget är testat på riktig telefon.** Det går nu, på adressen ovan. Prova gärna:
  - installera appen på hemskärmen
  - slå på flygplansläge och öppna en akutsida
- **Ljudet är bara provat utan ljudutgång.** Uppspelningen kördes i headless-webbläsaren, så tonen har inte hörts.
- **Elskåpets lampor saknar textbeskrivning.** Skärmläsare får rummens status genom statusraden och spakarnas läge, inte genom lamporna.
- **Sammanfattningar och beslutsträd saknas fortfarande.** Ämnena med figuren "beslutsträd" (alla i "Vad gör jag när...") visar att figuren kommer senare.

## Beslut som behövs

1. Svar på frågorna för stilgranskningen ovan, eller godkännande att fortsätta i samma stil.
2. Om de återstående 16 figurerna ska byggas i katalogens ordning, med nästa stopp efter till exempel sex figurer.

## Förslag på nästa steg

- Figur 4 till 6: kyl och frys, vattenlåset och toalettens cistern.
- Fas 4 kan börja parallellt med de 70 ämnena med låg risk på nivå vecka 1, enligt den beslutade prioriteringen.
