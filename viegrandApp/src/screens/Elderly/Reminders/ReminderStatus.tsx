import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface ReminderStatusProps {
  todayCount: number;
  tomorrowCount: number;
  completedCount: number;
}

const ReminderStatus: React.FC<ReminderStatusProps> = ({
  todayCount,
  tomorrowCount,
  completedCount,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tổng quan</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={[styles.statItem, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.statNumber, { color: '#0D4C92' }]}>{todayCount}</Text>
            <Text style={[styles.statLabel, { color: '#1976D2' }]}>Hôm nay</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={[styles.statItem, { backgroundColor: '#E8F4FD' }]}>
            <Text style={[styles.statNumber, { color: '#1E88E5' }]}>{tomorrowCount}</Text>
            <Text style={[styles.statLabel, { color: '#2196F3' }]}>Ngày mai</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={[styles.statItem, { backgroundColor: '#F3F9FF' }]}>
            <Text style={[styles.statNumber, { color: '#42A5F5' }]}>{completedCount}</Text>
            <Text style={[styles.statLabel, { color: '#64B5F6' }]}>Đã hoàn thành</Text>
          </View>
        </View>
      </View>

      {/* Thông báo nếu không có nhắc nhở nào */}
      {todayCount === 0 && tomorrowCount === 0 && completedCount === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>Chưa có nhắc nhở nào</Text>
          <Text style={styles.emptySubtitle}>
            Người thân sẽ tạo nhắc nhở cho bạn
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
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
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
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ReminderStatus; 