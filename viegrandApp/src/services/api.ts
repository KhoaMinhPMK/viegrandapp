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

// Search friend API
export const searchFriend = async (phone: string, currentUserEmail?: string): Promise<{ success: boolean; results?: any[]; total?: number; message?: string }> => {
  try {
    const response = await apiClient.post('/searchfriend.php', {
      phone: phone.trim(),
      currentUserEmail: currentUserEmail || ''
    });

    console.log('Search friend API response:', response.data);

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
      return {
        success: true,
        results: responseData.data.results || [],
        total: responseData.data.total || 0,
        message: responseData.message
      };
    } else {
      console.log('Search friend failed:', responseData);
      return {
        success: false,
        results: [],
        total: 0,
        message: responseData.message || 'Không tìm thấy bạn bè'
      };
    }
  } catch (error: any) {
    console.error('Search friend API error:', error);
    return {
      success: false,
      results: [],
      total: 0,
      message: error.response?.data?.error?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Request friend API
export const requestFriend = async (fromPhone: string, toPhone: string, message?: string): Promise<{ success: boolean; data?: any; message?: string; canAccept?: boolean; existingRequest?: any }> => {
  try {
    const payload = {
      from_phone: fromPhone.trim(),
      to_phone: toPhone.trim(),
      message: message || ''
    };
    console.log('🔄 Request friend - Sending payload:', payload);
    console.log('🔄 Request friend - API endpoint:', apiClient.defaults.baseURL + '/request_friend.php');
    
    const response = await apiClient.post('/request_friend.php', payload);
    
    console.log('✅ Request friend API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });

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
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
        canAccept: responseData.data?.canAccept || false,
        existingRequest: responseData.data?.existingRequest || null
      };
    } else {
      console.log('Request friend failed:', responseData);
      return {
        success: false,
        message: responseData.message || 'Không thể gửi lời mời kết bạn'
      };
    }
  } catch (error: any) {
    console.error('❌ Request friend API - Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers
      }
    });
    return {
      success: false,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Cancel friend request API
export const cancelFriendRequest = async (fromPhone: string, toPhone: string, requestId?: number): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const response = await apiClient.post('/cancel_friend_request.php', {
      from_phone: fromPhone.trim(),
      to_phone: toPhone.trim(),
      request_id: requestId || null
    });

    console.log('Cancel friend request API response:', response.data);

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
      return {
        success: true,
        data: responseData.data,
        message: responseData.message
      };
    } else {
      console.log('Cancel friend request failed:', responseData);
      return {
        success: false,
        message: responseData.message || 'Không thể hủy lời mời kết bạn'
      };
    }
  } catch (error: any) {
    console.error('Cancel friend request API error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Get notifications API
export const getNotifications = async (userPhone: string): Promise<{ success: boolean; notifications?: any[]; message?: string }> => {
  try {
    const response = await apiClient.post('/get_notifications.php', {
      user_phone: userPhone.trim()
    });
    console.log('Get notifications API response:', response.data);
    if (response.data.success) {
      return {
        success: true,
        notifications: response.data.data.notifications || [],
        message: response.data.message
      };
    }
    return { success: false, notifications: [], message: response.data.message };
  } catch (error: any) {
    console.error('Get notifications API error:', error);
    return {
      success: false,
      notifications: [],
      message: error.response?.data?.error?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Mark notifications as read API
export const markNotificationsRead = async (userPhone: string, notificationIds: number[]): Promise<{ success: boolean; markedAsReadCount?: number; message?: string }> => {
  try {
    const response = await apiClient.post('/mark_notification_read.php', {
      user_phone: userPhone.trim(),
      notification_ids: notificationIds
    });
    console.log('Mark notifications read API response:', response.data);
    if (response.data.success) {
      return {
        success: true,
        markedAsReadCount: response.data.data.markedAsReadCount || 0,
        message: response.data.message
      };
    }
    return { success: false, message: response.data.message };
  } catch (error: any) {
    console.error('Mark notifications read API error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Accept friend request API
export const acceptFriendRequest = async (requestId: number, userPhone: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    console.log('🔄 acceptFriendRequest - Sending request:', { requestId, userPhone });
    const response = await apiClient.post('/accept_friend_request.php', {
      request_id: requestId,
      user_phone: userPhone.trim()
    });
    console.log('✅ acceptFriendRequest API response:', response.data);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    return { success: false, message: response.data.message };
  } catch (error: any) {
    console.error('❌ acceptFriendRequest API error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Reject friend request API
export const rejectFriendRequest = async (requestId: number, userPhone: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    console.log('🔄 rejectFriendRequest - Sending request:', { requestId, userPhone });
    const response = await apiClient.post('/reject_friend_request.php', {
      request_id: requestId,
      user_phone: userPhone.trim()
    });
    console.log('✅ rejectFriendRequest API response:', response.data);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    return { success: false, message: response.data.message };
  } catch (error: any) {
    console.error('❌ rejectFriendRequest API error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Get user phone API - specialized endpoint for getting just the phone number
export const getUserPhone = async (email: string): Promise<{ success: boolean; phone?: string; userName?: string; message?: string }> => {
  try {
    const payload = { email: email.trim() };
    console.log('🔄 getUserPhone - Sending request:', {
      url: apiClient.defaults.baseURL + '/get_user_phone.php',
      payload: payload,
      headers: apiClient.defaults.headers
    });
    
    const response = await apiClient.post('/get_user_phone.php', payload);
    
    console.log('📞 getUserPhone API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    if (response.data.success) {
      console.log('✅ getUserPhone - Success response data:', response.data);
      return {
        success: true,
        phone: response.data.phone,
        userName: response.data.userName,
        message: response.data.message
      };
    }
    console.log('❌ getUserPhone - API returned success=false:', response.data.message);
    return { success: false, message: response.data.message };
  } catch (error: any) {
    console.error('❌ getUserPhone API - Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers
      }
    });
    return {
      success: false,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

export default apiClient;
