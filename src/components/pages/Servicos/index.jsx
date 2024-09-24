import Card from "../../Card"
import CardSuporte from '../../Card/CardEngenharia';
import CardDesenvolvedor from "../../Card/CardDesenvolvedor";
import styles from './Servicos.module.css'

function Servicos () {
    return (
        <section className={styles.servicos}>
            <h2>Serviços</h2>
            <section className={styles.lista}>
                <Card />
                <CardSuporte />
                <CardDesenvolvedor />
            </section>
        </section>
    )
}

export default Servicos