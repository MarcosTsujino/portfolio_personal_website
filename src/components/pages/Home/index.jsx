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
            <Link to="/sobre" className={`${styles.btn} ${styles.btn_purple} `}>
              Saiba mais
            </Link>
          </div>
          <figure>
            <img className={styles.img_home} src="../dist/photo.png" alt="Photo" />
          </figure>

        </section>
        
    )
}

export default Home

