// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contato from './index'

afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
})

async function preencherEEnviar(usuario) {
    await usuario.type(screen.getByLabelText('Nome'), 'Ana')
    await usuario.type(screen.getByLabelText('Email'), 'ana@exemplo.com')
    await usuario.type(screen.getByLabelText('Mensagem'), 'Olá, vaga de dev')
    await usuario.click(screen.getByRole('button', { name: 'Enviar pelo WhatsApp' }))
}

describe('Contato', () => {
    it('pop-up liberado: abre o WhatsApp com a mensagem e limpa o formulário', async () => {
        const janela = { opener: {} }
        const abrir = vi.spyOn(window, 'open').mockReturnValue(janela)
        const usuario = userEvent.setup()
        render(<Contato />)
        await preencherEEnviar(usuario)
        const url = new URL(abrir.mock.calls[0][0])
        expect(url.hostname).toBe('wa.me')
        expect(url.searchParams.get('text')).toContain('Meu nome é Ana')
        expect(janela.opener).toBeNull()
        expect(screen.getByLabelText('Nome').value).toBe('')
    })

    it('pop-up bloqueado: mantém o texto e oferece o link', async () => {
        vi.spyOn(window, 'open').mockReturnValue(null)
        const usuario = userEvent.setup()
        render(<Contato />)
        await preencherEEnviar(usuario)
        expect(screen.getByLabelText('Nome').value).toBe('Ana')
        const link = screen.getByRole('link', { name: /abrir o WhatsApp/ })
        expect(new URL(link.href).searchParams.get('text')).toContain('vaga de dev')
    })
})
