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
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleIconContainer}>
            <Feather name="bar-chart-2" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Tổng quan nhắc nhở</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalCount}>{totalCount}</Text>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
        </View>
      </View>
      
      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          {/* Today */}
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#0D4C92' }]}>
                <Feather name="clock" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.statNumber, { color: '#0D4C92' }]}>{todayCount}</Text>
            </View>
            <Text style={[styles.statLabel, { color: '#1976D2' }]}>Hôm nay</Text>
          </View>
          
          {/* Tomorrow */}
          <View style={[styles.statCard, { backgroundColor: '#E8F4FD' }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#1E88E5' }]}>
                <Feather name="calendar" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.statNumber, { color: '#1E88E5' }]}>{tomorrowCount}</Text>
            </View>
            <Text style={[styles.statLabel, { color: '#2196F3' }]}>Ngày mai</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          {/* Upcoming */}
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FF9800' }]}>
                <Feather name="calendar" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{upcomingCount}</Text>
            </View>
            <Text style={[styles.statLabel, { color: '#FFB74D' }]}>Sắp tới</Text>
          </View>
          
          {/* Completed */}
          <View style={[styles.statCard, { backgroundColor: '#F3F9FF' }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#42A5F5' }]}>
                <Feather name="check-circle" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.statNumber, { color: '#42A5F5' }]}>{completedCount}</Text>
            </View>
            <Text style={[styles.statLabel, { color: '#64B5F6' }]}>Đã hoàn thành</Text>
          </View>
        </View>
      </View>

      {/* Empty State */}
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
    padding: 20,
    shadowColor: '#0D4C92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D4C92',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalBadge: {
    backgroundColor: '#F8FAFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  totalCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D4C92',
  },
  totalLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 2,
  },
  statsContainer: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
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