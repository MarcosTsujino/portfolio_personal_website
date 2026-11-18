// Constante do MKT: ΔH/R, com ΔH = 83,144 kJ/mol e R = 8,3144 J/(mol·K)
const DELTA_H_SOBRE_R = 10000
const KELVIN = 273.15

// Aceita ponto ou vírgula como separador decimal ("5.3" ou "5,3")
export function parseNumero(texto) {
    const limpo = (texto ?? '').trim().replace(/^"|"$/g, '')
    if (limpo === '') return NaN
    const normal = limpo.replace(',', '.')
    if (!/^[-+]?\d+(\.\d+)?$/.test(normal)) return NaN
    return Number(normal)
}

// Aceita "2026-01-12 08:00:00", "2026/01/12 08:00" e "12/01/2026 08:00:00"
export function parseData(texto) {
    const limpo = texto.trim().replace(/^"|"$/g, '')
    const m = limpo.match(/^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/)
    if (!m) return null
    const [, a, b, c, hh, mi, ss] = m
    const anoPrimeiro = a.length === 4
    const ano = Number(anoPrimeiro ? a : c)
    const mes = Number(b)
    const dia = Number(anoPrimeiro ? c : a)
    const data = new Date(ano, mes - 1, dia, Number(hh), Number(mi), Number(ss || 0))
    return Number.isNaN(data.getTime()) ? null : data
}

// Divide uma linha pelo separador, respeitando campos entre aspas ("5,3")
export function dividirLinha(linha, separador) {
    const campos = []
    let atual = ''
    let entreAspas = false
    for (const c of linha) {
        if (c === '"') entreAspas = !entreAspas
        else if (c === separador && !entreAspas) {
            campos.push(atual)
            atual = ''
        } else atual += c
    }
    campos.push(atual)
    return campos
}

// O separador é o que aparece na maioria das linhas: ";" e tabulação ganham de ","
export function detectarSeparador(linhas) {
    for (const candidato of [';', '\t']) {
        const comCandidato = linhas.filter((l) => l.includes(candidato)).length
        if (comCandidato > linhas.length / 2) return candidato
    }
    return ','
}

const ehInteiro = (texto) => /^[-+]?\d+$/.test((texto ?? '').trim())

// Uma leitura por linha; temperatura na última coluna; data/hora na primeira (opcional)
export function lerCsv(texto) {
    const linhas = texto.split(/\r?\n/).filter((l) => l.trim() !== '')
    const separador = detectarSeparador(linhas)
    const avisos = []
    if (linhas.length === 0) return { leituras: [], ignoradas: 0, avisos }

    let tabela = linhas.map((l) => dividirLinha(l, separador))
    const temCabecalho = Number.isNaN(parseNumero(tabela[0][tabela[0].length - 1]))

    // CSV com vírgula como separador E como decimal, sem aspas: "data,5,3".
    // Se o cabeçalho tem uma coluna a menos que os dados, as duas últimas formam o número.
    if (separador === ',' && temCabecalho) {
        const colunasCabecalho = tabela[0].length
        const dados = tabela.slice(1)
        const juntar = dados.length > 0 && dados.every(
            (c) => c.length === colunasCabecalho + 1 && ehInteiro(c[c.length - 2]) && /^\d+$/.test(c[c.length - 1].trim()),
        )
        if (juntar) {
            tabela = [tabela[0], ...dados.map((c) => [...c.slice(0, -2), `${c[c.length - 2]}.${c[c.length - 1].trim()}`])]
            avisos.push('As temperaturas usam vírgula decimal no mesmo arquivo separado por vírgulas; interpretei "5,3" como 5,3 °C.')
        }
    } else if (separador === ',' && tabela.length > 0 && tabela.every((c) => c.length >= 3 && ehInteiro(c[c.length - 1]) && ehInteiro(c[c.length - 2]))) {
        avisos.push('As duas últimas colunas são números inteiros. Se a temperatura usa vírgula decimal, salve o CSV com ponto e vírgula como separador ou com o valor entre aspas.')
    }

    const leituras = []
    let ignoradas = 0
    for (let i = 0; i < tabela.length; i += 1) {
        const colunas = tabela[i]
        const temp = parseNumero(colunas[colunas.length - 1])
        if (Number.isNaN(temp)) {
            // a primeira linha inválida costuma ser o cabeçalho: não conta como erro
            if (i > 0) ignoradas += 1
            continue
        }
        const data = colunas.length > 1 ? parseData(colunas[0]) : null
        leituras.push({ temp, data })
    }
    return { leituras, ignoradas, avisos }
}

