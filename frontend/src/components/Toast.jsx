import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon success" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon error" />;
      default:
        return <Info size={18} className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast ${type}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <span className="toast-message">{message}</span>
      <button onClick={onClose} className="toast-close">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
