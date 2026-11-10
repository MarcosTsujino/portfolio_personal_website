import { Link } from 'react-router-dom'
import styles from './Projetos.module.css'

const projetos = [
    {
        titulo: 'Calculadora de temperatura e MKT',
        problema:
            'Conferir rapidamente se um registro de datalogger ficou dentro da faixa de temperatura e qual foi o MKT (temperatura cinética média) do período.',
        feito:
            'Aplicação em React que lê um CSV de leituras, calcula mínima, máxima, média e MKT, mostra o gráfico com a faixa aceitável e conta as leituras e as excursões fora do limite. Tudo roda no navegador: o arquivo não é enviado para lugar nenhum.',
        tecnologias: ['React', 'JavaScript', 'SVG', 'CSV'],
        acoes: [
            { texto: 'Experimentar a calculadora', to: '/calculadora' },
            {
                texto: 'Ver código no GitHub',
                href: 'https://github.com/MarcosTsujino/portfolio_personal_website/tree/main/src/components/pages/Calculadora',
            },
        ],
    },
    {
        titulo: 'Este portfólio',
        problema: 'Site pessoal com meu perfil, trajetória e projetos.',
        feito:
            'Construído com componentes React, rotas, estilos modulares em CSS e publicação contínua: cada alteração passa por Pull Request, ganha um preview e vai para o ar na Vercel.',
        tecnologias: ['React', 'Vite', 'React Router', 'CSS Modules', 'Vercel'],
        acoes: [
            {
                texto: 'Ver código no GitHub',
                href: 'https://github.com/MarcosTsujino/portfolio_personal_website',
            },
        ],
    },
]

function Projetos() {
    return (
        <section className={styles.projetos}>
            <h2>Projetos</h2>
            <div className={styles.lista}>
                {projetos.map((projeto) => (
                    <article key={projeto.titulo} className={styles.card}>
                        <h3>{projeto.titulo}</h3>
                        <p className={styles.problema}>{projeto.problema}</p>
                        <p>{projeto.feito}</p>
                        <ul className={styles.tecnologias}>
                            {projeto.tecnologias.map((tec) => (
                                <li key={tec} className={styles.chip}>{tec}</li>
                            ))}
                        </ul>
                        <div className={styles.acoes}>
                            {projeto.acoes.map((acao) =>
                                acao.to ? (
                                    <Link key={acao.texto} className={styles.link} to={acao.to}>
                                        {acao.texto}
                                    </Link>
                                ) : (
                                    <a
                                        key={acao.texto}
                                        className={styles.link}
                                        href={acao.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {acao.texto}
                                    </a>
                                )
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default Projetos
