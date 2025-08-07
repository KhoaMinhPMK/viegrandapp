import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { storageUtils, User as ApiUser, LoginRequest, RegisterRequest, registerUser, loginUser, getUserData } from '../services/api';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User extends ApiUser {}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateCurrentUser: (updatedUser: User) => void;
  getUserDataByEmail: (email: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await storageUtils.getToken();
      const savedUser = await storageUtils.getUser();
      
      if (token && savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Gọi API login thật
      const result = await loginUser(credentials);
      
      if (result.success && result.user) {
        // Lưu user và token
        const token = result.token || 'token_' + Date.now();
        
        await storageUtils.saveToken(token);
        await storageUtils.saveUser(result.user);
        
        setUser(result.user);
        return true;
      } else {
        Alert.alert('Lỗi', result.message || 'Đăng nhập thất bại');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Lỗi', 'Đăng nhập thất bại: ' + (error.message || 'Lỗi không xác định'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Debug: log the userData being passed
      console.log('AuthContext register - userData:', {
        ...userData,
        password: '***',
        privateKey: userData.privateKey || 'NULL'
      });
      
      // Clear cache cũ trước khi đăng ký
      console.log('🔄 Clearing old cache before registration...');
      await storageUtils.clearAuth();
      
      // Gọi API register thật
      const result = await registerUser(userData);
      
      if (result.success && result.user) {
        // Lưu user và tạo mock token
        const mockToken = 'token_' + Date.now();
        
        await storageUtils.saveToken(mockToken);
        await storageUtils.saveUser(result.user);
        
        // Clear và lưu email mới
        await AsyncStorage.removeItem('user_email');
        await AsyncStorage.setItem('user_email', userData.email);
        
        setUser(result.user);
        return true;
      } else {
        Alert.alert('Lỗi', result.message || 'Đăng ký thất bại');
        return false;
      }
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('Lỗi', 'Đăng ký thất bại: ' + (error.message || 'Lỗi không xác định'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 Starting logout process...');
      
      // Xóa tất cả dữ liệu từ AsyncStorage
      await storageUtils.clearAuth();
      
      // Reset user state
      setUser(null);
      
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const refreshUserProfile = useCallback(async (): Promise<void> => {
    try {
      if (!user?.email) {
        console.log('No user email available for refresh');
        return;
      }
      
      console.log('🔄 Refreshing user profile for:', user.email);
      const result = await getUserData(user.email);
      
      if (result.success && result.user) {
        console.log('✅ User profile refreshed successfully');
        setUser(result.user);
        await storageUtils.saveUser(result.user);
      } else {
        console.log('❌ Failed to refresh user profile:', result.message);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  }, [user?.email]);

  const updateCurrentUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    storageUtils.saveUser(updatedUser);
  }, []);

  const getUserDataByEmail = useCallback(async (email: string): Promise<User | null> => {
    try {
      const result = await getUserData(email);
      if (result.success && result.user) {
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
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
    getUserDataByEmail,
  }), [user, isLoading, login, register, logout, refreshUserProfile, updateCurrentUser, getUserDataByEmail]);

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
