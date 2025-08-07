// client/src/pages/Status.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../assets/css/status-page.css';

// --- Interfaces ---
interface StatusHistoryPoint { name: number; usage: number; }
interface FullServerStatus {
  online: boolean; version?: { name: string };
  players?: { online: number; max: number; sample?: { id: string; name: string }[] };
  favicon?: string | null;
  system?: { cpuUsage: number; memory: { total: number; used: number }; uptime: number; };
  history: { cpu: StatusHistoryPoint[]; memory: StatusHistoryPoint[]; };
}
interface LeaderboardData {
  playTime: { name: string; value: number }[];
  playerKills: { name: string; value: number }[];
  deaths: { name: string; value: number }[];
}

// --- Reusable Graph Component ---
const StatChart: React.FC<{ data: StatusHistoryPoint[]; color: string; dataKey: string; name: string }> = ({ data, color, dataKey, name }) => (
  <ResponsiveContainer width="100%" height={100}>
    <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
      <defs>
        <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
          <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
        </linearGradient>
      </defs>
      <Tooltip contentStyle={{ backgroundColor: 'var(--mantle, #181825)', borderColor: 'var(--surface-0, #313244)', borderRadius: '8px' }} labelFormatter={() => ''} formatter={(value) => [`${value}%`, name]} cursor={{ stroke: 'var(--surface-2)', strokeWidth: 1, strokeDasharray: '3 3' }} />
      <YAxis stroke="var(--subtext-0)" domain={[0, 100]} tick={{ fontSize: 12 }} />
      <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#gradient-${dataKey})`} />
    </AreaChart>
  </ResponsiveContainer>
);

// --- Live Uptime Hook ---
const useLiveUptime = (initialUptimeSeconds: number | undefined) => {
  const [displayUptime, setDisplayUptime] = useState('0d 0h 0m 0s');
  useEffect(() => {
    if (initialUptimeSeconds === undefined) return;
    const startTime = Date.now() - initialUptimeSeconds * 1000;
    const format = (seconds: number) => {
      const d = Math.floor(seconds / 86400);
      const h = Math.floor(seconds % 86400 / 3600);
      const m = Math.floor(seconds % 3600 / 60);
      const s = Math.floor(seconds % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };
    const intervalId = setInterval(() => {
      setDisplayUptime(format((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [initialUptimeSeconds]);
  return displayUptime;
};

const formatMemory = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(2);

const Status: React.FC = () => {
  const [status, setStatus] = useState<FullServerStatus | null>(null);
  const [leaderboards, setLeaderboards] = useState<LeaderboardData | null>(null);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const liveUptime = useLiveUptime(status?.system?.uptime);

  useEffect(() => {
    const fetchStatus = () => { fetch('/api/server-status').then(res => res.json()).then(setStatus).catch(console.error); };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLeaderboards = () => {
      setIsLeaderboardLoading(true);
      fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboards).catch(console.error).finally(() => setIsLeaderboardLoading(false));
    };
    fetchLeaderboards();
  }, []);

  if (!status) {
    return (<div className="status-page-container"><div className="dashboard-placeholder">Pinging server for initial status...</div></div>);
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
            <div className="status-pills"><span className="status-pill version">{status.version.name}</span></div>
          )}
        </header>

        {status.online && status.system ? (
          <div className="dashboard-body">
            <main className="dashboard-main">
              <div className="dashboard-widget">
                <h3>System Performance</h3>
                <div className="system-info-grid">
                  <div className="info-item chart">
                    <div className="chart-header"><span className="label">CPU Usage</span><span className="value">{status.system.cpuUsage.toFixed(1)}%</span></div>
                    <StatChart data={status.history.cpu} color="var(--blue)" dataKey="usage" name="CPU" />
                  </div>
                  <div className="info-item chart">
                    <div className="chart-header"><span className="label">Memory Usage</span><span className="value">{formatMemory(status.system.memory.used)} GB / {formatMemory(status.system.memory.total)} GB</span></div>
                    <StatChart data={status.history.memory} color="var(--mauve)" dataKey="usage" name="Memory" />
                  </div>
                </div>
                {/* THE FIX: Uptime is now in its own styled card */}
                <div className="uptime-card">
                  <span className="label">Uptime</span>
                  <span className="value">{liveUptime}</span>
                </div>
              </div>

              {/* THE FIX: The Leaderboards widget is restored */}
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