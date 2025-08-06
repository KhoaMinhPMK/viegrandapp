import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Platform,
  Clipboard,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { usePremium } from '../../contexts/PremiumContext';
import { useAuth } from '../../contexts/AuthContext';
import { savePremiumSubscription } from '../../services/api';

import { PremiumStackParamList } from '../../types/navigation';

// --- Icon Component ---
const CheckIcon = () => (
    <View style={styles.iconCheckMark} />
);

const PaymentSuccessScreen: React.FC<{
  navigation: NavigationProp<PremiumStackParamList, 'PaymentSuccess'>;
  route: RouteProp<PremiumStackParamList, 'PaymentSuccess'>;
}> = ({ navigation, route }) => {
  const { transactionId, planName, planType, planDuration } = route.params;
  const { fetchPremiumStatus, triggerRefresh } = usePremium();
  const { user } = useAuth();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isSubscriptionSaved, setIsSubscriptionSaved] = useState(false);
  const [actualTransactionCode, setActualTransactionCode] = useState<string | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  // Format transaction code for display
  const formatTransactionCode = (code: string) => {
    if (!code || code.length !== 16) return code;
    
    // Return the code as-is without any formatting (no dashes)
    return code;
  };

  const getTransactionCodeInfo = (code: string) => {
    if (!code || code.length !== 16) return null;
    
    const day = code.substring(0, 2);
    const sequence = parseInt(code.substring(2, 12));
    const month = code.substring(12, 14);
    const year = '20' + code.substring(14, 16);
    
    return {
      day,
      sequence,
      month,
      year,
      formatted: `${day}-${code.substring(2, 12)}-${month}${code.substring(14, 16)}`
         };
   };

   // Copy transaction code to clipboard
   const copyTransactionCode = () => {
     if (actualTransactionCode) {
       Clipboard.setString(actualTransactionCode);
       Alert.alert('Đã sao chép', 'Mã giao dịch đã được sao chép vào clipboard');
     }
   };

    // Save subscription to database
  const saveSubscriptionData = async () => {
    if (!user?.email || isSubscriptionSaved) {
      return;
    }

    try {
      console.log('Saving subscription data...', {
        userEmail: user.email,
        planType: planType || 'premium',
        planDuration: planDuration || 1
      });

      const result = await savePremiumSubscription({
        userEmail: user.email,
        planType: planType || 'premium',
        planDuration: planDuration || 1
      });

      if (result.success) {
        console.log('Subscription saved successfully:', result.subscription);
        setIsSubscriptionSaved(true);
        // Set the actual transaction code from backend response
        if (result.subscription?.premiumKey) {
          setActualTransactionCode(result.subscription.premiumKey);
          // Show transaction details with a small delay for better UX
          setTimeout(() => {
            setShowTransactionDetails(true);
          }, 500);
        }
      } else {
        console.error('Failed to save subscription:', result.message);
        Alert.alert(
          'Lưu thông tin',
          'Không thể lưu thông tin subscription. Vui lòng liên hệ hỗ trợ.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi lưu thông tin subscription.',
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    fetchPremiumStatus();
    
    // Trigger refresh để các màn hình khác cập nhật ngay lập tức
    triggerRefresh();

    // Save subscription data to database
    saveSubscriptionData();

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
  }, [scaleAnim, opacityAnim, fetchPremiumStatus, triggerRefresh]);

  const handleDone = () => {
    // Fetch premium status một lần nữa trước khi quay về
    fetchPremiumStatus();
    
    // Trigger refresh để các màn hình khác cập nhật
    triggerRefresh();
    
    // Navigate về trang home tương ứng theo role của user
    // Sử dụng getParent để access root navigator
    const rootNavigation = navigation.getParent();
    
    if (rootNavigation && user?.role) {
      if (user.role === 'elderly') {
        // Navigate về Elderly home
        rootNavigation.reset({
          index: 0,
          routes: [{ name: 'Elderly' }],
        });
      } else if (user.role === 'relative') {
        // Navigate về Relative home
        rootNavigation.reset({
          index: 0,
          routes: [{ name: 'Relative' }],
        });
      } else {
        // Fallback: quay về màn hình trước
        navigation.goBack();
      }
    } else {
      // Fallback: quay về màn hình trước
      navigation.goBack();
    }
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
            <TouchableOpacity style={styles.row} onPress={copyTransactionCode} disabled={!actualTransactionCode}>
              <Text style={styles.label}>Mã giao dịch</Text>
              <View style={styles.transactionCodeContainer}>
                <Text style={styles.transactionCode}>
                  {actualTransactionCode || transactionId || 'Đang tạo...'}
                </Text>
                {actualTransactionCode && showTransactionDetails && (
                  <Text style={styles.transactionCodeDetail}>
                    Giao dịch #{getTransactionCodeInfo(actualTransactionCode)?.sequence} - {getTransactionCodeInfo(actualTransactionCode)?.day}/{getTransactionCodeInfo(actualTransactionCode)?.month}/{getTransactionCodeInfo(actualTransactionCode)?.year}
                  </Text>
                )}
                {actualTransactionCode && (
                  <Text style={styles.copyHint}>Chạm để sao chép</Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Gói Premium</Text>
              <Text style={styles.value}>{planName}</Text>
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
      <View style={[styles.footer, { paddingBottom: 32 }]}>
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
  
  // Transaction Code Styles
  transactionCodeContainer: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 16,
  },
  transactionCode: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  transactionCodeDetail: {
    fontSize: 12,
    color: '#6A6A6E',
    marginTop: 2,
    textAlign: 'right',
  },
  copyHint: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 4,
    textAlign: 'right',
    fontStyle: 'italic',
  },

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
