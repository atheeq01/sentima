
import React from 'react';
import { toast } from 'react-toastify';
import '../styles/modal.css';

const Modal = ({ isOpen, show, onClose, title, children, customClass }) => {
  if (!isOpen && !show) {
    return null;
  }

  const handleClose = () => {
    toast.info("Not Submitted");
    onClose(); 
  };

  return (
    <div className="modal-backdrop">
      <div className={`modal-content ${customClass || ''}`}>
        <div className="modal-header">
          <h4 className="modal-title">{title}</h4>
          <button onClick={handleClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
