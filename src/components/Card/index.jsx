import { useState } from "react";
import { Link } from 'react-router-dom'
import styles from "./Card.module.css";

function Card() {

  const [isHovered, setIsHovered] = useState(false);

  return (
    
    <section 
    className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
        
        <div className={styles.content}>
          <h3>Técnico</h3>

          <img 
          src="tecnico.png" 
          alt="Técnico"
          className={isHovered ? styles.imageHidden : styles.imageVisible} />

          <p className={isHovered ? styles.texVisible : styles.textHidden}>
            [Em breve]
          </p>

          {isHovered && (
            <Link to="/tecnico" className={`${styles.btn} ${styles.btn_purple}`}>
              Saiba mais
            </Link>
          )}

        </div>
    </section>
    
  );
}

export default Card;
