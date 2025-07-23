import React from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  height?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, height = '200px' }) => {
  return (
    <div
      className="scroll-area overflow-y-auto"
      style={{ height, border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '0.5rem' }}
    >
      {children}
    </div>
  );
};
