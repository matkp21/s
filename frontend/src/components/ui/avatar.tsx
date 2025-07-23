import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt }) => {
  return (
    <div className="avatar w-12 h-12 rounded-full overflow-hidden">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

export const AvatarFallback: React.FC<{ fallbackText: string }> = ({ fallbackText }) => (
  <div className="avatar-fallback w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
    <span className="text-gray-700 font-bold">{fallbackText}</span>
  </div>
);

export const AvatarImage: React.FC<AvatarProps> = ({ src, alt }) => (
  <img src={src} alt={alt} className="avatar-image w-full h-full object-cover" />
);
