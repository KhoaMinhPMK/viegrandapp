import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config/env';

// API Configuration
const API_BASE_URL = config.BACKEND_API_URL;

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
      // Xóa tất cả dữ liệu liên quan đến user
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('user_email');
      await AsyncStorage.removeItem('user_phone');
      await AsyncStorage.removeItem('premium_status');
      await AsyncStorage.removeItem('premium_end_date');
      await AsyncStorage.removeItem('premium_days_remaining');
      
      console.log('✅ All user data cleared from AsyncStorage');
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
      phone: userData.phone, // Map phone vào field phone thay vì relative_phone
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
        phone: apiUser.phone || userData.phone, // Lấy phone từ API response
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

// Debug phone check API
export const debugPhoneCheck = async (email: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const response = await apiClient.post('/debug_phone_check.php', {
      email: email.trim()
    });
    console.log('Debug phone check API response:', response.data);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    return { success: false, data: null, message: response.data.message };
  } catch (error: any) {
    console.error('Debug phone check API error:', error);
    return {
      success: false,
      data: null,
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

// Delete notifications API
export const deleteNotifications = async (userPhone: string, notificationIds: number[]): Promise<{ success: boolean; deletedCount?: number; message?: string }> => {
  try {
    console.log('🔄 deleteNotifications - Deleting notifications:', { userPhone, notificationIds });
    const response = await apiClient.post('/delete_noti.php', {
      user_phone: userPhone.trim(),
      notification_ids: notificationIds
    });
    console.log('🗑️ deleteNotifications API response:', response.data);
    if (response.data.success) {
      return {
        success: true,
        deletedCount: response.data.data?.deletedCount || 0,
        message: response.data.message
      };
    }
    return { success: false, message: response.data.message };
  } catch (error: any) {
    console.error('❌ deleteNotifications API error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
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
        phone: response.data.data?.phone,
        userName: response.data.data?.userName,
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

// Get friends list API
export const getFriendsList = async (userPhone: string): Promise<{ success: boolean; friends?: any[]; total?: number; message?: string }> => {
  try {
    console.log('🔄 getFriendsList - Sending request:', { userPhone });
    const response = await apiClient.post('/get_friends.php', {
      user_phone: userPhone.trim()
    });
    
    console.log('✅ getFriendsList API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
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
            friends: [],
            total: 0,
            message: 'Invalid response format from server'
          };
        }
      }
    }

    if (responseData.success) {
      console.log('✅ getFriendsList - Success response data:', responseData.data);
      return {
        success: true,
        friends: responseData.data.friends || [],
        total: responseData.data.total || 0,
        message: responseData.message
      };
    } else {
      console.log('❌ getFriendsList - API returned success=false:', responseData.message);
      return {
        success: false,
        friends: [],
        total: 0,
        message: responseData.message || 'Không thể lấy danh sách bạn bè'
      };
    }
  } catch (error: any) {
    console.error('❌ getFriendsList API - Detailed error:', {
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
      friends: [],
      total: 0,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Debug conversations API
export const debugConversations = async (userPhone: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    console.log('🔄 debugConversations - Sending request:', { userPhone });
    const response = await apiClient.post('/debug_conversations.php', {
      user_phone: userPhone.trim()
    });
    
    console.log('✅ debugConversations API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    if (response.data.success) {
      console.log('✅ debugConversations - Success response data:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      console.log('❌ debugConversations - API returned success=false:', response.data.message);
      return {
        success: false,
        data: null,
        message: response.data.message || 'Không thể debug conversations'
      };
    }
  } catch (error: any) {
    console.error('❌ debugConversations API - Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return {
      success: false,
      data: null,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Get conversations list API
export const getConversationsList = async (userPhone: string): Promise<{ success: boolean; conversations?: any[]; total?: number; message?: string }> => {
  try {
    console.log('🔄 getConversationsList - Sending request:', { userPhone });
    const response = await apiClient.post('/get_conversations.php', {
      user_phone: userPhone.trim()
    });
    
    console.log('✅ getConversationsList API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
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
            conversations: [],
            total: 0,
            message: 'Invalid response format from server'
          };
        }
      }
    }

    if (responseData.success) {
      console.log('✅ getConversationsList - Success response data:', responseData.data);
      return {
        success: true,
        conversations: responseData.data.conversations || [],
        total: responseData.data.total || 0,
        message: responseData.message
      };
    } else {
      console.log('❌ getConversationsList - API returned success=false:', responseData.message);
      return {
        success: false,
        conversations: [],
        total: 0,
        message: responseData.message || 'Không thể lấy danh sách cuộc trò chuyện'
      };
    }
  } catch (error: any) {
    console.error('❌ getConversationsList API - Detailed error:', {
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
      conversations: [],
      total: 0,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Send message API
export const sendMessage = async (conversationId: string, senderPhone: string, receiverPhone: string, messageText: string): Promise<{ success: boolean; messageId?: number; data?: any; message?: string }> => {
  try {
    console.log('🔄 sendMessage - Sending request:', { conversationId, senderPhone, receiverPhone, messageText });
    
    // Log request details
    const requestData = {
      sender_phone: senderPhone.trim(),
      receiver_phone: receiverPhone.trim(),
      message_text: messageText.trim()
    };
    console.log('🔍 sendMessage - Request data:', requestData);
    console.log('🔍 sendMessage - Request URL:', apiClient.defaults.baseURL + 'send_message_complete.php');
    
    const response = await apiClient.post('/send_message_complete.php', requestData);
    
    console.log('✅ sendMessage API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    console.log('🔍 sendMessage - Full response data:', response.data);
    
    if (response.data.success) {
      console.log('✅ sendMessage - Success response data:', response.data.data);
      return {
        success: true,
        messageId: response.data.data?.message_id,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      console.log('❌ sendMessage - API returned success=false:', response.data);
      return {
        success: false,
        message: response.data.message || response.data.error?.message || 'Không thể gửi tin nhắn'
      };
    }
  } catch (error: any) {
    console.error('❌ sendMessage API - Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Log response headers và body chi tiết
    if (error.response) {
      console.log('🔍 sendMessage API - Response headers:', error.response.headers);
      console.log('🔍 sendMessage API - Response status:', error.response.status);
      console.log('🔍 sendMessage API - Response statusText:', error.response.statusText);
      console.log('🔍 sendMessage API - Response data:', error.response.data);
      console.log('🔍 sendMessage API - Response data type:', typeof error.response.data);
      console.log('🔍 sendMessage API - Response data length:', error.response.data?.length);
      
      // Nếu response.data là string, log chi tiết
      if (typeof error.response.data === 'string') {
        console.log('🔍 sendMessage API - Response data (string):', error.response.data);
        console.log('🔍 sendMessage API - Response data (first 500 chars):', error.response.data.substring(0, 500));
      }
    }
    
    return {
      success: false,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Mark message as read API
export const markMessageAsRead = async (messageId: number, userPhone: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    console.log('🔄 markMessageAsRead - Sending request:', { messageId, userPhone });
    const response = await apiClient.post('/mark_message_read.php', {
      message_id: messageId,
      user_phone: userPhone.trim()
    });
    
    console.log('✅ markMessageAsRead API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    if (response.data.success) {
      console.log('✅ markMessageAsRead - Success response data:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      console.log('❌ markMessageAsRead - API returned success=false:', response.data.message);
      return {
        success: false,
        message: response.data.message || 'Không thể đánh dấu tin nhắn đã đọc'
      };
    }
  } catch (error: any) {
    console.error('❌ markMessageAsRead API - Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return {
      success: false,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Get messages API
export const getMessages = async (conversationId: string, userPhone: string): Promise<{ success: boolean; messages?: any[]; conversation?: any; total?: number; message?: string }> => {
  try {
    console.log('🔄 getMessages - Sending request:', { conversationId, userPhone });
    const response = await apiClient.post('/get_messages.php', {
      conversation_id: conversationId,
      user_phone: userPhone.trim()
    });
    
    console.log('✅ getMessages API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
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
            messages: [],
            total: 0,
            message: 'Invalid response format from server'
          };
        }
      }
    }

    if (responseData.success) {
      console.log('✅ getMessages - Success response data:', responseData.data);
      return {
        success: true,
        messages: responseData.data.messages || [],
        conversation: responseData.data.conversation,
        total: responseData.data.total || 0,
        message: responseData.message
      };
    } else {
      console.log('❌ getMessages - API returned success=false:', responseData.message);
      return {
        success: false,
        messages: [],
        total: 0,
        message: responseData.message || 'Không thể lấy tin nhắn'
      };
    }
  } catch (error: any) {
    console.error('❌ getMessages API - Detailed error:', {
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
      messages: [],
      total: 0,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Lỗi kết nối'
    };
  }
};

// Reminder API functions
export interface Reminder {
  id: string;
  type: 'medicine' | 'exercise' | 'appointment' | 'call' | 'other';
  title: string;
  time: string;
  date: string;
  content: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getReminders = async (email: string): Promise<{ success: boolean; data?: Reminder[]; message?: string }> => {
  try {
    console.log('🔄 getReminders - Sending request:', { email });
    const response = await apiClient.get(`/get_reminders.php?email=${encodeURIComponent(email)}`);
    
    console.log('✅ getReminders API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    if (response.data.success) {
      console.log('✅ getReminders - Success response data:', response.data.data);
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message
      };
    } else {
      console.log('❌ getReminders - API returned success=false:', response.data.message);
      return {
        success: false,
        message: response.data.message || 'Failed to get reminders'
      };
    }
  } catch (error: any) {
    console.error('❌ getReminders API - Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return {
      success: false,
      message: error.response?.data?.message || 'Network error occurred'
    };
  }
};

export const updateReminderStatus = async (
  reminderId: string, 
  status: 'completed' | 'pending', 
  email: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    console.log('🔄 updateReminderStatus - Sending request:', { reminderId, status, email });
    const response = await apiClient.post('/update_reminder_status.php', {
      reminder_id: reminderId,
      status: status,
      email: email
    });
    
    console.log('✅ updateReminderStatus API - Full response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    if (response.data.success) {
      console.log('✅ updateReminderStatus - Success response data:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      console.log('❌ updateReminderStatus - API returned success=false:', response.data.message);
      return {
        success: false,
        message: response.data.message || 'Failed to update reminder status'
      };
    }
  } catch (error: any) {
    console.error('❌ updateReminderStatus API - Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return {
      success: false,
      message: error.response?.data?.message || 'Network error occurred'
    };
  }
};

export default apiClient;
