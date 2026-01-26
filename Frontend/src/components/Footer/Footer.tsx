import React from 'react';
import { FaInstagram, FaTiktok, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section contact">
                    <h3>Contactos</h3>
                    <p className="contact-text">
                        Email: <a href="mailto:fanatikjersey2@gmail.com" className="contact-email">fanatikjersey2@gmail.com</a>
                    </p>
                </div>

                <div className="footer-section social">
                    <h3>Redes Sociais</h3>
                    <div className="social-icons">
                        <a
                            href="https://www.instagram.com/fanatik_jersey/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="social-icon"
                        >
                            <FaInstagram />
                        </a>
                        <a
                            href="https://www.tiktok.com/@drible.wear?is_from_webapp=1&sender_device=pc&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnImmeBtglKcki1Dp3NeeyUszFj2f1gGNHUfQlP_qXZX16Ps2IeEPOzLGpGz0_aem_BSOQ7EgS0j_drvtzbLYABg"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="TikTok"
                            className="social-icon"
                        >
                            <FaTiktok />
                        </a>
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="social-icon"
                        >
                            <FaFacebook />
                        </a>
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="X (Twitter)"
                            className="social-icon"
                        >
                            <FaXTwitter />
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} FanatikJersey. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
