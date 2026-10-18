// Gör om Markdown-direktiv till säkerhetsrutor:
// :::varning ... :::  och  :::anlita-proffs ... :::
// Rubriken läggs in som text, inte via CSS, så att skärmläsare läser upp den.
import { visit } from 'unist-util-visit';
import { t } from '../i18n/index.js';

const RUTOR = {
  varning: { klass: 'ruta-varning', rubrik: 'ruta.varning.rubrik' },
  'anlita-proffs': { klass: 'ruta-anlita-proffs', rubrik: 'ruta.proffs.rubrik', standardtext: 'ruta.proffs.text' },
};

export default function remarkRutor() {
  return (trad, fil) => {
    visit(trad, (nod) => {
      if (nod.type !== 'containerDirective' && nod.type !== 'leafDirective' && nod.type !== 'textDirective') return;
      const ruta = RUTOR[nod.name];
      if (!ruta) {
        fil.fail(`Okänt direktiv "${nod.name}". Tillåtna: ${Object.keys(RUTOR).join(', ')}`, nod);
        return;
      }
      nod.data = { hName: 'aside', hProperties: { className: ['ruta', ruta.klass] } };
      const barn = [
        { type: 'paragraph', data: { hProperties: { className: ['ruta-rubrik'] } }, children: [{ type: 'text', value: t(ruta.rubrik) }] },
      ];
      if (ruta.standardtext) barn.push({ type: 'paragraph', children: [{ type: 'text', value: t(ruta.standardtext) }] });
      nod.children = [...barn, ...(nod.children ?? [])];
    });
  };
}
