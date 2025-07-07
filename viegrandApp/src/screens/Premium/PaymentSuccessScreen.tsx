import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { usePremium } from '../../contexts/PremiumContext';
import { PremiumStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');

interface PaymentSuccessScreenProps {
  navigation: NavigationProp<PremiumStackParamList, 'PaymentSuccess'>;
  route: RouteProp<PremiumStackParamList, 'PaymentSuccess'>;
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { transactionId, planName } = route.params;
  const { fetchPremiumStatus } = usePremium();
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [fadeAnim] = React.useState(new Animated.Value(0));

  useEffect(() => {
    // Refresh premium status
    fetchPremiumStatus();

    // Start success animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'PremiumHome' }],
    });
  };

  const handleViewHistory = () => {
    navigation.navigate('PaymentHistory');
  };

  const handleManageSubscription = () => {
    navigation.navigate('SubscriptionManagement');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Success Animation */}
          <Animated.View
            style={[
              styles.successContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.successCircle}>
              <Text style={styles.successIcon}>✅</Text>
            </View>
            <Text style={styles.successTitle}>Thanh toán thành công!</Text>
            <Text style={styles.successSubtitle}>
              Chúc mừng bạn đã nâng cấp lên Premium
            </Text>
          </Animated.View>

          {/* Transaction Details */}
          <Animated.View
            style={[
              styles.detailsContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.detailsTitle}>Chi tiết giao dịch</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gói dịch vụ:</Text>
              <Text style={styles.detailValue}>{planName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã giao dịch:</Text>
              <Text style={styles.detailValue}>{transactionId}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian:</Text>
              <Text style={styles.detailValue}>
                {new Date().toLocaleString('vi-VN')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trạng thái:</Text>
              <Text style={[styles.detailValue, styles.statusSuccess]}>
                Thành công
              </Text>
            </View>
          </Animated.View>

          {/* Premium Benefits */}
          <Animated.View
            style={[
              styles.benefitsContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.benefitsTitle}>🎉 Bạn đã có quyền truy cập</Text>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📹</Text>
              <Text style={styles.benefitText}>Gọi video không giới hạn</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>❤️</Text>
              <Text style={styles.benefitText}>Theo dõi sức khỏe AI</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎧</Text>
              <Text style={styles.benefitText}>Hỗ trợ ưu tiên 24/7</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💊</Text>
              <Text style={styles.benefitText}>Nhắc nhở uống thuốc thông minh</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📊</Text>
              <Text style={styles.benefitText}>Báo cáo sức khỏe chi tiết</Text>
            </View>
          </Animated.View>

          {/* Next Steps */}
          <Animated.View
            style={[
              styles.nextStepsContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.nextStepsTitle}>Tiếp theo</Text>
            <Text style={styles.nextStepsText}>
              Hãy khám phá các tính năng Premium mới và tận hưởng trải nghiệm tốt nhất!
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.actionContainer,
          { opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGoHome}
        >
          <Text style={styles.primaryButtonText}>Khám phá ngay</Text>
        </TouchableOpacity>
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewHistory}
          >
            <Text style={styles.secondaryButtonText}>Xem lịch sử</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleManageSubscription}
          >
            <Text style={styles.secondaryButtonText}>Quản lý gói</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 40,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successIcon: {
    fontSize: 48,
    color: '#fff',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusSuccess: {
    color: '#4CAF50',
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  nextStepsContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  nextStepsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PaymentSuccessScreen;
