import React from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <div className="dropdown-menu relative">{children}</div>;
};

export const DropdownMenuContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dropdown-menu-content absolute bg-white shadow-md rounded-md p-2">{children}</div>
);

export const DropdownMenuItem: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <div
    className="dropdown-menu-item px-4 py-2 hover:bg-gray-100 cursor-pointer"
    onClick={onClick}
  >
    {children}
  </div>
);

export const DropdownMenuLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dropdown-menu-label font-bold text-gray-700 px-4 py-2">{children}</div>
);

export const DropdownMenuSeparator: React.FC = () => (
  <div className="dropdown-menu-separator h-px bg-gray-200 my-2"></div>
);

export const DropdownMenuTrigger: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <button className="dropdown-menu-trigger" onClick={onClick}>
    {children}
  </button>
);

export const DropdownMenuSub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dropdown-menu-sub relative">{children}</div>
);

export const DropdownMenuSubTrigger: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <div
    className="dropdown-menu-sub-trigger px-4 py-2 hover:bg-gray-100 cursor-pointer"
    onClick={onClick}
  >
    {children}
  </div>
);

export const DropdownMenuSubContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dropdown-menu-sub-content absolute bg-white shadow-md rounded-md p-2">
    {children}
  </div>
);

export const DropdownMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dropdown-menu-portal">{children}</div>
);

export const DropdownMenuRadioGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dropdown-menu-radio-group">{children}</div>
);

export const DropdownMenuRadioItem: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <div
    className="dropdown-menu-radio-item px-4 py-2 hover:bg-gray-100 cursor-pointer"
    onClick={onClick}
  >
    {children}
  </div>
);
