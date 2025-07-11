import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PaymentMethod } from '../types/premium';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { getAPIURL, getNetworkInfo } from '../config/network';

// Hàm để detect thiết bị thật vs emulator/simulator và lấy URL phù hợp
const getBaseURL = async (): Promise<string> => {
  try {
    // Sử dụng config để lấy URL
    const baseURL = getAPIURL();
    const networkInfo = getNetworkInfo();
    
    console.log('🔧 Network Configuration:');
    console.log('  Platform:', networkInfo.platform);
    console.log('  Use Localhost:', networkInfo.useLocalhost);
    console.log('  Host:', networkInfo.host);
    console.log('  Full URL:', networkInfo.fullURL);
    
    // Kiểm tra device type cho thông tin debug
    const isEmulator = await DeviceInfo.isEmulator();
    console.log('📱 Device Type:', isEmulator ? 'Emulator/Simulator' : 'Real Device');
    
    console.log('🌐 API Base URL:', baseURL);
    return baseURL;
    
  } catch (error) {
    console.error('❌ Error getting base URL:', error);
    // Fallback - sử dụng network config
    return getAPIURL();
  }
};

// Khởi tạo baseURL (sẽ được cập nhật khi app khởi động)
let currentBaseURL = getAPIURL();

// Hàm để update baseURL
export const initializeAPI = async (): Promise<void> => {
  try {
    // Import debug utilities
    const { logNetworkDebugInfo, testNetworkConnection } = await import('../utils/networkDebug');
    
    // Log debug info
    await logNetworkDebugInfo();
    
    // Get the correct baseURL
    currentBaseURL = await getBaseURL();
    
    // Test connection
    const isConnected = await testNetworkConnection(currentBaseURL);
    
    if (!isConnected) {
      console.warn('⚠️ Initial connection test failed, but API URL has been set');
      console.log('💡 Suggestions:');
      console.log('   1. Make sure backend is running on your computer');
      console.log('   2. Check if your phone and computer are on the same WiFi network');
      console.log('   3. Check if firewall is blocking the connection');
      console.log('   4. Verify the IP address in API_CONFIG.HOST_IP');
    }
    
    // Cập nhật baseURL cho axios instance
    apiClient.defaults.baseURL = currentBaseURL;
    console.log('✅ API initialized with baseURL:', currentBaseURL);
  } catch (error) {
    console.error('❌ Failed to initialize API:', error);
  }
};

// Tạo axios instance
const apiClient = axios.create({
  baseURL: currentBaseURL,
  timeout: 30000, // Tăng timeout lên 30 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log('API Error:', error);
    
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
      // Có thể redirect về login screen
    }
    
    // Ensure error message is a string
    if (error.response?.data?.message && typeof error.response.data.message !== 'string') {
      error.response.data.message = 'Server error';
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    phone?: string;
    age?: number;
    address?: string;
    gender?: string;
    active: boolean;
  };
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  age?: number;
  address?: string;
  gender?: string;
  active: boolean;
}

// Premium types
export interface PremiumPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  type: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isActive: boolean;
  sortOrder: number;
  isRecommended: boolean;
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  nextPaymentDate?: string;
  paidAmount: number;
  paymentMethod: 'momo' | 'zalopay' | 'vnpay' | 'credit_card';
  transactionId?: string;
  notes?: string;
  failedPaymentAttempts: number;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: number;
  userId: number;
  subscriptionId: number;
  planId: number;
  transactionCode: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'momo' | 'zalopay' | 'vnpay' | 'credit_card';
  gatewayTransactionId?: string;
  gatewayResponse?: string;
  type: 'subscription' | 'renewal' | 'refund' | 'upgrade';
  description: string;
  customerInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  paidAt?: string;
  expiresAt?: string;
  failureReason?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  subscription: UserSubscription | null;
  plan: PremiumPlan | null;
  daysRemaining: number;
}

export interface CreateSubscriptionRequest {
  planId: number;
  paymentMethod: 'momo' | 'zalopay' | 'vnpay' | 'credit_card';
  autoRenewal?: boolean;
  notes?: string;
}

export interface CreatePaymentRequest {
  subscriptionId: number;
  planId: number;
  amount: number;
  paymentMethod: 'momo' | 'zalopay' | 'vnpay' | 'credit_card';
  type: 'subscription' | 'renewal' | 'refund' | 'upgrade';
  description: string;
  customerInfo?: string;
}

