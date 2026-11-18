import Header from '../../../components/Header'
import Container from '../../../components/Container'
import Footer from '../../../components/Footer'
import { Outlet } from 'react-router-dom'
import { useSeo } from '../../../seo/useSeo'
import styles from './PaginaBase.module.css'

function PaginaBase() {
    useSeo()
    return (
        <>
            <a className={styles.pular} href="#conteudo">Pular para o conteúdo</a>
            <Header />
            <main id="conteudo" tabIndex={-1}>
                <Container>
                    <Outlet />
                </Container>
            </main>
            <Footer />
        </>
    )
}

export default PaginaBase
