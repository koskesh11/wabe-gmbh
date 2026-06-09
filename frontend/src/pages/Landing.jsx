import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <nav className="nav">
        <div className="nav-logo">Wabe GmbH</div>
        <div className="nav-links">
          <Link to="/login">Anmelden</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Professionelle Außendienstleistungen</h1>
        <p>Hochwertige Dach- und Solarinstallationslösungen. Wir kümmern uns um Ihr Projekt von der Inspektion bis zur Fertigstellung.</p>
        <Link to="/login" className="btn btn-primary">Jetzt starten</Link>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Einfache Dokumentation</h3>
          <p>Laden Sie Fotos und Dokumente für Ihr Projekt hoch. Unser Team überprüft sie und antwortet schnell.</p>
        </div>
        <div className="feature-card">
          <h3>Expertenteam</h3>
          <p>Unsere erfahrenen Fachleute sind dem Qualitätshandwerk und der Kundenzufriedenheit verpflichtet.</p>
        </div>
        <div className="feature-card">
          <h3>Komplette Lösungen</h3>
          <p>Von Wohnungsachterungen bis zu Solaranlagen bieten wir umfassende Außendienstleistungen.</p>
        </div>
        <div className="feature-card">
          <h3>Sicheres Portal</h3>
          <p>Ihre Projektdateien werden sicher gespeichert und sind nur für Ihr Konto zugänglich.</p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Wabe GmbH. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}
