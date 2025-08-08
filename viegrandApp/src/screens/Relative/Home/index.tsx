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


import { User, getUserData, getFriendsList } from '../../../services/api';
import { usePremium } from '../../../contexts/PremiumContext';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/elderly-home/Header';
import RelativePremiumCard from '../../../components/relative-home/RelativePremiumCard';
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
  
  // Menu items with clean white background design
  const menuItems = [
    { 
      id: 1, 
      title: 'Theo dõi', 
      subtitle: 'Giám sát sức khỏe',
      icon: 'trending-up', 
      route: 'Monitoring'
    },
    { 
      id: 2, 
      title: 'Báo cáo', 
      subtitle: 'Thống kê chi tiết',
      icon: 'bar-chart', 
      route: 'Reports'
    },
    { 
      id: 3, 
      title: 'Thuốc', 
      subtitle: 'Quản lý thuốc',
      icon: 'package', 
      route: 'Medicine'
    },
    { 
      id: 4, 
      title: 'Liên hệ', 
      subtitle: 'Gọi khẩn cấp',
      icon: 'phone', 
      route: 'Emergency'
    },
    { 
      id: 5, 
      title: 'Cài đặt', 
      subtitle: 'Tùy chỉnh app',
      icon: 'settings', 
      route: 'RelativeSettings'
    },
    { 
      id: 6, 
      title: 'Thông báo', 
      subtitle: 'Xem tất cả',
      icon: 'bell', 
      route: 'Notifications'
    },
    { 
      id: 7, 
      title: 'Tạo nhắc nhở', 
      subtitle: 'Thêm nhắc nhở cho người cao tuổi',
      icon: 'plus-circle', 
      route: 'AddReminder'
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
  const { notifications: socketNotifications, unreadCount, markAsRead } = useSocket();
  
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
      // Call the markAsRead function from SocketContext
      markAsRead(readIds);
    }
  }, [formattedNotifications, markAsRead]);

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
      case 7:
        navigation.navigate('AddReminder');
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
          <RelativePremiumCard 
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
                    <View style={styles.menuItemContent}>
                      <View style={[
                        styles.iconContainer,
                        item.id === 4 && styles.emergencyIconContainer // Special styling for emergency
                      ]}>
                        <Feather 
                          name={item.icon as any} 
                          size={28} 
                          color={item.id === 4 ? "#FF3B30" : "#007AFF"} 
                        />
                      </View>
                      <Text style={[
                        styles.menuItemTitle,
                        item.id === 4 && styles.emergencyTitle // Special styling for emergency
                      ]}>{item.title}</Text>
                      <Text style={[
                        styles.menuItemSubtitle,
                        item.id === 4 && styles.emergencySubtitle // Special styling for emergency
                      ]}>{item.subtitle}</Text>
                    </View>
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
    gap: 8, // Reduced gap for minimalist feel
  },
  menuItemContainer: {
    width: (width - 56) / 2, // Slightly wider
    marginBottom: 8, // Reduced margin
  },
  menuItem: {
    borderRadius: 20, // Increased for more modern look
    overflow: 'hidden',
    elevation: 2, // Reduced shadow for subtlety
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, // Much more subtle
    shadowRadius: 3,
    backgroundColor: '#FFFFFF', // White background
    borderWidth: 0.5,
    borderColor: 'rgba(0, 122, 255, 0.1)',
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 18, // Moved padding here
    minHeight: 110, // Moved height here
  },
  iconContainer: {
    width: 44, // Slightly smaller
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.1)', // Light blue background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12, // Increased spacing
  },
  emergencyIconContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // Light red background for emergency
  },
  menuItemTitle: {
    fontSize: 15, // Slightly smaller for elegance
    fontWeight: '600', // Less bold for sophistication
    color: '#007AFF', // Blue text color
    marginBottom: 3,
    letterSpacing: 0.3, // Added letter spacing
  },
  emergencyTitle: {
    color: '#FF3B30', // Red text for emergency
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: 'rgba(0, 122, 255, 0.7)', // Blue subtitle
    fontWeight: '400', // Lighter weight
    letterSpacing: 0.2,
  },
  emergencySubtitle: {
    color: 'rgba(255, 59, 48, 0.7)', // Red subtitle for emergency
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
