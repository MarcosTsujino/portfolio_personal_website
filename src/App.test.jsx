// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import App from './App'
import { PAGINAS, PAGINA_404 } from './seo/paginas'

afterEach(cleanup)

const abrir = (rota) => {
    window.history.pushState({}, '', rota)
    return render(<App />)
}

describe('App', () => {
    it.each(Object.keys(PAGINAS))('%s: um único h1 e o título da página', (rota) => {
        abrir(rota)
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
        expect(document.title).toBe(PAGINAS[rota].titulo)
    })

    it('rota inexistente mostra o 404 com noindex', () => {
        abrir('/nao-existe')
        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Página não encontrada')
        expect(document.title).toBe(PAGINA_404.titulo)
        expect(document.head.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex')
    })

    it('o link "Pular para o conteúdo" aponta para o <main>', () => {
        abrir('/')
        const pular = screen.getByRole('link', { name: 'Pular para o conteúdo' })
        expect(document.querySelector(pular.getAttribute('href')).tagName).toBe('MAIN')
    })
})
