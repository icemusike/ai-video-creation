import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ApiKeyContextType {
  elevenLabsApiKey: string;
  setElevenLabsApiKey: (key: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');

  return (
    <ApiKeyContext.Provider value={{ elevenLabsApiKey, setElevenLabsApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
