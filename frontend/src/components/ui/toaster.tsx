import React from 'react';

interface ToasterProps {
  message: string;
  onClose: () => void;
}

export const Toaster: React.FC<ToasterProps> = ({ message, onClose }) => {
  return (
    <div className="toaster">
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
