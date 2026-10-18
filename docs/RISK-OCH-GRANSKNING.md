# Risk, granskning och ansvar

Denna fil är obligatorisk och går före övriga instruktioner. Reglerna ska byggas in i koden så att de inte kan glömmas bort: brott mot dem ska få bygget att misslyckas.

Texterna i avsnitt 7 och 8 är utkast. De ersätter inte juridisk rådgivning och ska granskas av jurist innan appen publiceras offentligt.

## 1. Risker och hur de hanteras

| Risk | Hantering |
|---|---|
| Felaktiga råd orsakar skada (el, kemikalier, mat, hälsa, brand) | Risknivå per ämne. Hög risk kräver fackgranskning innan publicering. Fasta säkerhetsregler per område (avsnitt 4). |
| Innehåll blir inaktuellt (lagar, bidrag, priser, myndighetsrutiner) | `regelberoende` och `nasta_kontroll` per ämne. Bygget misslyckas när ett högriskämne passerat sitt kontrolldatum. "Senast kontrollerad" visas på varje ämnessida. |
| Påhittade fakta eller källor | Inga faktauppgifter utan verifierad källa. `TODO-KONTROLL` i stället. Bygget misslyckas om publicerat innehåll innehåller `TODO-KONTROLL`. |
| Regionala skillnader (sophantering, tvättstuga, kollektivtrafik) | `varierar_per_kommun: true` ger en tydlig ruta och hänvisning till kommunen. Inga påståenden som bara gäller vissa kommuner som om de gällde alla. |
| Upphovsrätt | Egen text och egna figurer. Länka till källor, kopiera inte. Ingen kopiering av referenssajtens figurer eller kod. |
| Integritet och GDPR | Inga konton, ingen backend, ingen spårning. Data stannar på enheten. |
| Ekonomiska råd som uppfattas som personlig rådgivning | Endast förklaring av begrepp och regler. Inga produkt- eller placeringsrekommendationer. Inga affiliate-länkar. |
| Medicinska råd | Inga diagnoser, inga doseringar. Hänvisning till 1177 och vården. |
| Juridiska råd | Förklarar hur saker generellt fungerar, hänvisar till rätt instans. Inga bedömningar av enskilda fall. |
| Sponsring påverkar innehållet | Sponsorer får aldrig påverka innehåll. Sponsrat innehåll märks tydligt. Ingen sponsring inom ekonomi, försäkring eller boende-rättigheter. |
| Ton som stöter bort målgruppen | Tonregler i `CLAUDE.md`. Test med riktiga användare innan lansering. |
| Tillgänglighet | WCAG 2.1 AA som mål. Textversion av varje figur. |

## 2. Innehållsschema (frontmatter)

Varje innehållsfil ska ha följande fält. Schemat valideras vid bygge.

```yaml
id: tvatt-symboler               # unikt, små bokstäver, bindestreck
titel: Tvättsymboler
titel_en: ""                     # fylls senare
kategori: tvatt                  # id från INNEHALL.md
sammanfattning: ""               # en mening, vad användaren får veta
niva: vecka1                     # vecka1 | forsta_aret | bra_att_veta
risk: lag                        # lag | medel | hog
regelberoende: false             # true om lagar, regler, priser eller rutiner kan ändras
varierar_per_kommun: false
akut: false                      # true = måste fungera offline och nås från "Vad gör jag när..."
figur: null                      # figur-id eller null
filter:                          # visas bara om användarens onboarding matchar; tomt = visas för alla
  boendeform: []                 # hyresratt | andrahand | bostadsratt | studentboende | inneboende
  utrustning: []                 # egen_tvattmaskin | tvattstuga | diskmaskin | torktumlare | induktion | gasspis
kallor:                          # endast källor som faktiskt har öppnats och kontrollerats
  - namn: ""
    url: ""
    hamtad: 2026-01-01
granskning:
  status: utkast                 # utkast | for_granskning | publicerad
  senast_kontrollerad: null
  nasta_kontroll: null
  skriven_av: ""
  faktagranskad_av: ""           # krävs för publicering vid risk medel och hog
  fackgranskad_av: ""            # krävs för publicering vid risk hog
  fackgranskare_kompetens: ""    # till exempel "behörig elinstallatör"
relaterade: []
```

