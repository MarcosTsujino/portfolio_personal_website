import { Link } from 'react-router-dom'
import styles from './Page404.module.css'

function Page404() {
    return (
        <section className={styles.page404}>
            <span className={styles.texto_grande}>404</span>
            <h2 className={styles.titulo2}>Página não encontrada</h2>
            <p className={styles.descricao}>
                O endereço que você abriu não existe ou mudou de lugar.
            </p>
            <Link to="/" className={styles.botao}>Voltar para o início</Link>
        </section>
    )
}

export default Page404
