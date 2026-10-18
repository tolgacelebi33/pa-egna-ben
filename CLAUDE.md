# På egna ben / On my own

Instruktioner för Claude Code. Läs hela denna fil och alla filer i `docs/` innan du gör något.

## 1. Vad vi bygger

En app för unga som flyttar hemifrån i Sverige. All praktisk kunskap om att bo själv samlad på ett ställe: tvätt, mat, städning, pengar, kontrakt, att laga saker, akuta lägen och mycket mer. Fullständig innehållskatalog finns i `docs/INNEHALL.md`.

Arbetsnamn: **På egna ben** (svenska) och **On my own** (engelska). Namnen är inte kontrollerade mot varumärken eller domäner. Se öppna beslut nedan.

Appens särdrag är interaktiva, handritade isometriska figurer där man lär sig genom att göra: vrida på tvättmaskinens ratt, trycka på brandvarnarens testknapp, dra mat till rätt hylla i kylen. Figurerna ska visa genomskärningar med etiketter så att man förstår hur saker fungerar, inte bara hur de ser ut.

## 2. Arbetsprinciper (gäller alltid)

1. **Verifiera före du bygger vidare.** Ingen teknisk lösning räknas som vald förrän den är testad. Varje fas slutar med en kontrollpunkt där du stannar, redovisar vad som fungerar, vad som inte gör det och vad du är osäker på, och väntar på godkännande.
2. **Säg det när du är osäker.** Skriv uttryckligen om något är ett antagande, otestat eller beroende av något du inte har kunnat kontrollera. Presentera osäkra vägar som alternativ, inte som lösningar.
3. **Hitta aldrig på fakta.** Inga temperaturer, doseringar, frekvenser, belopp, lagregler, åldersgränser, telefonnummer eller myndighetsnamn utan verifierad källa. Där källa saknas: skriv `TODO-KONTROLL: <vad som ska kontrolleras>` och lämna faktauppgiften tom.
4. **Hitta aldrig på källor.** En källa får bara anges om du har öppnat den och kontrollerat att den säger det som påstås. Annars lämnas källfältet tomt.
5. **Egen text.** Skriv om allt innehåll med egna ord. Kopiera aldrig myndigheters, företags eller andra appars text. Länka till originalkällan.
6. **Eget visuellt uttryck.** Stilen är inspirerad av handritade isometriska figurer (referens: colorfigures.vercel.app). Kopiera inte deras figurer, kod, färgsättning eller layout. Läs inte deras källkod. Alla figurer ritas från grunden för den här appen.
7. **Inga emojis** i gränssnittet, innehållet, koden, commit-meddelanden eller rapporter.
8. **Små steg.** En fas i taget, en sak i taget inom fasen. Commit efter varje fungerande steg.
9. **Riskreglerna i `docs/RISK-OCH-GRANSKNING.md` är obligatoriska** och går före allt annat i denna fil.

## 3. Tekniska ramar

Ingenting nedan är verifierat. Fas 0 finns för att testa det.

**Krav (ska uppfyllas oavsett val):**
- Webbapp som kan installeras på hemskärmen (PWA), mobil först, fungerar även på dator.
- Ingen backend och inga användarkonton i första versionen.
- Användarens egna data (onboarding-val, avbockade uppgifter, sparade recept, quizresultat) lagras endast lokalt på enheten.
- Akutinnehåll (avsnitt markerade `akut: true`) ska fungera helt utan nätverk efter första besöket.
- Innehållet lagras som filer i repot (Markdown med frontmatter), en fil per ämne, och valideras mot ett schema vid bygge (se `docs/RISK-OCH-GRANSKNING.md`).
- Bygget ska ge statiska filer som kan hostas var som helst. Hosting är inte vald.
- Svenska är huvudspråk. Engelska ska kunna läggas till utan omskrivning, så all gränssnittstext går via ett översättningslager från början.
- Tillgänglighet: målet är WCAG 2.1 AA. Tangentbordsnavigering, synligt fokus, tillräcklig kontrast, `prefers-reduced-motion` respekteras, alla figurer har en textversion av samma kunskap.
- Ingen spårning, inga tredjepartsskript för analys eller annonser, inga externa typsnitt som laddas från tredje part i produktion (lägg typsnitt lokalt).

