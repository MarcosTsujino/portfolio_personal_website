import styles from './Calculadora.module.css'

const LARGURA = 800
const ALTURA = 320
const M = { esq: 56, dir: 16, topo: 30, base: 40 }

function formatarData(data) {
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function Grafico({ leituras, limMin, limMax }) {
    const n = leituras.length
    const temps = leituras.map((l) => l.temp)
    let menor = Math.min(limMin, limMax)
    let maior = Math.max(limMin, limMax)
    for (const t of temps) {
        if (t < menor) menor = t
        if (t > maior) maior = t
    }
    menor = Math.floor(menor - 1)
    maior = Math.ceil(maior + 1)

    const larguraUtil = LARGURA - M.esq - M.dir
    const alturaUtil = ALTURA - M.topo - M.base
    const x = (i) => M.esq + (n > 1 ? (i / (n - 1)) * larguraUtil : larguraUtil / 2)
    const y = (t) => M.topo + (1 - (t - menor) / (maior - menor)) * alturaUtil

    const passo = Math.max(1, Math.ceil(n / 800))
    const pontos = []
    const fora = []
    for (let i = 0; i < n; i += passo) {
        pontos.push(`${x(i).toFixed(1)},${y(temps[i]).toFixed(1)}`)
        if ((temps[i] < limMin || temps[i] > limMax) && fora.length < 300) {
            fora.push({ cx: x(i), cy: y(temps[i]), chave: i })
        }
    }

    const passoIdeal = (maior - menor) / 5
    const passoMarca = [0.5, 1, 2, 5, 10, 20, 50].filter((p) => p <= passoIdeal).pop() || 0.5
    const marcas = []
    for (let v = Math.ceil(menor / passoMarca) * passoMarca; v <= maior; v += passoMarca) {
        marcas.push(v)
    }

    const primeira = leituras[0].data
    const ultima = leituras[n - 1].data

    return (
        <svg
            className={styles.grafico}
            viewBox={`0 0 ${LARGURA} ${ALTURA}`}
            role="img"
            aria-label="Gráfico da temperatura ao longo do tempo, com a faixa aceitável destacada"
        >
            <rect
                x={M.esq}
                y={y(Math.max(limMin, limMax))}
                width={larguraUtil}
                height={Math.abs(y(limMin) - y(limMax))}
                className={styles.faixa}
            />
            {marcas.map((valor) => (
                <g key={valor}>
                    <line x1={M.esq} x2={LARGURA - M.dir} y1={y(valor)} y2={y(valor)} className={styles.grade} />
                    <text x={M.esq - 6} y={y(valor) + 4} textAnchor="end" className={styles.rotulo}>
                        {String(valor).replace('.', ',')}
                    </text>
                </g>
            ))}
            <line x1={M.esq} x2={LARGURA - M.dir} y1={y(limMin)} y2={y(limMin)} className={styles.limite} />
            <line x1={M.esq} x2={LARGURA - M.dir} y1={y(limMax)} y2={y(limMax)} className={styles.limite} />
            <polyline points={pontos.join(' ')} className={styles.linha} />
            {fora.map((p) => (
                <circle key={p.chave} cx={p.cx} cy={p.cy} r="2.5" className={styles.pontoFora} />
            ))}
            {primeira && (
                <text x={M.esq} y={ALTURA - 12} className={styles.rotulo}>
                    {formatarData(primeira)}
                </text>
            )}
            {ultima && (
                <text x={LARGURA - M.dir} y={ALTURA - 12} textAnchor="end" className={styles.rotulo}>
                    {formatarData(ultima)}
                </text>
            )}
            <text x={M.esq - 6} y="18" textAnchor="end" className={styles.rotulo}>°C</text>
        </svg>
    )
}

export default Grafico
