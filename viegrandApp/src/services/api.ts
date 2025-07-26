import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://viegrand.site/backend/';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Types - chỉ giữ lại types cần thiết
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
  // Health information fields
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
}

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
  user: User;
}

// Storage utilities - chỉ giữ lại phần này
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

// API Functions
export const registerUser = async (userData: RegisterRequest): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const response = await apiClient.post('/register.php', {
      userName: userData.fullName,
      email: userData.email,
      relative_phone: userData.phone, // Map phone to relative_phone
      // password field doesn't exist in backend, will be ignored
    });

    console.log('Register API response:', response.data);

    if (response.data.success) {
      // Kiểm tra response structure trước khi access
      if (!response.data.data || !response.data.data.user) {
        console.error('Invalid response structure:', response.data);
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }
      
      // Map từ cấu trúc API về cấu trúc User của app
      const apiUser = response.data.data.user;
      
      // Kiểm tra userId tồn tại
      if (!apiUser.userId) {
        console.error('UserId not found in response:', apiUser);
        return {
          success: false,
          message: 'User ID not returned from server'
        };
      }
      
      const mappedUser: User = {
        id: apiUser.userId,
        fullName: apiUser.userName || userData.fullName,
        email: apiUser.email || userData.email,
        role: 'user', // Mặc định là user
        phone: userData.phone, // Lưu phone từ input vì API chưa có field này
        active: true,
        age: apiUser.age,
        gender: apiUser.gender,
        bloodType: apiUser.blood,
        allergies: apiUser.allergies,
        chronicDiseases: apiUser.chronic_diseases,
        address: apiUser.home_address,
      };

      return {
        success: true,
        user: mappedUser,
        message: response.data.message
      };
    } else {
      console.log('Register failed:', response.data);
      return {
        success: false,
        message: response.data.message || 'Đăng ký thất bại'
      };
    }
  } catch (error: any) {
    console.error('Register API error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Lỗi kết nối'
    };
  }
};

export const loginUser = async (credentials: LoginRequest): Promise<{ success: boolean; user?: User; token?: string; message?: string }> => {
  try {
    const response = await apiClient.post('/login.php', {
      email: credentials.email,
      // Note: Password không cần thiết vì API chỉ cần email để đơn giản hóa cho người già
    });

    console.log('Login API response:', response.data);

    if (response.data.success) {
      // Kiểm tra response structure trước khi access
      if (!response.data.data || !response.data.data.user) {
        console.error('Invalid login response structure:', response.data);
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }

      // Map từ cấu trúc API về cấu trúc User của app
      const apiUser = response.data.data.user;
      
      // Kiểm tra userId tồn tại
      if (!apiUser.userId) {
        console.error('UserId not found in login response:', apiUser);
        return {
          success: false,
          message: 'User ID not returned from server'
        };
      }

      const mappedUser: User = {
        id: apiUser.userId,
        fullName: apiUser.userName || 'User',
        email: apiUser.email,
        role: 'user', // Mặc định là user
        active: true,
        age: apiUser.age,
        gender: apiUser.gender,
        bloodType: apiUser.blood,
        allergies: apiUser.allergies,
        chronicDiseases: apiUser.chronic_diseases,
        address: apiUser.home_address,
      };

      return {
        success: true,
        user: mappedUser,
        token: response.data.data.token,
        message: response.data.message
      };
    } else {
      console.log('Login failed:', response.data);
      return {
        success: false,
        message: response.data.message || 'Đăng nhập thất bại'
      };
    }
  } catch (error: any) {
    console.error('Login API error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Get user data API
export const getUserData = async (email: string): Promise<{ success: boolean; user?: any; message?: string }> => {
  try {
    const response = await apiClient.post('/get_user_data.php', {
      email
    });
    
    console.log('Get user data API response:', response.data);

    // Handle case where PHP warnings are included in response
    let responseData = response.data;
    if (typeof responseData === 'string') {
      // Extract JSON from string that might contain PHP warnings
      const jsonMatch = responseData.match(/\{.*\}$/);
      if (jsonMatch) {
        try {
          responseData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Failed to parse JSON from response:', parseError);
          return {
            success: false,
            message: 'Invalid response format from server'
          };
        }
      }
    }

    if (responseData.success) {
      // Kiểm tra response structure
      if (!responseData.data || !responseData.data.user) {
        console.error('Invalid get user data response structure:', responseData);
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }

      return {
        success: true,
        user: responseData.data.user,
        message: responseData.message
      };
    } else {
      console.log('Get user data failed:', responseData);
      return {
        success: false,
        message: responseData.message || 'Không thể lấy thông tin người dùng'
      };
    }
  } catch (error: any) {
    console.error('Get user data API error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Update user data API
export const updateUserData = async (email: string, updateData: any): Promise<{ success: boolean; user?: any; message?: string }> => {
  try {
    const response = await apiClient.post('/update_user_data.php', {
      email,
      ...updateData
    });

    console.log('Update user data API response:', response.data);

    if (response.data.success) {
      // Kiểm tra response structure
      if (!response.data.data || !response.data.data.user) {
        console.error('Invalid update response structure:', response.data);
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }

      return {
        success: true,
        user: response.data.data.user,
        message: response.data.message
      };
    } else {
      console.log('Update user data failed:', response.data);
      return {
        success: false,
        message: response.data.message || 'Cập nhật thông tin thất bại'
      };
    }
  } catch (error: any) {
    console.error('Update user data API error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Lỗi kết nối'
    };
  }
};

export default apiClient;