> Beslut efter fas 3 (se `docs/BESLUT.md`): figurerna är riktig 3D med three.js, inte SVG.

**Kandidat att testa i fas 0 (inte vald):**
- Astro med React-komponenter för de interaktiva figurerna, Astros content collections för innehåll och schemavalidering, och en PWA-plugin för offline.
- Figurer som SVG-komponenter där varje rörlig del är ett eget element. Handritad känsla och papperskorn via SVG-filter (till exempel turbulens och förskjutning) är en hypotes som ska testas.

Om kandidaten inte uppfyller kraven i fas 0: stoppa, redovisa varför och föreslå högst två alternativ med för- och nackdelar. Byt inte på egen hand.

## 4. Faser

### Fas 0: Verifiering (spike)

Mål: ta reda på om konceptet går att genomföra innan något annat byggs.

Bygg en fristående testsida med en enda figur: **tvättmaskinen**.
- Isometrisk, handritad stil med tjocka konturer och papperskänsla.
- Interaktion i steg via knappar: "Sortera tvätten", "Vrid ratten", "Välj temperatur", "Starta". Ratten går också att vrida direkt.
- Genomskärning som visar trumman och vattnet, med etiketter på svenska.
- Ett reglage för hur "handritad" konturen ska vara.
- Textversion av samma innehåll under figuren.
- Använd platshållartext. Skriv inga faktauppgifter om temperaturer eller program; markera dem `TODO-KONTROLL`.

Testa och redovisa med mätvärden där det går:
1. Ser figuren ut som avsett? Ta skärmdumpar på mobil- och datorbredd.
2. Prestanda på mobil: laddtid och flyt i animationerna. Ange hur du mätte.
3. Fungerar sidan offline efter första besöket? Beskriv exakt hur du testade.
4. Fungerar tangentbordsstyrning och reducerad rörelse?
5. Hur lång tid och hur mycket kod tog figuren? Uppskatta vad det innebär för cirka 15 figurer.
6. Vad var svårt, vad fungerade inte, vad är du osäker på?

**Kontrollpunkt. Stanna och vänta på godkännande.**

### Fas 1: Grundstruktur

- Projektstruktur, designsystem (färger, typsnitt, avstånd) som tokens, ljust och mörkt läge.
- Innehållsschema och valideringsregler enligt `docs/RISK-OCH-GRANSKNING.md`, inklusive att bygget misslyckas när reglerna bryts. Skriv tester för valideringen.
- Startsida som utgår från problem, inte kapitel: sökruta överst och "Vad gör jag när..." som första ingång. Kategorierna nås därunder.
- Onboarding med 3 till 5 frågor som filtrerar innehållet (boendeform, egen tvättmaskin eller tvättstuga, diskmaskin, kommun, språk). Ska gå att hoppa över och ändra senare. Sparas lokalt.
- Kategorivy, ämnessida och figurvy.
- Komponenter för säkerhetsrutor: `Akut`, `Varning`, `AnlitaProffs`, `VarierarPerKommun`, `Kallor`, `Granskning`.
- Sidor: Om appen, Ansvarsfriskrivning, Integritet, Källor och granskning, Rapportera fel. Använd texterna i `docs/RISK-OCH-GRANSKNING.md`.
- "Rapportera fel"-funktion utan backend: öppnar ett förifyllt e-postmeddelande med ämnets id. E-postadressen är ett öppet beslut; använd platshållare.
- Föräldraläge: en delbar checklista att gå igenom tillsammans före flytten.
- Översättningslager, svenska ifyllt, engelska tomt.
- PWA och offline enligt resultatet från fas 0.

