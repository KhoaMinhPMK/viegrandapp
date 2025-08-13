import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppStateContextType {
  currentScreen: string;
  isInChatScreen: boolean;
  currentConversationId: string | null;
  setCurrentScreen: (screen: string) => void;
  setChatScreenState: (isInChat: boolean, conversationId?: string) => void;
  isUserActive: boolean;
  setUserActive: (active: boolean) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreenState] = useState<string>('');
  const [isInChatScreen, setIsInChatScreen] = useState<boolean>(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isUserActive, setIsUserActive] = useState<boolean>(true);

  const setCurrentScreen = (screen: string) => {
    console.log('📱 App State - Screen changed to:', screen);
    setCurrentScreenState(screen);
  };

  const setChatScreenState = (isInChat: boolean, conversationId?: string) => {
    console.log('💬 Chat State - isInChat:', isInChat, 'conversationId:', conversationId);
    setIsInChatScreen(isInChat);
    setCurrentConversationId(conversationId || null);
  };

  const setUserActive = (active: boolean) => {
    console.log('👤 User Activity - Active:', active);
    setIsUserActive(active);
  };

  const value = {
    currentScreen,
    isInChatScreen,
    currentConversationId,
    setCurrentScreen,
    setChatScreenState,
    isUserActive,
    setUserActive,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}; 