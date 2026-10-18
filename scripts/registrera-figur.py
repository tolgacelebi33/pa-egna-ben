#!/usr/bin/env python3
"""Registrerar en färdig figur: ordlistan, visningen och klar-markeringen.
Användning: python3 scripts/registrera-figur.py <id> <Komponentnamn>
"""
import sys

fid, namn = sys.argv[1], sys.argv[2]

p = 'src/figurer/ordlistor.js'
s = open(p).read()
if f"from './{fid}/sv.js'" not in s:
    var = fid.replace('-', '_')
    s = s.replace("\nexport const FIGURORDLISTOR = {", f"import {var} from './{fid}/sv.js';\n\nexport const FIGURORDLISTOR = {{", 1)
    s = s.replace(" };\n", f", '{fid}': {var} }};\n", 1)
    s = s.replace("\n\nimport", "\nimport")
    open(p, 'w').write(s)

p = 'src/components/FigurVisning.astro'
s = open(p).read()
if f"figurer/{fid}/" not in s:
    s = s.replace("\ninterface Props", f"import {namn} from '../figurer/{fid}/{namn}.jsx';\nimport {namn}Text from '../figurer/{fid}/Textversion.astro';\n\ninterface Props", 1)
    s = s.replace("\n\n\ninterface", "\n\ninterface")
    s = s.replace("    </>\n  ) : (", f"      {{id === '{fid}' && <{namn} client:visible />}}\n    </>\n  ) : (", 1)
    i = s.rindex("    </>\n  )\n}")
    s = s[:i] + f"      {{id === '{fid}' && <{namn}Text />}}\n" + s[i:]
    open(p, 'w').write(s)

p = 'src/data/figurer.js'
s = open(p).read()
s = s.replace(f"{{ id: '{fid}', titel:", f"{{ id: '{fid}', titel:", 1)
import re
s = re.sub(rf"(\{{ id: '{re.escape(fid)}', titel: '[^']*', klar: )false", r"\1true", s)
open(p, 'w').write(s)
print('registrerad', fid)
