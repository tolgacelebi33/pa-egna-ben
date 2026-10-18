# Licenser för tredjepartskod och typsnitt

Krävs enligt docs/RISK-OCH-GRANSKNING.md, avsnitt 9. Uppdateras när beroenden ändras.

## Typsnitt

Båda typsnitten ligger lokalt i bygget (via Fontsource) och laddas aldrig från tredje part.

| Typsnitt | Licens |
|---|---|
| Atkinson Hyperlegible Next | SIL Open Font License 1.1 |
| Bricolage Grotesque | SIL Open Font License 1.1 |

## Paket

| Paket | Version | Licens | Används |
|---|---|---|---|
| @astrojs/markdown-remark | 7.3.3 | MIT | i appen |
| @astrojs/react | 7.1.0 | MIT | i appen |
| @fontsource-variable/bricolage-grotesque | 5.3.0 | OFL-1.1 | i appen |
| @fontsource/atkinson-hyperlegible-next | 5.3.0 | OFL-1.1 | i appen |
| astro | 7.4.0 | MIT | i appen |
| react | 19.3.1 | MIT | i appen |
| react-dom | 19.3.1 | MIT | i appen |
| remark-directive | 4.0.0 | MIT | i appen |
| unist-util-visit | 5.1.0 | MIT | i appen |
| yaml | 2.9.1 | ISC | i appen |
| @types/react | 19.3.0 | MIT | bygg och test |
| @types/react-dom | 19.3.0 | MIT | bygg och test |
| axe-core | 4.14.0 | MPL-2.0 | bygg och test |
| playwright | 1.64.1 | Apache-2.0 | bygg och test |
| workbox-build | 7.4.1 | MIT | bygg och test |
