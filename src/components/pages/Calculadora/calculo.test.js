import { describe, expect, it } from 'vitest'
import { ERRO_VIRGULA_AMBIGUA, calcular, calcularMkt, detectarSeparador, dividirLinha, gerarExemplo, lerCsv, lerLimite, parseData, parseNumero, resumir } from './calculo'

const leituras = (...temps) => temps.map((temp) => ({ temp, data: null }))

describe('parseNumero', () => {
    it('aceita ponto e vírgula como decimal', () => {
        expect(parseNumero('5.3')).toBe(5.3)
        expect(parseNumero('5,3')).toBe(5.3)
        expect(parseNumero(' "-2,5" ')).toBe(-2.5)
    })

    it('rejeita texto e campo vazio', () => {
        expect(parseNumero('')).toBeNaN()
        expect(parseNumero('Temperatura')).toBeNaN()
        expect(parseNumero(undefined)).toBeNaN()
    })
})

describe('parseData', () => {
    it('lê os três formatos', () => {
        expect(parseData('2026-01-12 08:00:00')).toEqual(new Date(2026, 0, 12, 8, 0, 0))
        expect(parseData('2026/01/12 08:00')).toEqual(new Date(2026, 0, 12, 8, 0, 0))
        expect(parseData('12/01/2026 08:00:00')).toEqual(new Date(2026, 0, 12, 8, 0, 0))
    })

    it('devolve null para texto que não é data', () => {
        expect(parseData('ontem')).toBeNull()
    })
})

describe('dividirLinha e detectarSeparador', () => {
    it('respeita campos entre aspas', () => {
        expect(dividirLinha('"2026-01-12 08:00:00","5,3"', ',')).toEqual(['2026-01-12 08:00:00', '5,3'])
    })

    it('escolhe o separador da maioria das linhas', () => {
        expect(detectarSeparador(['a;1', 'b;2', 'c,3'])).toBe(';')
        expect(detectarSeparador(['a,1', 'b,2;x', 'c,3'])).toBe(',')
        expect(detectarSeparador(['a\t1', 'b\t2'])).toBe('\t')
    })
})

