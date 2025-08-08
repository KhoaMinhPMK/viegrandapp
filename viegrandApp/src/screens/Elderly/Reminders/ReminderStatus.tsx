import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface ReminderStatusProps {
  todayCount: number;
  tomorrowCount: number;
  upcomingCount?: number;
  completedCount: number;
}

const ReminderStatus: React.FC<ReminderStatusProps> = ({
  todayCount,
  tomorrowCount,
  upcomingCount = 0,
  completedCount,
}) => {
  const totalCount = todayCount + tomorrowCount + upcomingCount + completedCount;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Feather name="bar-chart-2" size={20} color="#0D4C92" />
          <Text style={styles.title}>Tổng quan</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalCount}>{totalCount}</Text>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={[styles.statItem, { backgroundColor: '#E3F2FD' }]}>
            <View style={styles.statIconContainer}>
              <Feather name="clock" size={16} color="#0D4C92" />
            </View>
            <Text style={[styles.statNumber, { color: '#0D4C92' }]}>{todayCount}</Text>
            <Text style={[styles.statLabel, { color: '#1976D2' }]}>Hôm nay</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={[styles.statItem, { backgroundColor: '#E8F4FD' }]}>
            <View style={styles.statIconContainer}>
              <Feather name="calendar" size={16} color="#1E88E5" />
            </View>
            <Text style={[styles.statNumber, { color: '#1E88E5' }]}>{tomorrowCount}</Text>
            <Text style={[styles.statLabel, { color: '#2196F3' }]}>Ngày mai</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={[styles.statItem, { backgroundColor: '#FFF3E0' }]}>
            <View style={styles.statIconContainer}>
              <Feather name="calendar" size={16} color="#FF9800" />
            </View>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{upcomingCount}</Text>
            <Text style={[styles.statLabel, { color: '#FFB74D' }]}>Sắp tới</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={[styles.statItem, { backgroundColor: '#F3F9FF' }]}>
            <View style={styles.statIconContainer}>
              <Feather name="check-circle" size={16} color="#42A5F5" />
            </View>
            <Text style={[styles.statNumber, { color: '#42A5F5' }]}>{completedCount}</Text>
            <Text style={[styles.statLabel, { color: '#64B5F6' }]}>Đã hoàn thành</Text>
          </View>
        </View>
      </View>

      {/* Thông báo nếu không có nhắc nhở nào */}
      {totalCount === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Feather name="bell" size={32} color="#C7C7CC" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có nhắc nhở nào</Text>
          <Text style={styles.emptySubtitle}>
            Người thân sẽ tạo nhắc nhở cho bạn khi cần thiết
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  totalBadge: {
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  totalCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D4C92',
  },
  totalLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 16,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default ReminderStatus; 