import React, { createContext, useContext, useState } from 'react';

interface ClientStateContextProps {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

const ClientStateContext = createContext<ClientStateContextProps | undefined>(undefined);

export const ClientStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(null);

  return (
    <ClientStateContext.Provider value={{ state, setState }}>
      {children}
    </ClientStateContext.Provider>
  );
};

export const useClientState = () => {
  const context = useContext(ClientStateContext);
  if (!context) {
    throw new Error('useClientState must be used within a ClientStateProvider');
  }
  return context;
};
