import React from 'react';
import '../styles/ErrorMessage.css';

const ErrorMessage = ({ message, onClose, type }) => {
  if (!message) return null;

  return (
    <div className={type ? 'error-message' : 'info-message' }>
      <h2>{message}</h2>
      <button className = 'info-button' onClick={onClose}>Close</button>
    </div>
  );
};

export default ErrorMessage;