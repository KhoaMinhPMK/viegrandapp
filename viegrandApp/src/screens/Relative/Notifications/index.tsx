import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { BackgroundImages } from '../../../utils/assetUtils';
import { useSocket } from '../../../contexts/SocketContext';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  date?: string;
  read?: boolean;
}

const RelativeNotificationsScreen = ({ navigation, route }: any) => {
  // Sử dụng thông báo real từ SocketContext
  const { notifications: socketNotifications, markAsRead, deleteNotification, isLoading } = useSocket();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Format thông báo từ SocketContext để phù hợp với UI
  const formattedNotifications = useMemo(() => {
    return socketNotifications.map(notification => {
      const createdAt = new Date(notification.createdAt);
      const now = new Date();
      const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      let dateLabel = '';
      if (diffHours < 24) {
        dateLabel = 'Hôm nay';
      } else if (diffHours < 48) {
        dateLabel = 'Hôm qua';
      } else {
        dateLabel = createdAt.toLocaleDateString('vi-VN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      }

      let timeLabel = '';
      if (diffHours < 1) {
        const diffMins = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
        timeLabel = `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        timeLabel = `${Math.floor(diffHours)} giờ trước`;
      } else {
        timeLabel = createdAt.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }

      return {
        id: notification.id,
        title: notification.title,
        message: notification.body,
        time: timeLabel,
        date: dateLabel,
        read: notification.isRead,
      };
    });
  }, [socketNotifications]);

  const handleMarkAllAsRead = async () => {
    const unreadIds = formattedNotifications
      .filter(notification => !notification.read)
      .map(notification => notification.id);
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    await markAsRead([id]);
  };

  const handleDeleteNotification = async (id: number) => {
    Alert.alert(
      'Xóa thông báo',
      'Bạn có chắc chắn muốn xóa thông báo này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            await deleteNotification([id]);
          }
        }
      ]
    );
  };

  const filteredNotifications = filter === 'all' 
    ? formattedNotifications 
    : formattedNotifications.filter(notification => !notification.read);

  // Nhóm thông báo theo ngày
  const groupedNotifications: { [key: string]: Notification[] } = {};
  filteredNotifications.forEach(notification => {
    const date = notification.date || 'Không xác định';
    if (!groupedNotifications[date]) {
      groupedNotifications[date] = [];
    }
    groupedNotifications[date].push(notification);
  });

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.read ? styles.readNotification : styles.unreadNotification,
      ]}
      onPress={() => handleMarkAsRead(item.id)}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item.id)}>
        <Feather name="trash-2" size={18} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = (date: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{date}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={48} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>Không có thông báo</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'unread' ? 'Tất cả thông báo đã được đọc' : 'Chưa có thông báo nào'}
      </Text>
    </View>
  );

  const renderNotificationsList = () => {
    const sections = Object.entries(groupedNotifications).map(([date, notifications]) => ({
      title: date,
      data: notifications,
    }));

    return (
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View>
            {renderSectionHeader(item.title)}
            {item.data.map((notification) => (
              <View key={notification.id}>
                {renderNotificationItem({ item: notification })}
              </View>
            ))}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={BackgroundImages.secondary} style={styles.backgroundImage} resizeMode="cover" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: '#007AFF' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Tất cả ({formattedNotifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
          onPress={() => setFilter('unread')}>
          <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
            Chưa đọc ({formattedNotifications.filter(n => !n.read).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mark All as Read Button */}
      {formattedNotifications.filter(n => !n.read).length > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
          <Feather name="check-double" size={16} color="#007AFF" />
          <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
        </TouchableOpacity>
      )}

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        renderNotificationsList()
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C7C7CC',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  readNotification: {
    opacity: 0.7,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RelativeNotificationsScreen; 