import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';

// Mock settings type
interface UserSettings {
  id: number;
  userId: number;
  language: string;
  isDarkMode: boolean;
  elderly_notificationsEnabled: boolean;
  elderly_soundEnabled: boolean;
  elderly_vibrationEnabled: boolean;
  relative_appNotificationsEnabled: boolean;
  relative_emailAlertsEnabled: boolean;
  relative_smsAlertsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

type UpdateUserSettingsDto = Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

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
      // Mock settings
      const mockSettings: UserSettings = {
        id: 1,
        userId: user.id,
        language: 'vi',
        isDarkMode: false,
        elderly_notificationsEnabled: true,
        elderly_soundEnabled: true,
        elderly_vibrationEnabled: true,
        relative_appNotificationsEnabled: true,
        relative_emailAlertsEnabled: true,
        relative_smsAlertsEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSettings(mockSettings);
    } catch (e: any) {
      const errorMessage = 'Không thể tải cài đặt (mock)';
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
      // Mock update - chỉ update local state
      if (settings) {
        const updatedSettings = { ...settings, ...data, updatedAt: new Date().toISOString() };
        setSettings(updatedSettings);
      }
      return true;
    } catch (e: any) {
      const errorMessage = 'Không thể cập nhật cài đặt (mock)';
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