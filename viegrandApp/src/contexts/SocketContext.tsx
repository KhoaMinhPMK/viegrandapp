import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getUserData, getNotifications, markNotificationsRead } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

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
        const email = await AsyncStorage.getItem('user_email');
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
        console.log('App has come to the foreground, refetching notifications.');
        fetchNotifications();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [fetchNotifications]);

  // Quản lý socket connection
  useEffect(() => {
    console.log('🔄 SocketContext - Socket effect triggered:', { userPhone, hasExistingSocket: !!socketRef.current });
    if (userPhone) {
      if (socketRef.current) {
        console.log('🧹 SocketContext - Disconnecting existing socket');
        socketRef.current.disconnect();
      }

      console.log(`🚀 SocketContext: Connecting for phone ${userPhone}...`);
      const newSocket = io('https://chat.viegrand.site', { forceNew: true, reconnectionAttempts: 5, timeout: 10000 });

      newSocket.on('connect', () => {
        console.log(`✅ SocketContext: Connected with ID ${newSocket.id}. Registering phone...`);
        newSocket.emit('register', userPhone);
      });

      newSocket.on('notification', (newNotification: Notification) => {
        console.log('📧 SocketContext: New notification received via socket:', newNotification);
        // Thêm vào đầu danh sách để hiển thị mới nhất
        setNotifications(prev => {
          console.log('🔄 SocketContext: Adding notification to list. Current count:', prev.length);
          return [newNotification, ...prev];
        });
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log(`🔌 SocketContext: Disconnected. Reason: ${reason}`);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ SocketContext: Connection Error', error);
      });

      socketRef.current = newSocket;
      return () => { 
        console.log('🧹 SocketContext: Cleanup - disconnecting socket');
        newSocket.disconnect(); 
      };
    } else {
      if (socketRef.current) {
        console.log('🔌 SocketContext: No user phone, disconnecting socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
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

  const value = {
    socket: socketRef.current,
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    isLoading,
    markAsRead,
    refetchNotifications: fetchNotifications,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}; 