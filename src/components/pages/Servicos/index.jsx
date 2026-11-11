import { Link } from 'react-router-dom'
import styles from './Servicos.module.css'

const servicos = [
    {
        titulo: 'Automação com Python',
        descricao:
            'Scripts e pequenas ferramentas para tratar planilhas e arquivos CSV, gerar relatórios e automatizar tarefas repetitivas.',
    },
    {
        titulo: 'Integração de dispositivos e dados',
        descricao:
            'Leitura de dados de equipamentos eletrônicos (por exemplo, dataloggers via Bluetooth Low Energy), conversão para CSV e painéis simples para visualizar os resultados.',
    },
    {
        titulo: 'Documentação técnica',
        descricao:
            'Manuais, procedimentos, checklists e comparativos técnicos claros, em português, inglês ou espanhol.',
    },
]

function Servicos() {
    return (
        <section className={styles.servicos}>
            <h2>Serviços</h2>
            <p className={styles.intro}>
                Atendo projetos pontuais de automação e integração, principalmente onde software e hardware se
                encontram.
            </p>
            <div className={styles.lista}>
                {servicos.map((servico) => (
                    <article key={servico.titulo} className={styles.card}>
                        <h3>{servico.titulo}</h3>
                        <p>{servico.descricao}</p>
                    </article>
                ))}
            </div>
            <Link className={styles.botao} to="/contato">
                Vamos conversar
            </Link>
        </section>
    )
}

export default Servicos
