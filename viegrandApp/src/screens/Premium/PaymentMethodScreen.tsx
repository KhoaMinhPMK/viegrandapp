import React, { useState, useMemo } from 'react';
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
import { PaymentMethod as PaymentMethodType, PremiumPlan } from '../../types/premium';


// --- Icons ---
const BackArrowIcon = () => <View style={styles.iconBackArrow} />;
const CheckIcon = () => (
    <View style={styles.iconCheckContainer}>
        <View style={styles.iconCheckMark} />
    </View>
);

const PaymentMethodScreen: React.FC<{
  navigation: NavigationProp<PremiumStackParamList, 'PaymentMethod'>;
  route: RouteProp<PremiumStackParamList, 'PaymentMethod'>;
}> = ({ navigation, route }) => {
  const { plan } = route.params as { plan: PremiumPlan };
  const { isPurchasing, selectPaymentMethod } = usePremium();
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>('credit_card');


  const { paymentMethods, fetchPaymentMethods } = usePremium();
  
  // Load payment methods on mount
  React.useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Fallback payment methods if API fails
  const fallbackPaymentMethods: PaymentMethodType[] = useMemo(() => [
    { id: 'credit_card', type: 'credit_card', name: 'Thẻ Tín dụng / Ghi nợ', description: 'Visa, Mastercard', icon: '💳', enabled: true, isAvailable: true, processingFee: 0 },
    { id: 'momo', type: 'e_wallet', name: 'Ví MoMo', description: 'Thanh toán qua MoMo', icon: '🐷', enabled: true, isAvailable: true, processingFee: 0 },
    { id: 'zalopay', type: 'e_wallet', name: 'ZaloPay', description: 'Thanh toán qua ZaloPay', icon: '🔵', enabled: true, isAvailable: true, processingFee: 0 },
    { id: 'vnpay', type: 'e_wallet', name: 'VNPay', description: 'Thanh toán qua VNPay', icon: '🏦', enabled: true, isAvailable: true, processingFee: 0 },
  ], []);

  // Use API data or fallback
  const availablePaymentMethods = paymentMethods.length > 0 ? paymentMethods : fallbackPaymentMethods;

  const handleSelectMethod = (method: PaymentMethodType) => {
    if (!method.isAvailable) return;
    setSelectedMethodId(method.id);
    selectPaymentMethod(method);
  };
  
  const handleProceedToPayment = async () => {
    if (!selectedMethodId || !plan) {
      Alert.alert('Lỗi', 'Vui lòng chọn phương thức thanh toán.');
      return;
    }
    navigation.navigate('PaymentProcessing', {
      planId: plan.id,
      paymentMethod: selectedMethodId,
      amount: plan.price,
      billingCycle: plan.type,
      planType: plan.type,
      planDuration: plan.type === 'yearly' ? 12 : 1,
    });
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  const getBillingCycleText = (type: string) => (type === 'monthly' ? 'mỗi tháng' : 'mỗi năm');

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}><ActivityIndicator /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận và Thanh toán</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.contentContainer}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gói dịch vụ</Text>
                <Text style={styles.summaryValue}>{plan.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Thanh toán</Text>
                <Text style={styles.summaryValue}>{getBillingCycleText(plan.type)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
                <Text style={styles.summaryTotalValue}>{formatPrice(plan.price)}</Text>
              </View>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn phương thức</Text>
            <View style={styles.card}>
              {availablePaymentMethods.map((method, index) => (
                <React.Fragment key={method.id}>
                  <TouchableOpacity
                    style={styles.paymentMethodRow}
                    onPress={() => handleSelectMethod(method)}
                    disabled={!method.isAvailable}
                  >
                    <View style={styles.paymentMethodIcon}>
                      <Text style={styles.paymentMethodIconText}>{method.icon || '💳'}</Text>
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodName}>{method.name}</Text>
                      <Text style={styles.paymentMethodDesc}>{method.description || ''}</Text>
                    </View>
                    {selectedMethodId === method.id && <CheckIcon />}
                  </TouchableOpacity>
                  {index < availablePaymentMethods.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
          
           {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.securityText}>🔒 Thông tin của bạn được mã hoá và bảo vệ an toàn.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { paddingBottom: 32 }]}>
        <TouchableOpacity
          style={[styles.continueButton, (!selectedMethodId || isPurchasing) && styles.disabledButton]}
          onPress={handleProceedToPayment}
          disabled={!selectedMethodId || isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>{`Thanh toán ${formatPrice(plan.price)}`}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E5EA',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#000' },
  headerRightPlaceholder: { width: 40, height: 40 },
  
  // Content
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 12, paddingHorizontal: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16 },

  // Summary Card
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 16, color: '#000', fontWeight: '500' },
  summaryTotalLabel: { fontSize: 16, color: '#000', fontWeight: 'bold' },
  summaryTotalValue: { fontSize: 20, color: '#000', fontWeight: 'bold' },
  
  // Payment Method Card
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  paymentMethodIcon: { fontSize: 24, marginRight: 16 },
  paymentMethodIconText: { fontSize: 24 },
  paymentMethodInfo: { flex: 1 },
  paymentMethodName: { fontSize: 16, fontWeight: '500', color: '#000' },
  paymentMethodDesc: { fontSize: 14, color: '#8A8A8E', marginTop: 2 },
  
  // Common
  divider: { height: 1, backgroundColor: '#E5E5EA', marginLeft: 52 },

  // Security
  securityNotice: { alignItems: 'center', paddingVertical: 16 },
  securityText: { fontSize: 13, color: '#8A8A8E' },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 32, // Keep a base padding
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { backgroundColor: '#C7C7CC' },
  continueButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  
  // Icons
  iconBackArrow: { width: 10, height: 10, borderLeftWidth: 2, borderTopWidth: 2, borderColor: '#8A8A8E', transform: [{ rotate: '-45deg' }] },
  iconCheckContainer: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#34C759', alignItems: 'center', justifyContent: 'center' },
  iconCheckMark: { width: 6, height: 11, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#FFF', transform: [{ rotate: '45deg' }], marginBottom: 2 },
});

export default PaymentMethodScreen;
