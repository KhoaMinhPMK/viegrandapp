import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Image,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { usersAPI, User } from '../../../services/api';
import { usePremium, useIsPremium } from '../../../contexts/PremiumContext';

// Import asset utilities
import { BackgroundImages, getWeatherIcon } from '../../../utils/assetUtils';
import { useVoice } from '../../../contexts/VoiceContext';
import { BlurView } from '@react-native-community/blur';
import NotificationDropdown from '../../../components/NotificationDropdown';

const { width, height } = Dimensions.get('window');

const ElderlyHomeScreen = ({ navigation }: any) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [showForecast, setShowForecast] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Premium Context - with error handling
  let premiumStatus = null;
  let isPremium = false;
  let fetchPremiumStatus = () => {};
  
  try {
    const premiumContext = usePremium();
    premiumStatus = premiumContext.premiumStatus;
    fetchPremiumStatus = premiumContext.fetchPremiumStatus;
    isPremium = useIsPremium();
  } catch (error) {
    console.log('Premium context not available yet:', error);
  }

  useEffect(() => {
    loadUserProfile();
    fetchPremiumStatus();
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('Loading user profile...');
      
      // Kiểm tra token trước
      const token = await AsyncStorage.getItem('access_token');
      const savedUser = await AsyncStorage.getItem('user');
      console.log('Token exists:', !!token);
      console.log('Saved user:', savedUser);
      
      if (token) {
        // Nếu có token, thử API /users/me
        try {
          const profile = await usersAPI.getProfile();
          console.log('Authenticated user profile loaded:', profile);
          setUserProfile(profile);
          return;
        } catch (authError) {
          console.log('Auth failed, trying alternative...');
        }
      }
      
      // Fallback: lấy thông tin user mẫu từ database
      const profile = await usersAPI.getProfileById(1);
      console.log('Sample user profile loaded:', profile);
      setUserProfile(profile);
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Last fallback to test API
      try {
        const testProfile = await usersAPI.getTest();
        console.log('Test profile loaded (final fallback):', testProfile);
        setUserProfile(testProfile);
      } catch (testError) {
        console.error('Error loading test profile:', testError);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const {
    isListening,
    startListening,
    stopListening,
    results,
    error,
    clearResults,
  } = useVoice();

  const [showTranscript, setShowTranscript] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  
  // Thêm state cho dropdown thông báo
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, right: 0 });
  const notificationButtonRef = useRef<View>(null);

  // Thêm state cho notifications và đánh dấu đã đọc
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nhắc nhở uống thuốc', message: 'Đã đến giờ uống thuốc huyết áp', time: '10:30', read: false },
    { id: 2, title: 'Lịch khám bệnh', message: 'Bạn có lịch khám tim mạch vào ngày mai', time: '09:00', read: false },
    { id: 3, title: 'Cập nhật sức khỏe', message: 'Hãy cập nhật chỉ số huyết áp hôm nay', time: '08:00', read: false },
  ]);

  useEffect(() => {
    if (isListening) {
      setShowTranscript(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (!isListening && results.length === 0) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setShowTranscript(false);
      });
    }
  }, [isListening, results]);

  useEffect(() => {
    if (results.length > 0) {
      setShowTranscript(true);
    } else if (!isListening) {
      setShowTranscript(false);
    }
  }, [results]);

  // Mock data - được thay thế bằng Premium Context
  const userInfo = {
    fullName: userProfile?.name || 'Đang tải...',
    isActive: isPremium,
    premiumStatus: premiumStatus,
  };

  // Fetch weather data
  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const API_KEY = 'e88c3624f6ac265634567a3ff20c41e3';
      const city = 'Ho Chi Minh City';
      
      // Current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=vi`
      );
      const currentData = await currentResponse.json();
      
      // Check if API returned valid data
      if (currentData.cod === 200) {
        setWeatherData(currentData);
      } else {
        console.error('Weather API error:', currentData.message);
        return;
      }

      // 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=vi`
      );
      const forecastResult = await forecastResponse.json();
      
      // Check if forecast API returned valid data
      if (forecastResult.cod === '200' && forecastResult.list && Array.isArray(forecastResult.list)) {
        // Get daily forecast (one per day) - only 3 days
        const dailyForecast = forecastResult.list.filter((item: any, index: number) => index % 8 === 0).slice(0, 3);
        setForecastData(dailyForecast);
      } else {
        console.error('Forecast API error:', forecastResult.message);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  // Hàm tạo avatar từ tên
  const getAvatarText = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const handleProcessVoice = () => {
    if (results.length > 0) {
      const command = results[0];
      console.log('Lệnh thoại đã nhận:', command);
      if (command.toLowerCase().includes('cài đặt')) {
        // Navigate to settings, assuming it exists
        // navigation.navigate('ElderlySettings');
      }
    }
    clearResults();
    Animated.timing(animation, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowTranscript(false);
    });
  };

  const handleCancelVoice = () => {
    stopListening();
    clearResults();
    Animated.timing(animation, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowTranscript(false);
    });
  };

  // Thêm các hàm xử lý thông báo
  const handleToggleNotifications = () => {
    if (notificationButtonRef.current) {
      notificationButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setNotificationPosition({
          top: pageY + height,
          right: 20,
        });
        setShowNotifications(!showNotifications);
      });
    }
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
  };

  const handlePressNotification = (notification: any) => {
    // Đánh dấu thông báo đã đọc
    const updatedNotifications = notifications.map(item =>
      item.id === notification.id ? { ...item, read: true } : item
    );
    setNotifications(updatedNotifications);
    
    // Xử lý khi nhấn vào thông báo (ví dụ: chuyển đến màn hình chi tiết)
    console.log('Pressed notification:', notification);
    
    // Đóng dropdown
    setShowNotifications(false);
  };

  // Thêm hàm để chuyển đến màn hình thông báo đầy đủ
  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigation.navigate('Notifications', { notifications });
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const animatedStyle = {
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0],
        }),
      },
    ],
  };

  const premiumWeatherGradient = ['#007AFF', '#5856D6'];
  const normalWeatherGradient = ['#6c757d', '#343a40'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image */}
      <Image 
        source={BackgroundImages.secondary} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={[
              styles.avatarContainer,
              userInfo.isActive ? styles.premiumAvatar : styles.normalAvatar
            ]}>
              {userInfo.isActive ? (
                <LinearGradient
                  colors={['#007AFF', '#5856D6']}
                  style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>
                    {getAvatarText(userInfo.fullName)}
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={styles.avatarTextNormal}>
                  {getAvatarText(userInfo.fullName)}
                </Text>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userInfo.fullName}</Text>
              <View style={styles.statusContainer}>
                {userInfo.isActive ? (
                  <LinearGradient
                    colors={['#007AFF', '#5856D6']}
                    style={styles.premiumBadge}>
                    <Feather 
                      name="award" 
                      size={14} 
                      color="#FFFFFF" 
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={styles.premiumText}>
                      Premium
                    </Text>
                  </LinearGradient>
                ) : (
                  <TouchableOpacity 
                    style={styles.upgradeBadge}
                    onPress={() => navigation.navigate('Premium')}
                  >
                    <Feather 
                      name="award" 
                      size={14} 
                      color="#007AFF" 
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={styles.upgradeText}>
                      Nâng cấp Premium
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity
            ref={notificationButtonRef}
            style={styles.notificationButton}
            onPress={handleToggleNotifications}>
            <Feather name="bell" size={24} color="#007AFF" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weather Widget */}
        <TouchableOpacity 
          style={styles.weatherContainer}
          onPress={() => setShowForecast(!showForecast)}>
            {weatherData && (
              <View style={styles.weatherContent}>
                {/* Current Weather - Full Width */}
                <View style={styles.currentWeatherSection}>
                  <View style={styles.weatherMainContainer}>
                    <View style={styles.weatherShapeContainer}>
                      {/* SVG Trapezoid Shape */}
                      <Svg width="100%" height="100%" viewBox="0 0 342 175" style={styles.trapezoidSvg}>
                        <Defs>
                          <SvgLinearGradient id="weatherGradient" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor={userInfo.isActive ? '#007AFF' : '#6c757d'} />
                            <Stop offset="1" stopColor={userInfo.isActive ? '#5856D6' : '#343a40'} />
                          </SvgLinearGradient>
                        </Defs>
                        <Path
                          d="M0 66.4396C0 31.6455 0 14.2484 11.326 5.24044C22.6519 -3.76754 39.6026 0.147978 73.5041 7.97901L307.903 62.1238C324.259 65.9018 332.436 67.7909 337.218 73.8031C342 79.8154 342 88.2086 342 104.995V131C342 151.742 342 162.113 335.556 168.556C329.113 175 318.742 175 298 175H44C23.2582 175 12.8873 175 6.44365 168.556C0 162.113 0 151.742 0 131V66.4396Z"
                          fill="url(#weatherGradient)"
                        />
                      </Svg>
                      
                      {/* Content overlay */}
                      <View style={styles.weatherShapeContent}>
                        <View style={styles.leftSection}>
                          <Text style={styles.temperature}>
                            {Math.round(weatherData.main.temp)}°
                          </Text>
                          <View style={styles.locationInfo}>
                            <Text style={styles.tempRange}>
                              H:{Math.round(weatherData.main.temp_max)}° L:{Math.round(weatherData.main.temp_min)}°
                            </Text>
                            <Text style={styles.location}>
                              TP. Hồ Chí Minh
                            </Text>
                          </View>
                        </View>
                        <View style={styles.rightSection}>
                          <Text style={styles.description}>
                            {weatherData.weather[0].description}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* Weather Icon - Floating Layer */}
                    <View style={styles.weatherIconFloating}>
                      <Image 
                        source={getWeatherIcon(weatherData.weather[0].icon)} 
                        style={styles.weatherImage}
                      />
                    </View>
                  </View>
                  
                  {/* Removed Weather Details Row */}
                </View>

                {/* 3-day Forecast - Show on tap */}
                {showForecast && (
                  <View style={styles.forecastSection}>
                    <Text style={styles.forecastTitle}>Dự báo 3 ngày</Text>
                    <View style={styles.forecastVertical}>
                      {forecastData.map((item: any, index: number) => (
                        <View key={index} style={styles.forecastItem}>
                          <Image 
                            source={getWeatherIcon(item.weather[0].icon)} 
                            style={styles.forecastIcon}
                          />
                          <Text style={styles.forecastTemp}>
                            {Math.round(item.main.temp)}°
                          </Text>
                          <Text style={styles.forecastDay} numberOfLines={1}>
                            {index === 0 ? 'Hôm nay' : formatDate(item.dt)}
                          </Text>
                          <Text style={styles.forecastHumidity}>
                            {item.main.humidity}%
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>

        {/* Premium Status Card */}
        {isPremium ? (
          <View style={styles.premiumCard}>
            <LinearGradient
              colors={['#1E3A8A', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumCardGradient}
            >
              <View style={styles.premiumCardOverlay}>
                <View style={styles.premiumCardHeader}>
                  <Feather name="crown" size={18} color="#FFD700" />
                  <Text style={styles.premiumCardTitle}>PREMIUM ACTIVE</Text>
                  <TouchableOpacity 
                    style={styles.premiumCardButton}
                    onPress={() => navigation.navigate('Premium')}
                  >
                    <Text style={styles.premiumCardButtonText}>Quản lý</Text>
                  </TouchableOpacity>
                </View>
                
                {premiumStatus && (
                  <Text style={styles.premiumCardDays}>
                    {premiumStatus.daysRemaining > 0 
                      ? `Còn ${premiumStatus.daysRemaining} ngày` 
                      : 'Đã hết hạn'}
                  </Text>
                )}
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.upgradeCard}>
            <LinearGradient
              colors={['#1E3A8A', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeCardGradient}
            >
              <View style={styles.upgradeCardOverlay}>
                <View style={styles.upgradeCardHeader}>
                  <Feather name="star" size={18} color="#FFD700" />
                  <Text style={styles.upgradeCardTitle}>NÂNG CẤP PREMIUM</Text>
                  <TouchableOpacity 
                    style={styles.upgradeCardButton}
                    onPress={() => navigation.navigate('Premium')}
                  >
                    <Text style={styles.upgradeCardButtonText}>Khám phá</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.upgradeCardSubtitle}>
                  Mở khóa tính năng cao cấp
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Divider Section */}
        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Chức năng</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Function Grid */}
        <View style={styles.functionGrid}>
          {/* Row 1 */}
          <View style={styles.functionRow}>
            <View style={styles.functionItem}>
              <TouchableOpacity style={styles.functionButton}>
                <Feather name="heart" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.functionText}>Sức khỏe</Text>
            </View>
            <View style={styles.functionItem}>
              <TouchableOpacity style={styles.functionButton}>
                <Feather name="phone" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.functionText}>Gọi khẩn cấp</Text>
            </View>
            <View style={styles.functionItem}>
              <TouchableOpacity style={styles.functionButton}>
                <Feather name="calendar" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.functionText}>Lịch khám</Text>
            </View>
          </View>
          
          {/* Row 2 */}
          <View style={styles.functionRow}>
            <View style={styles.functionItem}>
              <TouchableOpacity style={styles.functionButton}>
                <Feather name="users" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.functionText}>Gia đình</Text>
            </View>
            <View style={styles.functionItem}>
              <TouchableOpacity style={styles.functionButton}>
                <Feather name="message-circle" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.functionText}>Tin nhắn</Text>
            </View>
            <View style={styles.functionItem}>
              <TouchableOpacity style={styles.functionButton}>
                <Feather name="settings" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.functionText}>Cài đặt</Text>
            </View>
          </View>
          
          {/* Row 3 */}
          <View style={styles.functionRow}>
            <View style={styles.functionItem}>
              <TouchableOpacity style={styles.functionButton}>
                <Feather name="plus" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.functionText}>Thêm</Text>
            </View>
            <View style={styles.functionItem}>
              <TouchableOpacity style={styles.functionButton}>
                <Feather name="clock" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.functionText}>Sắp có</Text>
            </View>
            <View style={styles.functionItemEmpty} />
          </View>
        </View>
        
        {/* Bottom spacing to prevent content being hidden by bottom bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {showTranscript && (
        <Animated.View style={[styles.transcriptContainer, animatedStyle]}>
          <BlurView
            style={styles.absolute}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          />
          <Text style={styles.transcriptText} numberOfLines={3}>
            {results[0] || 'Đang nghe...'}
          </Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {!isListening && results.length > 0 && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCancelVoice}>
                <Feather name="x" size={24} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.processButton]} onPress={handleProcessVoice}>
                <Feather name="check" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      )}

      {/* Notification Dropdown */}
      <NotificationDropdown
        visible={showNotifications}
        notifications={notifications}
        onClose={handleCloseNotifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onPressNotification={handlePressNotification}
        onViewAll={handleViewAllNotifications}
        position={notificationPosition}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  normalAvatar: {
    backgroundColor: '#F2F2F7',
  },
  premiumAvatar: {
    backgroundColor: 'transparent',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarTextNormal: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  userNameGradient: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  upgradeText: {
    color: '#007AFF',
    fontSize: 11,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666666',
  },
  notificationButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: 10,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  weatherContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 0,
  },
  weatherCard: {
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20, // Add padding here since the parent padding is gone
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  weatherContent: {
    // Removed flex: 1
  },
  currentWeatherSection: {
    // Removed flexDirection: 'row'
  },
  weatherMainContainer: {
    position: 'relative',
    height: 180, // Increased height to accommodate floating icon
    marginBottom: 15,
  },
  weatherShapeContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'visible',
    // SVG trapezoid container
  },
  trapezoidSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  weatherShapeContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    padding: 20,
    zIndex: 1,
  },
  trapezoidMask: {
    // Remove this as we're using SVG now
  },
  weatherShape: {
    // Remove most properties as we're using SVG now
  },
  weatherIconFloating: {
    position: 'absolute',
    right: -10,
    top: -15, // Raised the icon position to avoid covering text
    width: 150,
    height: 150,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
  },
  weatherImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  leftSection: {
    flex: 1,
    justifyContent: 'space-between',
    // Remove counter-skew since we're not using skew anymore
    paddingRight: 10,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    // Remove counter-skew since we're not using skew anymore
  },
  temperature: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationInfo: {
    // Container for H/L and location
  },
  tempRange: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  location: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 15,
    marginHorizontal: 20, // Add padding here
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  forecastSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    marginHorizontal: 20, // Add padding here
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  forecastVertical: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastItem: {
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: (width - 40 - 40 - 20) / 3, // width - padding - gap
  },
  forecastIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  forecastDay: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  forecastHumidity: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  comingSoon: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  // Divider Styles
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6D6D70',
    marginHorizontal: 16,
  },
  // Function Grid Styles
  functionGrid: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  functionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  functionItem: {
    alignItems: 'center',
    width: '30%',
  },
  functionItemEmpty: {
    width: '30%',
  },
  functionButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  functionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Voice Recognition Styles
  transcriptContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  transcriptText: {
    fontSize: 18,
    color: '#000',
    padding: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#D93B3B',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  processButton: {
    backgroundColor: '#007AFF', // iOS blue
  },
  // Premium Card Styles
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  premiumCardGradient: {
    position: 'relative',
  },
  premiumCardOverlay: {
    padding: 16,
    position: 'relative',
  },
  premiumCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  premiumCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  premiumCardDays: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  premiumCardButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  premiumCardButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  
  // Upgrade Card Styles
  upgradeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  upgradeCardGradient: {
    position: 'relative',
  },
  upgradeCardOverlay: {
    padding: 16,
    position: 'relative',
  },
  upgradeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  upgradeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  upgradeCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  upgradeCardButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  upgradeCardButtonText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Bottom spacing
  bottomSpacing: {
    height: 100,
  },
});

export default ElderlyHomeScreen;
