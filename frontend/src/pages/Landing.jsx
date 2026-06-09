import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const services = [
  {
    title: 'Dachdeckerei',
    description: 'Professionelle Dachdeckerarbeiten für Neu- und Bestandsbauten. Qualität und Langlebigkeit stehen bei uns an erster Stelle.',
    icon: '🏠',
  },
  {
    title: 'Solaranlagen',
    description: 'Installation von Photovoltaikanlagen auf jedem Dachtyp. Nutzen Sie die Kraft der Sonne für mehr Unabhängigkeit.',
    icon: '☀️',
  },
  {
    title: 'Dachreinigung',
    description: 'Gründliche Reinigung und Pflege Ihres Daches. Moos, Algen und Verschmutzungen werden professionell entfernt.',
    icon: '🧹',
  },
  {
    title: 'Sanierung',
    description: 'Umfassende Dachsanierung und Instandsetzung. Wir bringen Ihr Dach zurück in Topzustand – schnell und zuverlässig.',
    icon: '🔧',
  },
];

export default function Landing() {
  return (
    <div className="landing">

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="logo-name">Wabe GmbH</span>
          <span className="logo-tagline">Dachdeckerei</span>
        </div>
        <div className="nav-phone">
          <a href="tel:+4940000000">📞 +49 (0) 40 000 000</a>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-portal-btn">Kundenportal</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Ihr Dachdecker<br />in Hamburg</h1>
          <div className="hero-accent"></div>
          <p>Professionelle Dachdeckerarbeiten – von der Inspektion bis zur Fertigstellung. Qualität und Zuverlässigkeit seit über 20 Jahren.</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-hero-primary">Jetzt starten</Link>
            <a href="tel:+4940000000" className="btn btn-hero-outline">Kostenlos beraten</a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>Ihr zuverlässiger Partner für alle Dacharbeiten</h2>
              <div className="section-accent"></div>
              <p>Als erfahrenes Dachdeckerunternehmen in Hamburg stehen wir für Qualität, Zuverlässigkeit und faire Preise. Unser Team aus qualifizierten Fachhandwerkern übernimmt alle Arbeiten rund um Ihr Dach – von der einfachen Reparatur bis zur kompletten Dachsanierung.</p>
              <p>Über unser Kundenportal können Sie Fotos und Dokumente hochladen, damit wir Ihr Projekt schnell und effizient bearbeiten können.</p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Kundenportal öffnen</Link>
            </div>
            <div className="about-image">
              <div className="about-image-placeholder">
                <span>🏗️</span>
                <p>Fachgerechte Dacharbeiten</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2>Unsere Leistungen</h2>
            <div className="section-accent center"></div>
            <p className="section-sub">Alles rund ums Dach – aus einer Hand</p>
          </div>
          <div className="services-grid">
            {services.map((service, i) => (
              <div key={i} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to="/login" className="btn btn-service">Mehr erfahren</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Bereit für Ihr Dachprojekt?</h2>
          <p>Kontaktieren Sie uns noch heute oder melden Sie sich direkt im Kundenportal an.</p>
          <div className="cta-buttons">
            <a href="tel:+4940000000" className="btn btn-cta-primary">Jetzt anrufen</a>
            <Link to="/login" className="btn btn-cta-outline">Zum Kundenportal</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Wabe GmbH</h4>
              <p>Ihr professioneller Dachdeckerbetrieb in Hamburg und Umgebung.</p>
            </div>
            <div className="footer-col">
              <h4>Leistungen</h4>
              <ul>
                <li>Dachdeckerei</li>
                <li>Solaranlagen</li>
                <li>Dachreinigung</li>
                <li>Sanierung</li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Kontakt</h4>
              <ul>
                <li><a href="tel:+4940000000">+49 (0) 40 000 000</a></li>
                <li><a href="mailto:info@wabe-gmbh.de">info@wabe-gmbh.de</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Portal</h4>
              <ul>
                <li><Link to="/login">Anmelden</Link></li>
                <li><Link to="/register">Registrieren</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Wabe GmbH. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
