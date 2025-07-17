// client/src/components/SkinViewer.tsx
import React, { useRef, useEffect } from "react";
import { SkinViewer, WalkingAnimation } from "skinview3d";

interface SkinViewerProps {
  skinUrl: string;
  playerName: string;
  // The 'onDelete' prop has been removed
}

const SkinViewerComponent: React.FC<SkinViewerProps> = ({
  skinUrl,
  playerName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const skinViewer = new SkinViewer({
      canvas: canvasRef.current,
      width: 250,
      height: 300,
      skin: skinUrl,
      // Add a cape if you want!
      // cape: `https://crafatar.com/capes/${playerName}`
    });

    skinViewer.camera.position.set(0, 15, 40);

    const walking = new WalkingAnimation();
    walking.speed = 0.5;
    skinViewer.animation = walking;

    return () => {
      skinViewer.dispose();
    };
  }, [skinUrl]);

  return (
    <div className="skin-card">
      <canvas ref={canvasRef} />
      <div className="skin-info">
        {/* The delete button has been removed */}
        <span className="skin-name">{playerName}</span>
      </div>
    </div>
  );
};

export default SkinViewerComponent;
