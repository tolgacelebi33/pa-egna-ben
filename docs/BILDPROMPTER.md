# Bildprompter för figurerna

Bilderna genereras med en AI-bildgenerator, till exempel ChatGPT eller Midjourney. Interaktionen byggs ovanpå i appen: klickytor, etiketter, steg, textversion och listor. Därför ska bilderna **inte innehålla text, siffror, pilar eller etiketter**.

## Så här gör du

1. Klistra in **stilblocket** först i varje prompt, och sedan figurens **lägesprompt**.
2. Generera **grundbilden** för en figur först. När du är nöjd med den, använd den som referens för figurens övriga lägen, så att vinkel, storlek och färger blir exakt desamma. I ChatGPT: ladda upp grundbilden och skriv "same image, same angle and framing, but ...". I Midjourney: använd bilden som referens, till exempel med `--cref` eller `--sref`.
3. Format: **kvadratisk**, minst 1536 × 1536 pixlar. Spara som PNG.
4. Lägg bilderna i `OMO/public/figurer/bilder/<figur>/<läge>.png`, med exakt de filnamn som står nedan.
5. Säg till när en figur är klar. Då kopplar jag ihop den.

Det gör inget om bakgrunden inte blir exakt rätt. Jag kan lägga figuren på appens papper.

## Stilblock (används i alla prompter)

```
Isometric illustration, 30-degree isometric angle viewed from the front-left and slightly above.
Hand-drawn look with confident, slightly uneven dark brown ink outlines (#2a2522), flat colors
with soft two-tone shading, subtle paper grain texture. Muted warm palette: cream paper background
(#f6f1e7), terracotta (#c8664a), sage green (#8fa58a), ochre (#d9a441), slate blue (#5e7fa0),
warm greys and natural wood. Clean product-illustration style like a friendly instruction manual,
realistic proportions, accurate real-world construction. Single object centered with generous empty
space around it, soft contact shadow on a plain light floor. No text, no letters, no numbers,
no arrows, no labels, no logos, no brand names, no people unless stated.
```

---

## Kyl och frys (`kyl`)

Modern fristående kombinerad kyl och frys: kylen upptill med en dörr gångjärnad till vänster, frysen nedtill med två utdragbara frysbackar.

| Fil | Prompt efter stilblocket |
|---|---|
| `stangd.png` | A modern freestanding fridge-freezer in warm off-white, fridge on top with one door, freezer drawers below, both closed. |
| `oppen.png` | Same fridge-freezer, fridge door wide open to the left so the interior is clearly visible: three glass shelves, a vegetable drawer at the bottom, door shelves on the inside of the door. Interior empty and clean, soft interior light. |
| `oppen-mat.png` | Same open fridge with food placed: a milk carton and butter on the door shelves, eggs and leftovers in boxes on the top shelf, cheese and yoghurt on the middle shelf, a wrapped raw chicken on a plate on the lowest shelf, vegetables in the vegetable drawer. |
| `frys-ute.png` | Same fridge-freezer with the fridge door closed and the top freezer drawer pulled straight out, showing frozen bags and a thick layer of frost and ice on the drawer walls. |

## Vattenlåset (`vattenlas`)

Diskbänksskåp med öppen dörr. Under diskhon syns ett vit plastvattenlås av sorten med U-böj.

| Fil | Prompt efter stilblocket |
|---|---|
| `grund.png` | A kitchen sink cabinet with the cabinet doors open. Under the stainless steel sink a white plastic U-shaped sink trap (P-trap) connects the drain to the wall pipe. Cut-away view of the trap showing water standing in the bottom of the U-bend. |
| `torr.png` | Same image, but the U-bend is empty with no water, and faint wavy greenish smell lines rise from the wall pipe through the empty trap up through the sink drain. |
| `loss.png` | Same cabinet, the U-bend unscrewed and lowered into a small bucket on the cabinet floor, with hair and grime visible inside the bend. The two plastic nuts are loose. |

## Toalettens cistern (`cistern`)

Vanlig svensk golvstående toalett med cistern ovanpå skålen. Fokus är på vad som händer inuti cisternen.

| Fil | Prompt efter stilblocket |
|---|---|
| `grund.png` | A white floor-standing toilet with the cistern lid removed and leaning against the wall, cut-away front of the cistern showing the inside: fill valve on the left, float, overflow pipe and flush valve with rubber seal in the middle, water level high. |
| `spolar.png` | Same cut-away, the flush valve seal lifted, water level low and rushing down into the bowl. |
| `fylls.png` | Same cut-away, seal closed, float low, fill valve open with water spraying in, water level halfway. |
| `lacker.png` | Same cut-away, cistern full but a thin continuous trickle of water running from a worn seal down into the bowl, visible ripple in the bowl. |

## Diskmaskinen (`diskmaskin`)

En modern inbyggd diskmaskin med **två korgar och ingen besticklåda upptill**: övre korg för glas, nedre korg för tallrikar, bestickkorg i nedre korgen.

| Fil | Prompt efter stilblocket |
|---|---|
| `stangd.png` | A built-in dishwasher between kitchen cabinets under a worktop, door closed, stainless steel front with a recessed handle. |
| `oppen.png` | Same dishwasher with the door folded fully down, both racks inside and empty, spray arm and filter visible at the bottom, detergent compartment on the inside of the door. |
| `korg-ute.png` | Same open dishwasher, lower rack pulled out onto the open door, loaded with plates standing in rows and a cutlery basket, upper rack inside with glasses and cups. |
| `filter.png` | Same open dishwasher with racks pushed in, the round filter lifted out and lying on the open door, small food residue on it. |

