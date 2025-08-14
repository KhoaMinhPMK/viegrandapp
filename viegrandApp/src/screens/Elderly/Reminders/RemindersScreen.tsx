import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReminders, updateReminderStatus, Reminder } from '../../../services/api';
import ReminderItem from './ReminderItem';
import ReminderStatus from './ReminderStatus';

const { width, height } = Dimensions.get('window');

const RemindersScreen = () => {
  const navigation = useNavigation<any>();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPrivateKey, setUserPrivateKey] = useState<string>('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [headerAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const scrollY = useRef(new Animated.Value(0)).current;

  // Load user email from storage
  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error loading user email:', error);
      }
    };
    loadUserEmail();
  }, []);

  // Load user private key from storage
  useEffect(() => {
    const loadUserPrivateKey = async () => {
      try {
        console.log('🔍 Starting to load user private key...');
        const userData = await AsyncStorage.getItem('user');
        console.log('📦 Raw userData from AsyncStorage:', userData);
        
        if (userData) {
          const user = JSON.parse(userData);
          console.log('👤 Parsed user object:', user);
          console.log('🔍 Available keys in user object:', Object.keys(user));
          
          const privateKey = user.privateKey || user.private_key || '';
          console.log('🔑 User data loaded:', {
            email: user.email,
            privateKey: privateKey,
            privateKeyLength: privateKey.length,
            userData: user
          });
          console.log('🔑 CURRENT USER PRIVATE KEY:', privateKey);
          console.log('🔑 Is privateKey empty?', privateKey === '');
          setUserPrivateKey(privateKey);
        } else {
          console.log('❌ No user data found in AsyncStorage');
          console.log('🔍 Checking if user is logged in...');
          
          // Check if there's any data in AsyncStorage
          const allKeys = await AsyncStorage.getAllKeys();
          console.log('🔍 All AsyncStorage keys:', allKeys);
          
          // Check if there's a token
          const token = await AsyncStorage.getItem('access_token');
          console.log('🔍 Access token exists:', !!token);
        }
      } catch (error) {
        console.error('❌ Error loading user private key:', error);
      }
    };
    loadUserPrivateKey();
  }, []);

  // Animate header on mount
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  // Pulse animation for loading
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading, pulseAnim]);

  const loadReminders = async (isRefresh = false) => {
    console.log('🔍 loadReminders called with userPrivateKey:', userPrivateKey);
    console.log('🔍 userPrivateKey type:', typeof userPrivateKey);
    console.log('🔍 userPrivateKey length:', userPrivateKey?.length);
    console.log('🔍 Is userPrivateKey empty?', !userPrivateKey);
    
    if (!userPrivateKey) {
      console.log('❌ userPrivateKey is empty, skipping API call');
      return;
    }
    
    if (!isRefresh) {
      setLoading(true);
    }
    
    try {
      console.log('🔍 Loading reminders for private key:', userPrivateKey);
      const result = await getReminders(userPrivateKey, true);
      console.log('📋 API Response:', result);
      
      if (result.success && result.data) {
        console.log('✅ Setting reminders:', result.data);
        setReminders(result.data);
        
        // Animate in the content
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else {
        console.error('❌ Failed to load reminders:', result.message);
        if (!isRefresh) {
          Alert.alert('Lỗi', 'Không thể tải nhắc nhở: ' + result.message);
        }
      }
    } catch (error) {
      console.error('❌ Error loading reminders:', error);
      if (!isRefresh) {
        Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load reminders from API
  useEffect(() => {
    loadReminders();
  }, [userPrivateKey]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReminders(true);
  };

  const handleMarkCompleted = async (id: string) => {
    if (!userPrivateKey || !userEmail) {
      console.log('❌ Missing userPrivateKey or userEmail:', { userPrivateKey, userEmail });
      Alert.alert('Lỗi', 'Thông tin người dùng không đầy đủ');
      return;
    }
    
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) {
        console.log('❌ Reminder not found:', id);
        return;
      }
      
      const newStatus = reminder.isCompleted ? 'pending' : 'completed';
      console.log('🔄 Updating reminder status:', { id, newStatus, userEmail });
      
      const result = await updateReminderStatus(id, newStatus, userEmail);
      
      if (result.success) {
        console.log('✅ Reminder status updated successfully');
        setReminders(prev =>
          prev.map(reminder =>
            reminder.id === id
              ? { ...reminder, isCompleted: !reminder.isCompleted }
              : reminder
          )
        );
      } else {
        console.log('❌ Failed to update reminder status:', result.message);
        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Error updating reminder status:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    }
  };

  const getRemindersByDate = () => {
    console.log('📅 Processing reminders:', reminders);
    
    const today = reminders.filter(r => r.date === 'Hôm nay' && !r.isCompleted);
    const tomorrow = reminders.filter(r => r.date === 'Ngày mai' && !r.isCompleted);
    const upcoming = reminders.filter(r => !r.isCompleted && r.date !== 'Hôm nay' && r.date !== 'Ngày mai');
    const completed = reminders.filter(r => r.isCompleted);

    console.log('📊 Filtered reminders:', {
      today: today.length,
      tomorrow: tomorrow.length,
      upcoming: upcoming.length,
      completed: completed.length,
      total: reminders.length
    });

    return { today, tomorrow, upcoming, completed };
  };

  const { today, tomorrow, upcoming, completed } = getRemindersByDate();

  const renderSection = (title: string, data: any[], color: string, icon: string) => {
    if (data.length === 0) return null;

    return (
      <Animated.View 
        style={[styles.section, { opacity: fadeAnim }]}
        key={title}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionIcon, { backgroundColor: color + '20' }]}>
              <Feather name={icon} size={16} color={color} />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <View style={[styles.sectionBadge, { backgroundColor: color }]}>
            <Text style={styles.sectionCount}>{data.length}</Text>
          </View>
        </View>
        <View style={styles.sectionContent}>
          {data.map((item, index) => (
            <ReminderItem
              key={item.id}
              reminder={item}
              onMarkCompleted={handleMarkCompleted}
            />
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <Feather name="bell" size={48} color="#C7C7CC" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có nhắc nhở nào</Text>
      <Text style={styles.emptySubtitle}>
        Người thân sẽ tạo nhắc nhở cho bạn khi cần thiết
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Feather name="refresh-cw" size={16} color="#0D4C92" />
        <Text style={styles.refreshButtonText}>Làm mới</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#0D4C92" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Nhắc nhở</Text>
          <Text style={styles.headerSubtitle}>Quản lý các nhắc nhở của bạn</Text>
        </View>
        <TouchableOpacity style={styles.refreshHeaderButton} onPress={onRefresh}>
          <Feather name="refresh-cw" size={20} color="#0D4C92" />
        </TouchableOpacity>
      </Animated.View>

      {/* Status Summary */}
      <ReminderStatus
        todayCount={today.length}
        tomorrowCount={tomorrow.length}
        upcomingCount={upcoming.length}
        completedCount={completed.length}
      />

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingSpinner, { opacity: pulseAnim }]}>
            <Feather name="loader" size={32} color="#0D4C92" />
          </Animated.View>
          <Text style={styles.loadingText}>Đang tải nhắc nhở...</Text>
        </View>
      ) : reminders.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0D4C92"
              colors={["#0D4C92"]}
              progressBackgroundColor="#F8FAFF"
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          ListHeaderComponent={() => (
            <View style={styles.sectionsContainer}>
              {renderSection('Hôm nay', today, '#0D4C92', 'clock')}
              {renderSection('Ngày mai', tomorrow, '#1E88E5', 'calendar')}
              {renderSection('Sắp tới', upcoming, '#FF9800', 'calendar')}
              {renderSection('Đã hoàn thành', completed, '#42A5F5', 'check-circle')}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16, // Thêm padding top cho Android
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 22,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  refreshHeaderButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 22,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionsContainer: {
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sectionBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 24,
    alignItems: 'center',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D4C92',
    marginLeft: 8,
  },
});

export default RemindersScreen; 