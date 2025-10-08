import React from 'react';
import './Modal.css';

// Main Modal component
const Modal = ({ show, onHide, size = '', centered = false, backdrop = true, keyboard = true, children }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && backdrop && onHide) {
      onHide();
    }
  };

  const handleKeyDown = React.useCallback((e) => {
    if (keyboard && e.key === 'Escape' && onHide) {
      onHide();
    }
  }, [keyboard, onHide]);

  React.useEffect(() => {
    if (show && keyboard) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [show, keyboard, handleKeyDown]);

  React.useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  const modalSizeClass = size ? `modal-${size}` : '';
  const modalCenteredClass = centered ? 'modal-dialog-centered' : '';

  return (
    <div 
      className={`modal fade ${show ? 'show' : ''}`} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-hidden={!show}
      style={{ display: show ? 'block' : 'none' }}
    >
      <div className={`modal-dialog ${modalSizeClass} ${modalCenteredClass}`}>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal Header component
const ModalHeader = ({ closeButton = true, onHide, children }) => {
  return (
    <div className="modal-header">
      {children}
      {closeButton && (
        <button 
          type="button" 
          className="btn-close" 
          onClick={onHide}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

// Modal Title component
const ModalTitle = ({ as = 'h5', className = '', children }) => {
  const Tag = as;
  return (
    <Tag className={`modal-title ${className}`}>
      {children}
    </Tag>
  );
};

// Modal Body component
const ModalBody = ({ children, className = '' }) => {
  return (
    <div className={`modal-body ${className}`}>
      {children}
    </div>
  );
};

// Modal Footer component
const ModalFooter = ({ children, className = '' }) => {
  return (
    <div className={`modal-footer ${className}`}>
      {children}
    </div>
  );
};

// Attach subcomponents to main Modal component
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;