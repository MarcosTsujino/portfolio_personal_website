import { useMemo, useState } from 'react'
import Grafico from './Grafico'
import { calcular, gerarExemplo, lerCsv } from './calculo'
import styles from './Calculadora.module.css'

const numero = (valor, casas = 1) =>
    valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

const dataHora = (data) =>
    data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function Calculadora() {
    const [leituras, setLeituras] = useState([])
    const [ignoradas, setIgnoradas] = useState(0)
    const [origem, setOrigem] = useState('')
    const [erro, setErro] = useState('')
    const [limMin, setLimMin] = useState(2)
    const [limMax, setLimMax] = useState(8)

    const resultado = useMemo(() => calcular(leituras, limMin, limMax), [leituras, limMin, limMax])

    const carregar = (texto, nome) => {
        const lido = lerCsv(texto)
        if (lido.leituras.length === 0) {
            setLeituras([])
            setOrigem('')
            setErro('Não encontrei leituras válidas. Confira se a temperatura está na última coluna de cada linha.')
            return
        }
        setErro('')
        setLeituras(lido.leituras)
        setIgnoradas(lido.ignoradas)
        setOrigem(nome)
    }

    const aoEscolherArquivo = async (evento) => {
        const arquivo = evento.target.files[0]
        if (!arquivo) return
        try {
            carregar(await arquivo.text(), arquivo.name)
        } catch {
            setErro('Não consegui ler esse arquivo.')
        }
    }

    const limitesValidos = Number.isFinite(limMin) && Number.isFinite(limMax)

    return (
        <section className={styles.calculadora}>
            <h2>Calculadora de temperatura e MKT</h2>
            <p className={styles.intro}>
                Carregue um CSV com as leituras de um datalogger (data/hora e temperatura em °C) ou use os dados de
                exemplo. Tudo é processado no seu navegador: o arquivo não é enviado para lugar nenhum.
            </p>

            <div className={styles.controles}>
                <label className={styles.botao}>
                    Escolher arquivo CSV
                    <input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={aoEscolherArquivo} hidden />
                </label>
                <button type="button" className={styles.botaoSecundario} onClick={() => carregar(gerarExemplo(), 'dados de exemplo (fictícios)')}>
                    Usar dados de exemplo
                </button>
            </div>

            <p className={styles.formato}>
                Formato aceito: uma leitura por linha, com a data/hora na primeira coluna e a temperatura na última,
                separadas por vírgula ou ponto e vírgula. Ex.: <code>2026-01-12 08:00:00;5,3</code>
            </p>

            {erro && <p className={styles.erro} role="alert">{erro}</p>}

            {resultado && limitesValidos && (
                <>
                    <p className={styles.origem}>
                        Origem: <strong>{origem}</strong> · {resultado.n} leituras
                        {ignoradas > 0 && ` · ${ignoradas} linha(s) ignorada(s) (cabeçalho ou inválidas)`}
                    </p>

                    <div className={styles.limites}>
                        <label>
                            Faixa aceitável, mínima (°C)
                            <input type="number" step="0.5" value={limMin} onChange={(e) => setLimMin(e.target.valueAsNumber)} />
                        </label>
                        <label>
                            Faixa aceitável, máxima (°C)
                            <input type="number" step="0.5" value={limMax} onChange={(e) => setLimMax(e.target.valueAsNumber)} />
                        </label>
                    </div>

                    <dl className={styles.resultados}>
                        <div><dt>Mínima</dt><dd>{numero(resultado.min)} °C</dd></div>
                        <div><dt>Máxima</dt><dd>{numero(resultado.max)} °C</dd></div>
                        <div><dt>Média</dt><dd>{numero(resultado.media)} °C</dd></div>
                        <div><dt>MKT</dt><dd>{numero(resultado.mkt)} °C</dd></div>
                        <div><dt>Dentro da faixa</dt><dd>{numero(resultado.percentualDentro)} %</dd></div>
                        <div><dt>Leituras fora</dt><dd>{resultado.fora}</dd></div>
                        <div><dt>Excursões</dt><dd>{resultado.excursoes}</dd></div>
                        {resultado.inicio && resultado.fim && (
                            <div><dt>Período</dt><dd className={styles.periodo}>{dataHora(resultado.inicio)} a {dataHora(resultado.fim)}</dd></div>
                        )}
                    </dl>

                    <Grafico leituras={leituras} limMin={limMin} limMax={limMax} />

                    <p className={styles.nota}>
                        MKT (temperatura cinética média) calculado com ΔH = 83,144 kJ/mol, supondo leituras em
                        intervalos regulares. Uma excursão é uma sequência de leituras consecutivas fora da faixa.
                    </p>
                </>
            )}
        </section>
    )
}

export default Calculadora
