import React from 'react';

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return <aside className="sidebar-container">{children}</aside>;
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  return <div className="sidebar-provider">{children}</div>;
};

interface SidebarTriggerProps {
  onClick: () => void;
  children: React.ReactNode;
}

export const SidebarTrigger: React.FC<SidebarTriggerProps> = ({ onClick, children }) => {
  return (
    <button className="sidebar-trigger" onClick={onClick}>
      {children}
    </button>
  );
};

interface SidebarInsetProps {
  children: React.ReactNode;
}

export const SidebarInset: React.FC<SidebarInsetProps> = ({ children }) => {
  return <div className="sidebar-inset">{children}</div>;
};
