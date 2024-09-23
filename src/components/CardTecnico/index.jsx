import { useState } from "react";
import styles from "./CardTecnico.module.css";

function CardTecnico() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className={`${styles.card} ${isHovered ? styles.cardHovered : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.content}>
        
        <img src="/tecnico.png" 
        alt="Técnico" 
        className={isHovered ? styles.imageHidden : styles.imageVisible}
        />

        <p className={isHovered ? styles.texVisible : styles.textHidden}>

          Cartões com código de Barras, criptografados, personalizados e codificados para cada loja. <br />
          <b>Vantagens:</b> 
          <li>Não desmagnetiza e não desgasta com o uso, problemas frequentes do Cartão Magnético;</li>
          <li>Pode ser fabricado pelo fornecedor que mais convier
          tecnicamente e comercialmente à Loja otimizando disponibilidade e reduzindo custos.</li>
        </p>
      </div>
    </section>
  );
}

export default CardTecnico;