## Spis och ugn (`spis`)

Fristående spis med svart induktionshäll och ugn under.

| Fil | Prompt efter stilblocket |
|---|---|
| `grund.png` | A freestanding electric cooker in white with a black glass induction hob with four cooking zones on top, a control panel with two knobs, and an oven below with a glass door, door closed. |
| `kastrull.png` | Same cooker with a stainless steel saucepan with lid on the front right cooking zone, the zone glowing faintly, gentle steam rising. |
| `ugn-oppen.png` | Same cooker, oven door folded fully down, interior visible: two wire racks, a baking tray, a round fan cover on the back wall, heating element at the top glowing orange. |

## Dammsugaren (`dammsugare`)

Vanlig golvdammsugare med påse: liten kropp på hjul, flexibel slang, ett rakt metallrör och ett golvmunstycke.

| Fil | Prompt efter stilblocket |
|---|---|
| `grund.png` | A canister vacuum cleaner in sage green on a wooden floor: compact body on wheels, a flexible ribbed hose attached to a straight telescopic metal tube with a handle, and a wide floor nozzle at the end. The hose, tube and nozzle are connected in one continuous line. |
| `oppen.png` | Same vacuum cleaner, the top lid of the body flipped open showing a full grey paper dust bag inside. |
| `munstycken.png` | The three vacuum attachments laid out side by side on the floor: a wide floor nozzle, a narrow crevice tool and a small round dusting brush. |
| `filter.png` | Same vacuum cleaner with the rear filter cover open and a dusty pleated filter pulled half out. |

## Väggen i genomskärning (`tavla`)

Tre separata bilder av en verklig väggkonstruktion, var och en med en tavla upphängd.

| Fil | Prompt efter stilblocket |
|---|---|
| `gips.png` | A section of a Swedish interior partition wall cut open at the right edge: two layers of white gypsum board on each side of steel studs (vertical metal profiles), mineral wool insulation between the studs, an electrical cable conduit running inside. A framed picture hangs on the wall on a gypsum anchor. |
| `betong.png` | A section of a concrete wall cut open at the right edge showing solid grey concrete with small stones, painted surface. A framed picture hangs on a plastic wall plug and screw. |
| `tra.png` | A section of a wall with a wooden stud frame cut open at the right edge: wooden studs, wood panel or board on the room side. A framed picture hangs on a screw driven into a stud. |

## Påslakanet (`paslakan`)

En säng med ett täcke och en person som drar på ett påslakan. Använd en enkel, anonym stiliserad figur.

| Fil | Prompt efter stilblocket |
|---|---|
| `steg1.png` | A single bed with a white duvet lying flat on it, a patterned slate-blue duvet cover lying turned inside out next to it on the bed. |
| `steg2.png` | A simple stylised person (no face details) with both hands inside the inside-out duvet cover, gripping its two top corners from the inside, standing at the foot of the bed. |
| `steg3.png` | The same person holding the top corners of the duvet through the cover and shaking so the cover slides down over the duvet, the cover now right side out. |
| `klar.png` | The bed neatly made with the duvet inside the patterned slate-blue cover and a pillow at the head. |

## Cykeln (`cykel`)

Vanlig svensk stadscykel. Det är den här bilden som är viktigast att få realistisk.

| Fil | Prompt efter stilblocket |
|---|---|
| `grund.png` | A classic slate-blue Scandinavian city bicycle with upright handlebars, rim brakes, a chain guard, a rear rack, fenders and a kickstand, standing on the floor. |
| `punktering.png` | Same bicycle, the front tyre visibly flat at the bottom, a small puncture with tiny air puff marks. |
| `pump.png` | Same bicycle with a floor pump next to it, the pump hose connected to the front tyre valve, tyre fully inflated. |
| `kedja.png` | Close-up of the same bicycle's chain and rear sprocket, a small oil bottle dripping oil onto the chain. |

## Fakturan (`faktura`)

En svensk faktura på ett skrivbord. Bildgeneratorer klarar inte text bra, så pappret ska vara **tomt med fält**, och jag lägger texten ovanpå.

| Fil | Prompt efter stilblocket |
|---|---|
| `grund.png` | A single A4 paper invoice lying flat on a wooden desk, seen from above at a slight isometric angle. The paper has an empty layout with blank boxes: a header area at the top, a table area in the middle, and at the bottom a separated payment slip strip with three empty rectangular fields. A pen and a coffee cup beside the paper. No text, no numbers on the paper. |

## Städschemat (`stadschema`)

Förslag: ersätt den gamla figuren med en enkel, begriplig bild av en liten lägenhet uppifrån, där varje rum visas. Interaktionen blir en lista per rum, utan figurlogik.

| Fil | Prompt efter stilblocket |
|---|---|
| `lagenhet.png` | A cosy one-bedroom apartment seen from above at an isometric angle with the roof removed: kitchen, bathroom, living room and bedroom clearly separated by walls, simple furniture in each room. |

## Godkända, behöver inga nya bilder

Tvättmaskinen, brandvarnaren, elskåpet, huvudkranen, budgeten, tvättsymbolerna (visas som ikoner), källsorteringen (visas som översikt) och beslutsträden.
