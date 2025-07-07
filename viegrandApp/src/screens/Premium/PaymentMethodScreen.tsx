import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { usePremium } from '../../contexts/PremiumContext';
import { PremiumStackParamList } from '../../types/navigation';
import { PaymentMethod, PaymentMethodType } from '../../types/premium';

interface PaymentMethodScreenProps {
  navigation: NavigationProp<PremiumStackParamList, 'PaymentMethod'>;
  route: RouteProp<PremiumStackParamList, 'PaymentMethod'>;
}

const PaymentMethodScreen: React.FC<PaymentMethodScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { planId, billingCycle } = route.params;
  const { plans, loading } = usePremium();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan = plans.find((plan) => plan.id === planId);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      type: 'credit_card',
      name: 'Thẻ tín dụng/Ghi nợ',
      description: 'Visa, MasterCard, American Express',
      icon: '💳',
      enabled: true,
      isAvailable: true,
      processingFee: 0,
    },
    {
      id: 'momo',
      type: 'e_wallet',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: '📱',
      enabled: true,
      isAvailable: true,
      processingFee: 0,
    },
    {
      id: 'zalopay',
      type: 'e_wallet',
      name: 'ZaloPay',
      description: 'Thanh toán qua ví điện tử ZaloPay',
      icon: '🔵',
      enabled: true,
      isAvailable: true,
      processingFee: 0,
    },
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua Internet Banking',
      icon: '🏦',
      enabled: true,
      isAvailable: true,
      processingFee: 0,
    },
    {
      id: 'apple_pay',
      type: 'digital_wallet',
      name: 'Apple Pay',
      description: 'Thanh toán qua Apple Pay',
      icon: '🍎',
      enabled: false,
      isAvailable: false, // Mock as unavailable
      processingFee: 0,
    },
  ];

  const handlePaymentMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
  };

  const handleProceedToPayment = async () => {
    if (!selectedMethod || !selectedPlan) {
      Alert.alert('Lỗi', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Navigate to payment processing screen
      navigation.navigate('PaymentProcessing', {
        planId,
        billingCycle,
        paymentMethod: selectedMethod,
        amount: selectedPlan.price,
      });
    } catch (error) {
      console.error('Payment navigation error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chuyển đến trang thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getBillingCycleText = (cycle: string): string => {
    switch (cycle) {
      case 'monthly':
        return 'hàng tháng';
      case 'quarterly':
        return 'hàng quý';
      case 'yearly':
        return 'hàng năm';
      default:
        return cycle;
    }
  };

  if (loading || !selectedPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn phương thức thanh toán</Text>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>Đơn hàng của bạn</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gói dịch vụ:</Text>
            <Text style={styles.summaryValue}>{selectedPlan.name}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Chu kỳ thanh toán:</Text>
            <Text style={styles.summaryValue}>{getBillingCycleText(billingCycle)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Giá:</Text>
            <Text style={styles.summaryValue}>{formatPrice(selectedPlan.price)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryTotalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.summaryTotalValue}>{formatPrice(selectedPlan.price)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodItem,
                selectedMethod === method.type && styles.selectedPaymentMethod,
                !method.isAvailable && styles.disabledPaymentMethod,
              ]}
              onPress={() => method.isAvailable && handlePaymentMethodSelect(method.type)}
              disabled={!method.isAvailable}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentMethodIcon}>
                  <Text style={styles.paymentMethodIconText}>{method.icon}</Text>
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={[
                    styles.paymentMethodName,
                    !method.isAvailable && styles.disabledText,
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={[
                    styles.paymentMethodDescription,
                    !method.isAvailable && styles.disabledText,
                  ]}>
                    {method.description}
                  </Text>
                  {method.processingFee > 0 && (
                    <Text style={styles.processingFee}>
                      Phí xử lý: {formatPrice(method.processingFee)}
                    </Text>
                  )}
                </View>
                <View style={styles.paymentMethodSelector}>
                  {selectedMethod === method.type && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                  )}
                  {!method.isAvailable && (
                    <Text style={styles.unavailableText}>Không khả dụng</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityTitle}>🔒 Bảo mật thanh toán</Text>
          <Text style={styles.securityText}>
            Tất cả thông tin thanh toán được mã hóa và bảo mật theo tiêu chuẩn quốc tế.
            Chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.continueContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedMethod || isProcessing) && styles.disabledButton,
          ]}
          onPress={handleProceedToPayment}
          disabled={!selectedMethod || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>
              Tiếp tục thanh toán
            </Text>
          )}
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  orderSummary: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentMethodsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  paymentMethodItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  disabledPaymentMethod: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentMethodIconText: {
    fontSize: 20,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
  },
  processingFee: {
    fontSize: 12,
    color: '#orange',
    marginTop: 4,
  },
  disabledText: {
    color: '#999',
  },
  paymentMethodSelector: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unavailableText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  securityNotice: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  continueContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentMethodScreen;
