// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calculadora from './index'
import Grafico from './Grafico'

afterEach(cleanup)

const arquivo = (texto, nome = 'teste.csv') => new File([texto], nome, { type: 'text/csv' })
const valorDe = (rotulo) => screen.getByText(rotulo, { selector: 'dt' }).nextElementSibling.textContent

async function carregarArquivo(usuario, texto) {
    const { container } = { container: document.body }
    await usuario.upload(container.querySelector('input[type=file]'), arquivo(texto))
}

describe('Calculadora', () => {
    it('dados de exemplo mostram os resultados e desenham o gráfico', async () => {
        const usuario = userEvent.setup()
        const { container } = render(<Calculadora />)
        await usuario.click(screen.getByRole('button', { name: 'Usar dados de exemplo' }))
        expect(screen.getByText(/1008 leituras/)).toBeTruthy()
        expect(valorDe('MKT')).toBe('5,1 °C')
        expect(container.querySelector('svg polyline')).toBeTruthy()
    })

    it('apagar um limite mantém os campos na tela e permite digitar de novo', async () => {
        const usuario = userEvent.setup()
        render(<Calculadora />)
        await usuario.click(screen.getByRole('button', { name: 'Usar dados de exemplo' }))
        const minimo = screen.getByLabelText('Faixa aceitável, mínima (°C)')
        await usuario.clear(minimo)
        expect(screen.getByRole('alert').textContent).toMatch(/Preencha os dois limites/)
        expect(screen.getByLabelText('Faixa aceitável, mínima (°C)')).toBeTruthy()
        await usuario.type(minimo, '2,5')
        expect(valorDe('MKT')).toBe('5,1 °C')
    })

    it('decimal pendente ("6,") não some com os resultados', async () => {
        const usuario = userEvent.setup()
        render(<Calculadora />)
        await usuario.click(screen.getByRole('button', { name: 'Usar dados de exemplo' }))
        const maximo = screen.getByLabelText('Faixa aceitável, máxima (°C)')
        await usuario.clear(maximo)
        await usuario.type(maximo, '6,')
        expect(screen.getByText('MKT', { selector: 'dt' })).toBeTruthy()
    })

    it('limites invertidos geram aviso', async () => {
        const usuario = userEvent.setup()
        render(<Calculadora />)
        await usuario.click(screen.getByRole('button', { name: 'Usar dados de exemplo' }))
        const minimo = screen.getByLabelText('Faixa aceitável, mínima (°C)')
        await usuario.clear(minimo)
        await usuario.type(minimo, '9')
        expect(screen.getByText(/A mínima está maior que a máxima/)).toBeTruthy()
    })

    it('CSV ambíguo pergunta, leva o foco e respeita a escolha', async () => {
        const usuario = userEvent.setup()
        render(<Calculadora />)
        await carregarArquivo(usuario, '2026-01-12 08:00:00,5,3\n2026-01-12 08:10:00,5,4')
        const pergunta = await screen.findByRole('group')
        expect(document.activeElement).toBe(pergunta)
        await usuario.click(screen.getByRole('button', { name: /São decimais/ }))
        expect(valorDe('Mínima')).toBe('5,3 °C')
    })

    it('valores impossíveis (timestamp, -9999) são descartados com aviso, sem travar', async () => {
        const usuario = userEvent.setup()
        render(<Calculadora />)
        await carregarArquivo(usuario, 'Data;Temp\n2026-01-12 08:00:00;1768219200\n2026-01-12 08:01:00;-9999\n2026-01-12 08:02:00;5,1')
        expect(await screen.findByText(/2 leitura\(s\) com valor impossível/)).toBeTruthy()
        expect(valorDe('Máxima')).toBe('5,1 °C')
    })

    it('arquivo só com valores impossíveis mostra erro e nenhum resultado', async () => {
        const usuario = userEvent.setup()
        render(<Calculadora />)
        await carregarArquivo(usuario, 'Data;Temp\n2026-01-12 08:00:00;1768219200')
        expect((await screen.findByRole('alert')).textContent).toMatch(/não parecem temperaturas/)
        expect(screen.queryByText('MKT', { selector: 'dt' })).toBeNull()
    })
})

describe('Grafico', () => {
    const leituras = (temps) => temps.map((temp) => ({ temp, data: null }))
    const marcas = (container) => container.querySelectorAll('text').length

    it('o número de elementos não cresce com a magnitude dos valores', () => {
        // limites altos de propósito: o gráfico recebe o que o componente pai mandar
        for (const extremo of [10, 1000, 1e6, 1e9]) {
            const { container, unmount } = render(<Grafico leituras={leituras([0, extremo])} limMin={2} limMax={8} />)
            expect(container.querySelectorAll('svg *').length).toBeLessThan(60)
            expect(marcas(container)).toBeLessThan(20)
            unmount()
        }
    })

    it('100 mil leituras viram menos de 1000 pontos na linha', () => {
        const muitas = Array.from({ length: 100000 }, (_, i) => ({ temp: 5 + Math.sin(i / 100), data: null }))
        const { container } = render(<Grafico leituras={muitas} limMin={2} limMax={8} />)
        const pontos = container.querySelector('polyline').getAttribute('points').trim().split(/\s+/)
        expect(pontos.length).toBeLessThan(1000)
    })
})
