// client/src/pages/Portal.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/landing-style.css';

// The interface no longer needs host or port
interface ServerStatus {
  online: boolean;
  players?: { online: number; max: number };
}

const Portal: React.FC = () => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  
  // The 'copyButtonText' state has been removed.

  useEffect(() => {
    const root = document.getElementById('root');
    if (root) root.classList.add('root-portal-layout');
    return () => { if (root) root.classList.remove('root-portal-layout'); };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => { window.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/server-status').then(res => res.json()).then(setStatus)
      .catch(error => console.error("Failed to fetch server status:", error));
    };
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // The 'handleCopyIp' function has been removed.

  const statusText = status ? (status.online ? `Online - ${status.players?.online} / ${status.players?.max} Players` : 'Offline') : 'Checking...';
  const statusClass = status ? (status.online ? 'online' : 'offline') : '';

  return (
    <>
      <div className="portal-revamp">
        <header className="portal-header">
          <h1>Server Hub</h1>
          <p>Self-hosted depot for chisato .mrpacks and server resources.</p>
        </header>

        <div className="hero-card-grid">
          <Link to="/modpacks" className="portal-card hero-card depot">
            <div className="portal-card-content"><h2>Modpack Depot</h2><span>Browse and download .mrpacks</span></div>
          </Link>
          <Link to="/gallery" className="portal-card hero-card skins">
            <div className="portal-card-content"><h2>Player Gallery</h2><span>View the hall of fame</span></div>
          </Link>
        </div>

        <div className="secondary-card-grid">
          <Link to="/status" className={`portal-card secondary-card status ${statusClass}`}>
            <div className="portal-card-content">
              <h2>Server Status</h2>
              <span>{statusText}</span>
            </div>
          </Link>
          <a href="https://prismlauncher.org/" target="_blank" rel="noopener noreferrer" className="portal-card secondary-card launcher">
            <div className="portal-card-content"><h2>Prism Launcher</h2><span>Powerful Open Source Launcher</span></div>
          </a>
          <a href="https://github.com/chisato04/mrpack-depot" target="_blank" rel="noopener noreferrer" className="portal-card secondary-card github">
            <div className="portal-card-content"><h2>GitHub Repo</h2><span>View Source Code</span></div>
          </a>
        </div>
      </div>
      
      <footer className="portal-revamp-footer">
        <ul>
            <li><a href="https://www.minecraft.net/" target="_blank" rel="noopener noreferrer">Minecraft.net</a></li>
            <li><a href="https://adoptium.net/temurin/releases/" target="_blank" rel="noopener noreferrer">Java (Temurin)</a></li>
            <li><a href="https://catppuccin.com" target="_blank" rel="noopener noreferrer">Catppuccin Theme</a></li>
            {/* The entire list item for the copy button has been REMOVED. */}
        </ul>
        <p>© {new Date().getFullYear()}, chisato04. Inspired by Catppuccin.</p>
      </footer>
    </>
  );
};

export default Portal;