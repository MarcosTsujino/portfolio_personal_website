import React from "react";
import './ContactMe.css';
import ContactInfoCard from "./ContactInfoCard/ContactInfoCard";
import ContactForm from "./ContactForm/ContactForm";

const ContactMe = () => {
    return (
        <section className="contact-container">
            <h5>Contact Me</h5>

            <div className="contact-content">
                <div style={{ flex: 1 }}>
                    <ContactInfoCard
                        iconUrl='./assets/images/email-icon.svg' text="marcos.yoshio10@gmail.com"
                    />
                    <ContactInfoCard
                        iconUrl='./assets/images/github-icon.svg' text="https://github.com/MarcosTsujino"
                    />
                    <ContactInfoCard
                        iconUrl='./assets/images/linkedin-icon.svg' text="https://linkedin.com/MarcosTsujino"
                    />
                </div>

                <div style={{flex: 1}}>
                        <ContactForm />
                </div>
            </div>
        </section>
    )
}

export default ContactMe;