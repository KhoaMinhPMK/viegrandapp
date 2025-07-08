import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { usePremium } from '../../contexts/PremiumContext';
import { PremiumStackParamList } from '../../types/navigation';
import { PaymentTransaction } from '../../types/premium';

interface PaymentHistoryScreenProps {
  navigation: NavigationProp<PremiumStackParamList, 'PaymentHistory'>;
}

const PaymentHistoryScreen: React.FC<PaymentHistoryScreenProps> = ({ navigation }) => {
  const { transactions, loading, fetchTransactions, error } = usePremium();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleTransactionPress = (transaction: PaymentTransaction) => {
    Alert.alert(
      'Chi tiết giao dịch',
      `Mã: ${transaction.transactionCode}\n` +
      `Số tiền: ${formatPrice(transaction.amount)}\n` +
      `Trạng thái: ${getStatusText(transaction.status)}\n` +
      `Thời gian: ${formatDate(transaction.createdAt)}\n` +
      `Phương thức: ${getPaymentMethodText(transaction.paymentMethod)}\n` +
      `Mô tả: ${transaction.description}`,
      [
        { text: 'Đóng', style: 'cancel' },
        transaction.status === 'failed' && {
          text: 'Thử lại',
          onPress: () => handleRetryPayment(transaction),
        },
      ].filter(Boolean) as any
    );
  };

  const handleRetryPayment = async (transaction: PaymentTransaction) => {
    try {
      // Navigate back to payment with same plan
      navigation.navigate('PaymentMethod', { 
        planId: transaction.planId,
        billingCycle: 'monthly', // Default billing cycle for retry
      });
    } catch (error) {
      console.error('Retry payment error:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện lại thanh toán');
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'failed':
        return 'Thất bại';
      case 'pending':
        return 'Đang xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'cancelled':
        return 'Đã hủy';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#f44336';
      case 'pending':
      case 'processing':
        return '#FF9800';
      case 'cancelled':
        return '#9E9E9E';
      case 'refunded':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const getPaymentMethodText = (method: string): string => {
    switch (method) {
      case 'credit_card':
        return 'Thẻ tín dụng';
      case 'momo':
        return 'MoMo';
      case 'zalopay':
        return 'ZaloPay';
      case 'vnpay':
        return 'VNPay';
      default:
        return method;
    }
  };

  const getTypeText = (type: string): string => {
    switch (type) {
      case 'subscription':
        return 'Đăng ký';
      case 'renewal':
        return 'Gia hạn';
      case 'upgrade':
        return 'Nâng cấp';
      case 'refund':
        return 'Hoàn tiền';
      default:
        return type;
    }
  };

  const getFilteredTransactions = (): PaymentTransaction[] => {
    if (filter === 'all') {
      return transactions;
    }
    return transactions.filter(transaction => transaction.status === filter);
  };

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTransactionItem = (transaction: PaymentTransaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={styles.transactionItem}
      onPress={() => handleTransactionPress(transaction)}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCode}>{transaction.transactionCode}</Text>
          <Text style={styles.transactionType}>{getTypeText(transaction.type)}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={styles.amountText}>{formatPrice(transaction.amount)}</Text>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(transaction.status) }
          ]}>
            {getStatusText(transaction.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription} numberOfLines={2}>
          {transaction.description}
        </Text>
        <View style={styles.transactionMeta}>
          <Text style={styles.metaText}>
            {getPaymentMethodText(transaction.paymentMethod)}
          </Text>
          <Text style={styles.metaText}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
      </View>

      {transaction.status === 'failed' && (
        <View style={styles.failureInfo}>
          <Text style={styles.failureText}>
            Lý do: {transaction.failureReason || 'Không xác định'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💳</Text>
      <Text style={styles.emptyTitle}>Chưa có giao dịch nào</Text>
      <Text style={styles.emptySubtitle}>
        Lịch sử thanh toán sẽ xuất hiện ở đây sau khi bạn thực hiện giao dịch đầu tiên
      </Text>
    </View>
  );

  const filteredTransactions = getFilteredTransactions();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử thanh toán</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContainer}
        >
          {renderFilterButton('all', 'Tất cả')}
          {renderFilterButton('completed', 'Thành công')}
          {renderFilterButton('failed', 'Thất bại')}
          {renderFilterButton('pending', 'Đang xử lý')}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.transactionsList}>
            {filteredTransactions.map(renderTransactionItem)}
          </View>
        )}
      </ScrollView>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            Tổng: {filteredTransactions.length} giao dịch
          </Text>
          <Text style={styles.summaryAmount}>
            Tổng tiền: {formatPrice(
              filteredTransactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 60,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  transactionsList: {
    padding: 20,
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionDetails: {
    marginTop: 8,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  failureInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#f44336',
  },
  failureText: {
    fontSize: 12,
    color: '#f44336',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default PaymentHistoryScreen;
