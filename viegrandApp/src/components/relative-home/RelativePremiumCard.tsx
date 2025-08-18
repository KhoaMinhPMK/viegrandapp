import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

interface RelativePremiumCardProps {
  isPremium: boolean;
  daysRemaining?: number;
}

const RelativePremiumCard = memo(({ isPremium, daysRemaining }: RelativePremiumCardProps) => {
  const navigation = useNavigation<any>();

  const handleNavigate = useCallback(() => {
    if (isPremium) {
      // Navigate to Premium management screen for active premium users
      navigation.navigate('PremiumManagement');
    } else {
      // Navigate to Premium subscription screen for non-premium users
      navigation.navigate('Premium');
    }
  }, [navigation, isPremium]);

  if (isPremium) {
    return (
      <View style={styles.cardContainer}>
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardGradient}>
          <View style={styles.cardOverlay}>
            <View style={styles.cardHeader}>
              <Feather name="star" size={18} color="#FFD700" />
              <Text style={styles.cardTitle}>PREMIUM ACTIVE</Text>
              <TouchableOpacity style={styles.cardButton} onPress={handleNavigate}>
                <Text style={styles.cardButtonText}>Quản lý</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardDays}>{daysRemaining !== undefined ? (daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : 'Đã hết hạn') : ''}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardGradient}>
        <View style={styles.cardOverlay}>
          <View style={styles.cardHeader}>
            <Feather name="star" size={18} color="#FFD700" />
            <Text style={styles.cardTitle}>NÂNG CẤP PREMIUM</Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleNavigate}>
              <Text style={styles.upgradeButtonText}>Khám phá</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardSubtitle}>Mở khóa tính năng cao cấp</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: { 
    // marginHorizontal: 20, 
    marginBottom: 20, 
    marginTop: 20, 
    borderRadius: 16, 
    overflow: 'hidden', 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4 
  },
  cardGradient: { position: 'relative' },
  cardOverlay: { padding: 16, position: 'relative' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', flex: 1, marginLeft: 8, letterSpacing: 0.3 },
  cardDays: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' },
  cardButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  cardButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  upgradeButton: { backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  upgradeButtonText: { color: '#1E3A8A', fontSize: 12, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' },
});

export default RelativePremiumCard;
