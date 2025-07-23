import React from 'react';

interface TextareaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder = '',
  rows = 3,
  className = '',
}) => {
  return (
    <textarea
      className={`textarea ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
  );
};
