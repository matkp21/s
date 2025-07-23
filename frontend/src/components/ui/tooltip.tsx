import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <div className="tooltip">{children}</div>;
};

interface TooltipTriggerProps {
  onClick: () => void;
  children: React.ReactNode;
}

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ onClick, children }) => {
  return (
    <button className="tooltip-trigger" onClick={onClick}>
      {children}
    </button>
  );
};

interface TooltipContentProps {
  content: string;
}

export const TooltipContent: React.FC<TooltipContentProps> = ({ content }) => {
  return <div className="tooltip-content">{content}</div>;
};

interface TooltipProviderProps {
  children: React.ReactNode;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return <div className="tooltip-provider">{children}</div>;
};