## 3. Byggregler (ska implementeras och testas)

Bygget ska **misslyckas** om något av följande gäller för innehåll med `status: publicerad`:
1. Obligatoriskt fält saknas eller har fel värde.
2. Texten innehåller `TODO-KONTROLL`.
3. `risk: medel` eller `risk: hog` saknar `faktagranskad_av`.
4. `risk: hog` saknar `fackgranskad_av` eller `fackgranskare_kompetens`.
5. `risk: hog` och `nasta_kontroll` har passerats.
6. `regelberoende: true` och `kallor` är tom.
7. `akut: true` och ämnet saknas i offline-cachen.
8. Ett `relaterade`-id pekar på ett ämne som inte finns.

Bygget ska **varna** om:
1. `risk: lag` eller `risk: medel` har passerat `nasta_kontroll`.
2. En källa är äldre än 12 månader och `regelberoende: true`.

Innehåll med annan status än `publicerad` tas inte med i produktionsbygget. I utvecklingsläge visas det med en tydlig markering "Utkast, ej granskat".

**Förslag på kontrollintervall** (justeras när granskare finns): hög risk var 6:e månad, medel var 12:e, låg var 24:e. Regelberoende ämnen kontrolleras dessutom vid kända ändringstillfällen, till exempel årsskiften.

## 4. Säkerhetsregler per område

Dessa regler gäller allt innehåll och alla figurer.

**Akut**
- Varje ämne med `akut: true` börjar med: om någon är i fara, ring 112. Därefter stegen.
- Stegen är korta, numrerade och fungerar offline.
- Telefonnummer och tjänstenamn hämtas från en enda central fil med källa och kontrolldatum, aldrig hårdkodade i löptext.

**El**
- Appen beskriver bara det som en lekman får och kan göra säkert, till exempel byta glödlampa, återställa jordfelsbrytare, byta propp. Exakt vad som är tillåtet att göra själv ska fastställas med källa och fackgranskas (`TODO-KONTROLL`).
- Allt annat: `AnlitaProffs`-ruta med hänvisning till behörig elinstallatör och till hyresvärden.
- Inga instruktioner för att öppna elcentral, dra kabel eller byta uttag.
- Laddning av batterier (elsparkcykel, mobil, powerbank) har egen brandsäkerhetsruta.

**Gas, vatten och värme**
- Gaslukt: ut, inga strömbrytare, larma. Exakta steg fackgranskas.
- Vattenläcka: huvudkranen och kontakta hyresvärden. Inga instruktioner för rörarbete utöver att rensa vattenlås.

**Kemikalier och städning**
- Varning för att blanda rengöringsmedel. Vilka kombinationer som ska nämnas fastställs med källa.
- Hänvisning till Giftinformationscentralen vid förgiftning. Numret hämtas från den centrala filen.

**Mat**
- Temperaturer, hållbarhet och hantering av rå mat endast med källa från ansvarig myndighet.
- Allergier: appen ger inga råd om allergier utöver att hänvisa till vården.

**Hälsa och mående**
- Inga diagnoser, inga läkemedelsdoser.
- Hänvisning till 1177 och vårdcentral.
- Ämnen om att må dåligt visar alltid var man kan få hjälp, med källa och kontrolldatum för varje stödlinje.

**Pengar**
- Förklarar begrepp, regler och konsekvenser. Rekommenderar inga banker, kort, försäkringar, fonder eller lån.
- Belopp, gränser och bidragsregler är alltid `regelberoende: true` och visar kontrolldatum.

**Juridik och boende**
- Beskriver hur saker generellt fungerar och hänvisar till rätt instans. Inga bedömningar av enskilda fall.

**Skadedjur**
- Inga råd om att själv använda bekämpningsmedel utöver det som är tillåtet för privatpersoner och fastställt med källa. Hänvisning till hyresvärden.

**Fixa och laga**
- Hyresgästens regler om vad man får göra i bostaden (borra, måla, spika) med källa och påminnelse om att läsa sitt eget kontrakt.

## 5. Granskningsflöde

