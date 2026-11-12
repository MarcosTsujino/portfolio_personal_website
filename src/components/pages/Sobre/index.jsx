import styles from './Sobre.module.css'

const ferramentas = [
    {
        titulo: 'Desenvolvimento',
        itens: ['Python', 'OpenCV', 'JavaScript', 'React', 'HTML', 'CSS', 'Git e GitHub'],
    },
    {
        titulo: 'Engenharia e dados',
        itens: ['AutoCAD 2D e 3D', 'SolidWorks', 'Power BI', 'Excel', 'TOTVS Protheus'],
    },
    {
        titulo: 'Idiomas',
        itens: ['Português', 'Inglês', 'Espanhol'],
    },
]

function Sobre() {
    return (
        <section className={styles.sobre}>
            <div className={styles.banner}>
                <div className={styles.texto}>
                    <h2>Sobre</h2>

                    <p>
                        Olá! Sou o Marcos, desenvolvedor em formação com base sólida em eletrônica e
                        instrumentação. Sou bacharel em Engenharia de Controle e Automação (UNIP) e
                        tecnólogo em Análise e Desenvolvimento de Sistemas (FMU).
                    </p>

                    <p>
                        Há mais de oito anos trabalho com eletrônica e manutenção em campo. Comecei na
                        I/O Eletrônica, com sistemas de automação para parques de diversões, e hoje sou
                        técnico em eletrônica na Didai Tecnologia, em Campinas. Lá faço reparo em nível
                        de componente, suporte regulatório (ANATEL), documentação técnica e atendimento
                        a clientes no Brasil e no exterior, incluindo Chile e Costa Rica.
                    </p>

                    <p>
                        Nos últimos anos tenho levado esse conhecimento para o software: ferramentas em
                        Python, engenharia reversa de protocolos Bluetooth Low Energy, visão
                        computacional com OpenCV e interfaces em React. Busco oportunidades como
                        desenvolvedor, principalmente onde software e hardware se encontram: IoT,
                        automação, instrumentação e integração de sistemas.
                    </p>

                    <a
                        className={styles.botao}
                        href="/curriculo-marcos-tsujino.pdf"
                        download
                    >
                        Baixar currículo (PDF)
                    </a>

                    <h3 className={styles.subtitulo}>Ferramentas</h3>
                    <dl className={styles.ferramentas}>
                        {ferramentas.map((grupo) => (
                            <div key={grupo.titulo} className={styles.grupo}>
                                <dt>{grupo.titulo}</dt>
                                <dd>
                                    {grupo.itens.map((item) => (
                                        <span key={item} className={styles.chip}>{item}</span>
                                    ))}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    )
}

export default Sobre