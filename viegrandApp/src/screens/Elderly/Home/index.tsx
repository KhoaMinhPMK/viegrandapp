import React, { useState, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { usePremium } from '../../../contexts/PremiumContext';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../contexts/AuthContext';
import { BackgroundImages } from '../../../utils/assetUtils';
import Header from '../../../components/elderly-home/Header';
import WeatherCard from '../../../components/elderly-home/WeatherCard';
import FunctionGrid from '../../../components/elderly-home/FunctionGrid';
import PremiumUpgradeCard from '../../../components/elderly-home/PremiumUpgradeCard';
import VoiceTranscript from '../../../components/elderly-home/VoiceTranscript';

const ElderlyHomeScreen = () => {
  const { user } = useAuth();
  const { premiumStatus, fetchPremiumStatus } = usePremium();
  const isPremium = premiumStatus?.isPremium || false;

  useFocusEffect(
    useCallback(() => {
      fetchPremiumStatus();
    }, [fetchPremiumStatus])
  );

  // Notifications state remains here as it's passed to the Header
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nhắc nhở uống thuốc', message: 'Đã đến giờ uống thuốc huyết áp', time: '10:30', read: false },
    { id: 2, title: 'Lịch khám bệnh', message: 'Bạn có lịch khám tim mạch vào ngày mai', time: '09:00', read: false },
    { id: 3, title: 'Cập nhật sức khỏe', message: 'Hãy cập nhật chỉ số huyết áp hôm nay', time: '08:00', read: false },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={BackgroundImages.secondary} style={styles.backgroundImage} resizeMode="cover" />
      
      <Header 
        user={user}
        isPremium={isPremium}
        notifications={notifications}
        onNotificationsUpdate={setNotifications}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <WeatherCard isPremium={isPremium} />
        <PremiumUpgradeCard isPremium={isPremium} daysRemaining={premiumStatus?.daysRemaining} />
        <FunctionGrid />
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <VoiceTranscript />
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
