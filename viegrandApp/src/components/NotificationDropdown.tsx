import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

interface NotificationDropdownProps {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onPressNotification: (notification: Notification) => void;
  onViewAll: () => void;
  position: { top: number; right: number };
}

const NotificationDropdown = ({
  visible,
  notifications,
  onClose,
  onMarkAllAsRead,
  onPressNotification,
  onViewAll,
  position,
}: NotificationDropdownProps) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const opacity = animatedValue;

  if (!visible) return null;

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.overlay}
      onPress={onClose}>
      <Animated.View
        style={[
          styles.container,
          {
            top: position.top + 10,
            right: position.right,
            opacity,
            transform: [{ translateY }],
          },
        ]}>
        {/* Arrow pointing up */}
        <View style={[styles.arrow, { right: 20 }]} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <TouchableOpacity onPress={onMarkAllAsRead}>
            <Text style={styles.markAllRead}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.notificationList}
          showsVerticalScrollIndicator={false}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  notification.read ? styles.readNotification : styles.unreadNotification,
                ]}
                onPress={() => onPressNotification(notification)}>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                </View>
                {!notification.read && <View style={styles.unreadIndicator} />}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="bell-off" size={24} color="#999" />
              <Text style={styles.emptyText}>Không có thông báo mới</Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.footer} onPress={onViewAll}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    width: width * 0.85,
    maxHeight: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
  },
  arrow: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    zIndex: 1002,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  markAllRead: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
  },
  notificationList: {
    maxHeight: 320,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
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
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#3C3C43',
    lineHeight: 18,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
});

export default NotificationDropdown; 