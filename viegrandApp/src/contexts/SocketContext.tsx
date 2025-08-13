import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getUserData, getNotifications, markNotificationsRead, deleteNotifications, debugPhoneCheck } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import config from '../config/env';

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (ids: number[]) => Promise<void>;
  deleteNotification: (ids: number[]) => Promise<void>;
  removeNotification: (ids: number[]) => void;
  refetchNotifications: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy SĐT của user
  useEffect(() => {
    const fetchUserPhone = async () => {
      console.log('🔄 SocketContext - fetchUserPhone triggered:', { user: user?.email, currentUserPhone: userPhone });
      if (user) {
        if (user.phone) {
          console.log('✅ SocketContext - User phone from context:', user.phone);
          setUserPhone(user.phone);
          return;
        }
        // Sử dụng email từ user context thay vì AsyncStorage
        const email = user.email;
        console.log('🔄 SocketContext - Fetching phone for email:', email);
        if (email) {
          const result = await getUserData(email);
          console.log('🔄 SocketContext - getUserData result:', { success: result.success, phone: result.user?.phone });
          if (result.success && result.user?.phone) {
            console.log('✅ SocketContext - Setting phone from API:', result.user.phone);
            setUserPhone(result.user.phone);
          }
        }
      } else {
        console.log('🔄 SocketContext - No user, clearing phone');
        setUserPhone(null);
      }
    };
    fetchUserPhone();
  }, [user]);

  // Lấy danh sách thông báo từ server
  const fetchNotifications = useCallback(async () => {
    if (!userPhone) {
      console.log('⏭️ SocketContext: Skipping fetch notifications - no userPhone');
      return;
    }
    console.log('🔄 SocketContext: Fetching notifications for phone:', userPhone);
    setIsLoading(true);
    try {
      const result = await getNotifications(userPhone);
      console.log('📋 SocketContext: Fetch notifications result:', { 
        success: result.success, 
        count: result.notifications?.length || 0,
        notifications: result.notifications 
      });
      
      // Debug specific notification types
      if (result.notifications && result.notifications.length > 0) {
        result.notifications.forEach((notif, index) => {
          console.log(`📧 Notification ${index}:`, {
            id: notif.id,
            type: notif.type,
            title: notif.title,
            hasData: !!notif.data,
            dataKeys: notif.data ? Object.keys(notif.data) : []
          });
        });
      }
      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        console.log('✅ SocketContext: Notifications updated in state');
      }
    } catch (error) {
      console.error("❌ SocketContext: Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, [userPhone]);

  // Lấy thông báo lần đầu khi có SĐT
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Xử lý khi app quay lại từ background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App has come to the foreground, refetching notifications and re-registering phone.');
        fetchNotifications();
        // Re-register phone to ensure mapping is fresh
        if (socketRef.current && socketRef.current.connected && userPhone) {
          console.log('🔁 Re-registering phone on foreground:', userPhone);
          socketRef.current.emit('register', userPhone);
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, [fetchNotifications, userPhone]);

  // Nếu socket đã kết nối và userPhone vừa có, đăng ký ngay
  useEffect(() => {
    if (userPhone && socketRef.current && socketRef.current.connected) {
      console.log('🔔 Registering phone due to userPhone change:', userPhone);
      socketRef.current.emit('register', userPhone);
    }
  }, [userPhone]);

  // Quản lý socket connection
  useEffect(() => {
    console.log('🔄 SocketContext - Socket effect triggered:', { userPhone, hasExistingSocket: !!socketRef.current });
    if (userPhone) {
      if (socketRef.current) {
        console.log('🧹 SocketContext - Disconnecting existing socket');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketState(null);
      }

      console.log(`🚀 SocketContext: Connecting for phone ${userPhone}...`);
      const socketUrl = config.API_BASE_URL || 'https://chat.viegrand.site';
      const newSocket = io(socketUrl, {
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5, // Giảm số lần thử reconnect
        reconnectionDelay: 2000, // Tăng delay giữa các lần thử
        reconnectionDelayMax: 10000, // Tăng max delay
        timeout: 30000, // Tăng timeout
        transports: ['websocket'],
        path: '/socket.io',
        withCredentials: true,
        auth: { phone: userPhone },
      });

      newSocket.on('connect', () => {
        console.log(`✅ SocketContext: Connected with ID ${newSocket.id}. Registering phone...`);
        newSocket.emit('register', userPhone);
      });

      // Re-register on reconnect and keep state in sync
      newSocket.on('reconnect', (attempt) => {
        console.log(`🔁 SocketContext: Reconnected after ${attempt} attempts. Re-registering phone...`);
        if (userPhone) newSocket.emit('register', userPhone);
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log(`🔌 SocketContext: Disconnected. Reason: ${reason}`);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ SocketContext: Connection Error', {
          message: error?.message,
          name: error?.name,
          description: (error as any)?.description,
          context: (error as any)?.context,
        });
        
        // Nếu server không khả dụng, tạm thời dừng reconnection
        if (error?.message?.includes('503') || error?.message?.includes('Service Unavailable')) {
          console.log('🚫 SocketContext: Server unavailable (503), stopping reconnection attempts');
          newSocket.disconnect();
        }
      });

      // Xử lý lỗi reconnection failed
      newSocket.on('reconnect_failed', () => {
        console.error('❌ SocketContext: All reconnection attempts failed. Chat functionality may be limited.');
      });

      newSocket.on('notification', (newNotification: Notification) => {
        console.log('📧 SocketContext: New notification received via socket:', newNotification);
        setNotifications(prev => [newNotification, ...prev]);
      });

      socketRef.current = newSocket;
      setSocketState(newSocket);

      return () => { 
        console.log('🧹 SocketContext: Cleanup - disconnecting socket');
        newSocket.disconnect(); 
        socketRef.current = null;
        setSocketState(null);
      };
    } else {
      if (socketRef.current) {
        console.log('🔌 SocketContext: No user phone, disconnecting socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketState(null);
    }
  }, [userPhone]);

  // Hàm để đánh dấu đã đọc
  const markAsRead = useCallback(async (ids: number[]) => {
    if (!userPhone || ids.length === 0) return;

    // Cập nhật UI ngay lập tức để có trải nghiệm tốt hơn
    setNotifications(prev => 
      prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n)
    );
    
    try {
      await markNotificationsRead(userPhone, ids);
      // Có thể fetch lại để đảm bảo dữ liệu đồng bộ, nhưng không bắt buộc
      // fetchNotifications(); 
    } catch (error) {
      console.error("SocketContext: Failed to mark notifications as read", error);
      // Rollback UI nếu API thất bại
      setNotifications(prev => 
        prev.map(n => ids.includes(n.id) ? { ...n, isRead: false } : n)
      );
    }
  }, [userPhone]);

  // Hàm để xóa thông báo với API call
  const deleteNotification = useCallback(async (ids: number[]) => {
    if (!userPhone || ids.length === 0) return;

    // Optimistic update - xóa khỏi UI ngay lập tức
    const previousNotifications = notifications;
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    
    try {
      const result = await deleteNotifications(userPhone, ids);
      if (!result.success) {
        // Nếu API thất bại, rollback UI
        setNotifications(previousNotifications);
        console.error("SocketContext: Failed to delete notifications:", result.message);
      }
    } catch (error) {
      console.error("SocketContext: Failed to delete notifications", error);
      // Rollback UI nếu API thất bại
      setNotifications(previousNotifications);
    }
  }, [userPhone, notifications]);

  // Hàm để xóa local (chỉ UI, không gọi API)
  const removeNotification = useCallback((ids: number[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
  }, []);

  const value = {
    socket: socketState,
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    isLoading,
    markAsRead,
    deleteNotification,
    removeNotification,
    refetchNotifications: fetchNotifications,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}; 