describe('lerCsv', () => {
    it('lê ponto e vírgula com vírgula decimal', () => {
        const { leituras: l, ignoradas } = lerCsv('Data;Temp\n2026-01-12 08:00:00;5,3\n2026-01-12 08:10:00;5,4')
        expect(l.map((x) => x.temp)).toEqual([5.3, 5.4])
        expect(ignoradas).toBe(0)
    })

    it('não perde o arquivo por causa de um ";" perdido em CSV com vírgula', () => {
        const { leituras: l } = lerCsv('2026-01-12 08:00:00,5.3\n2026-01-12 08:10:00;x,5.4\n2026-01-12 08:20:00,5.5')
        expect(l.map((x) => x.temp)).toEqual([5.3, 5.4, 5.5])
    })

    it('junta vírgula decimal quando o cabeçalho tem uma coluna a menos', () => {
        const { leituras: l, avisos } = lerCsv('Data,Temp\n2026-01-12 08:00:00,5,3\n2026-01-12 08:10:00,-1,5')
        expect(l.map((x) => x.temp)).toEqual([5.3, -1.5])
        expect(avisos).toHaveLength(1)
    })

    it('caso 4: "data,5,3" sem cabeçalho não calcula sozinho; pergunta', () => {
        const texto = '2026-01-12 08:00:00,5,3\n2026-01-12 08:10:00,5,4'
        const r = lerCsv(texto)
        expect(r.ambiguo).toBe(true)
        expect(r.leituras).toEqual([])
        expect(lerCsv(texto, { virgula: 'decimal' }).leituras.map((x) => x.temp)).toEqual([5.3, 5.4])
    })

    it('caso 5: colunas inteiras sem cabeçalho também pergunta, e "colunas" lê o último número', () => {
        const texto = '2026-01-12 08:00:00,45,5\n2026-01-12 08:10:00,46,6'
        expect(lerCsv(texto).ambiguo).toBe(true)
        const r = lerCsv(texto, { virgula: 'colunas' })
        expect(r.leituras.map((x) => x.temp)).toEqual([5, 6])
        expect(r.avisos).toHaveLength(1)
    })

    it('A: cabeçalho e vírgula decimal, com uma temperatura inteira no meio', () => {
        const r = lerCsv('Data,Temp\n2026-01-12 08:00:00,5,3\n2026-01-12 08:10:00,6\n2026-01-12 08:20:00,5,4')
        expect(r.leituras.map((x) => x.temp)).toEqual([5.3, 6, 5.4])
        expect(r.avisos).toHaveLength(1)
    })

    it('C: outra coluna também com vírgula decimal vira erro, não 3 °C', () => {
        const r = lerCsv('Data,Umid,Temp\n2026-01-12 08:00:00,45,2,5,3')
        expect(r.erro).toBe(ERRO_VIRGULA_AMBIGUA)
    })

    it('F: uma coluna só com vírgula decimal e sem cabeçalho pergunta', () => {
        expect(lerCsv('5,3\n5,4').ambiguo).toBe(true)
        expect(lerCsv('5,3\n5,4', { virgula: 'decimal' }).leituras.map((x) => x.temp)).toEqual([5.3, 5.4])
    })

    it('caso 2: vírgula solta numa coluna de texto ignora só aquela linha', () => {
        const r = lerCsv('Data,Obs,Temp\n2026-01-12 08:00,ok,5.3\n2026-01-12 08:10,foi, reiniciado,5.4\n2026-01-12 08:20,ok,5.5')
        expect(r.erro).toBeUndefined()
        expect(r.leituras.map((x) => x.temp)).toEqual([5.3, 5.5])
        expect(r.ignoradas).toBe(1)
    })

    it('caso 3: uma linha corrompida no meio não derruba o arquivo', () => {
        const r = lerCsv('Data,Temp\n2026-01-12 08:00,5.3\nlixo,a,b,c,d\n2026-01-12 08:20,5.5')
        expect(r.erro).toBeUndefined()
        expect(r.leituras.map((x) => x.temp)).toEqual([5.3, 5.5])
        expect(r.ignoradas).toBe(1)
    })

    it('caso 1 (documentado): "Data,Temp" com linhas de dois números lê como duas colunas', () => {
        // só acontece se a coluna "Data" tiver um número de um dígito; aceito como limitação
        expect(lerCsv('Data,Temp\n5,3\n6,4').leituras.map((x) => x.temp)).toEqual([3, 4])
    })

    it('sem cabeçalho, larguras diferentes revelam a vírgula decimal', () => {
        const r = lerCsv('2026-01-12 08:00:00,5,3\n2026-01-12 08:10:00,6')
        expect(r.leituras.map((x) => x.temp)).toEqual([5.3, 6])
    })

    it('colunas inteiras legítimas com cabeçalho continuam funcionando', () => {
        const r = lerCsv('Data,Umid,Temp\n2026-01-12 08:00:00,45,5\n2026-01-12 08:10:00,46,6')
        expect(r.leituras.map((x) => x.temp)).toEqual([5, 6])
        expect(r.avisos).toEqual([])
        expect(r.erro).toBeUndefined()
    })

    it('aceita valor entre aspas em CSV com vírgula', () => {
        const { leituras: l } = lerCsv('"2026-01-12 08:00:00","5,3"')
        expect(l[0].temp).toBe(5.3)
    })

    it('não conta o cabeçalho como linha ignorada, mas conta as demais', () => {
        const { ignoradas } = lerCsv('Data;Temp\n2026-01-12 08:00:00;5\nlixo;abc')
        expect(ignoradas).toBe(1)
    })

    it('arquivo vazio não quebra', () => {
        expect(lerCsv('')).toEqual({ leituras: [], ignoradas: 0, avisos: [] })
    })
})

