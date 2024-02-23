import React from "react";
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-container">
            <div className="hero-content">
                <h2>Building Digital Experiences That Inspire</h2>
                <p>
                    Passionate Frontend Developer | Transforming Ideas into Seamless and Visually Stunning Web Solutions
                </p>
            </div>

            <div className="hero-img">
                <div>
                    <div className="tech-icon">
                        <img src="./assets/images/img1.png" alt="Logo React" />
                    </div>
                    <img src="./assets/images/img11.png" alt="Personal Photo" />
                </div>
                    
                    <div>
                        <div className="tech-icon">
                            <img src="./assets/images/img2.png" alt="HTML5 Logo" />
                        </div>

                        <div className="tech-icon">
                            <img src="./assets/images/img3.png" alt="CSS3 Logo" />
                        </div>

                        <div className="tech-icon">
                            <img src="./assets/images/img4.png" alt="Javascript Logo" />
                        </div>
                    </div>
                
            </div>
        </section>
    )
}

export default Hero;