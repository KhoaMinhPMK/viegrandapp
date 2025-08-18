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
  
  // Menu items with enhanced design and blue theme
  const menuItems = [
    { 
      id: 1, 
      title: 'Theo dõi', 
      subtitle: 'Giám sát sức khỏe',
      icon: 'trending-up', 
      route: 'Monitoring',
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      iconBg: 'rgba(30, 64, 175, 0.12)',
      gradientColors: ['#1E40AF', '#3B82F6']
    },
    { 
      id: 2, 
      title: 'Báo cáo', 
      subtitle: 'Thống kê chi tiết',
      icon: 'bar-chart', 
      route: 'Reports',
      primaryColor: '#1E3A8A',
      secondaryColor: '#2563EB',
      iconBg: 'rgba(30, 58, 138, 0.12)',
      gradientColors: ['#1E40AF', '#3B82F6']

    },
    { 
      id: 3, 
      title: 'Thuốc', 
      subtitle: 'Quản lý thuốc',
      icon: 'package', 
      route: 'Medicine',
      primaryColor: '#059669',
      secondaryColor: '#10B981',
      iconBg: 'rgba(5, 150, 105, 0.12)',
      gradientColors: ['#1E40AF', '#3B82F6']

    },
    { 
      id: 4, 
      title: 'Tạo nhắc nhở', 
      subtitle: 'Thêm nhắc nhở cho người cao tuổi',
      icon: 'plus-circle', 
      route: 'AddReminder',
      primaryColor: '#DC2626',
      secondaryColor: '#EF4444',
      iconBg: 'rgba(220, 38, 38, 0.12)',
      gradientColors: ['#1E40AF', '#3B82F6']

    },
  ];
  
  // Animation states for menu items - REMOVED
  // const fadeAnim = useRef(menuItems.map(() => new Animated.Value(0))).current;
  // const scaleAnim = useRef(menuItems.map(() => new Animated.Value(1))).current;
  
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

  // Enhanced animation for menu items - REMOVED
  // useEffect(() => {
  //   const animations = menuItems.map((_, index) => {
  //     return Animated.parallel([
  //       Animated.timing(fadeAnim[index], {
  //         toValue: 1,
  //         duration: 500,
  //         delay: index * 150,
  //         useNativeDriver: true,
  //       }),
  //       Animated.spring(scaleAnim[index], {
  //         toValue: 1,
  //         tension: 60,
  //         friction: 8,
  //         delay: index * 150,
  //         useNativeDriver: true,
  //       })
  //     ]);
  //   });
  //   
  //   Animated.stagger(100, animations).start();
  // }, []);

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

  const handleMenuPress = (item: any, index: number) => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      // iOS haptic feedback would go here
    }
    
    // Animate button press - REMOVED
    // Animated.sequence([
    //   Animated.timing(scaleAnim[index], {
    //     toValue: 0.95,
    //     duration: 100,
    //     useNativeDriver: true,
    //   }),
    //   Animated.timing(scaleAnim[index], {
    //     toValue: 1,
    //     duration: 100,
    //     useNativeDriver: true,
    //   }),
    // ]).start();
    
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
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItemContainer}
                  onPress={() => handleMenuPress(item, index)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={item.gradientColors}
                    style={styles.menuItemGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={styles.iconContainer}>
                        <View style={[styles.iconBackground, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                          <Feather 
                            name={item.icon as any} 
                            size={24} 
                            color="#FFFFFF"
                          />
                        </View>
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.menuItemTitle}>
                          {item.title}
                        </Text>
                        <Text style={styles.menuItemSubtitle}>
                          {item.subtitle}
                        </Text>
                      </View>
                      <View style={styles.arrowContainer}>
                        <Feather 
                          name="chevron-right" 
                          size={18} 
                          color="#FFFFFF"
                          style={{ opacity: 0.8 }}
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
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
    paddingBottom: 100,

  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    // marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D4C92',
    marginBottom: 20,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 32,
    marginTop: 8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  menuItemContainer: {
    width: (width - 48) / 2, // Ensure equal width for all buttons
    height: 160 , // Fixed height for consistency
    marginBottom: 16,
  },
  menuItemGradient: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  menuItemContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginBottom: 12,
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginBottom: 8,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 16,
    opacity: 0.9,
    color: '#FFFFFF',
  },
  arrowContainer: {
    alignSelf: 'flex-end',
  },
});

export default RelativeHomeScreen;
