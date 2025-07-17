// client/src/pages/Status.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../assets/css/status-page.css';

interface FullServerStatus {
  online: boolean;
  version?: { name: string };
  players?: {
    online: number;
    max: number;
    sample?: { id: string; name: string }[];
  };
  motd?: { html: string; clean: string };
  favicon?: string | null;
  roundTripLatency?: number;
}

const Status: React.FC = () => {
  const [status, setStatus] = useState<FullServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/server-status")
        .then((res) => res.json())
        .then((data) => {
          setStatus(data);
          if (isLoading) setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
          setStatus({ online: false }); // Set to offline on error
        });
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="container status-page-container">
      {isLoading ? (
        <div className="status-dashboard loading">Loading Server Status...</div>
      ) : (
        <div
          className={`status-dashboard ${
            status?.online ? "online" : "offline"
          }`}
        >
          <header className="dashboard-header">
            <div className="dashboard-title">
              {status?.favicon && (
                <img src={status.favicon} alt="Server Icon" />
              )}
              <h1>{status?.online ? "Server Online" : "Server Offline"}</h1>
            </div>
            <div className="status-pills">
              {status?.online && (
                <>
                  <div className="status-pill version">
                    {status.version?.name}
                  </div>
                  <div className="status-pill ping">
                    {status.roundTripLatency}ms
                  </div>
                </>
              )}
            </div>
          </header>

          <div className="dashboard-body">
            {status?.online ? (
              <>
                <div className="dashboard-column">
                  <div className="dashboard-widget">
                    <h3>Message of the Day</h3>
                    <div
                      className="motd-display"
                      dangerouslySetInnerHTML={{
                        __html: status.motd?.html || "",
                      }}
                    />
                  </div>
                </div>
                <div className="dashboard-column players">
                  <div className="dashboard-widget">
                    <h3>
                      Players ({status.players?.online} / {status.players?.max})
                    </h3>
                    {status.players?.sample &&
                    status.players.sample.length > 0 ? (
                      <ul className="player-list">
                        {status.players.sample.map((player) => (
                          <li key={player.id}>
                            <img
                              src={`https://cravatar.eu/helmavatar/${player.name}/32.png`}
                              alt={player.name}
                            />
                            <span>{player.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-players">
                        No players are currently online.
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="offline-notice">
                <p>The server is not responding. Please try again later.</p>
                <Link to="/" className="portal-return-btn">
                  Back to Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Status;
