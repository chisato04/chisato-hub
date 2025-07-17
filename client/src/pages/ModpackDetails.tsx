// client/src/pages/ModpackDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// THE FIX: We no longer import the separate 'Modlist' type
import type { Modpack } from '../types';
import '../assets/css/modpack-details.css';

const ModpackDetails: React.FC = () => {
  const { filename } = useParams<{ filename: string }>();
  const [pack, setPack] = useState<Modpack | null>(null);
  // THE FIX: The separate 'modlist' state is removed.
  // const [modlist, setModlist] = useState<Modlist | null>(null);
  const [activeTab, setActiveTab] = useState('mod-list');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filename) return;
    setIsLoading(true);

    // THE FIX: We only need one API call now to get all pack data, including the modlist.
    fetch(`/api/modpacks/${filename}`)
      .then(res => {
        if (!res.ok) throw new Error('Modpack not found');
        return res.json();
      })
      .then((packData: Modpack) => {
        setPack(packData);
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));

  }, [filename]);

  if (isLoading) return <div className="container"><p className="placeholder-text">Loading details...</p></div>;
  if (error) return <div className="container"><p className="error-message">{error}</p></div>;
  if (!pack) return <div className="container"><p className="placeholder-text">Modpack not found.</p></div>;

  const downloadUrl = `/downloads/modpacks/${pack.filename}`;

  return (
    <div className="container">
      <div className="details-container">
        <header className="details-header">
          <div>
            <Link to="/modpacks" className="back-link">← Back to All Packs</Link>
            <h1>{pack.name}</h1>
            <div className="tags">
              <span className="tag tag-loader">{pack.loader}</span>
              <span className="tag tag-version">{pack.minecraftVersion}</span>
            </div>
          </div>
          <a href={downloadUrl} className="download-btn" download>Download Pack</a>
        </header>

        <div className="tab-container">
          <nav className="tab-nav">
            <button className={`tab-btn ${activeTab === 'mod-list' ? 'active' : ''}`} onClick={() => setActiveTab('mod-list')}>Mod List</button>
            <button className={`tab-btn ${activeTab === 'setup-notes' ? 'active' : ''}`} onClick={() => setActiveTab('setup-notes')}>Setup & Notes</button>
          </nav>
          
          {activeTab === 'mod-list' && (
            <div id="mod-list" className="tab-content active">
              {/* THE FIX: We now check pack.modlist directly */}
              {pack.modlist && pack.modlist.length > 0 ? (
                <div className="table-wrapper">
                  <table className="mod-list-table">
                    <thead><tr><th>Mod Name</th></tr></thead>
                    {/* THE FIX: We map over pack.modlist and explicitly type the parameters */}
                    <tbody>{pack.modlist.map((mod: string, index: number) => <tr key={index}><td>{mod}</td></tr>)}</tbody>
                  </table>
                </div>
              ) : (
                <p className="placeholder-text">No modlist has been generated for this pack.</p>
              )}
            </div>
          )}

          {activeTab === 'setup-notes' && (
            <div id="setup-notes" className="tab-content active">
              {pack.java_args && <><h3>Recommended Java Arguments</h3><pre><code>{pack.java_args}</code></pre></>}
              {pack.notes && <><h3>Notes</h3><div className="notes-content" dangerouslySetInnerHTML={{ __html: pack.notes.replace(/\n/g, '<br />') }} /></>}
              {!pack.java_args && !pack.notes && <p className="placeholder-text">No setup information or notes have been added for this pack.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModpackDetails;