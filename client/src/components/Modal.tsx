// client/src/components/Modal.tsx
import React, { useEffect } from 'react';

interface ModalProps {
  // The 'isClosing' prop will be controlled by the parent to trigger the animation
  isClosing: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isClosing, onClose, children }) => {
  // Effect to handle the 'Escape' key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Determine the CSS class for animations based on the prop from the parent
  const animationClass = isClosing ? 'closing' : 'opening';

  return (
    <div className={`modal-overlay ${animationClass}`} onClick={onClose}>
      <div className={`modal-content ${animationClass}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;