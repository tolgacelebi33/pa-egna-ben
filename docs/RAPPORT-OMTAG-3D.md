# Rapport: ny design och figurerna i 3D

Datum: 2026-10-18. Testversion: https://tolgacelebi33.github.io/pa-egna-ben/

## Gjort

**Hela appen har ny design**
- Lugna pappersark på varm bakgrund med korn. Tunt sidhuvud med logotyp, och en meny med små versaler.
- Startsidan:
  - stor sökruta
  - "Vad gör jag när..." som en lugn lista med röda markeringar
  - figurerna som bildkort
  - kategorierna som numrerade kort
- Ämnessidan har kategorin överst i små versaler, ett kort med figurens bild när det finns en figur, och texten på ett ark. Källor och granskning ligger sida vid sida.
- Knappar och val är rundade. Säkerhetsrutorna har en mjukare stil med färgad kant.
- Nytt typsnitt för små etiketter och figurknappar: IBM Plex Mono (OFL-1.1). Paletten och de andra typsnitten är oförändrade.

**Figurerna i riktig 3D (three.js)**
- **Tvättmaskinen:**
  - Den går att vrida och zooma.
  - Luckan går att öppna, ratten att vrida med fingret, knapparna att trycka på och facket att dra ut.
  - Genomskärningen visar trumman, vattnet och tvätten.
- **Brandvarnaren:**
  - Testknappen ger ljudvågor och blinkande lampa.
  - Locket lyfts så att insidan syns, och batteriet byts.
  - "Visa insidan" gör locket genomskinligt.
  - Ljudet är avstängt från början.
- **Elskåpet:**
  - Spakarna går att klicka på i figuren. Ledningarna går till fyra rum som tänds och släcks.
  - Vid överlast pulserar köksledningen rött och säkringen löser ut.
  - Brytarna finns också som knappar under figuren, för tangentbord och skärmläsare.
- **Gemensamt för alla tre:**
  - Bläckkonturer med reglage för hur handritade de är.
  - Etiketter med korta linjer som undviker att krocka, och som hålls inne i bilden på mobil.
  - Steg som små knappar ovanför figuren och textversionen alltid under.
  - Om WebGL saknas visas en förklaring, och stegen fungerar ändå.
- **Bilder:** stillbilderna till startsidan och ämnessidorna tas från 3D-figurerna med `scripts/figurbilder.mjs`.

## Testat och hur

- **Enhetstester:** 71 av 71 godkända.
- **Webbläsartester:** 96 av 96 kontroller godkända mot utkastbygget. Det täcker:
  - axe-core på alla sidor i ljust och mörkt läge
  - offline
  - sökning
  - onboarding
  - föräldraläget
  - tangentbord
  - stegen i de tre 3D-figurerna, även med reducerad rörelse
- **Flyt i 3D:**

  | Webbläsare | Bildfrekvens under tvätten |
  |---|---|
  | WebKit, mobilstorlek | 60 bilder per sekund |
  | Chromium med mjukvaruritning, utan grafikkort | median 60 bilder per sekund, men vissa bildrutor tar dubbelt så lång tid (p95 33 ms) |

  Figuren syns efter cirka 0,8 sekunder i WebKit.
- **Storlek:** three.js och den gemensamma 3D-koden är 148 kB komprimerat och delas av alla figurer. Varje figur är 8–12 kB. Förcachen för offline är nu 3,9 MB okomprimerat.
- **Fel som hittades och rättades:**
  - canvasen växte i en loop på mobil
  - dolda texter för skärmläsare gjorde sidan bredare
  - kontrasten på ringknappen var för låg i mörkt läge
  - verktygsraden hamnade utanför figurens papper

## Fungerar inte eller osäkert

- **Inget är provat på riktig telefon.** Det viktigaste nu är hur 3D:n känns att vrida med fingret och hur snabb den är på en äldre telefon.
- **Skärmläsare får ingen beskrivning av 3D-bilden.** Kunskapen finns i stegen, statusraden och textversionen, men inte i själva bilden. Det är inte provat med VoiceOver eller TalkBack.
- **Etiketterna kan fortfarande överlappa i vissa vinklar.** När figuren vrids flyttar sig etiketterna med, och krockkontrollen flyttar dem bara nedåt.
- **Spakarna i elskåpet är stiliserade.** På och av syns främst på vinkeln och den röda färgen.
- **Förcachen växer.** 3,9 MB okomprimerat är okej nu men blir mer med fler figurer. Senare kan figurerna cachas vid besök i stället, medan akutsidorna alltid förcachas.
- **Ljudet är inte provat med hörbar ljudutgång.**

## Beslut som behövs

1. Gillar du den nya designen och 3D-figurerna, eller ska något justeras innan fler figurer byggs?
2. Nästa figurer i katalogens ordning är kyl och frys, vattenlåset och toalettens cistern. Ska jag fortsätta med dem?
3. Ska fas 4, texterna för de 70 ämnena med låg risk, börja parallellt?
