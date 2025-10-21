// frontend/src/components/Footer.jsx

import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import '../styles/components/footer.css';

/**
 * Componente Footer
 * 
 * Incluye:
 * - Información sobre Autocanje
 * - Enlaces rápidos
 * - Enlaces legales
 * - Información de contacto
 * - Redes sociales
 * - Copyright
 */
const Footer = () => {
  
  /**
   * Datos de enlaces rápidos
   */
  const quickLinks = [
    { label: 'Catálogo', href: '/catalog' },
    { label: 'Membresía Premium', href: '/premium' },
    { label: 'Vender en Autocanje', href: '/seller' },
    { label: 'Centro de Ayuda', href: '/help' },
  ];

  /**
   * Datos de enlaces legales
   */
  const legalLinks = [
    { label: 'Términos y Condiciones', href: '/terms' },
    { label: 'Política de Privacidad', href: '/privacy' },
    { label: 'Devoluciones', href: '/returns' },
    { label: 'Envíos', href: '/shipping' },
  ];

  /**
   * Datos de contacto
   */
  const contactInfo = [
    { 
      icon: Mail, 
      label: 'soporte@autocanje.com', 
      href: 'mailto:soporte@autocanje.com' 
    },
    { 
      icon: Phone, 
      label: '+57 300 123 4567', 
      href: 'tel:+573001234567' 
    },
    { 
      icon: MapPin, 
      label: 'Bogotá, Colombia', 
      href: null 
    },
  ];

  /**
   * Datos de redes sociales
   */
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
  ];

  /**
   * Año actual para el copyright
   */
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Contenido principal del footer */}
        <div className="footer-content">
          
          {/* Columna 1: Sobre Autocanje */}
          <div className="footer-section">
            <h3 className="footer-title">Sobre Autocanje</h3>
            <p className="footer-description">
              Tu marketplace de confianza para partes vehiculares y repuestos. 
              Conectamos compradores y vendedores en toda la región.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="footer-section">
            <h3 className="footer-title">Enlaces Rápidos</h3>
            <nav className="footer-links">
              {quickLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href} 
                  className="footer-link"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Columna 3: Legal */}
          <div className="footer-section">
            <h3 className="footer-title">Legal</h3>
            <nav className="footer-links">
              {legalLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href} 
                  className="footer-link"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Columna 4: Contacto */}
          <div className="footer-section">
            <h3 className="footer-title">Contacto</h3>
            <div className="footer-contact">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                const Element = contact.href ? 'a' : 'div';
                
                return (
                  <Element
                    key={index}
                    href={contact.href || undefined}
                    className="contact-item"
                  >
                    <IconComponent className="contact-icon" size={20} />
                    <span>{contact.label}</span>
                  </Element>
                );
              })}

              {/* Redes sociales */}
              <div className="social-links">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="social-link"
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent size={20} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Autocanje. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;