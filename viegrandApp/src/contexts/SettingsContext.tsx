import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { settingsAPI, UserSettings, UpdateUserSettingsDto } from '../services/api';
import { useAuth } from './AuthContext';

interface SettingsContextState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: UpdateUserSettingsDto) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextState | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      const fetchedSettings = await settingsAPI.getSettings();
      setSettings(fetchedSettings);
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || 'Lỗi không xác định';
      setError(errorMessage);
      console.error('Lỗi khi tải cài đặt:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateSettings = async (data: UpdateUserSettingsDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSettings = await settingsAPI.updateSettings(data);
      setSettings(updatedSettings);
      return true;
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || 'Lỗi không xác định';
      setError(errorMessage);
      console.error('Lỗi khi cập nhật cài đặt:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      // Clear settings when user logs out
      setSettings(null);
    }
  }, [user, fetchSettings]);

  const value = {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextState => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings phải được sử dụng trong một SettingsProvider');
  }
  return context;
}; 