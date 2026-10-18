# Rapport fas 0: verifiering med tvättmaskinen

Datum: 2026-10-18. Skärmdumpar och mätvärden finns i `rapport/` och kan tas fram igen med `node tests/fas0.mjs` mot `npm run build && npm run preview -- --port 4322`.

## Gjort

- En fristående testsida i `spike/` byggd med Astro 7 och en React-ö för figuren.
- Tvättmaskinen ritad som SVG i isometri. Framsidan ritas platt och läggs på rätt plan med en matris, så att rattar, lucka och trumma kan ritas som vanliga cirklar.
- Fyra stegknappar: Sortera tvätten, Vrid ratten, Välj temperatur och Starta tvätten (blir Stoppa tvätten medan maskinen går). Det finns också Börja om.
- Ratten går att vrida direkt med mus eller finger, och med piltangenterna samt Home och End.
- Genomskärning med ojämn snittkant som visar yttre behållare, trumma med hål och medbringare, vatten som stiger och sjunker, tvätt som snurrar och vattnets väg från facket. Utan genomskärning syns samma sak genom luckans glas.
- Tvätthög som sorteras ut i tre korgar. Den ljusa tvätten hamnar i trumman.
- Ett reglage för hur handritad konturen är (0 till 10).
- Etiketter på svenska. På smal skärm blir de numrerade markeringar med en förteckning under figuren.
- Textversion under figuren. Alla faktauppgifter är markerade med `TODO-KONTROLL`. Program heter Program 1 till 5 och temperaturerna låg, mellan och hög.
- All gränssnittstext går via ett översättningslager (`src/i18n`). Svenska är ifyllt, engelska är tomt.
- Offline via en service worker som skapas med workbox-build efter bygget.

## Testat och hur

Alla mätningar gjordes med Playwright 1.64 i headless Chromium och headless WebKit på en Mac (Apple Silicon), mot produktionsbygget.

**1. Ser figuren ut som avsett?** Ja, i stort. Se `rapport/mobil-*.png` (375 px bred, 2x) och `rapport/dator-*.png` (1280 px). Tjocka konturer, papperskorn i bakgrunden och dämpade färger fungerar. Testet hittade ett fel som nu är rättat: på mobil blev sidan 545 px bred, så webbläsaren zoomade ut. Figurlistan tryckte ut grid-kolumnen.

**2. Prestanda på mobil**
- Laddning med strypt nät (150 ms latens, 1,6 Mbit/s, ungefär Slow 4G i DevTools) och processorn strypt fyra gånger i Chromium:
  - första innehållet syns efter 376 ms
  - sidan är klar efter 402 ms
  - figuren går att använda (hydrerad) efter cirka 920 ms
  - totalt 81 kB överfört
- JavaScript: React-runtime 66 kB gzippat, själva figuren 6 kB gzippat. React är den största posten.
- Flyt i Chromium: 60 bilder per sekund i alla lägen. Den siffran säger dock lite, se osäkert nedan.
- Flyt i WebKit (samma motor som alla webbläsare på iPhone):

  | Filterläge | Bilder per sekund |
  |---|---|
  | Filter på hela figuren | cirka 43, oavsett filternivå |
  | Utan filter | 59 |
  | Filter bara på stillastående delar, rörliga delar utan filter | 59 vid alla nivåer (0, 3, 10) |

  Resultatet blev detsamma i två omgångar. Det sista läget är nu standard.

**3. Offline efter första besöket.** Sidan öppnades en gång och jag väntade tills service workern var klar. Cachen innehöll 8 filer. Därefter stängdes nätet av i webbläsarkontexten (`context.setOffline(true)`) och sidan laddades om. Svaret var HTTP 200 från service workern, rubriken och figuren laddades, och knappen Sortera tvätten fungerade offline. Se `rapport/offline-mobil.png`. Service workern registreras även i WebKit.

**4. Tangentbord och reducerad rörelse**
- Tabbordningen är figurlistan, programratten, de fyra stegen, Börja om, genomskärningsrutan och reglaget.
- Ratten svarar på piltangenterna, Home och End. Den har en synlig streckad fokusring (`rapport/tangentbord-fokus-ratt.png`) och läses upp som "Programratt, Program 2".
- Statusraden är en live-region som läser upp varje ändring.
- Med reducerad rörelse står trumman stilla, vattnet visas direkt utan att stiga och tvätten flyttas utan animation. Kontrollerat genom att trummans transform var oförändrad efter 1,5 sekunder.
- Dra i ratten med mus: läget följer pekaren från 0 till 4 under ett varv.

