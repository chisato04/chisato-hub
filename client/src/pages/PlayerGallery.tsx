// client/src/pages/PlayerGallery.tsx
import React, { useState, useEffect, useRef } from 'react';
import SkinViewerComponent from '../components/SkinViewer';
import Modal from '../components/Modal';
import '../assets/css/player-gallery.css';

interface Player { name: string; uuid: string; }

interface PlayerStats {
  deaths: number;
  player_kills: number;
  play_time_hours: number;
  top_mob_kills: { name: string; count: number }[];
}

const PlayerGallery: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the modal
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = grid.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      grid.style.setProperty('--mouse-x', `${x}px`);
      grid.style.setProperty('--mouse-y', `${y}px`);
    };
    grid.addEventListener('mousemove', handleMouseMove);
    return () => grid.removeEventListener('mousemove', handleMouseMove);
  }, [isLoading]);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/players');
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to fetch player data.');
        setPlayers(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayers();
  }, []);

useEffect(() => {
    if (selectedPlayer) {
      const fetchStats = async () => {
        setIsModalLoading(true);
        try {
          const response = await fetch(`/api/player-stats/${selectedPlayer.uuid}`);
          if (!response.ok) {
            // It's okay if a player has no stats file, we'll just show a message.
            setPlayerStats(null); 
            return;
          }
          const data: PlayerStats = await response.json();
          setPlayerStats(data);
        } catch (err) {
          console.error("Failed to fetch player stats:", err);
          setPlayerStats(null); // Clear stats on error
        } finally {
          setIsModalLoading(false);
        }
      };
      fetchStats();
    }
  }, [selectedPlayer]);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalClosing(false);
  };
  
  const closeModal = () => {
    setIsModalClosing(true);
    const timer = setTimeout(() => {
      setSelectedPlayer(null);
      setPlayerStats(null); // Clear stats when modal closes
    }, 300);
    return () => clearTimeout(timer);
  };

  return (
    <div className="container">
      <header>
        <h1>Player Gallery</h1>
        <p>A hall of fame for everyone who has joined the server. Click a player to view their stats.</p>
      </header>

      <div className="player-grid-container" ref={gridRef}>
        <div className="player-grid">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="player-pill skeleton-card">
                <div className="skeleton-line" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                <div className="skeleton-line" style={{ height: '16px', flex: 1, marginLeft: '10px' }} />
              </div>
            ))
          ) : error ? (
            <p className="error-message" style={{ gridColumn: '1 / -1' }}>{error}</p>
          ) : (
            players.map(player => (
              <div key={player.uuid} className="player-pill" onClick={() => handlePlayerClick(player)}>
                <img src={`https://crafatar.com/avatars/${player.uuid}?size=32&overlay`} alt={player.name} />
                <span>{player.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* The modal is only rendered if there is a selected player */}
      {selectedPlayer && (
        <Modal isClosing={isModalClosing} onClose={closeModal}>
          <div className="stats-modal-content">
            {/* The new two-column layout */}
            <div className="stats-modal-skin">
              <SkinViewerComponent
                skinUrl={`https://crafatar.com/skins/${selectedPlayer.uuid}`}
                playerName={selectedPlayer.name}
              />
            </div>
            <div className="stats-modal-info">
              <h2>{selectedPlayer.name}</h2>
              {isModalLoading ? (
                // Skeleton for the stats section
                <div className="stats-skeleton">
                  <div className="skeleton-line" style={{ height: '24px', width: '80%' }} />
                  <div className="skeleton-line" style={{ height: '16px', width: '60%', marginTop: '10px' }} />
                  <div className="skeleton-line" style={{ height: '16px', width: '70%', marginTop: '5px' }} />
                </div>
              ) : playerStats ? (
                <ul className="stats-list">
                  <li><span>Play Time</span> <strong>{playerStats.play_time_hours} hour/s</strong></li>
                  <li><span>Deaths</span> <strong>{playerStats.deaths}</strong></li>
                  <li><span>Player Kills</span> <strong>{playerStats.player_kills}</strong></li>
                  {playerStats.top_mob_kills.length > 0 && (
                    <li className="mob-kills">
                      <span>Top Kills</span>
                      <ul>
                        {playerStats.top_mob_kills.map(kill => (
                          <li key={kill.name}>{kill.name}: <strong>{kill.count}</strong></li>
                        ))}
                      </ul>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="no-stats-message">No stats recorded for this player yet.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PlayerGallery;