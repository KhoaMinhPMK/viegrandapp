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
  const { planId, paymentMethod, amount, planType, planDuration } = route.params;
  const { plans, purchasePremium } = usePremium();

  
  const [statusMessage, setStatusMessage] = useState('Đang khởi tạo giao dịch...');
  const [animatedValue] = useState(new Animated.Value(0));

  const selectedPlan = plans.find((plan) => plan.id === planId);

  useEffect(() => {
    const process = async () => {
      setStatusMessage('Đang xử lý thanh toán...');
      const result = await purchasePremium(planId, paymentMethod);

      if (result && result.success) {
        setStatusMessage('Thanh toán thành công!');
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{
              name: 'PaymentSuccess',
              params: {
                transactionId: result.transaction.transactionCode,
                planName: selectedPlan?.name || 'Premium',
                planType: planType || selectedPlan?.type || 'premium',
                planDuration: planDuration || (selectedPlan?.type === 'yearly' ? 12 : 1),
              }
            }]
          });
        }, 800);
      } else {
        setStatusMessage('Thanh toán thất bại. Vui lòng thử lại.');
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{
              name: 'PaymentFailed',
              params: {
                transactionId: result?.transaction?.transactionCode || 'N/A',
                error: result?.transaction?.failureReason || 'Lỗi không xác định',
              }
            }]
          });
        }, 1200);
      }
    };

    process();
  }, [planId, paymentMethod]);

  // Animation effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pulseAnimation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.1],
  });

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
              { transform: [{ scale: pulseAnimation }] },
            ]}
          >
            <Text style={styles.processingIcon}>⏳</Text>
          </Animated.View>
        </View>
        
        <Text style={styles.statusMessage}>{statusMessage}</Text>
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />

      </View>

      <View style={[styles.cancelContainer, { paddingBottom: 32 }]}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Hủy giao dịch</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
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
    marginVertical: 40,
  },
  processingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2196F3',
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
