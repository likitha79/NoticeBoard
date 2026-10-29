import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const Modal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', confirmBtnClass = 'btn-danger', isLoading = false }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon-danger">
            <AlertTriangle size={24} />
          </div>
          <h3 className="modal-title">{title}</h3>
        </div>

        <div className="modal-body">
          {message}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
            id="modal-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${confirmBtnClass}`}
            onClick={onConfirm}
            disabled={isLoading}
            id="modal-confirm-btn"
          >
            {isLoading ? (
              <>
                <span className="spinner spinner-light"></span>
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
