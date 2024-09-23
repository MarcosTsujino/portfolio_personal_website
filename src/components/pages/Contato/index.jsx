import styles from './Contato.module.css'
import { GoMail } from 'react-icons/go'
import { FaGithub, FaLinkedin, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa'
import { useState } from 'react'

function Contato() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const sendWhatsAppMessage = (e) => {
    e.preventDefault()

    const phoneNumber = '5519996423909' 
    const whatsappMessage = `Olá! Meu nome é ${name}. ${message}`

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`

    window.open(url, '_blank', 'noopener,noreferrer')


    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <>
      <section className={styles.contato}>
        <h3>Entre em contato</h3>
        <p>Para que possamos tirar suas dúvidas.</p>

        {/* Formulário */}
        <form onSubmit={sendWhatsAppMessage} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">Mensagem</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Sua mensagem"
              rows="4"
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Enviar
          </button>
        </form>

        {/* Ícones de contato */}
        <div className={styles.icones}>
          <a href='mailto:marcos.yoshio10@gmail.com' target='_blank' rel='noopener noreferrer'>
            <GoMail className={styles.icone} color='red' />
          </a>

          <a href='https://wa.me/5519996423909' target='_blank' rel="noopener noreferrer">
            <FaWhatsapp className={styles.icone} color='#25d366' />
          </a>

          <a href='https://www.linkedin.com/in/marcos-yoshio-n-b9868a13b/' target='_blank' rel='noopener noreferrer'>
            <FaLinkedin className={styles.icone} color='blue' />
          </a>

          <a href='https://github.com/MarcosTsujino' target='_blank' rel='noopener noreferrer'>
            <FaGithub className={styles.icone} color='black'/>
          </a>

        </div>
      </section>
    </>
  )
}

export default Contato
