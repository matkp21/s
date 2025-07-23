import React from 'react';

interface SelectProps {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children }) => {
  return <div className="select-container">{children}</div>;
};

interface SelectTriggerProps {
  children: React.ReactNode;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children }) => {
  return <button className="select-trigger">{children}</button>;
};

interface SelectValueProps {
  value: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ value }) => {
  return <span className="select-value">{value}</span>;
};

interface SelectContentProps {
  children: React.ReactNode;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  return <div className="select-content">{children}</div>;
};

interface SelectItemProps {
  value: string;
  onClick: () => void;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, onClick }) => {
  return (
    <div className="select-item" onClick={onClick}>
      {value}
    </div>
  );
};
