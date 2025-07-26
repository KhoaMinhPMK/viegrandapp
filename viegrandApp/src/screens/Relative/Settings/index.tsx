import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SettingsContainer } from '../../../components/settings/SettingsContainer';
import { SettingsSection } from '../../../components/settings/SettingsSection';
import { SettingsRow } from '../../../components/settings/SettingsRow';
import { useAuth } from '../../../contexts/AuthContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { getUserData } from '../../../services/api';

const RelativeSettingsScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { settings, updateSettings, isLoading } = useSettings();
  
  // State cho user data từ API
  const [userData, setUserData] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumEndDate, setPremiumEndDate] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // Function để fetch user data - gọi API mỗi khi vào trang
  const fetchUserDataAndUpdatePremium = useCallback(async () => {
    try {
      setIsLoadingUserData(true);
      
      // Lấy email từ cache
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (!userEmail) {
        console.log('No email found in cache for settings');
        setIsLoadingUserData(false);
        return;
      }

      console.log('Settings: Fetching user data for email:', userEmail);
      
      // Gọi API get user data
      const result = await getUserData(userEmail);
      
      if (result.success && result.user) {
        const apiUser = result.user;
        const premiumStatus = apiUser.premium_status;
        const premiumEndDateFromAPI = apiUser.premium_end_date;
        
        // Tính số ngày còn lại
        let daysLeft = null;
        if (premiumStatus && premiumEndDateFromAPI) {
          const endDate = new Date(premiumEndDateFromAPI);
          const currentDate = new Date();
          const timeDiff = endDate.getTime() - currentDate.getTime();
          daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          // Nếu hết hạn thì set premium = false
          if (daysLeft <= 0) {
            setIsPremium(false);
            daysLeft = 0;
          } else {
            setIsPremium(premiumStatus);
          }
        } else {
          setIsPremium(premiumStatus);
        }
        
        // Cập nhật state
        setUserData(apiUser);
        setPremiumEndDate(premiumEndDateFromAPI);
        setDaysRemaining(daysLeft);
        
        console.log('Settings premium data updated:', {
          status: premiumStatus,
          endDate: premiumEndDateFromAPI,
          daysRemaining: daysLeft
        });
      } else {
        console.error('Failed to fetch user data for settings:', result.message);
      }
    } catch (error) {
      console.error('Error fetching user data for settings:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  }, []);

  // ✅ GỌI API MỖI KHI VÀO TRANG - useFocusEffect đảm bảo data luôn fresh
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 RelativeSettings: Auto-fetching user data on every page visit');
      fetchUserDataAndUpdatePremium();
    }, [fetchUserDataAndUpdatePremium])
  );

  // Backup: Fetch data khi component mount
  useEffect(() => {
    fetchUserDataAndUpdatePremium();
  }, [fetchUserDataAndUpdatePremium]);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
      ],
      { cancelable: true }
    );
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cài đặt</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D4C92" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cài đặt</Text>
        {isLoading && <ActivityIndicator style={styles.headerLoader} color="#0D4C92" />}
      </View>
      <SettingsContainer>
        {/* Profile Section */}
        <SettingsSection>
          <SettingsRow
            type="navigation"
            icon="user"
            iconBackgroundColor="#1E90FF"
            title={userData?.userName || user?.fullName || 'Người dùng'}
            value={userData?.email || user?.email}
            onPress={() => navigation.navigate('EditProfile')}
            isLast
          />
        </SettingsSection>

        {/* Notification Section */}
        <SettingsSection title="Thông báo & Cảnh báo">
          <SettingsRow
            type="toggle"
            icon="bell"
            iconBackgroundColor="#FF4500"
            title="Thông báo ứng dụng"
            value={settings.relative_appNotificationsEnabled}
            onValueChange={(value) => updateSettings({ relative_appNotificationsEnabled: value })}
          />
          <SettingsRow
            type="toggle"
            icon="mail"
            iconBackgroundColor="#007BFF"
            title="Cảnh báo qua Email"
            value={settings.relative_emailAlertsEnabled}
            onValueChange={(value) => updateSettings({ relative_emailAlertsEnabled: value })}
          />
          <SettingsRow
            type="toggle"
            icon="message-circle"
            iconBackgroundColor="#32CD32"
            title="Cảnh báo qua SMS"
            value={settings.relative_smsAlertsEnabled}
            onValueChange={(value) => updateSettings({ relative_smsAlertsEnabled: value })}
            isLast
          />
        </SettingsSection>

        {/* General Section */}
        <SettingsSection title="Chung">
          <SettingsRow
            type="navigation"
            icon="globe"
            iconBackgroundColor="#4682B4"
            title="Ngôn ngữ"
            value={settings.language === 'vi' ? 'Tiếng Việt' : 'English'}
            onPress={() => Alert.alert('Tính năng đang phát triển')}
          />
          <SettingsRow
            type="navigation"
            icon="shield"
            iconBackgroundColor="#6A5ACD"
            title="Bảo mật"
            onPress={() => Alert.alert('Tính năng đang phát triển')}
          />
          <SettingsRow
            type="navigation"
            icon="info"
            iconBackgroundColor="#708090"
            title="Về ứng dụng"
            onPress={() => Alert.alert('Tính năng đang phát triển')}
            isLast
          />
        </SettingsSection>

        {/* Premium Section */}
        <SettingsSection title="Premium">
          {isLoadingUserData ? (
            <SettingsRow
              type="navigation"
              icon="star"
              iconBackgroundColor="#FFD700"
              title="Premium"
              value="Đang tải..."
              onPress={() => {}}
              isLast
            />
          ) : isPremium ? (
            <SettingsRow
              type="navigation"
              icon="star"
              iconBackgroundColor="#32CD32"
              title="Premium Active"
              value={daysRemaining ? `Còn ${daysRemaining} ngày` : 'Đang hoạt động'}
              onPress={() => navigation.navigate('Premium')}
              isLast
            />
          ) : (
            <SettingsRow
              type="navigation"
              icon="star"
              iconBackgroundColor="#FFD700"
              title="Nâng cấp Premium"
              value="Xem chi tiết gói"
              onPress={() => navigation.navigate('Premium')}
              isLast
            />
          )}
        </SettingsSection>

        {/* Logout Section */}
        <SettingsSection>
          <SettingsRow
            type="button"
            title="Đăng xuất"
            titleColor="#FF3B30"
            onPress={handleLogout}
            isLast
          />
        </SettingsSection>
      </SettingsContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C7C7CC',
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerLoader: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RelativeSettingsScreen;
