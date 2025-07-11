import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { usePremium } from '../../contexts/PremiumContext';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { PremiumStackParamList } from '../../types/navigation';

// --- Icon Component ---
const CheckIcon = () => (
    <View style={styles.iconCheckMark} />
);

const PaymentSuccessScreen: React.FC<{
  navigation: NavigationProp<PremiumStackParamList, 'PaymentSuccess'>;
  route: RouteProp<PremiumStackParamList, 'PaymentSuccess'>;
}> = ({ navigation, route }) => {
  const { transactionId, planName } = route.params;
  const { fetchPremiumStatus } = usePremium();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    fetchPremiumStatus();

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, fetchPremiumStatus]);

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'PremiumHome' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.content, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <CheckIcon />
          </View>

          {/* Message */}
          <Text style={styles.title}>Thanh toán thành công</Text>
          <Text style={styles.subtitle}>
            Chúc mừng bạn đã nâng cấp thành công gói <Text style={{ fontWeight: 'bold' }}>{planName}</Text>.
          </Text>

          {/* Transaction Details */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Mã giao dịch</Text>
              <Text style={styles.value}>{transactionId}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Thời gian</Text>
              <Text style={styles.value}>{new Date().toLocaleTimeString('vi-VN')} - {new Date().toLocaleDateString('vi-VN')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Trạng thái</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Thành công</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.infoText}>
            Bạn có thể bắt đầu khám phá các tính năng cao cấp ngay bây giờ.
          </Text>

        </Animated.View>
      </ScrollView>
      
      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: tabBarHeight > 0 ? tabBarHeight + 10 : 32 }]}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
          <Text style={styles.primaryButtonText}>Hoàn tất</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('PaymentHistory')}>
          <Text style={styles.secondaryButtonText}>Xem lịch sử giao dịch</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 24, alignItems: 'center', paddingBottom: 160 }, // Padding bottom to avoid overlap with footer
  
  // Icon
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCheckMark: {
    width: 24,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  
  // Message
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6A6A6E',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#8A8A8E',
    textAlign: 'center',
    marginTop: 24,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  label: { fontSize: 16, color: '#6A6A6E' },
  value: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E5E5EA' },

  // Status Badge
  statusBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PaymentSuccessScreen;
