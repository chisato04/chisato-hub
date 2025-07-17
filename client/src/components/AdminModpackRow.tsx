// client/src/components/AdminModpackRow.tsx
import React, { useState } from 'react';
import type { Modpack } from '../types';

interface AdminModpackRowProps {
  pack: Modpack;
  onInputChange: (filename: string, field: keyof Modpack, value: string) => void;
  onDelete: (filename: string) => void;
}

const AdminModpackRow: React.FC<AdminModpackRowProps> = ({
  pack,
  onInputChange,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="modpack-manage-card">
      <div className="modpack-main-row">
        <div className="modpack-info-display name">{pack.name}</div>
        <div className="modpack-info-display">{pack.loader}</div>
        <div className="modpack-info-display">{pack.minecraftVersion}</div>
        <div className="modpack-info-display modlist-count">
          {pack.modlist?.length || 0} mods
        </div>

        <div className="actions-container">
          <button className="action-btn details-toggle" title="Expand/Collapse Details" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? '−' : '+'}
          </button>
          <button className="action-btn delete-btn" title="Delete Modpack" onClick={() => onDelete(pack.filename)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10,18a1,1,0,0,0,1-1V11a1,1,0,0,0-2,0v6A1,1,0,0,0,10,18Z"/><path d="M14,18a1,0,0,0,1-1V11a1,1,0,0,0-2,0v6A1,1,0,0,0,14,18Z"/><path d="M20,6H16V5a3,3,0,0,0-3-3H11A3,3,0,0,0,8,5V6H4A1,1,0,0,0,4,8H5V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V8h1a1,1,0,0,0,0-2ZM10,5a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1V6H10Zm7,14a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V8H17Z"/></svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="modpack-details-row">
          <div className="detail-group">
            <label>Java Arguments</label>
            <textarea className="admin-textarea" rows={4} value={pack.java_args || ''} onChange={(e) => onInputChange(pack.filename, 'java_args', e.target.value)} />
          </div>
          <div className="detail-group">
            <label>Notes</label>
            <textarea className="admin-textarea" rows={4} value={pack.notes || ''} onChange={(e) => onInputChange(pack.filename, 'notes', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModpackRow;