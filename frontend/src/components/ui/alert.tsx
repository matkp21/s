import React from 'react';

interface AlertProps {
  title: string;
  description: string;
}

export const Alert: React.FC<AlertProps> = ({ title, description }) => {
  return (
    <div className="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">{title}</strong>
      <span className="block sm:inline"> {description}</span>
    </div>
  );
};

export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="font-bold text-lg">{children}</h4>
);

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-700">{children}</p>
);
