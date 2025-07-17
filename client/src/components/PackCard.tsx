// client/src/components/PackCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Modpack } from '../types';

interface PackCardProps {
  pack: Modpack;
}

const PackCard: React.FC<PackCardProps> = ({ pack }) => {
  const navigate = useNavigate();
  const downloadUrl = `http://localhost:3001/downloads/modpacks/${pack.filename}`;
  const handleCardClick = () => navigate(`/modpacks/${pack.filename}`);
  const handleDownloadClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="card" onClick={handleCardClick} data-loader={pack.loader} data-version={pack.minecraftVersion}>
      <div className="card-content">
        <h3>{pack.name.replace(/_/g, ' ')}</h3>
        <div className="tags">
          <span className="tag tag-loader">{pack.loader || 'N/A'}</span>
          <span className="tag tag-version">{pack.minecraftVersion}</span>
        </div>
      </div>
      <a href={downloadUrl} className="card-download-btn" download title={`Download ${pack.name}`} onClick={handleDownloadClick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,15a1,1,0,0,1-.707-.293l-4-4a1,1,0,1,1,1.414-1.414L12,12.586l3.293-3.293a1,1,0,0,1,1.414,1.414l-4,4A1,1,0,0,1,12,15Z" />
          <path d="M12,2A1,1,0,0,0,11,3V13a1,1,0,0,0,2,0V3A1,1,0,0,0,12,2Z" />
          <path d="M20,14a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V15a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V15A1,1,0,0,0,20,14Z" />
        </svg>
      </a>
    </div>
  );
};

export default PackCard;