// client/src/pages/ModpackDepot.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { Modpack } from '../types';
import PackCard from '../components/PackCard';
import PackCardSkeleton from '../components/PackCardSkeleton';
import '../assets/css/modpack-depot.css';

const ModpackDepot: React.FC = () => {
  const [allPacks, setAllPacks] = useState<Modpack[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLoader, setActiveLoader] = useState('all');
  const [activeVersion, setActiveVersion] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('/api/modpacks')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch modpacks from the server.');
        return res.json();
      })
      .then((data: Modpack[]) => {
        if (Array.isArray(data)) {
          setAllPacks(data.sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          console.error("API did not return an array:", data);
          setError("Received invalid data from the server.");
        }
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const { uniqueLoaders, uniqueVersions } = useMemo(() => {
    const loaders = new Set<string>();
    const versions = new Set<string>();
    allPacks.forEach(pack => {
      if (pack.loader && pack.loader !== 'N/A') loaders.add(pack.loader);
      if (pack.minecraftVersion && pack.minecraftVersion !== 'N/A') versions.add(pack.minecraftVersion);
    });
    return {
      uniqueLoaders: Array.from(loaders).sort(),
      uniqueVersions: Array.from(versions).sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
    };
  }, [allPacks]);

  const filteredPacks = useMemo(() => {
    return allPacks.filter(pack => {
      const searchMatch = pack.name.toLowerCase().includes(searchTerm.toLowerCase());
      const loaderMatch = activeLoader === 'all' || pack.loader === activeLoader;
      const versionMatch = activeVersion === 'all' || pack.minecraftVersion === activeVersion;
      return searchMatch && loaderMatch && versionMatch;
    });
  }, [allPacks, searchTerm, activeLoader, activeVersion]);

  return (
    // This container triggers the two-column layout.
    <div className="container container-with-sidebar">
      <div className="sidebar-card">
        <header>
            <h1>chisato packs</h1>
            <p>A self-hosted repository for Minecraft Modpacks. Click a pack for details or the icon to download.</p>
        </header>
        <div className="search-container">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10,18a8,8,0,1,1,8-8A8.009,8.009,0,0,1,10,18ZM10,4a6,6,0,1,0,6,6A6.007,6.007,0,0,0,10,4Z" />
                <path d="M21,22a1,1,0,0,1-.707-0.293l-4-4a1,1,0,0,1,1.414-1.414l4,4A1,1,0,0,1,21,22Z" />
            </svg>
            <input 
              type="search" 
              id="searchInput"
              placeholder="Search packs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="filter-group">
            <h2>Mod Loaders</h2>
            <div className="filter-buttons">
              <button className={`filter-btn ${activeLoader === 'all' ? 'active' : ''}`} onClick={() => setActiveLoader('all')}>All</button>
              {uniqueLoaders.map(loader => ( <button key={loader} className={`filter-btn ${activeLoader === loader ? 'active' : ''}`} onClick={() => setActiveLoader(loader)}>{loader}</button>))}
            </div>
        </div>
        <div className="filter-group">
            <h2>Versions</h2>
            <div className="filter-buttons">
              <button className={`filter-btn ${activeVersion === 'all' ? 'active' : ''}`} onClick={() => setActiveVersion('all')}>All</button>
              {uniqueVersions.map(version => ( <button key={version} className={`filter-btn ${activeVersion === version ? 'active' : ''}`} onClick={() => setActiveVersion(version)}>{version}</button>))}
            </div>
        </div>
      </div>

      <div className="content-card">
        <div className="grid-container" id="gridContainer">
          {isLoading ? (
            // Render a grid of 6 skeletons as a placeholder
            Array.from({ length: 6 }).map((_, index) => <PackCardSkeleton key={index} />)
          ) : error ? (
            <p style={{color: 'var(--red)', gridColumn: '1 / -1'}}>Error: {error}</p>
          ) : filteredPacks.length > 0 ? (
            filteredPacks.map(pack => <PackCard key={pack.filename} pack={pack} />)
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center'}}>No modpacks match the current filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModpackDepot;