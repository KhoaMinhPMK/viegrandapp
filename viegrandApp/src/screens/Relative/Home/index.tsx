import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  Alert,
  Image,
  Animated,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import { User, getUserData, getFriendsList } from '../../../services/api';
import { usePremium } from '../../../contexts/PremiumContext';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/elderly-home/Header';
import PremiumUpgradeCard from '../../../components/elderly-home/PremiumUpgradeCard';
import WeatherCard from '../../../components/elderly-home/WeatherCard';

// Import Notification type from SocketContext to avoid conflict
type Notification = {
  id: number;
  type: string;
  title: string;
  body: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

const { width } = Dimensions.get('window');

const RelativeHomeScreen = ({ navigation }: any) => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Menu items with new design
  const menuItems = [
    { 
      id: 1, 
      title: 'Theo dõi', 
      subtitle: 'Giám sát sức khỏe',
      icon: 'activity', 
      gradient: ['#FF6B6B', '#FF8E8E'],
      route: 'Monitoring'
    },
    { 
      id: 2, 
      title: 'Báo cáo', 
      subtitle: 'Thống kê chi tiết',
      icon: 'bar-chart-2', 
      gradient: ['#4ECDC4', '#6EE7DF'],
      route: 'Reports'
    },
    { 
      id: 3, 
      title: 'Thuốc', 
      subtitle: 'Quản lý thuốc',
      icon: 'pill', 
      gradient: ['#45B7D1', '#67C9E3'],
      route: 'Medicine'
    },
    { 
      id: 4, 
      title: 'Liên hệ', 
      subtitle: 'Gọi khẩn cấp',
      icon: 'phone', 
      gradient: ['#96CEB4', '#B8E6C8'],
      route: 'Emergency'
    },
    { 
      id: 5, 
      title: 'Cài đặt', 
      subtitle: 'Tùy chỉnh app',
      icon: 'settings', 
      gradient: ['#FFEAA7', '#FFF2C7'],
      route: 'RelativeSettings'
    },
    { 
      id: 6, 
      title: 'Thông báo', 
      subtitle: 'Xem tất cả',
      icon: 'bell', 
      gradient: ['#DDA0DD', '#E8B5E8'],
      route: 'Notifications'
    },
  ];
  
  // Animation states for menu items
  const fadeAnim = useRef(menuItems.map(() => new Animated.Value(0))).current;
  
  // Premium Context - with error handling
  let premiumStatus = null;
  let fetchPremiumStatus = () => {};
  
  // Local premium state
  const [isPremium, setIsPremium] = useState(false);
  const [premiumDaysRemaining, setPremiumDaysRemaining] = useState<number | null>(null);
  
  try {
    const premiumContext = usePremium();
    premiumStatus = premiumContext.premiumStatus;
    fetchPremiumStatus = premiumContext.fetchPremiumStatus;
  } catch (error) {
    console.log('Premium context not available yet:', error);
  }

  // Socket Context for notifications
  const { notifications: socketNotifications, unreadCount } = useSocket();
  
  // Convert notifications to match NotificationDropdown format
  const notifications = socketNotifications.map(notif => ({
    id: notif.id,
    title: notif.title,
    message: notif.body,
    time: notif.createdAt,
    read: notif.isRead,
    type: notif.type,
    data: notif.data,
    createdAt: notif.createdAt,
  }));

  useEffect(() => {
    loadUserProfile();
    fetchPremiumStatus();
  }, []);

  // Load premium data from cache on mount
  useEffect(() => {
    const loadPremiumDataFromCache = async () => {
      try {
        const cachedPremiumStatus = await AsyncStorage.getItem('premium_status');
        const cachedPremiumEndDate = await AsyncStorage.getItem('premium_end_date');
        const cachedDaysRemaining = await AsyncStorage.getItem('premium_days_remaining');
        
        console.log('Cached premium data:', {
          status: cachedPremiumStatus,
          endDate: cachedPremiumEndDate,
          daysRemaining: cachedDaysRemaining
        });
        
        if (cachedPremiumStatus && cachedPremiumEndDate) {
          const isPremiumCached = JSON.parse(cachedPremiumStatus);
          const endDate = new Date(cachedPremiumEndDate);
          const currentDate = new Date();
          const timeDiff = endDate.getTime() - currentDate.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          if (daysLeft > 0) {
            setIsPremium(isPremiumCached);
            setPremiumDaysRemaining(daysLeft);
          } else {
            setIsPremium(false);
            setPremiumDaysRemaining(0);
          }
        }
      } catch (error) {
        console.log('Error loading premium data from cache:', error);
      }
    };
    
    loadPremiumDataFromCache();
  }, []);

  // Animation for menu items
  useEffect(() => {
    const animations = menuItems.map((_, index) => {
      return Animated.timing(fadeAnim[index], {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      });
    });
    
    Animated.stagger(100, animations).start();
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('Loading user profile from API...');
      setLoading(true);
      
      // Lấy email từ AsyncStorage
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (!userEmail) {
        console.log('No email found in cache');
        setLoading(false);
        return;
      }

      console.log('Fetching user data for email:', userEmail);
      
      // Gọi API get user data
      const result = await getUserData(userEmail);
      
      if (result.success && result.user) {
        console.log('User profile loaded from API:', result.user);
        
        // Map API response to User interface
        const mappedUser: User = {
          id: result.user.userId,
          fullName: result.user.userName,
          email: result.user.email,
          phone: result.user.phone,
          role: 'relative', // Default role for relative screen
          active: true,
          age: result.user.age,
          address: result.user.home_address,
          gender: result.user.gender,
          bloodType: result.user.blood,
          allergies: result.user.allergies,
          chronicDiseases: result.user.chronic_diseases,
        };
        
        console.log('Mapped user data:', mappedUser);
        setUserProfile(mappedUser);
        
        // Update premium status from API data
        const premiumStatusFromAPI = result.user.premium_status;
        const premiumEndDateFromAPI = result.user.premium_end_date;
        
        console.log('Premium data from API:', {
          status: premiumStatusFromAPI,
          endDate: premiumEndDateFromAPI
        });
        
        // Calculate days remaining and set premium status
        let daysRemaining = null;
        let shouldBePremium = false;
        
        if (premiumStatusFromAPI && premiumEndDateFromAPI) {
          const endDate = new Date(premiumEndDateFromAPI);
          const currentDate = new Date();
          const timeDiff = endDate.getTime() - currentDate.getTime();
          daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          // If expired, set premium = false
          if (daysRemaining <= 0) {
            daysRemaining = 0;
            shouldBePremium = false;
          } else {
            shouldBePremium = true;
          }
        } else {
          shouldBePremium = false;
        }
        
        console.log('Premium status calculation:', {
          shouldBePremium,
          daysRemaining,
          originalStatus: premiumStatusFromAPI
        });
        
        // Update local premium state
        setIsPremium(shouldBePremium);
        setPremiumDaysRemaining(daysRemaining);
        
        // Save to cache
        await AsyncStorage.setItem('premium_status', JSON.stringify(shouldBePremium));
        await AsyncStorage.setItem('premium_end_date', JSON.stringify(premiumEndDateFromAPI));
        await AsyncStorage.setItem('premium_days_remaining', JSON.stringify(daysRemaining));
        
        console.log('Premium state updated:', {
          isPremium: shouldBePremium,
          daysRemaining,
          savedToCache: true
        });
        
        // Update premium context if available
        if (fetchPremiumStatus) {
          try {
            await fetchPremiumStatus();
          } catch (error) {
            console.log('Error updating premium context:', error);
          }
        }
        

      } else {
        console.error('Failed to load user profile:', result.message);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };



  const { user } = useAuth();
  
  // Convert SocketContext notifications to Header format
  const formattedNotifications = socketNotifications.map(notif => ({
    id: notif.id,
    title: notif.title,
    message: notif.body,
    time: new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    read: notif.isRead,
    type: notif.type,
    data: notif.data,
    createdAt: notif.createdAt
  }));

  // Use useCallback to memoize the function, preventing re-renders of the Header
  const handleNotificationsUpdate = useCallback((newNotifications: any) => {
    // Handle marking notifications as read
    const readIds = newNotifications
      .filter((notif: any, index: number) => notif.read && !formattedNotifications[index]?.read)
      .map((notif: any) => notif.id);
    
    if (readIds.length > 0) {
      // Handle mark as read
    }
  }, [formattedNotifications]);

  // Callback to refresh conversations list
  const handleConversationsRefresh = useCallback(() => {
    console.log('🔄 RelativeHomeScreen: Conversations refresh requested from notification');
    // Navigate to Message screen to trigger refresh
    (navigation as any).navigate('Message', { screen: 'MessageList' });
  }, [navigation]);





  const handleMenuPress = (item: any) => {
    // Haptic feedback (if available)
    if (Platform.OS === 'ios') {
      // iOS haptic feedback would go here
    }
    
    // Navigation based on route
    switch (item.id) {
      case 1:
        navigation.navigate('Monitoring');
        break;
      case 2:
        navigation.navigate('Reports');
        break;
      case 3:
        navigation.navigate('Medicine');
        break;
      case 4:
        navigation.navigate('Emergency');
        break;
      case 5:
        navigation.navigate('RelativeSettings');
        break;
      case 6:
        navigation.navigate('Notifications');
        break;
      default:
        console.log('Menu item pressed:', item.title);
        break;
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/background.png')}
      style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        {/* Header component giống trang người cao tuổi */}
        <Header 
          user={user}
          isPremium={isPremium}
          notifications={formattedNotifications}
          unreadNotificationCount={unreadCount}
          onNotificationsUpdate={handleNotificationsUpdate}
          onConversationsRefresh={handleConversationsRefresh}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Weather Card */}
          <WeatherCard isPremium={isPremium} />
          
          {/* Premium Upgrade Card */}
          <PremiumUpgradeCard 
            isPremium={isPremium} 
            daysRemaining={premiumDaysRemaining || undefined}
          />

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            <View style={styles.menuGrid}>
              {menuItems.map((item, index) => (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.menuItemContainer,
                    { opacity: fadeAnim[index] }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleMenuPress(item)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={item.gradient}
                      style={styles.menuItemGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.menuItemContent}>
                        <View style={styles.iconContainer}>
                          <Feather name={item.icon as any} size={28} color="#FFFFFF" />
                        </View>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={styles.notifications}>
            <Text style={styles.sectionTitle}>Thông báo gần đây</Text>
            <View style={styles.notificationCard}>
              <View style={styles.notificationItem}>
                <Feather name="alert-circle" size={20} color="#FF6B6B" />
                <Text style={styles.notificationText}>
                  Bà Trần Thị B chưa uống thuốc huyết áp buổi sáng
                </Text>
              </View>
              <View style={styles.notificationItem}>
                <Feather name="check-circle" size={20} color="#4ECDC4" />
                <Text style={styles.notificationText}>
                  Ông Nguyễn Văn A đã hoàn thành bài tập thể dục
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D4C92',
    marginBottom: 15,
  },
  quickActions: {
    marginBottom: 30,
    marginHorizontal: 10,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuItemContainer: {
    width: (width - 60) / 2,
    marginBottom: 12,
  },
  menuItem: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItemGradient: {
    padding: 16,
    minHeight: 120,
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  notifications: {
    marginBottom: 30,
    marginHorizontal: 10,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 10,
    flex: 1,
  },
});

export default RelativeHomeScreen;
