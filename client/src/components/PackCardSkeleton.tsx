// client/src/components/PackCardSkeleton.tsx
import React from 'react';

const PackCardSkeleton: React.FC = () => {
  return (
    <div className="card skeleton-card">
      <div className="card-content">
        <div className="skeleton-line" style={{ height: '24px', width: '80%', marginBottom: '15px' }} />
        <div className="skeleton-tags">
          <div className="skeleton-line" style={{ height: '20px', width: '60px' }} />
          <div className="skeleton-line" style={{ height: '20px', width: '50px' }} />
        </div>
      </div>
      <div className="card-download-btn">
        <div className="skeleton-line" style={{ height: '20px', width: '20px', borderRadius: '50%' }} />
      </div>
    </div>
  );
};

export default PackCardSkeleton;