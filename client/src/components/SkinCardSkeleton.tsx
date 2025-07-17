// client/src/components/SkinCardSkeleton.tsx
import React from 'react';

const SkinCardSkeleton: React.FC = () => {
  return (
    // We use the real skin-card class to get the correct background and border
    <div className="skin-card skeleton-card">
      {/* This div mimics the <canvas> element */}
      <div className="skeleton-line" style={{ height: '300px', width: '250px' }} />
      
      {/* This div mimics the .skin-info bar */}
      <div className="skin-info" style={{ padding: '15px 10px' }}>
        <div className="skeleton-line" style={{ height: '20px', width: '70%' }} />
      </div>
    </div>
  );
};

export default SkinCardSkeleton;