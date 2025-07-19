// client/src/pages/Status.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/status-page.css';

// Interfaces for our data structures
interface FullServerStatus {
  online: boolean;
  version?: { name: string };
  players?: { online: number; max: number; sample?: { id: string; name: string }[] };
  motd?: { html: string };
  favicon?: string | null;
  system?: {
    hostname: string; product: string; os: string; cpu: string;
    cores: number; memory: { total: number; used: number }; uptime: number;
  };
}
interface LeaderboardData {
  playTime: { name: string; value: number }[];
  playerKills: { name: string; value: number }[];
  deaths: { name: string; value: number }[];
}

// Helper functions for formatting data
const formatUptime = (seconds: number) => {
  const d = Math.floor(seconds / (3600*24));
  const h = Math.floor(seconds % (3600*24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  return `${d}d ${h}h ${m}m`;
};
const formatMemory = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(2);

const Status: React.FC = () => {
  const [status, setStatus] = useState<FullServerStatus | null>(null);
  const [leaderboards, setLeaderboards] = useState<LeaderboardData | null>(null);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

  // Effect for polling server status
  useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/server-status').then(res => res.json()).then(setStatus).catch(console.error);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Effect for fetching leaderboards once on load
  useEffect(() => {
    const fetchLeaderboards = () => {
      setIsLeaderboardLoading(true);
      fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboards).catch(console.error)
      .finally(() => setIsLeaderboardLoading(false));
    };
    fetchLeaderboards();
  }, []);

  if (!status) {
    return (
      <div className="status-page-container">
        <div className="dashboard-placeholder">Pinging server...</div>
      </div>
    );
  }

  return (
    <div className="status-page-container">
      <div className={`status-dashboard ${status.online ? 'online' : 'offline'}`}>
        <header className="dashboard-header">
          <div className="dashboard-title">
            {status.favicon && <img src={status.favicon} alt="Server Icon" />}
            <h1>{status.online ? 'Server Online' : 'Server Offline'}</h1>
          </div>
          {status.online && status.version && (
            <div className="status-pills">
              <span className="status-pill version">{status.version.name}</span>
            </div>
          )}
        </header>

        {status.online ? (
          <div className="dashboard-body">
            {/* Main content column on the left */}
            <main className="dashboard-main">
              <div className="dashboard-widget">
                <h3>System Information</h3>
                {status.system ? (
                  <div className="system-info-grid">
                    <div className="info-item"><span className="label">Hostname</span><span className="value">{status.system.hostname}</span></div>
                    <div className="info-item"><span className="label">Motherboard</span><span className="value">{status.system.product}</span></div>
                    <div className="info-item"><span className="label">OS</span><span className="value">{status.system.os}</span></div>
                    <div className="info-item"><span className="label">CPU</span><span className="value">{status.system.cpu}</span></div>
                    <div className="info-item"><span className="label">Memory</span><span className="value">{formatMemory(status.system.memory.used)} GB / {formatMemory(status.system.memory.total)} GB</span></div>
                    <div className="info-item"><span className="label">Uptime</span><span className="value">{formatUptime(status.system.uptime)}</span></div>
                  </div>
                ) : <div className="admin-placeholder">Loading system info...</div>}
              </div>
              
              <div className="dashboard-widget">
                <h3>Leaderboards</h3>
                {isLeaderboardLoading ? (
                  <div className="admin-placeholder">Loading leaderboards...</div>
                ) : leaderboards ? (
                  <div className="leaderboard-container">
                    <div className="leaderboard">
                      <h4>Play Time (Hours)</h4>
                      <ol>{leaderboards.playTime.map(p => <li key={p.name}><span>{p.name}</span><strong>{p.value}</strong></li>)}</ol>
                    </div>
                    <div className="leaderboard">
                      <h4>Player Kills</h4>
                      <ol>{leaderboards.playerKills.map(p => <li key={p.name}><span>{p.name}</span><strong>{p.value}</strong></li>)}</ol>
                    </div>
                    <div className="leaderboard">
                      <h4>Deaths</h4>
                      <ol>{leaderboards.deaths.map(p => <li key={p.name}><span>{p.name}</span><strong>{p.value}</strong></li>)}</ol>
                    </div>
                  </div>
                ) : (
                  <div className="admin-placeholder">Could not load leaderboards.</div>
                )}
              </div>
            </main>
            
            {/* Sidebar on the right */}
            <aside className="dashboard-sidebar">
              <div className="dashboard-widget">
                <h3>Players ({status.players?.online} / {status.players?.max})</h3>
                {status.players?.sample && status.players.sample.length > 0 ? (
                  <ul className="player-list">
                    {status.players.sample.map(player => (
                      <li key={player.id}>
                        <img src={`https://crafatar.com/avatars/${player.id}?size=32&overlay`} alt={player.name} />
                        <span>{player.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-players">No players are currently online.</p>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <div className="offline-notice">
            The server is currently offline. Please try again later.
            <Link to="/" className="portal-return-btn">Return to Portal</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Status;