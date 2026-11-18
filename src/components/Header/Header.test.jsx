// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from './index'

afterEach(cleanup)

const montar = (rota = '/') =>
    render(
        <MemoryRouter initialEntries={[rota]}>
            <Header />
        </MemoryRouter>,
    )

describe('Header', () => {
    it('o botão do menu alterna aria-expanded e o rótulo', async () => {
        const usuario = userEvent.setup()
        montar()
        const botao = screen.getByRole('button', { name: 'Abrir menu' })
        expect(botao.getAttribute('aria-expanded')).toBe('false')
        await usuario.click(botao)
        expect(botao.getAttribute('aria-expanded')).toBe('true')
        expect(botao.getAttribute('aria-label')).toBe('Fechar menu')
    })

    it('Esc fecha o menu', async () => {
        const usuario = userEvent.setup()
        montar()
        const botao = screen.getByRole('button', { name: 'Abrir menu' })
        await usuario.click(botao)
        await usuario.keyboard('{Escape}')
        expect(botao.getAttribute('aria-expanded')).toBe('false')
    })

    it('clicar num link fecha o menu', async () => {
        const usuario = userEvent.setup()
        montar()
        const botao = screen.getByRole('button', { name: 'Abrir menu' })
        await usuario.click(botao)
        await usuario.click(screen.getByRole('link', { name: 'Sobre' }))
        expect(botao.getAttribute('aria-expanded')).toBe('false')
    })

    it('marca a página atual com aria-current', () => {
        montar('/projetos')
        expect(screen.getByRole('link', { name: 'Projetos' }).getAttribute('aria-current')).toBe('page')
        expect(screen.getByRole('link', { name: 'Sobre' }).getAttribute('aria-current')).toBeNull()
    })
})
