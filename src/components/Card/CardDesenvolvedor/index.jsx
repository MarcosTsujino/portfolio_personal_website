import { useState } from "react";
import styles from "./CardDesenvolvedor.module.css";

function CardClube() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.content}>
        <h3>Desenvolvedor Front-end</h3>

        <img
          src="front_end.png"
          alt="Desenvolvedor Front-end"
          className={isHovered ? styles.imageHidden : styles.imageVisible}
        />

        <p className={isHovered ? styles.texVisible : styles.textHidden}>
          [Em breve]
        </p>
      </div>
    </section>
  );
}

export default CardClube;
