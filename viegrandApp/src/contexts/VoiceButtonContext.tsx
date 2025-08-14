import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceButtonContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const VoiceButtonContext = createContext<VoiceButtonContextType | undefined>(undefined);

export const VoiceButtonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <VoiceButtonContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </VoiceButtonContext.Provider>
  );
};

export const useVoiceButton = (): VoiceButtonContextType => {
  const context = useContext(VoiceButtonContext);
  if (context === undefined) {
    throw new Error('useVoiceButton must be used within a VoiceButtonProvider');
  }
  return context;
}; 