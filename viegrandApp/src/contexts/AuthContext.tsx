import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { authAPI, storageUtils, User, LoginRequest, RegisterRequest, usersAPI } from '../services/api';
import { Alert } from 'react-native';
import { usePremium } from './PremiumContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateCurrentUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchPremiumStatus, reset: resetPremiumContext } = usePremium();

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await storageUtils.getToken();
      const savedUser = await storageUtils.getUser();
      
      if (token && savedUser) {
        setUser(savedUser);
        await fetchPremiumStatus();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPremiumStatus]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);


  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.access_token && response.user) {
        await storageUtils.saveToken(response.access_token);
        await storageUtils.saveUser(response.user);
        
        setUser(response.user);
        await fetchPremiumStatus();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Đăng nhập thất bại';
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPremiumStatus]);

  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.access_token && response.user) {
        await storageUtils.saveToken(response.access_token);
        await storageUtils.saveUser(response.user);
        
        setUser(response.user);
        await fetchPremiumStatus();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Register error:', error);
      let errorMessage = 'Đăng ký thất bại';
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPremiumStatus]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await storageUtils.clearAuth();
      setUser(null);
      resetPremiumContext();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [resetPremiumContext]);

  const refreshUserProfile = useCallback(async (): Promise<void> => {
    try {
      const profile = await usersAPI.getProfile();
      setUser(profile);
      await storageUtils.saveUser(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  }, []);

  const updateCurrentUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    storageUtils.saveUser(updatedUser);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUserProfile,
    updateCurrentUser,
  }), [user, isLoading, login, register, logout, refreshUserProfile, updateCurrentUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
