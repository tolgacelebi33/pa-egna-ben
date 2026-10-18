# Fattade beslut

Beslut som har tagits vid kontrollpunkterna. Öppna beslut finns i `CLAUDE.md`, avsnitt 7.

## 2026-10-18, efter fas 0

- Astro med React och SVG för figurerna godkänt.
- Offline via workbox-build direkt efter bygget (PWA-pluginet för Astro stöder inte Astro 7).
- Rörliga delar i figurerna får raka konturer; filtret ligger bara på stillastående delar. Omprövas vid stilgranskningen efter tre figurer.

## 2026-10-18, efter fas 1

- Paletten (papper, bläck, tegel, salvia, ockra, skiffer) och typsnitten Atkinson Hyperlegible Next och Bricolage Grotesque godkända.
- Hosting för test: GitHub Pages från det publika repot tolgacelebi33/pa-egna-ben. Slutlig hosting avgörs tillsammans med intäktsmodellen (öppet beslut 3 och 4).

## 2026-10-18, efter fas 2

- Prioritering till fas 4 (öppet beslut 8): först de 70 ämnena med nivå vecka 1, låg risk och inte regelberoende. Därefter vecka 1 med medelrisk (50, kräver faktagranskare). Vecka 1 med hög risk (37) väntar på fackgranskare.
- Titlarna med nummer och myndighetsnamn (akut-nummer, halsa-1177, myndigheter-forsakringskassan, pengar-paminnelse-inkasso) behålls. De kontrolleras mot källa innan ämnena publiceras.
- Tjänstenamn i sidtexterna hämtas från kontaktfilen (src/data/kontakter.json), inte skrivna i texten.

## 2026-10-18, efter stilgranskningen av tre figurer

- Användaren tyckte inte om gränssnittet. Hela appen görs om, med referensbildens principer som riktning: figuren i centrum, lugn ram, små kontroller och etiketter på figuren.
- Regeln i CLAUDE.md, punkt 6, gäller fortfarande: egen tolkning, inga kopior av referensens figurer, kod, färger eller layout.
- Figurerna ska vara i riktig 3D som går att snurra. Teknik: three.js (MIT) med ortografisk kamera, toon-material och bläckkonturer (inverted hull). Ersätter beslutet efter fas 0 om SVG-figurer och om raka konturer på rörliga delar.
- Figurerna ska vara självförklarande. Fokus på bilden, textversionen står alltid under.
- Typografi: IBM Plex Mono (OFL-1.1) tillkommer för små etiketter och figurknappar.
