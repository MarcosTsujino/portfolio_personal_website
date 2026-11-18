import { useMemo, useState } from 'react'
import Grafico from './Grafico'
import { calcular, gerarExemplo, lerCsv, lerLimite, resumir } from './calculo'
import styles from './Calculadora.module.css'

const numero = (valor, casas = 1) =>
    valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

const dataHora = (data) =>
    data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function Calculadora() {
    const [leituras, setLeituras] = useState([])
    const [ignoradas, setIgnoradas] = useState(0)
    const [avisos, setAvisos] = useState([])
    const [origem, setOrigem] = useState('')
    const [erro, setErro] = useState('')
    // arquivo esperando a pessoa dizer se as vírgulas são decimais
    const [pendente, setPendente] = useState(null)
    // os limites ficam como texto: o campo pode estar vazio enquanto a pessoa digita
    const [textoMin, setTextoMin] = useState('2')
    const [textoMax, setTextoMax] = useState('8')
    const limiteA = lerLimite(textoMin)
    const limiteB = lerLimite(textoMax)
    const limitesValidos = Number.isFinite(limiteA) && Number.isFinite(limiteB)

    const resumo = useMemo(() => resumir(leituras), [leituras])
    const resultado = useMemo(() => calcular(leituras, limiteA, limiteB, resumo), [leituras, limiteA, limiteB, resumo])

    const carregar = (texto, nome, virgula) => {
        const lido = lerCsv(texto, { virgula })
        if (lido.ambiguo) {
            setLeituras([])
            setOrigem('')
            setAvisos([])
            setErro('')
            setPendente({ texto, nome })
            return
        }
        setPendente(null)
        if (lido.erro || lido.leituras.length === 0) {
            setLeituras([])
            setOrigem('')
            setAvisos([])
            setErro(lido.erro || 'Não encontrei leituras válidas. Confira se a temperatura está na última coluna de cada linha.')
            return
        }
        setErro('')
        setLeituras(lido.leituras)
        setIgnoradas(lido.ignoradas)
        setAvisos(lido.avisos)
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

    return (
        <section className={styles.calculadora}>
            <h1>Calculadora de temperatura e MKT</h1>
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

            {pendente && (
                <div className={styles.pergunta} role="alert">
                    <p>
                        No arquivo <strong>{pendente.nome}</strong>, as vírgulas podem separar colunas ou casas
                        decimais: uma linha como <code>2026-01-12 08:00,5,3</code> pode ser 5,3 °C ou duas
                        colunas (5 e 3). Como as vírgulas são usadas?
                    </p>
                    <div className={styles.controles}>
                        <button type="button" className={styles.botaoSecundario} onClick={() => carregar(pendente.texto, pendente.nome, 'decimal')}>
                            São decimais (5,3 °C)
                        </button>
                        <button type="button" className={styles.botaoSecundario} onClick={() => carregar(pendente.texto, pendente.nome, 'colunas')}>
                            Separam colunas (5 e 3)
                        </button>
                    </div>
                </div>
            )}

            {leituras.length > 0 && (
                <>
                    <p className={styles.origem}>
                        Origem: <strong>{origem}</strong> · {leituras.length} leituras
                        {ignoradas > 0 && ` · ${ignoradas} linha(s) inválida(s) ignorada(s)`}
                    </p>

                    {avisos.map((aviso) => (
                        <p key={aviso} className={styles.aviso}>{aviso}</p>
                    ))}

                    <div className={styles.limites}>
                        <label>
                            Faixa aceitável, mínima (°C)
                            <input type="text" inputMode="decimal" value={textoMin} onChange={(e) => setTextoMin(e.target.value)} />
                        </label>
                        <label>
                            Faixa aceitável, máxima (°C)
                            <input type="text" inputMode="decimal" value={textoMax} onChange={(e) => setTextoMax(e.target.value)} />
                        </label>
                    </div>

                    {!limitesValidos && (
                        <p className={styles.aviso} role="alert">Preencha os dois limites com números, por exemplo 2 ou 2,5.</p>
                    )}
                    {resultado?.limitesInvertidos && (
                        <p className={styles.aviso}>A mínima está maior que a máxima; considerei a faixa de {numero(resultado.limMin)} a {numero(resultado.limMax)} °C.</p>
                    )}
                    {resultado && !resultado.emOrdem && (
                        <p className={styles.aviso}>As datas não estão em ordem cronológica. As excursões são contadas na ordem das linhas do arquivo.</p>
                    )}
                </>
            )}

            {resultado && (
                <>
                    <dl className={styles.resultados}>
                        <div><dt>Mínima</dt><dd>{numero(resultado.min)} °C</dd></div>
                        <div><dt>Máxima</dt><dd>{numero(resultado.max)} °C</dd></div>
                        <div><dt>Média</dt><dd>{numero(resultado.media)} °C</dd></div>
                        <div><dt>MKT</dt><dd>{numero(resultado.mkt)} °C</dd></div>
                        <div><dt>Dentro da faixa</dt><dd>{numero(resultado.percentualDentro)} %</dd></div>
                        <div><dt>Leituras fora</dt><dd>{resultado.fora}</dd></div>
                        <div><dt>Excursões</dt><dd>{resultado.excursoes}</dd></div>
                        {resultado.inicio && resultado.fim && (
                            <div>
                                <dt>Período</dt>
                                <dd className={styles.periodo}>
                                    {dataHora(resultado.inicio)} a {dataHora(resultado.fim)}
                                    {resultado.comData < resultado.n && (
                                        <span className={styles.parcial}>{resultado.comData} de {resultado.n} leituras com data</span>
                                    )}
                                </dd>
                            </div>
                        )}
                    </dl>

                    <Grafico leituras={leituras} limMin={resultado.limMin} limMax={resultado.limMax} />

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
