import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { usePremium } from '../../contexts/PremiumContext';
import { PremiumStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');

interface PaymentProcessingScreenProps {
  navigation: NavigationProp<PremiumStackParamList, 'PaymentProcessing'>;
  route: RouteProp<PremiumStackParamList, 'PaymentProcessing'>;
}

const PaymentProcessingScreen: React.FC<PaymentProcessingScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { planId, billingCycle, paymentMethod, amount } = route.params;
  const { 
    plans, 
    purchasePremium, 
    isPurchasing, 
    purchaseResult, 
    error 
  } = usePremium();
  
  const [statusMessage, setStatusMessage] = useState('Đang khởi tạo thanh toán...');
  const [animatedValue] = useState(new Animated.Value(0));

  const selectedPlan = plans.find((plan) => plan.id === planId);

  // Effect to start payment process
  useEffect(() => {
    purchasePremium(planId, paymentMethod);
  }, [planId, paymentMethod]);

  // Effect for UI updates and navigation
  useEffect(() => {
    if (isPurchasing) {
      setStatusMessage('Đang xử lý giao dịch...');
    }

    if (!isPurchasing && purchaseResult) {
      if (purchaseResult.success) {
        setStatusMessage('Thanh toán thành công!');
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{
              name: 'PaymentSuccess',
              params: {
                transactionId: purchaseResult.transaction.transactionCode,
                planName: selectedPlan?.name || 'Premium',
              }
            }]
          });
        }, 1500);
      } else {
        setStatusMessage(error || 'Thanh toán thất bại');
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{
              name: 'PaymentFailed',
              params: {
                transactionId: purchaseResult.transaction?.transactionCode || 'N/A',
                error: purchaseResult.transaction?.failureReason || error || 'Unknown error',
              }
            }]
          });
        }, 1500);
      }
    }
  }, [isPurchasing, purchaseResult, navigation, selectedPlan, error]);
  
  // Animation effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);


  const handleCancel = () => {
    Alert.alert(
      'Hủy giao dịch',
      'Bạn có chắc chắn muốn hủy giao dịch này?',
      [
        { text: 'Không', style: 'cancel' },
        { 
          text: 'Có', 
          onPress: () => navigation.goBack()
        },
      ]
    );
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getPaymentMethodName = (method: string): string => {
    switch (method) {
      case 'credit_card': return 'Thẻ tín dụng/Ghi nợ';
      case 'e_wallet': return 'Ví điện tử';
      case 'bank_transfer': return 'Chuyển khoản ngân hàng';
      case 'digital_wallet': return 'Ví kỹ thuật số';
      default: return method;
    }
  };
  
  const step = isPurchasing ? 'processing' : purchaseResult?.success ? 'completed' : 'failed';

  const getStepColor = (currentStep: string) => {
    if (currentStep === 'completed') return '#4CAF50';
    if (currentStep === 'failed') return '#f44336';
    return '#2196F3';
  };

  const getStepIcon = (currentStep: string) => {
    if (currentStep === 'completed') return '✅';
    if (currentStep === 'failed') return '❌';
    return '⏳';
  };

  const pulseAnimation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đang xử lý thanh toán</Text>
          <Text style={styles.headerSubtitle}>Vui lòng không thoát khỏi ứng dụng</Text>
        </View>

        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.processingCircle,
              {
                backgroundColor: getStepColor(step),
                transform: [{ scale: pulseAnimation }],
              },
            ]}
          >
            <Text style={styles.processingIcon}>{getStepIcon(step)}</Text>
          </Animated.View>
        </View>

        {isPurchasing && <ActivityIndicator size="large" color="#2196F3" />}
        
        <Text style={[styles.statusMessage, { color: getStepColor(step) }]}>
          {statusMessage}
        </Text>

        <View style={styles.transactionDetails}>
          <Text style={styles.detailsTitle}>Chi tiết giao dịch</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gói dịch vụ:</Text>
            <Text style={styles.detailValue}>{selectedPlan?.name || 'Premium'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tiền:</Text>
            <Text style={styles.detailValue}>{formatPrice(amount)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phương thức:</Text>
            <Text style={styles.detailValue}>{getPaymentMethodName(paymentMethod)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Chu kỳ:</Text>
            <Text style={styles.detailValue}>{billingCycle}</Text>
          </View>

          {purchaseResult?.transaction && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã giao dịch:</Text>
              <Text style={styles.detailValue}>{purchaseResult.transaction.transactionCode}</Text>
            </View>
          )}
        </View>
      </View>

      {isPurchasing && (
        <View style={styles.cancelContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Hủy giao dịch</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  processingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  processingIcon: {
    fontSize: 48,
    color: '#fff',
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  transactionDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
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
  cancelContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentProcessingScreen;