**5. Tid och mängd kod.** Mitt arbete tog ungefär 25 minuter från tom mapp till mätt testsida, inklusive tre rättningsrundor. Det säger lite om hur lång tid en människa behöver.

Kodmängd:
- figuren: 659 rader (`Tvattmaskin.jsx`)
- stilar: cirka 330 rader, varav ungefär 100 hör till figuren
- testsidan: 100 rader
- mätskriptet: 255 rader

Uppskattning för cirka 15 figurer: ungefär en tredjedel av figurfilen är gemensamt och bör brytas ut i fas 1. Det gäller isometrihjälpen, filtret, etiketterna, stegknapparna och animationsloopen. Därefter blir varje figur troligen 300 till 500 rader. Det som tar tid är inte koden utan att få bilden att se rätt ut och få den granskad. Varje figur behövde flera rundor med skärmdumpar. Räkna med att stilgranskningen efter de tre första figurerna styr resten.

## Fungerar inte eller osäkert

- **Inget riktigt mobiltest.** Allt är mätt i headless-webbläsare på en dator. WebKit här är inte Safari på en iPhone, och en strypt dator är inte en billig Android. Siffrorna visar skillnader mellan lösningar, inte verklig prestanda. Ett test på en äldre iPhone och en billig Android behövs.
- **Chromiums mätning missar filterkostnaden.** Mätningen via requestAnimationFrame visade 60 bilder per sekund även med strypt processor och filter. Filtret rastreras troligen utanför huvudtråden och syns därför inte. Mitt försök att räkna tappade bildrutor via Chromes spårning gav inga användbara värden.
- **Ojämn stil.** Med filtret bara på stillastående delar ritas trumman, vattnet och röret med raka konturer medan resten är handritad. Skillnaden syns om man tittar noga. Alternativet är att rita in den ojämna formen i själva banorna för de rörliga delarna. Det kostar mer arbete per figur.
- **PWA-pluginet fungerar inte med Astro 7.** `@vite-pwa/astro` stöder bara Astro upp till version 5. Jag använde i stället workbox-build direkt efter bygget. Det fungerar och är enkelt, men det är en avvikelse från kandidaten. Alternativet är att låsa Astro på version 5 och använda pluginet.
- **Installation på hemskärmen är inte testad.** Manifestet har bara en SVG-ikon. iPhone behöver troligen en PNG-ikon (apple-touch-icon). Det tas i fas 1.
- **Layouthopp på dator.** Serverrenderingen antar smal skärm (mobil först). På dator byts figuren till bred vy när React startar, vilket ger ett litet hopp. Det kan lösas genom att rendera båda vyerna och välja med CSS.
- **Statustexten stämmer inte med reducerad rörelse.** Texten säger att trumman snurrar även när den står still. Det är lätt att rätta.
- **Kontrast på inaktiva knappar.** Knapparna blir halvgenomskinliga medan maskinen går och når troligen inte kontrastkravet. Det är inte mätt.
- **Display och siffermarkering krockar på mobil.** Texten på maskinens display blir liten och skev, och markering 2 täcker den delvis. Displayen är dekoration och samma information finns i statusraden.
- **Content collections är inte testade.** Schemavalidering av innehåll hörde inte till fas 0. Den testas i fas 1.
- **Typsnitt.** Testsidan använder systemtypsnitt. Inga egna typsnitt är valda än.

## Beslut som behövs

1. Godkänna Astro med React och SVG som teknik för figurerna. Min bedömning är att den håller.
2. Offline: fortsätta med workbox-build direkt (fungerar med Astro 7) eller låsa Astro på version 5 för att använda PWA-pluginet.
3. Handritad stil: godkänna att rörliga delar har raka konturer, eller lägga mer tid per figur på att rita in den ojämna formen.
4. Om någon kan testa sidan på en riktig iPhone och en enklare Android innan fas 1.

## Förslag på nästa steg

- Testa på riktiga telefoner. Sidan kan köras lokalt eller läggas upp tillfälligt, men hosting är ett öppet beslut.
- I fas 1: bryta ut de gemensamma delarna av figuren, rätta de små felen ovan och bygga grundstrukturen.
