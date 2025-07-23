import React from 'react';

interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export const Form: React.FC<FormProps> = ({ children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="form space-y-4">
      {children}
    </form>
  );
};

export const FormControl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="form-control">{children}</div>
);

export const FormDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="form-description text-sm text-gray-600">{children}</p>
);

export const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="form-field space-y-2">{children}</div>
);

export const FormItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="form-item">{children}</div>
);

export const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="form-label font-medium text-gray-700">{children}</label>
);

export const FormMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="form-message text-sm text-red-600">{children}</p>
);