export interface PaymentInitRequest {
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  callbackUrl: string;
  returnUrl: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  gatewayTransactionId?: string;
  paymentUrl?: string;
  message: string;
  data?: {
    qrCode?: string;
    deepLink?: string;
    expiresAt?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    error?: string;
    timestamp: string;
    path: string;
    method: string;
  };
}

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    console.log('Login request data:', data);
    const response = await apiClient.post('/auth/login', data);
    console.log('Login response:', response.data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log('Register request data:', data);
    const response = await apiClient.post('/auth/register', data);
    console.log('Register response:', response.data);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  getTest: async (): Promise<User> => {
    const response = await apiClient.get('/users/test');
    return response.data;
  },

  getProfileById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/profile/${id}`);
    return response.data;
  },

  testProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/test');
    return response.data;
  },

  create: async (userData: any): Promise<User> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  update: async (id: number, userData: any): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  updateMyProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.patch('/users/me', userData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

// Premium API
export const premiumAPI = {
  // Premium Plans
  getPlans: async (): Promise<PremiumPlan[]> => {
    const response = await apiClient.get('/premium/plans');
    return response.data.data;
  },

  getPlanById: async (id: number): Promise<PremiumPlan> => {
    const response = await apiClient.get(`/premium/plans/${id}`);
    return response.data.data;
  },

  // User Subscription
  getMySubscription: async (): Promise<UserSubscription | null> => {
    const response = await apiClient.get('/premium/my-subscription');
    return response.data.data;
  },

  getMyPremiumStatus: async (): Promise<PremiumStatus> => {
    const response = await apiClient.get('/premium/my-status');
    return response.data.data;
  },

  getMySubscriptions: async (): Promise<UserSubscription[]> => {
    const response = await apiClient.get('/premium/my-subscriptions');
    return response.data.data;
  },

  subscribe: async (data: CreateSubscriptionRequest): Promise<UserSubscription> => {
    const response = await apiClient.post('/premium/subscribe', data);
    return response.data.data;
  },

  cancelSubscription: async (subscriptionId: number, reason: string): Promise<UserSubscription> => {
    const response = await apiClient.put(`/premium/subscription/${subscriptionId}/cancel`, {
      cancelReason: reason,
    });
    return response.data.data;
  },

  // Payment
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get('/premium/payment-methods');
    return response.data.data;
  },

  createPayment: async (data: CreatePaymentRequest): Promise<PaymentTransaction> => {
    const response = await apiClient.post('/premium/payment/create', data);
    return response.data.data;
  },

  initiatePayment: async (transactionId: number, data: PaymentInitRequest): Promise<PaymentGatewayResponse> => {
    const response = await apiClient.post(`/premium/payment/${transactionId}/initiate`, data);
    return response.data.data;
  },

  getTransaction: async (transactionCode: string): Promise<PaymentTransaction> => {
    const response = await apiClient.get(`/premium/payment/transaction/${transactionCode}`);
    return response.data.data;
  },

  getMyTransactions: async (): Promise<PaymentTransaction[]> => {
    const response = await apiClient.get('/premium/payment/my-transactions');
    return response.data.data;
  },

  retryPayment: async (transactionId: number): Promise<PaymentGatewayResponse> => {
    const response = await apiClient.post(`/premium/payment/${transactionId}/retry`);
    return response.data.data;
  },

  // Statistics
  getMyStats: async (): Promise<any> => {
    const response = await apiClient.get('/premium/stats');
    return response.data.data;
  },

  // Complete subscription flow
  purchasePremium: async (planId: number, paymentMethod: string, customerInfo: any): Promise<{
    subscription: UserSubscription;
    transaction: PaymentTransaction;
    paymentUrl: string;
  }> => {
    try {
      // Step 1: Create subscription
      const subscription = await premiumAPI.subscribe({
        planId,
        paymentMethod: paymentMethod as any,
        autoRenewal: true,
      });

      // Step 2: Create payment transaction
      const plan = await premiumAPI.getPlanById(planId);
      const transaction = await premiumAPI.createPayment({
        subscriptionId: subscription.id,
        planId,
        amount: plan.price,
        paymentMethod: paymentMethod as any,
        type: 'subscription',
        description: `Thanh toán gói ${plan.name}`,
        customerInfo: JSON.stringify(customerInfo),
      });

      // Step 3: Initiate payment
      const paymentInit = await premiumAPI.initiatePayment(transaction.id, {
        amount: plan.price,
        currency: 'VND',
        description: `Thanh toán gói ${plan.name}`,
        paymentMethod,
        customerInfo,
        callbackUrl: `${currentBaseURL}/premium/payment/callback`,
        returnUrl: 'viegrandapp://payment/result',
      });

      return {
        subscription,
        transaction,
        paymentUrl: paymentInit.paymentUrl || '',
      };
    } catch (error) {
      console.error('Purchase premium error:', error);
      throw error;
    }
  },
};

// Settings Types
export interface UserSettings {
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

export type UpdateUserSettingsDto = Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// Settings API
export const settingsAPI = {
  getSettings: async (): Promise<UserSettings> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  updateSettings: async (data: UpdateUserSettingsDto): Promise<UserSettings> => {
    const response = await apiClient.put('/settings', data);
    return response.data;
  },
};

// Storage utilities
export const storageUtils = {
  saveToken: async (token: string) => {
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  saveUser: async (user: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  getUser: async (): Promise<User | null> => {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  clearAuth: async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  },
};

export default apiClient;
