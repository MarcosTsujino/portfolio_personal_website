import { useState } from "react";
import { FaCode } from "react-icons/fa";
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

        <FaCode aria-label="Desenvolvedor Front-end" className={`${styles.icon} ${isHovered ? styles.imageHidden : styles.imageVisible}`} />

        <p className={isHovered ? styles.texVisible : styles.textHidden}>
          [Em breve]
        </p>
      </div>
    </section>
  );
}

export default CardClube;
