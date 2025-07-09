import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { usePremium } from '../../contexts/PremiumContext';
import { PremiumStackParamList } from '../../types/navigation';
import { PaymentTransaction } from '../../types/premium';

// --- Icons ---
const BackArrowIcon = () => <View style={styles.iconBackArrow} />;

// --- Helper Functions ---
const formatPrice = (price: number): string => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

const getStatusInfo = (status: string): { text: string; color: string; backgroundColor: string } => {
  switch (status) {
    case 'completed': return { text: 'Thành công', color: '#34C759', backgroundColor: 'rgba(52, 199, 89, 0.1)' };
    case 'failed': return { text: 'Thất bại', color: '#FF3B30', backgroundColor: 'rgba(255, 59, 48, 0.1)' };
    case 'pending':
    case 'processing': return { text: 'Đang xử lý', color: '#FF9500', backgroundColor: 'rgba(255, 149, 0, 0.1)' };
    case 'cancelled': return { text: 'Đã hủy', color: '#8A8A8E', backgroundColor: 'rgba(138, 138, 142, 0.1)' };
    case 'refunded': return { text: 'Đã hoàn tiền', color: '#007AFF', backgroundColor: 'rgba(0, 122, 255, 0.1)' };
    default: return { text: status, color: '#8A8A8E', backgroundColor: 'rgba(138, 138, 142, 0.1)' };
  }
};

const getPaymentMethodText = (method: string): string => {
    switch (method) {
      case 'credit_card': return 'Thẻ tín dụng';
      case 'momo': return 'Ví MoMo';
      case 'zalopay': return 'ZaloPay';
      default: return method;
    }
};

// --- Sub-components ---
const TransactionItem = ({ transaction }: { transaction: PaymentTransaction }) => {
  const status = getStatusInfo(transaction.status);
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <Text style={styles.transactionDescription} numberOfLines={1}>{transaction.description}</Text>
          <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.transactionAmount}>{formatPrice(transaction.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.transactionMeta}>
        {`Mã GD: ${transaction.transactionCode} - ${getPaymentMethodText(transaction.paymentMethod)}`}
      </Text>
    </TouchableOpacity>
  );
};

const FilterButton = ({ label, filterType, activeFilter, setFilter }: any) => (
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === filterType && styles.filterButtonActive]}
    onPress={() => setFilter(filterType)}
  >
    <Text style={[styles.filterButtonText, activeFilter === filterType && styles.filterButtonTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📂</Text>
        <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
        <Text style={styles.emptySubtitle}>Lịch sử thanh toán của bạn sẽ được hiển thị tại đây.</Text>
    </View>
);

const PaymentHistoryScreen: React.FC<{ navigation: NavigationProp<PremiumStackParamList> }> = ({ navigation }) => {
  const { transactions, loading, fetchTransactions } = usePremium();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');

  useFocusEffect(useCallback(() => { fetchTransactions() }, []));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter(t => filter === 'all' || t.status === filter);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử Giao dịch</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FilterButton label="Tất cả" filterType="all" activeFilter={filter} setFilter={setFilter} />
        <FilterButton label="Thành công" filterType="completed" activeFilter={filter} setFilter={setFilter} />
        <FilterButton label="Thất bại" filterType="failed" activeFilter={filter} setFilter={setFilter} />
        <FilterButton label="Đang xử lý" filterType="pending" activeFilter={filter} setFilter={setFilter} />
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}><ActivityIndicator /></View>
      ) : filteredTransactions.length === 0 ? (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <EmptyState />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredTransactions.map(t => <TransactionItem key={t.id} transaction={t} />)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#000' },
  headerRightPlaceholder: { width: 40, height: 40 },
  iconBackArrow: { width: 10, height: 10, borderLeftWidth: 2, borderTopWidth: 2, borderColor: '#8A8A8E', transform: [{ rotate: '-45deg' }] },

  // Filters
  filterContainer: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E5EA',
  },
  filterButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  filterButtonActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  filterButtonText: { fontSize: 15, fontWeight: '500', color: '#6A6A6E' },
  filterButtonTextActive: { color: '#007AFF' },
  
  // List
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft: { flex: 1, marginRight: 12 },
  cardRight: { alignItems: 'flex-end' },
  transactionDescription: { fontSize: 16, fontWeight: '500', color: '#1C1C1E', marginBottom: 4 },
  transactionDate: { fontSize: 14, color: '#8A8A8E' },
  transactionAmount: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 6 },
  transactionMeta: { fontSize: 13, color: '#8A8A8E', marginTop: 12, borderTopWidth: 1, borderTopColor: '#E5E5EA', paddingTop: 8 },

  // Status
  statusBadge: { borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: '30%',
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#8A8A8E', textAlign: 'center', lineHeight: 24 },
});

export default PaymentHistoryScreen;