1. **Utkast:** skrivs enligt disposition. Alla fakta har källa eller `TODO-KONTROLL`.
2. **Faktagranskning:** en person kontrollerar varje faktauppgift mot källan. Krävs för medel och hög risk.
3. **Fackgranskning:** person med relevant kompetens (till exempel elinstallatör, livsmedelskunnig, jurist med hyresrättskunskap, vårdpersonal). Krävs för hög risk.
4. **Publicering:** status ändras till `publicerad`, kontrolldatum sätts.
5. **Uppföljning:** felrapporter från användare och passerade kontrolldatum leder tillbaka till steg 2.

Varje ändring av publicerat innehåll med risk medel eller hög går tillbaka genom granskning.

## 6. Felrapportering

- Varje ämnessida har "Rapportera fel" som öppnar ett förifyllt e-postmeddelande med ämnets id och titel. Ingen data skickas automatiskt.
- E-postadress: öppet beslut, platshållare tills vidare.

## 7. Utkast: Ansvarsfriskrivning

Visas i sin helhet på sidan Ansvarsfriskrivning, i kortform i sidfoten och i onboarding.

**Kortform:**
> På egna ben ger allmän information om att bo själv. Den ersätter inte råd från vården, en jurist, din hyresvärd eller en behörig hantverkare. Om någon är i fara, ring 112.

**Fullständig text:**
> På egna ben är en guide med allmän information om att bo själv. Vi gör vårt bästa för att innehållet ska vara korrekt och uppdaterat. Varje ämne visar vilka källor som använts och när det senast kontrollerades.
>
> Informationen är generell och kan inte ta hänsyn till din situation. Regler, priser och rutiner ändras, och kan skilja sig mellan kommuner, hyresvärdar och försäkringsbolag. Läs alltid ditt eget hyreskontrakt, dina försäkringsvillkor och bruksanvisningen till dina apparater.
>
> Appen ger inte medicinska, juridiska eller ekonomiska råd. Vid frågor om hälsa, kontakta 1177 eller vården. Vid frågor om ditt boende eller dina rättigheter, kontakta din hyresvärd eller en organisation som ger råd till hyresgäster. Arbete med el, gas och vatten utöver det som beskrivs i appen ska göras av behörig fackperson.
>
> Om någon är i fara, ring 112.
>
> Du använder informationen på eget ansvar. Om du hittar något som är fel, rapportera det via "Rapportera fel" på ämnets sida.

`TODO-KONTROLL`: Juristgranskning av texten, inklusive vilken ansvarsbegränsning som är giltig enligt svensk rätt.

## 8. Utkast: Integritet

> På egna ben har inga användarkonton och skickar ingen information om dig någonstans. Det du väljer i appen, till exempel boendeform, avbockade uppgifter och sparade recept, sparas bara på din egen enhet. Vi använder inga kakor för spårning, ingen statistik om hur du använder appen och inga annonser.
>
> Du kan radera allt som sparats under Inställningar, Radera mina uppgifter. Det raderas också om du rensar webbläsarens data för appen.
>
> Om du rapporterar ett fel skickas ett vanligt e-postmeddelande från ditt eget e-postprogram. Då ser vi din e-postadress och det du skriver. Vi använder det bara för att rätta felet.

`TODO-KONTROLL`:
- Om lokal lagring av användarens egna val kräver samtycke enligt gällande regler för elektronisk kommunikation, eller räknas som nödvändig för en tjänst användaren själv begär.
- Hostingleverantörens loggning av IP-adresser och vad det innebär för texten ovan.
- Personuppgiftsansvarig och kontaktuppgifter.

Funktionen "Radera mina uppgifter" ska byggas i fas 1.

## 9. Upphovsrätt och källor

- Allt innehåll skrivs med egna ord. Citera inte längre stycken från källor.
- Länka till originalkällan på varje ämnessida.
- Inga bilder från andra källor. Alla illustrationer ritas för appen.
- Typsnitt måste ha licens som tillåter webbruk och lokal hosting. Ange licens i repot.
- Tredjepartsbibliotek: förteckning med licenser i repot.

## 10. Sponsring och partners (gäller om det blir aktuellt)

- Partners får sprida appen. De får inte påverka innehåll.
- Inga logotyper eller länkar till kommersiella aktörer i innehåll om ekonomi, försäkring, kontrakt eller rättigheter.
- Eventuellt sponsrat innehåll märks "Sponsrat" och skiljs visuellt från övrigt innehåll.
