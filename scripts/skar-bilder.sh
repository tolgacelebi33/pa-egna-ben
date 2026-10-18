#!/bin/sh
# Skär AI-kollagen i public/figurer/bilder/<figur>/ till en WebP per läge.
# Kollagen är 1536x1024: 2x2-rutor (768x512) eller 3 kolumner (512x1024). Kanten (6 px) tas bort så att mellanrummen inte syns.
# Originalen flyttas till bilder-original/ (ligger utanför git).
set -e
B=public/figurer/bilder
mkdir -p bilder-original
skar() { # figur fil layout namn...
  fig=$1; fil=$2; lay=$3; shift 3; i=0
  for namn in "$@"; do
    if [ "$lay" = 2x2 ]; then x=$(( (i % 2) * 768 + 6 )); y=$(( (i / 2) * 512 + 6 )); w=756; h=500
    elif [ "$lay" = 3 ]; then x=$(( i * 512 + 6 )); y=6; w=500; h=1012
    else x=0; y=0; w=1536; h=1024; fi
    cwebp -quiet -q 80 -crop $x $y $w $h "$B/$fig/$fil" -o "$B/$fig/$namn.webp"
    i=$((i + 1))
  done
  mkdir -p "bilder-original/$fig" && mv "$B/$fig/$fil" "bilder-original/$fig/"
}
skar kyl        "Illustrerad kyl och frys i fyra vyer.png"           2x2 stangd oppen oppen-mat frys-ute
skar cistern    "Toalettcisternens fyra spolningsstadier.png"        2x2 grund spolar fylls lacker
skar diskmaskin "Diskmaskinens fyra rengöringssteg.png"              2x2 stangd oppen korg-ute filter
skar dammsugare "Illustrerad dammsugarguide i fyra paneler.png"      2x2 grund oppen munstycken filter
skar paslakan   "Så bäddar du med påslakanet.png"                    2x2 steg1 steg2 steg3 klar
skar cykel      "Cykelunderhåll i fyra steg.png"                     2x2 grund punktering pump kedja
skar vattenlas  "Så rengör du vattenlåset_ tre steg.png"             3   grund torr loss
skar spis       "Illustrerad trippelscen med spis och ugn.png"       3   grund kastrull ugn-oppen
skar tavla      "Tre väggar, tre fästmetoder.png"                    3   gips betong tra
skar faktura    "Minimalistisk fakturamall med kaffe och växt.png"   1   grund
skar stadschema "Skandinavisk lägenhet i isometrisk vy.png"          1   lagenhet