export function calcularMkt(temps) {
    let soma = 0
    for (const t of temps) soma += Math.exp(-DELTA_H_SOBRE_R / (t + KELVIN))
    return -DELTA_H_SOBRE_R / Math.log(soma / temps.length) - KELVIN
}

export function calcular(leituras, limiteA, limiteB) {
    const n = leituras.length
    if (n === 0 || !Number.isFinite(limiteA) || !Number.isFinite(limiteB)) return null
    // aceita os limites em qualquer ordem
    const limMin = Math.min(limiteA, limiteB)
    const limMax = Math.max(limiteA, limiteB)

    let min = Infinity
    let max = -Infinity
    let total = 0
    let dentro = 0
    let excursoes = 0
    let estavaFora = false
    const temps = new Array(n)

    for (let i = 0; i < n; i += 1) {
        const t = leituras[i].temp
        temps[i] = t
        if (t < min) min = t
        if (t > max) max = t
        total += t
        const ok = t >= limMin && t <= limMax
        if (ok) dentro += 1
        if (!ok && !estavaFora) excursoes += 1
        estavaFora = !ok
    }

    const datas = leituras.map((l) => l.data).filter(Boolean)
    let emOrdem = true
    for (let i = 1; i < datas.length; i += 1) {
        if (datas[i] < datas[i - 1]) emOrdem = false
    }
    // reduce em vez de Math.min(...): arquivos grandes estourariam o limite de argumentos
    const tempos = datas.map((d) => d.getTime())
    const primeiro = tempos.reduce((a, b) => (b < a ? b : a), Infinity)
    const ultimo = tempos.reduce((a, b) => (b > a ? b : a), -Infinity)
    return {
        n,
        min,
        max,
        media: total / n,
        mkt: calcularMkt(temps),
        dentro,
        fora: n - dentro,
        percentualDentro: (dentro / n) * 100,
        excursoes,
        limMin,
        limMax,
        limitesInvertidos: limiteA > limiteB,
        comData: datas.length,
        emOrdem,
        inicio: datas.length ? new Date(primeiro) : null,
        fim: datas.length ? new Date(ultimo) : null,
    }
}

// Dados fictícios: 7 dias, uma leitura a cada 10 min, com uma excursão no 4º dia
export function gerarExemplo() {
    let semente = 20260112
    const aleatorio = () => {
        semente = (semente + 0x6d2b79f5) | 0
        let t = Math.imul(semente ^ (semente >>> 15), 1 | semente)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const dois = (v) => String(v).padStart(2, '0')
    const inicio = new Date(2026, 0, 12, 8, 0, 0)
    const linhas = ['Data e hora;Temperatura (°C)']
    for (let i = 0; i < 7 * 144; i += 1) {
        const d = new Date(inicio.getTime() + i * 10 * 60 * 1000)
        let temp = 5 + 1.3 * Math.sin((2 * Math.PI * i) / 144) + (aleatorio() - 0.5) * 0.4
        if (i >= 3 * 144 + 40 && i < 3 * 144 + 58) {
            const fase = (i - (3 * 144 + 40)) / 18
            temp += 5 * Math.sin(Math.PI * fase)
        }
        const texto = `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())} ${dois(d.getHours())}:${dois(d.getMinutes())}:00`
        linhas.push(`${texto};${temp.toFixed(1).replace('.', ',')}`)
    }
    return linhas.join('\n')
}
