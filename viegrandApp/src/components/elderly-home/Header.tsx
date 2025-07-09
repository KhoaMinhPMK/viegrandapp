import React, { useState, useRef, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import NotificationDropdown from '../NotificationDropdown';
import { User } from '../../contexts/AuthContext'; // Assuming User type is exported from AuthContext

interface HeaderProps {
  user: User | null;
  isPremium: boolean;
  notifications: any[]; // Replace with a proper Notification type
  onNotificationsUpdate: (notifications: any[]) => void;
}

const getAvatarText = (fullName: string | undefined) => {
  if (!fullName) return '';
  const names = fullName.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
};

const Header = memo(({ user, isPremium, notifications, onNotificationsUpdate }: HeaderProps) => {
  const navigation = useNavigation<any>();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, right: 0 });
  const notificationButtonRef = useRef<TouchableOpacity>(null);

  const handleToggleNotifications = useCallback(() => {
    if (notificationButtonRef.current) {
      notificationButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setNotificationPosition({
          top: pageY + height,
          right: 20,
        });
        setShowNotifications(prev => !prev);
      });
    }
  }, []);

  const handleCloseNotifications = useCallback(() => setShowNotifications(false), []);

  const handleMarkAllAsRead = useCallback(() => {
    onNotificationsUpdate(prev => prev.map(n => ({ ...n, read: true })));
  }, [onNotificationsUpdate]);

  const handlePressNotification = useCallback((notification: any) => {
    onNotificationsUpdate(prev => prev.map(item => item.id === notification.id ? { ...item, read: true } : item));
    setShowNotifications(false);
  }, [onNotificationsUpdate]);

  const handleViewAllNotifications = useCallback(() => {
    setShowNotifications(false);
    navigation.navigate('Notifications', { notifications });
  }, [navigation, notifications]);

  const handleUpgradePress = useCallback(() => {
      navigation.navigate('Premium');
  }, [navigation]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={[styles.avatarContainer, isPremium ? styles.premiumAvatar : styles.normalAvatar]}>
              {isPremium ? (
                <LinearGradient colors={['#007AFF', '#5856D6']} style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>{getAvatarText(user?.fullName)}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.avatarTextNormal}>{getAvatarText(user?.fullName)}</Text>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.fullName || 'Đang tải...'}</Text>
              <View style={styles.statusContainer}>
                {isPremium ? (
                  <LinearGradient colors={['#007AFF', '#5856D6']} style={styles.premiumBadge}>
                    <Feather name="award" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.premiumText}>Premium</Text>
                  </LinearGradient>
                ) : (
                  <TouchableOpacity style={styles.upgradeBadge} onPress={handleUpgradePress}>
                    <Feather name="award" size={14} color="#007AFF" style={{ marginRight: 6 }} />
                    <Text style={styles.upgradeText}>Nâng cấp Premium</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity ref={notificationButtonRef} style={styles.notificationButton} onPress={handleToggleNotifications}>
            <Feather name="bell" size={24} color="#007AFF" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <NotificationDropdown 
        visible={showNotifications} 
        notifications={notifications} 
        onClose={handleCloseNotifications} 
        onMarkAllAsRead={handleMarkAllAsRead} 
        onPressNotification={handlePressNotification} 
        onViewAll={handleViewAllNotifications} 
        position={notificationPosition} 
      />
    </>
  );
});

const styles = StyleSheet.create({
  header: { backgroundColor: 'transparent', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  normalAvatar: { backgroundColor: '#F2F2F7' },
  premiumAvatar: { backgroundColor: 'transparent' },
  avatarGradient: { width: '100%', height: '100%', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  avatarTextNormal: { color: '#007AFF', fontSize: 18, fontWeight: '600' },
  userDetails: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '600', color: '#007AFF', marginBottom: 5 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  premiumText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  upgradeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  upgradeText: { color: '#007AFF', fontSize: 11, fontWeight: '500' },
  notificationButton: { backgroundColor: '#F2F2F7', borderRadius: 20, padding: 10, position: 'relative' },
  notificationBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#FF3B30', borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  notificationCount: { color: '#FFFFFF', fontSize: 9, fontWeight: '600' },
});

export default Header; 