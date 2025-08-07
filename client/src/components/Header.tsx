// client/src/components/Header.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/capitano.png'; 

const Header: React.FC = () => {
  return (
    <header className="site-header">
      <div className="header-container">
        <NavLink to="/" className="logo"><img src={logo} alt="Site Logo" /></NavLink>
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/modpacks">Packs</NavLink></li>
            <li><NavLink to="/gallery">Gallery</NavLink></li>
            <li><a href="https://github.com/chisato04/chisato-hub" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
export default Header;