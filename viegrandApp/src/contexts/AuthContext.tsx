import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { storageUtils, User as ApiUser, LoginRequest, RegisterRequest, registerUser, loginUser } from '../services/api';
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
        Alert.alert('Thành công', result.message || 'Đăng nhập thành công');
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
        Alert.alert('Thành công', result.message || 'Đăng ký thành công');
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
    // Mock refresh - không làm gì
    console.log('Profile refresh disabled - no backend');
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
