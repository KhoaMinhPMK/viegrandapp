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
  Alert,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { usePremium } from '../../contexts/PremiumContext';
import { PremiumStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');

interface PaymentFailedScreenProps {
  navigation: NavigationProp<PremiumStackParamList, 'PaymentFailed'>;
  route: RouteProp<PremiumStackParamList, 'PaymentFailed'>;
}

const PaymentFailedScreen: React.FC<PaymentFailedScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { transactionId, error } = route.params;
  const { plans } = usePremium();
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [fadeAnim] = React.useState(new Animated.Value(0));

  useEffect(() => {
    // Start error animation
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

  const handleTryAgain = () => {
    navigation.goBack();
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'PremiumHome' }],
    });
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Liên hệ hỗ trợ',
      'Bạn có thể liên hệ với chúng tôi qua:\n\n📞 Hotline: 1900-xxxx\n📧 Email: support@viegrand.com\n💬 Chat: Trong ứng dụng',
      [
        { text: 'OK', style: 'default' },
        { text: 'Mở chat', onPress: () => console.log('Open chat support') },
      ]
    );
  };

  const handleViewHistory = () => {
    navigation.navigate('PaymentHistory');
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'Insufficient funds':
        return 'Số dư trong tài khoản không đủ để thực hiện giao dịch này.';
      case 'Card declined':
        return 'Thẻ của bạn đã bị từ chối. Vui lòng kiểm tra thông tin thẻ hoặc liên hệ ngân hàng.';
      case 'Network error':
        return 'Kết nối mạng không ổn định. Vui lòng kiểm tra kết nối và thử lại.';
      case 'Gateway timeout':
        return 'Thời gian xử lý vượt quá giới hạn. Vui lòng thử lại sau.';
      case 'Invalid card':
        return 'Thông tin thẻ không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      default:
        return 'Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.';
    }
  };

  const getTroubleshootingSteps = (errorCode: string): string[] => {
    switch (errorCode) {
      case 'Insufficient funds':
        return [
          'Kiểm tra số dư trong tài khoản',
          'Nạp thêm tiền vào tài khoản',
          'Thử với thẻ khác',
        ];
      case 'Card declined':
        return [
          'Kiểm tra thông tin thẻ',
          'Liên hệ ngân hàng để mở khóa thẻ',
          'Thử với thẻ khác',
        ];
      case 'Network error':
        return [
          'Kiểm tra kết nối mạng',
          'Thử kết nối Wi-Fi khác',
          'Thử lại sau vài phút',
        ];
      default:
        return [
          'Kiểm tra thông tin thanh toán',
          'Thử với phương thức khác',
          'Liên hệ hỗ trợ nếu vẫn gặp lỗi',
        ];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Error Animation */}
          <Animated.View
            style={[
              styles.errorContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.errorCircle}>
              <Text style={styles.errorIcon}>❌</Text>
            </View>
            <Text style={styles.errorTitle}>Thanh toán thất bại</Text>
            <Text style={styles.errorSubtitle}>
              Rất tiếc, giao dịch của bạn không thể hoàn tất
            </Text>
          </Animated.View>

          {/* Error Details */}
          <Animated.View
            style={[
              styles.detailsContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.detailsTitle}>Chi tiết lỗi</Text>
            
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
              <Text style={[styles.detailValue, styles.statusError]}>
                Thất bại
              </Text>
            </View>
            
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageTitle}>Lý do:</Text>
              <Text style={styles.errorMessageText}>
                {getErrorMessage(error)}
              </Text>
            </View>
          </Animated.View>

          {/* Troubleshooting */}
          <Animated.View
            style={[
              styles.troubleshootingContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.troubleshootingTitle}>💡 Hướng dẫn khắc phục</Text>
            
            {getTroubleshootingSteps(error).map((step, index) => (
              <View key={index} style={styles.troubleshootingStep}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Alternative Payment Methods */}
          <Animated.View
            style={[
              styles.alternativeContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.alternativeTitle}>💳 Phương thức thanh toán khác</Text>
            <Text style={styles.alternativeText}>
              Bạn có thể thử thanh toán bằng các phương thức khác:
            </Text>
            
            <View style={styles.paymentMethodsList}>
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodIcon}>📱</Text>
                <Text style={styles.paymentMethodName}>Ví điện tử</Text>
              </View>
              
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodIcon}>🏦</Text>
                <Text style={styles.paymentMethodName}>Chuyển khoản</Text>
              </View>
              
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodIcon}>💳</Text>
                <Text style={styles.paymentMethodName}>Thẻ khác</Text>
              </View>
            </View>
          </Animated.View>

          {/* Support Information */}
          <Animated.View
            style={[
              styles.supportContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.supportTitle}>🆘 Cần hỗ trợ?</Text>
            <Text style={styles.supportText}>
              Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp bạn 24/7
            </Text>
            
            <TouchableOpacity
              style={styles.supportButton}
              onPress={handleContactSupport}
            >
              <Text style={styles.supportButtonText}>Liên hệ hỗ trợ</Text>
            </TouchableOpacity>
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
          onPress={handleTryAgain}
        >
          <Text style={styles.primaryButtonText}>Thử lại</Text>
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
            onPress={handleGoHome}
          >
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
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
  errorContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 40,
  },
  errorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorIcon: {
    fontSize: 48,
    color: '#fff',
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
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
  statusError: {
    color: '#f44336',
  },
  errorMessageContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorMessageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  errorMessageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  troubleshootingContainer: {
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
  troubleshootingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  troubleshootingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: 8,
    minWidth: 20,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  alternativeContainer: {
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
  alternativeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  paymentMethodsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodItem: {
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentMethodName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  supportContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
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

export default PaymentFailedScreen;
