// client/src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Theme } from '../App'; 

interface FooterProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const Footer: React.FC<FooterProps> = ({ currentTheme, onThemeChange }) => {
  
  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange(event.target.value as Theme);
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3>Project</h3>
            <ul>
              <li><Link to="/modpacks">Packs</Link></li>
              <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Social</h3>
            <ul>
              <li><a href="https://github.com/chisato04/chisato-hub" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>mrpack-depot-react</h3>
            <p className="description">This site is built and maintained by chisato04, inspired by the Catppuccin "Ports" page.</p>
            <p className="copyright">© {new Date().getFullYear()}, chisato04. Licensed under MIT.</p>
            <div className="theme-selector">
              <label htmlFor="theme-switcher-select">Theme</label>
              <select className="theme-switcher" id="theme-switcher-select" value={currentTheme} onChange={handleThemeChange}>
                <option value="mocha">Mocha</option>
                <option value="macchiato">Macchiato</option>
                <option value="frappe">Frappé</option>
                <option value="latte">Latte</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;