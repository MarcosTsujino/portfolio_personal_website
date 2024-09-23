import { useState } from "react";
import styles from "./Card1.module.css";

function CardCartao() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className={`${styles.card} ${isHovered ? styles.cardHovered : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.content}>
        
        <img src="/teste1.png" 
        alt="Teste 1" 
        className={isHovered ? styles.imageHidden : styles.imageVisible}
        />

        <p className={isHovered ? styles.texVisible : styles.textHidden}>

          Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
        </p>
      </div>
    </section>
  );
}

export default CardCartao;
