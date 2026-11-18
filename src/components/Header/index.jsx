import { Link, useLocation } from 'react-router-dom'
import styles from './Header.module.css'
import { useEffect, useState } from 'react'

const LINKS = [
    { para: '/', texto: 'Home' },
    { para: '/sobre', texto: 'Sobre' },
    { para: '/projetos', texto: 'Projetos' },
    { para: '/servicos', texto: 'Serviços' },
    { para: '/contato', texto: 'Contato' },
]

function Header () {
    const [ menuAberto, setMenuAberto ] = useState(false)
    const { pathname } = useLocation()

    // fecha o menu ao trocar de página
    useEffect(() => {
        setMenuAberto(false)
    }, [pathname])

    // fecha com Esc
    useEffect(() => {
        if (!menuAberto) return undefined
        const aoTeclar = (evento) => {
            if (evento.key === 'Escape') setMenuAberto(false)
        }
        document.addEventListener('keydown', aoTeclar)
        return () => document.removeEventListener('keydown', aoTeclar)
    }, [menuAberto])

    return (
        <header className={styles.header}>
            <Link to="/" aria-label="Marcos Tsujino, página inicial">
                <span>
                    <img src="/logo.svg" alt="" />
                </span>
            </Link>
            <nav
                id="menu-principal"
                aria-label="Principal"
                className={`${styles.menuSandwich} ${ menuAberto ? styles.show : ''}`}
            >
                {LINKS.map((link) => (
                    <Link
                        key={link.para}
                        to={link.para}
                        aria-current={pathname === link.para ? 'page' : undefined}
                    >
                        {link.texto}
                    </Link>
                ))}
            </nav>
            <button
                type="button"
                className={styles.menuButton}
                aria-expanded={menuAberto}
                aria-controls="menu-principal"
                aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
                onClick={() => setMenuAberto((aberto) => !aberto)}
            >
                <span className={styles.linha}></span>
                <span className={styles.linha}></span>
                <span className={styles.linha}></span>
            </button>
        </header>
    )
}

export default Header