describe('escolhas documentadas', () => {
    it('com exatamente metade das linhas com ";" o separador fica ","', () => {
        expect(detectarSeparador(['a;1', 'b,2'])).toBe(',')
    })

    it('"1,234" é lido como 1,234 (decimal), não como milhar: temperaturas não usam milhar', () => {
        expect(parseNumero('1,234')).toBe(1.234)
    })
})

describe('lerLimite', () => {
    it('aceita vírgula, ponto e decimal pendente durante a digitação', () => {
        expect(lerLimite('2,5')).toBe(2.5)
        expect(lerLimite('2.')).toBe(2)
        expect(lerLimite('2,')).toBe(2)
        expect(lerLimite('-1')).toBe(-1)
    })

    it('vazio ou texto vira NaN', () => {
        expect(lerLimite('')).toBeNaN()
        expect(lerLimite('-')).toBeNaN()
        expect(lerLimite('abc')).toBeNaN()
    })
})

describe('calcularMkt', () => {
    it('temperatura constante dá MKT igual a ela', () => {
        expect(calcularMkt([5, 5, 5])).toBeCloseTo(5, 6)
    })

    it('MKT fica acima da média quando a temperatura varia', () => {
        // valor de referência conferido em Python
        expect(calcularMkt([2, 4, 6, 8, 10, 30])).toBeCloseTo(16.6433, 3)
        expect(calcularMkt([-20, 40])).toBeGreaterThan(10)
    })
})

describe('calcular', () => {
    it('conta leituras fora e excursões', () => {
        const r = calcular(leituras(5, 9, 10, 5, 1, 5), 2, 8)
        expect(r.fora).toBe(3)
        expect(r.excursoes).toBe(2)
        expect(r.percentualDentro).toBeCloseTo(50)
    })

    it('aceita limites invertidos e avisa', () => {
        const normal = calcular(leituras(5, 9), 2, 8)
        const invertido = calcular(leituras(5, 9), 8, 2)
        expect(invertido.percentualDentro).toBe(normal.percentualDentro)
        expect(invertido.limitesInvertidos).toBe(true)
        expect([invertido.limMin, invertido.limMax]).toEqual([2, 8])
    })

    it('devolve null com limite vazio em vez de quebrar', () => {
        expect(calcular(leituras(5), NaN, 8)).toBeNull()
    })

    it('período usa a menor e a maior data e informa quantas leituras têm data', () => {
        const d = (min) => new Date(2026, 0, 12, 8, min)
        const r = calcular(
            [{ temp: 5, data: d(20) }, { temp: 5, data: null }, { temp: 5, data: d(0) }],
            2,
            8,
        )
        expect(r.inicio).toEqual(d(0))
        expect(r.fim).toEqual(d(20))
        expect(r.comData).toBe(2)
        expect(r.emOrdem).toBe(false)
    })
})

describe('desempenho', () => {
    // relógio de parede pisca em runner compartilhado: roda só na máquina local
    it.skipIf(Boolean(globalThis.process?.env?.CI))('com o resumo pronto, recalcular os limites em 200 mil leituras é rápido', () => {
        const muitas = Array.from({ length: 200000 }, (_, i) => ({ temp: 5 + Math.sin(i / 50), data: null }))
        const resumo = resumir(muitas)
        const inicio = performance.now()
        calcular(muitas, 2, 8, resumo)
        expect(performance.now() - inicio).toBeLessThan(50)
    })
})

describe('gerarExemplo', () => {
    it('gera 7 dias de leituras com uma excursão', () => {
        const { leituras: l } = lerCsv(gerarExemplo())
        const r = calcular(l, 2, 8)
        expect(r.n).toBe(1008)
        expect(r.excursoes).toBe(1)
        expect(r.emOrdem).toBe(true)
        expect(r.mkt).toBeCloseTo(5.14, 1)
    })
})
