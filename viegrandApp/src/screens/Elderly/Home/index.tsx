import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePremium } from '../../../contexts/PremiumContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../contexts/AuthContext';
import { BackgroundImages } from '../../../utils/assetUtils';
import { getUserData } from '../../../services/api';
import Header from '../../../components/elderly-home/Header';
import WeatherCard from '../../../components/elderly-home/WeatherCard';
import FunctionGrid from '../../../components/elderly-home/FunctionGrid';
import PremiumUpgradeCard from '../../../components/elderly-home/PremiumUpgradeCard';
import VoiceTranscript from '../../../components/elderly-home/VoiceTranscript';

// --- Memoized Components for Performance Optimization ---
const MemoizedHeader = memo(Header);
const MemoizedWeatherCard = memo(WeatherCard);
const MemoizedFunctionGrid = memo(FunctionGrid);
const MemoizedPremiumUpgradeCard = memo(PremiumUpgradeCard);
const MemoizedVoiceTranscript = memo(VoiceTranscript);

const ElderlyHomeScreen = () => {
  const { user } = useAuth();
  const { premiumStatus, fetchPremiumStatus, refreshTrigger } = usePremium();
  const navigation = useNavigation();
  
  // State cho premium status từ cache và API
  const [isPremium, setIsPremium] = useState(false);
  const [premiumEndDate, setPremiumEndDate] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // Function để lấy user data và cập nhật premium status
  const fetchUserDataAndUpdatePremium = async () => {
    try {
      setIsLoadingUserData(true);
      
      // Lấy email từ cache
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (!userEmail) {
        console.log('No email found in cache');
        setIsLoadingUserData(false);
        return;
      }

      console.log('Fetching user data for email:', userEmail);
      
      // Gọi API get user data
      const result = await getUserData(userEmail);
      
      if (result.success && result.user) {
        const premiumStatus = result.user.premium_status;
        const premiumEndDateFromAPI = result.user.premium_end_date;
        
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
        
        // Lưu vào cache
        await AsyncStorage.setItem('premium_status', JSON.stringify(premiumStatus));
        await AsyncStorage.setItem('premium_end_date', JSON.stringify(premiumEndDateFromAPI));
        await AsyncStorage.setItem('premium_days_remaining', JSON.stringify(daysLeft));
        
        // Cập nhật state
        setPremiumEndDate(premiumEndDateFromAPI);
        setDaysRemaining(daysLeft);
        
        console.log('Premium data updated:', {
          status: premiumStatus,
          endDate: premiumEndDateFromAPI,
          daysRemaining: daysLeft
        });
      } else {
        console.error('Failed to fetch user data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Function để load premium data từ cache
  const loadPremiumDataFromCache = async () => {
    try {
      const cachedPremiumStatus = await AsyncStorage.getItem('premium_status');
      const cachedEndDate = await AsyncStorage.getItem('premium_end_date');
      const cachedDaysRemaining = await AsyncStorage.getItem('premium_days_remaining');
      
      if (cachedPremiumStatus) {
        const premiumStatus = JSON.parse(cachedPremiumStatus);
        setIsPremium(premiumStatus);
      }
      
      if (cachedEndDate) {
        const endDate = JSON.parse(cachedEndDate);
        setPremiumEndDate(endDate);
      }
      
      if (cachedDaysRemaining) {
        const daysLeft = JSON.parse(cachedDaysRemaining);
        setDaysRemaining(daysLeft);
      }
      
      console.log('Premium data loaded from cache:', {
        status: cachedPremiumStatus ? JSON.parse(cachedPremiumStatus) : null,
        endDate: cachedEndDate ? JSON.parse(cachedEndDate) : null,
        daysRemaining: cachedDaysRemaining ? JSON.parse(cachedDaysRemaining) : null
      });
    } catch (error) {
      console.error('Error loading premium data from cache:', error);
    }
  };

  // Load premium data từ cache khi component mount
  useEffect(() => {
    loadPremiumDataFromCache();
    fetchUserDataAndUpdatePremium();
  }, []);

  // Refresh user data khi có thay đổi premium status từ context
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchUserDataAndUpdatePremium();
    }
  }, [refreshTrigger]);

  // Refresh khi focus vào màn hình (quay về từ màn hình thanh toán)
  useFocusEffect(
    useCallback(() => {
      fetchUserDataAndUpdatePremium();
    }, [])
  );

  // Backup: Vẫn giữ context premium status như fallback
  useEffect(() => {
    fetchPremiumStatus();
  }, [fetchPremiumStatus]);

  // Notifications state remains here as it's passed to the Header
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nhắc nhở uống thuốc', message: 'Đã đến giờ uống thuốc huyết áp', time: '10:30', read: false },
    { id: 2, title: 'Lịch khám bệnh', message: 'Bạn có lịch khám tim mạch vào ngày mai', time: '09:00', read: false },
    { id: 3, title: 'Cập nhật sức khỏe', message: 'Hãy cập nhật chỉ số huyết áp hôm nay', time: '08:00', read: false },
  ]);

  // Use useCallback to memoize the function, preventing re-renders of the Header
  const handleNotificationsUpdate = useCallback((newNotifications: any) => {
    setNotifications(newNotifications);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={BackgroundImages.secondary} style={styles.backgroundImage} resizeMode="cover" />
      
      <MemoizedHeader 
        user={user}
        isPremium={isPremium}
        notifications={notifications}
        onNotificationsUpdate={handleNotificationsUpdate}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <MemoizedWeatherCard isPremium={isPremium} />
        <MemoizedPremiumUpgradeCard isPremium={isPremium} daysRemaining={daysRemaining || undefined} />
        <MemoizedFunctionGrid />
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <MemoizedVoiceTranscript />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: -1 },
  content: { flex: 1, backgroundColor: 'transparent' },
  bottomSpacing: { height: 100 },
});

export default ElderlyHomeScreen;
