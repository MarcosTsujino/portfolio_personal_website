import { useState } from "react";
import { FaCogs } from "react-icons/fa";
import styles from "./CardEngenharia.module.css";

function CardSuporte() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.content}>
        <h3>Engenharia</h3>

        <FaCogs aria-label="Engenharia" className={`${styles.icon} ${isHovered ? styles.imageHidden : styles.imageVisible}`} />

        <p className={isHovered ? styles.texVisible : styles.textHidden}>
          [Em breve]
        </p>
      </div>
    </section>
  );
}

export default CardSuporte;
