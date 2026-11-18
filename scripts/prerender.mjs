// Gera um HTML por rota com título e meta tags já preenchidos.
//
// O site é uma SPA: sem isto, toda URL recebe o mesmo index.html, e os robôs do
// LinkedIn, WhatsApp, Slack e X (que não executam JavaScript) mostram a prévia da
// Home para qualquer link. O useSeo continua atualizando as tags durante a navegação.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PAGINAS, PAGINA_404, SITE } from '../src/seo/paginas.js'

const escapar = (texto) =>
    texto.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function trocar(html, padrao, valor) {
    if (!padrao.test(html)) throw new Error(`Tag não encontrada no index.html: ${padrao}`)
    return html.replace(padrao, (_, antes, depois) => `${antes}${valor}${depois}`)
}

// Preenche o template com os dados de uma página; url null = sem canonical/og:url (404)
export function montarHtml(template, { titulo, descricao, url, indexar }) {
    let html = template
    html = trocar(html, /(<title>)[^<]*(<\/title>)/, escapar(titulo))
    html = trocar(html, /(<meta name="description" content=")[^"]*(")/, escapar(descricao))
    html = trocar(html, /(<meta property="og:title" content=")[^"]*(")/, escapar(titulo))
    html = trocar(html, /(<meta property="og:description" content=")[^"]*(")/, escapar(descricao))
    html = trocar(html, /(<meta name="robots" content=")[^"]*(")/, indexar ? 'index, follow' : 'noindex')
    if (url) {
        html = trocar(html, /(<meta property="og:url" content=")[^"]*(")/, escapar(url))
        html = trocar(html, /(<link rel="canonical" href=")[^"]*(")/, escapar(url))
    } else {
        html = html.replace(/\s*<meta property="og:url" content="[^"]*" \/>/, '')
        html = html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '')
    }
    return html
}

// "/" → index.html, "/sobre" → sobre.html (servido em /sobre pelo cleanUrls da Vercel)
export const arquivoDaRota = (rota) => (rota === '/' ? 'index.html' : `${rota.slice(1)}.html`)

export function gerar(pasta) {
    const template = readFileSync(`${pasta}/index.html`, 'utf8')
    const gerados = []
    for (const [rota, pagina] of Object.entries(PAGINAS)) {
        const arquivo = arquivoDaRota(rota)
        writeFileSync(`${pasta}/${arquivo}`, montarHtml(template, { ...pagina, url: `${SITE}${rota}`, indexar: true }))
        gerados.push(arquivo)
    }
    writeFileSync(`${pasta}/404.html`, montarHtml(template, { ...PAGINA_404, url: null, indexar: false }))
    gerados.push('404.html')
    return gerados
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const gerados = gerar('dist')
    console.log(`pré-render: ${gerados.join(', ')}`)
}
