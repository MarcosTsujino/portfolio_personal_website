import { Link } from 'react-router-dom'
import styles from './Home.module.css'

function Home() {
    return (
        <section className={styles.home}>
          <div className={styles.apresentacao}>
            <p>
              Olá, eu sou <br /> 
              <span>Marcos</span> <br />
              Tsujino
            </p>
            <p className={styles.subtitulo}>
              Desenvolvedor com base em eletrônica e instrumentação.
              Python, React e automação.
            </p>
            <div className={styles.acoes}>
              <Link to="/projetos" className={`${styles.btn} ${styles.btn_purple}`}>
                Ver projetos
              </Link>
              <Link to="/sobre" className={`${styles.btn} ${styles.btn_outline}`}>
                Saiba mais
              </Link>
            </div>
          </div>
          <figure>
            <img className={styles.img_home} src="/assets/photo.jpg" alt="Ilustração de Marcos Tsujino" />
          </figure>

        </section>
        
    )
}

export default Home;
