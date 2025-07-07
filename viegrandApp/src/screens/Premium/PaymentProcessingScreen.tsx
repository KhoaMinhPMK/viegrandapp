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
import { PaymentTransaction } from '../../types/premium';

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
  const { plans, purchasePremium } = usePremium();
  const [processingStep, setProcessingStep] = useState<'initializing' | 'processing' | 'verifying' | 'completed' | 'failed'>('initializing');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Đang khởi tạo thanh toán...');
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [animatedValue] = useState(new Animated.Value(0));

  const selectedPlan = plans.find((plan) => plan.id === planId);

  useEffect(() => {
    // Start processing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start payment processing
    processPayment();
  }, []);

  const processPayment = async () => {
    try {
      // Step 1: Initialize payment
      setProcessingStep('initializing');
      setStatusMessage('Đang khởi tạo giao dịch...');
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Process payment
      setProcessingStep('processing');
      setStatusMessage('Đang xử lý thanh toán...');
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Verify payment
      setProcessingStep('verifying');
      setStatusMessage('Đang xác thực giao dịch...');
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock payment result (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        // Mock successful transaction
        const mockTransaction: PaymentTransaction = {
          id: Math.floor(Math.random() * 10000),
          userId: 1,
          subscriptionId: Math.floor(Math.random() * 1000),
          planId: planId,
          transactionCode: `TX${Date.now()}`,
          amount: amount,
          currency: 'VND',
          status: 'completed',
          paymentMethod: paymentMethod as any,
          type: 'subscription',
          description: `Thanh toán gói ${selectedPlan?.name || 'Premium'}`,
          paidAt: new Date().toISOString(),
          retryCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setTransaction(mockTransaction);
        setProcessingStep('completed');
        setStatusMessage('Thanh toán thành công!');
        setProgress(100);

        // Navigate to success screen after delay
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'PaymentSuccess',
                params: {
                  transactionId: mockTransaction.transactionCode,
                  planName: selectedPlan?.name || 'Premium',
                }
              }
            ]
          });
        }, 2000);
      } else {
        // Mock failed transaction
        const mockTransaction: PaymentTransaction = {
          id: Math.floor(Math.random() * 10000),
          userId: 1,
          subscriptionId: Math.floor(Math.random() * 1000),
          planId: planId,
          transactionCode: `TX${Date.now()}`,
          amount: amount,
          currency: 'VND',
          status: 'failed',
          paymentMethod: paymentMethod as any,
          type: 'subscription',
          description: `Thanh toán gói ${selectedPlan?.name || 'Premium'}`,
          failureReason: 'Insufficient funds',
          retryCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setTransaction(mockTransaction);
        setProcessingStep('failed');
        setStatusMessage('Thanh toán thất bại');
        setProgress(100);

        // Navigate to failure screen after delay
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'PaymentFailed',
                params: {
                  transactionId: mockTransaction.transactionCode,
                  error: 'Insufficient funds',
                }
              }
            ]
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setProcessingStep('failed');
      setStatusMessage('Có lỗi xảy ra trong quá trình thanh toán');
      setProgress(100);
      
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'PaymentFailed',
              params: {
                transactionId: 'N/A',
                error: 'Lỗi hệ thống',
              }
            }
          ]
        });
      }, 2000);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Hủy giao dịch',
      'Bạn có chắc chắn muốn hủy giao dịch này?',
      [
        { text: 'Không', style: 'cancel' },
        { 
          text: 'Có', 
          onPress: () => {
            navigation.goBack();
          }
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
      case 'credit_card':
        return 'Thẻ tín dụng/Ghi nợ';
      case 'e_wallet':
        return 'Ví điện tử';
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'digital_wallet':
        return 'Ví kỹ thuật số';
      default:
        return method;
    }
  };

  const getStepColor = (step: string) => {
    switch (step) {
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#f44336';
      default:
        return '#2196F3';
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const pulseAnimation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đang xử lý thanh toán</Text>
          <Text style={styles.headerSubtitle}>
            Vui lòng không thoát khỏi ứng dụng
          </Text>
        </View>

        {/* Processing Animation */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.processingCircle,
              {
                backgroundColor: getStepColor(processingStep),
                transform: [{ scale: pulseAnimation }],
              },
            ]}
          >
            <Text style={styles.processingIcon}>
              {getStepIcon(processingStep)}
            </Text>
          </Animated.View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: getStepColor(processingStep) },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        {/* Status Message */}
        <Text style={[styles.statusMessage, { color: getStepColor(processingStep) }]}>
          {statusMessage}
        </Text>

        {/* Transaction Details */}
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

          {transaction && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã giao dịch:</Text>
              <Text style={styles.detailValue}>{transaction.transactionCode}</Text>
            </View>
          )}
        </View>

        {/* Processing Steps */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              processingStep === 'initializing' && styles.stepCircleActive,
              ['processing', 'verifying', 'completed', 'failed'].includes(processingStep) && styles.stepCircleCompleted
            ]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepLabel}>Khởi tạo</Text>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              processingStep === 'processing' && styles.stepCircleActive,
              ['verifying', 'completed', 'failed'].includes(processingStep) && styles.stepCircleCompleted
            ]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Xử lý</Text>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              processingStep === 'verifying' && styles.stepCircleActive,
              ['completed', 'failed'].includes(processingStep) && styles.stepCircleCompleted
            ]}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Xác thực</Text>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              ['completed', 'failed'].includes(processingStep) && styles.stepCircleCompleted
            ]}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <Text style={styles.stepLabel}>Hoàn thành</Text>
          </View>
        </View>
      </View>

      {/* Cancel Button */}
      {!['completed', 'failed'].includes(processingStep) && (
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
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBar: {
    width: width - 80,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  transactionDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
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
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#2196F3',
  },
  stepCircleCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  cancelContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
