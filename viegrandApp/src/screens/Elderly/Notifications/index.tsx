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

const NotificationsScreen = ({ navigation, route }: any) => {
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
      <Text style={styles.sectionHeaderText}>{date}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>Không có thông báo nào</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={BackgroundImages.secondary} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllText}>Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText,
            ]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('unread')}>
          <Text
            style={[
              styles.filterText,
              filter === 'unread' && styles.activeFilterText,
            ]}>
            Chưa đọc
          </Text>
        </TouchableOpacity>
      </View>

      {Object.keys(groupedNotifications).length > 0 ? (
        <FlatList
          data={Object.keys(groupedNotifications)}
          keyExtractor={(date) => date}
          renderItem={({ item: date }) => (
            <View>
              {renderSectionHeader(date)}
              {groupedNotifications[date].map((notification) => (
                <View key={notification.id}>
                  {renderNotificationItem({ item: notification })}
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.notificationList}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F2F2F7',
  },
  activeFilterButton: {
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
  notificationList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  readNotification: {
    backgroundColor: '#FFFFFF',
  },
  unreadNotification: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginHorizontal: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
});

export default NotificationsScreen; 