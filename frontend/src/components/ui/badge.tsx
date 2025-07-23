import React from 'react';

interface BadgeProps {
  text: string;
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ text, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span
      className={`badge inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${colorClasses[color]}`}
    >
      {text}
    </span>
  );
};
