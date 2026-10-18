# Rapport: alla 19 figurer

Datum: 2026-10-18. Testversion: https://tolgacelebi33.github.io/pa-egna-ben/figur/

## Gjort

Alla figurer i katalogen är byggda som statisk 3D: isometriska bilder med djup och genomskärning. Varje figur har steg som små knappar ovanför, delar som går att klicka på i bilden, en statusrad, etiketter på delarna och en textversion under.

| Nr | Figur | Vad man gör |
|---|---|---|
| 01 | Tvättmaskinen | Sortera, vrid ratten, välj temperatur, starta. Genomskärning med vatten och trumma. |
| 02 | Brandvarnaren | Testknapp, öppna locket, byt batteri, jämför pipen. |
| 03 | Elskåpet | Överlast som löser ut säkringen, dra ur, slå på, testa jordfelsbrytaren. |
| 04 | Kyl och frys | Öppna, dra maten till hyllorna, temperaturzoner, frosta av frysen. |
| 05 | Vattenlåset | Spola, låt det torka (lukt), skruva loss, rensa. |
| 06 | Toalettens cistern | Spola och se flottören, lyft locket, läckande tätning, stäng vattnet. |
| 07 | Huvudkranen | Det läcker, hitta kranen, stäng huvudkranen eller under diskbänken. |
| 08 | Diskmaskinen | Dra ut korgen, ställ in disk, fyll i diskmedel, rengör filtret. |
| 09 | Spis, ugn och induktion | Kastrull och magnet, slå på plattan, öppna ugnen, välj funktion. |
| 10 | Dammsugaren | Byt munstycke, öppna locket, byt påse, rengör filtret. |
| 11 | Väggen i genomskärning | Gips, betong eller trä, knacka, borra och plugga, häng rakt med vattenpass. |
| 12 | Påslakanet | Vänd, ta hörnen, dra över, skaka ned. |
| 13 | Cykeln | Hitta punkteringen, laga och pumpa, smörj kedjan, kolla bromsen. |
| 14 | Fakturan | Hitta belopp, OCR och förfallodag, se vad som händer om den inte betalas. |
| 15 | Budgetkalkylator | Egna belopp blir staplar, inkomst mot kostnader. Sparas bara på enheten. |
| 16 | Städschema | Välj rum, välj själv hur ofta, bocka av så att golvet blir rent. |
| 17 | Tvättsymboler som quiz | Fem symboler, välj grupp. |
| 18 | Källsortering som quiz | Sex saker, välj kärl. |
| 19 | Beslutsträd | Ett träd för vart och ett av de 17 ämnena i "Vad gör jag när...", visas direkt på ämnessidan. |

Inga faktauppgifter är påhittade. Program, temperaturer, gränsen för överlast, pipmönster, quizsvar och liknande är platshållare, och textversionerna har `TODO-KONTROLL` där källa behövs. Budgeten och städschemat föreslår inga belopp eller frekvenser. Användaren fyller i sina egna. Quizen är tydligt märkta som utkast.

## Testat och hur

- 115 av 115 kontroller i webbläsartestet. Det nya är att alla 19 figurer laddas utan fel, ryms på mobil (375 px) och att första steget går att trycka på. axe-core hittade inga brister på figursidorna.
- 71 av 71 enhetstester.
- Varje figur är granskad på skärmdumpar på dator och mobil, i flera steg.
- Testversionen är publicerad och svarar.

## Fungerar inte eller osäkert

- Inget är provat på riktig telefon.
- Figurerna har olika kvalitet. Tvättmaskinen, cisternen, väggen och spisen är mest genomarbetade. Påslakanet, dammsugaren och källsorteringen är enklare.
- Etiketter kan stå tätt på mobil i vissa figurer, där siffermarkeringarna används i stället.
- Förcachen för offline är nu cirka 5 MB okomprimerat.
- Quizsvaren och beslutsträdens vägar måste granskas innan de publiceras.

## Beslut som behövs

1. Vilka figurer du vill att jag förbättrar först efter att du provat dem.
2. Ska fas 4, texterna för de 70 ämnena med låg risk, börja nu?
