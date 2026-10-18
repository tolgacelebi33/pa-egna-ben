// Alla interna adresser går via url(), så att appen fungerar både på en egen domän och i en undermapp
// (till exempel GitHub Pages: /pa-egna-ben/). Undermappen sätts med BASE_PATH vid bygget.
const BAS = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

export const url = (sokvag = '') => BAS + sokvag.replace(/^\//, '');
