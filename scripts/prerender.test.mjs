import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PAGINAS } from '../src/seo/paginas.js'
import { arquivoDaRota, gerar, montarHtml } from './prerender.mjs'

const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const tag = (html, re) => html.match(re)?.[1]

describe('pré-render das meta tags', () => {
    it('preenche título, descrição, og e canonical da página', () => {
        const html = montarHtml(template, {
            titulo: 'Projetos | Marcos Tsujino',
            descricao: 'Lista de projetos',
            url: 'https://marcostsujino.vercel.app/projetos',
            indexar: true,
        })
        expect(tag(html, /<title>([^<]*)<\/title>/)).toBe('Projetos | Marcos Tsujino')
        expect(tag(html, /og:title" content="([^"]*)"/)).toBe('Projetos | Marcos Tsujino')
        expect(tag(html, /name="description" content="([^"]*)"/)).toBe('Lista de projetos')
        expect(tag(html, /canonical" href="([^"]*)"/)).toBe('https://marcostsujino.vercel.app/projetos')
        expect(tag(html, /og:url" content="([^"]*)"/)).toBe('https://marcostsujino.vercel.app/projetos')
        expect(tag(html, /og:image" content="([^"]*)"/)).toBe('https://marcostsujino.vercel.app/og-image.png')
    })

    it('escapa aspas e sinais no texto', () => {
        const html = montarHtml(template, { titulo: 'A & "B" <c>', descricao: 'x', url: 'https://x', indexar: true })
        expect(html).toContain('<title>A &amp; &quot;B&quot; &lt;c&gt;</title>')
    })

    it('404 sem canonical e sem og:url, com noindex', () => {
        const html = montarHtml(template, { titulo: 'Página não encontrada', descricao: 'x', url: null, indexar: false })
        expect(html).not.toContain('rel="canonical"')
        expect(html).not.toContain('og:url')
        expect(tag(html, /name="robots" content="([^"]*)"/)).toBe('noindex')
    })

    it('gera um arquivo por rota mais o 404.html', () => {
        const pasta = mkdtempSync(join(tmpdir(), 'prerender-'))
        writeFileSync(join(pasta, 'index.html'), template)
        const gerados = gerar(pasta)
        expect(gerados).toEqual([...Object.keys(PAGINAS).map(arquivoDaRota), '404.html'])
        const sobre = readFileSync(join(pasta, 'sobre.html'), 'utf8')
        expect(tag(sobre, /<title>([^<]*)<\/title>/)).toBe(PAGINAS['/sobre'].titulo)
    })

    it('o sitemap lista exatamente as rotas pré-renderizadas', () => {
        const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
        const urls = [...sitemap.matchAll(/<loc>https:\/\/marcostsujino\.vercel\.app([^<]*)<\/loc>/g)].map((m) => m[1])
        expect(urls.sort()).toEqual(Object.keys(PAGINAS).sort())
    })
})
