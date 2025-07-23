import React, { createContext, useContext, useState } from 'react';

interface ProModeContextProps {
  isProMode: boolean;
  toggleProMode: () => void;
}

const ProModeContext = createContext<ProModeContextProps | undefined>(undefined);

export const ProModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProMode, setIsProMode] = useState(false);

  const toggleProMode = () => {
    setIsProMode((prev) => !prev);
  };

  return (
    <ProModeContext.Provider value={{ isProMode, toggleProMode }}>
      {children}
    </ProModeContext.Provider>
  );
};

export const useProMode = () => {
  const context = useContext(ProModeContext);
  if (!context) {
    throw new Error('useProMode must be used within a ProModeProvider');
  }
  return context;
};