**Kontrollpunkt. Stanna och vänta på godkännande.**

### Fas 2: Innehållsstubbar för alla ämnen

- Skapa en innehållsfil för **varje** ämne i `docs/INNEHALL.md`. Inget får utelämnas.
- Varje fil får komplett frontmatter enligt schemat, `status: utkast`, rätt `risk`, `regelberoende`, `varierar_per_kommun`, `akut`, `figur` och `niva` enligt katalogen.
- Brödtexten är en disposition i punktform med `TODO-KONTROLL` där fakta behövs. Inga påhittade uppgifter.
- För varje ämne: lista förslag på vilken typ av källa som bör användas (till exempel "ansvarig myndighet för livsmedelssäkerhet"), inte påhittade länkar.
- Generera en översikt (tabell) över alla ämnen med kategori, risk, nivå, figur och status.

**Kontrollpunkt. Stanna och vänta på godkännande.**

### Fas 3: Figurer

Bygg figurerna i den ordning som anges i `docs/INNEHALL.md`, avsnitt "Figurer". En figur i taget. Stanna efter de tre första för granskning av stil och kvalitet.

### Fas 4: Innehåll

Skriv innehåll kategori för kategori enligt den prioritering som godkänns efter fas 2. Följ granskningsflödet i `docs/RISK-OCH-GRANSKNING.md`. Innehåll med `risk: hog` publiceras aldrig utan fackgranskning.

## 5. Ton och språk

- Målgrupp: unga vuxna, ungefär 18 till 25 år, som flyttar till sitt första egna boende. Antagande, se öppna beslut.
- Skriv som en kunnig äldre syskon, inte som en förälder eller en myndighet. Rakt, vänligt, konkret, utan pekpinnar och utan skämt på användarens bekostnad.
- Korta meningar. Aktiv form. Förklara facktermer första gången de används.
- Varje ämne börjar med det viktigaste: vad gör jag nu. Bakgrund kommer efter.
- Knappar säger exakt vad som händer: "Starta tvätten", inte "Fortsätt".
- Sikta på en nivå som fungerar för den som har svenska som andraspråk eller läs- och skrivsvårigheter. En lättläst version är ett senare tillägg men strukturen ska tillåta den.

## 6. Design

Följ referensbildens riktning: isometriska handritade figurer, tjocka bläckkonturer, papperskorn, dämpad färgskala, knappar som driver figurens steg, en lista över figurer bredvid scenen. Gör den egen:
- Ta fram en egen palett med 4 till 6 namngivna färger och egna typsnittsval. Motivera dem kort och redovisa i fas 1.
- Mobil först: på smal skärm blir figurlistan en vågrät rad eller en meny, inte en sidopanel.
- Lägg det djärva i figurerna. Allt runt omkring ska vara lugnt och lättläst.
- Ljud är frivilligt, avstängt som standard.

## 7. Öppna beslut (ta inte dessa på egen hand)

1. Slutligt namn, efter kontroll av varumärken och domäner.
2. Primär målgrupp: alla unga, studenter, unga som börjar jobba, eller unga som lämnar familjehem eller HVB.
3. Intäktsmodell eller ideellt. Påverkar hosting: vissa gratisnivåer, till exempel Vercel Hobby, tillåter inte kommersiell användning.
4. Hosting.
5. Om appen ska finnas i App Store och Google Play utöver som webbapp.
6. Vem som fackgranskar innehåll med hög risk.
7. E-postadress för felrapporter och kontakt.
8. Prioritering av ämnen till första publicerade versionen.
9. Partners för spridning (bostadsbolag, kommuner med flera) och regler för sponsring.

## 8. Rapportformat vid kontrollpunkter

Skriv på svenska, kort:
- Gjort
- Testat och hur
- Fungerar inte eller osäkert
- Beslut som behövs
- Förslag på nästa steg
