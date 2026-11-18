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

// Limite digitado pela pessoa: aceita "2", "2,5", "2.5" e também "2," no meio da
// digitação, para os resultados não piscarem; vazio ou inválido vira NaN
export function lerLimite(texto) {
    const normal = texto.trim().replace(',', '.')
    return /^[-+]?\d+(\.\d*)?$/.test(normal) ? Number(normal) : NaN
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
const ehFracao = (texto) => /^\d+$/.test((texto ?? '').trim())
const terminaComDoisInteiros = (c) => c.length >= 2 && ehInteiro(c[c.length - 2]) && ehFracao(c[c.length - 1])

export const ERRO_VIRGULA_AMBIGUA =
    'Não consegui saber se as vírgulas do arquivo separam colunas ou casas decimais. Salve o CSV com ponto e vírgula como separador (ou com as temperaturas entre aspas) e carregue de novo.'

// Decide, linha a linha, se as duas últimas colunas formam um número com vírgula decimal.
// A largura "normal" vem do cabeçalho; sem cabeçalho, da linha mais estreita.
// - linha com exatamente uma coluna a mais e "inteiro,inteiro" no fim: vírgula decimal;
// - linha com colunas sobrando que não se encaixa: é uma linha ruim, vai para "ignoradas";
// - se a maioria das linhas não se encaixa, o problema é do arquivo, não da linha: erro;
// - sem cabeçalho e com todas as linhas iguais, "data,45,5" pode ser 45,5 °C ou duas
//   colunas. Nenhuma regra resolve isso, então a pessoa escolhe (escolha = 'decimal' | 'colunas').
export function resolverVirgulaDecimal(tabela, temCabecalho, escolha) {
    const inicioDados = temCabecalho ? 1 : 0
    const dados = tabela.slice(inicioDados)
    if (dados.length === 0) return { tabela, juntadas: 0, descartadas: 0 }

    const juntar = (c) => [...c.slice(0, -2), `${c[c.length - 2].trim()}.${c[c.length - 1].trim()}`]
    const larguras = dados.map((c) => c.length)
    const menor = larguras.reduce((a, b) => (b < a ? b : a), Infinity)
    const larguraUniforme = larguras.every((w) => w === menor)

    if (!temCabecalho && larguraUniforme && dados.some(terminaComDoisInteiros)) {
        if (escolha === 'colunas') return { tabela, juntadas: 0, descartadas: 0 }
        if (escolha !== 'decimal') return { ambiguo: true }
        let juntadas = 0
        const novos = dados.map((c) => {
            if (!terminaComDoisInteiros(c)) return c
            juntadas += 1
            return juntar(c)
        })
        return { tabela: novos, juntadas, descartadas: 0 }
    }

    const base = temCabecalho ? tabela[0].length : menor
    let juntadas = 0
    let descartadas = 0
    const novosDados = []
    for (const c of dados) {
        if (c.length <= base) {
            novosDados.push(c)
        } else if (c.length === base + 1 && terminaComDoisInteiros(c)) {
            novosDados.push(juntar(c))
            juntadas += 1
        } else {
            descartadas += 1
        }
    }
    if (descartadas > dados.length / 2) return { erro: ERRO_VIRGULA_AMBIGUA }
    return { tabela: [...tabela.slice(0, inicioDados), ...novosDados], juntadas, descartadas }
}

// Uma leitura por linha; temperatura na última coluna; data/hora na primeira (opcional)
// opcoes.virgula: 'decimal' ou 'colunas', quando a pessoa já respondeu a pergunta
export function lerCsv(texto, opcoes = {}) {
    const linhas = texto.split(/\r?\n/).filter((l) => l.trim() !== '')
    const separador = detectarSeparador(linhas)
    const avisos = []
    if (linhas.length === 0) return { leituras: [], ignoradas: 0, avisos }

    let tabela = linhas.map((l) => dividirLinha(l, separador))
    const temCabecalho = Number.isNaN(parseNumero(tabela[0][tabela[0].length - 1]))
    let descartadas = 0

    // CSV separado por vírgula com vírgula decimal sem aspas: "data,5,3".
    if (separador === ',') {
        const resolvido = resolverVirgulaDecimal(tabela, temCabecalho, opcoes.virgula)
        if (resolvido.ambiguo) return { leituras: [], ignoradas: 0, avisos, ambiguo: true }
        if (resolvido.erro) return { leituras: [], ignoradas: 0, avisos, erro: resolvido.erro }
        tabela = resolvido.tabela
        descartadas = resolvido.descartadas
        if (opcoes.virgula === 'colunas') {
            avisos.push('Conforme sua escolha, tratei as vírgulas como separadores de coluna: a temperatura é o último número de cada linha.')
        } else if (resolvido.juntadas > 0) {
            avisos.push(
                opcoes.virgula === 'decimal'
                    ? `Conforme sua escolha, tratei a última vírgula de cada linha como decimal (${resolvido.juntadas} valor(es)).`
                    : `O arquivo usa vírgula tanto para separar colunas quanto como decimal; interpretei ${resolvido.juntadas} valor(es) como "5,3" = 5,3 °C.`,
            )
        }
    }

    const leituras = []
    // linhas com colunas sobrando que não se encaixaram também contam como ignoradas
    let ignoradas = descartadas
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

// Tudo o que não depende dos limites: calculado uma vez por arquivo, não a cada tecla
export function resumir(leituras) {
    const n = leituras.length
    if (n === 0) return null
    let min = Infinity
    let max = -Infinity
    let total = 0
    const temps = new Array(n)
    for (let i = 0; i < n; i += 1) {
        const t = leituras[i].temp
        temps[i] = t
        if (t < min) min = t
        if (t > max) max = t
        total += t
    }

    let comData = 0
    let emOrdem = true
    let anterior = -Infinity
    // laço simples em vez de Math.min(...): arquivos grandes estourariam o limite de argumentos
    let primeiro = Infinity
    let ultimo = -Infinity
    for (const { data } of leituras) {
        if (!data) continue
        const t = data.getTime()
        comData += 1
        if (t < anterior) emOrdem = false
        anterior = t
        if (t < primeiro) primeiro = t
        if (t > ultimo) ultimo = t
    }

    return {
        n,
        min,
        max,
        media: total / n,
        mkt: calcularMkt(temps),
        comData,
        emOrdem,
        inicio: comData ? new Date(primeiro) : null,
        fim: comData ? new Date(ultimo) : null,
    }
}

// Parte que depende dos limites: um laço de comparações, barato a cada tecla
export function calcular(leituras, limiteA, limiteB, resumo = resumir(leituras)) {
    if (!resumo || !Number.isFinite(limiteA) || !Number.isFinite(limiteB)) return null
    // aceita os limites em qualquer ordem
    const limMin = Math.min(limiteA, limiteB)
    const limMax = Math.max(limiteA, limiteB)

    let dentro = 0
    let excursoes = 0
    let estavaFora = false
    for (const { temp } of leituras) {
        const ok = temp >= limMin && temp <= limMax
        if (ok) dentro += 1
        if (!ok && !estavaFora) excursoes += 1
        estavaFora = !ok
    }

    const n = resumo.n
    return {
        ...resumo,
        dentro,
        fora: n - dentro,
        percentualDentro: (dentro / n) * 100,
        excursoes,
        limMin,
        limMax,
        limitesInvertidos: limiteA > limiteB,
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
