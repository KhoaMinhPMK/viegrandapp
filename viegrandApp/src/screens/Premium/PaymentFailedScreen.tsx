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

import { PremiumStackParamList } from '../../types/navigation';

// --- Icon Component ---
const CloseIcon = () => (
    <View style={styles.iconCloseContainer}>
        <View style={styles.iconCloseLine1} />
        <View style={styles.iconCloseLine2} />
    </View>
);

const PaymentFailedScreen: React.FC<{
  navigation: NavigationProp<PremiumStackParamList, 'PaymentFailed'>;
  route: RouteProp<PremiumStackParamList, 'PaymentFailed'>;
}> = ({ navigation, route }) => {
  const { transactionId, error } = route.params;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
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
  }, [scaleAnim, opacityAnim]);

  const getErrorMessage = (errorCode: string): { title: string, description: string } => {
    switch (errorCode) {
      case 'Insufficient funds':
        return { title: 'Số dư không đủ', description: 'Tài khoản của bạn không đủ để thực hiện giao dịch này. Vui lòng nạp thêm tiền hoặc sử dụng phương thức khác.' };
      case 'Card declined':
        return { title: 'Thẻ bị từ chối', description: 'Ngân hàng đã từ chối giao dịch. Vui lòng kiểm tra lại thông tin thẻ hoặc liên hệ ngân hàng của bạn.' };
      default:
        return { title: 'Giao dịch không thành công', description: 'Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.' };
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.content, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <CloseIcon />
          </View>

          {/* Message */}
          <Text style={styles.title}>{errorMessage.title}</Text>
          <Text style={styles.subtitle}>{errorMessage.description}</Text>

          {/* Transaction Details */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Mã giao dịch</Text>
              <Text style={styles.value}>{transactionId}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Trạng thái</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Thất bại</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.infoText}>
            Bạn chưa bị trừ tiền cho giao dịch này.
          </Text>

        </Animated.View>
      </ScrollView>
      
      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: 32 }]}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('PremiumHome')}>
          <Text style={styles.secondaryButtonText}>Quay về trang chủ</Text>
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
    backgroundColor: '#FF3B30', // Error color
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCloseContainer: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  iconCloseLine1: { position: 'absolute', width: '100%', height: 4, backgroundColor: '#FFFFFF', borderRadius: 2, transform: [{ rotate: '45deg' }] },
  iconCloseLine2: { position: 'absolute', width: '100%', height: 4, backgroundColor: '#FFFFFF', borderRadius: 2, transform: [{ rotate: '-45deg' }] },

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
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // Error color with opacity
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    color: '#FF3B30',
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

export default PaymentFailedScreen;
