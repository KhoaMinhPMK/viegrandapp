import React, { useState, useRef, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import NotificationDropdown from '../NotificationDropdown';
import PrivateKeyQRModal from '../PrivateKeyQRModal';
import { User, useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { getUserData } from '../../services/api';
import { showElderlyPremiumAlert } from '../../utils/elderlyPremiumAlert';

interface HeaderProps {
  user: User | null;
  isPremium: boolean;
  notifications: any[];
  unreadNotificationCount: number;
  onNotificationsUpdate: (notifications: any[]) => void;
  onConversationsRefresh?: () => void; // Optional callback to refresh conversations
}

const Header = memo(({ user, isPremium, notifications, unreadNotificationCount, onNotificationsUpdate, onConversationsRefresh }: HeaderProps) => {
  const navigation = useNavigation<any>();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const notificationButtonRef = useRef<any>(null);
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, right: 0 });
  
  // Get auth context for refreshing user data
  const { refreshUserProfile } = useAuth();
  
  // Get user phone from socket context for friend request handling
  const socketContext = useSocket();
  
  // Multi-fallback để lấy userPhone một cách đáng tin cậy
  const [userPhone, setUserPhone] = React.useState<string>('');
  
     React.useEffect(() => {
     const getUserPhone = async () => {
       console.log('🔍 Header: Getting user phone with fallbacks...', {
         userFromAuth: user,
         userPhone: user?.phone,
         userEmail: user?.email
       });
       
       // Try 1: AuthContext user
       if (user?.phone) {
         console.log('✅ Header: Got phone from AuthContext:', user.phone);
         setUserPhone(user.phone);
         return;
       }
       
       console.log('🔄 Header: AuthContext phone not found, trying AsyncStorage...');
       
       // Try 2: AsyncStorage
       try {
         const storedPhone = await AsyncStorage.getItem('user_phone');
         console.log('🔍 Header: AsyncStorage result:', storedPhone);
         if (storedPhone) {
           console.log('✅ Header: Got phone from AsyncStorage:', storedPhone);
           setUserPhone(storedPhone);
           return;
         }
       } catch (error) {
         console.log('❌ Header: AsyncStorage phone fetch failed:', error);
       }
       
       console.log('🔄 Header: AsyncStorage failed, trying API call...');
       
       // Try 3: Get from API if we have email
       if (user?.email) {
         try {
           console.log('🔄 Header: Calling getUserData API for email:', user.email);
           const result = await getUserData(user.email);
           console.log('🔍 Header: getUserData API result:', {
             success: result.success,
             userPhone: result.user?.phone,
             fullUser: result.user
           });
           
           if (result.success && result.user?.phone) {
             console.log('✅ Header: Got phone from getUserData API:', result.user.phone);
             setUserPhone(result.user.phone);
             // Save to AsyncStorage for next time
             await AsyncStorage.setItem('user_phone', result.user.phone);
             return;
           } else {
             console.log('❌ Header: getUserData returned no phone - user.phone is:', result.user?.phone);
           }
         } catch (error) {
           console.log('❌ Header: API phone fetch failed:', error);
         }
       } else {
         console.log('❌ Header: No user email available for API call');
       }
       
       console.log('❌ Header: No phone found from any source');
       setUserPhone(''); // Explicitly set empty string
     };
     
     getUserPhone();
   }, [user?.phone, user?.email]);
  
  console.log('🔍 Header: Final userPhone value:', userPhone);

  const handleToggleNotifications = () => {
    if (notificationButtonRef.current) {
      notificationButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setNotificationPosition({
          top: pageY + height,
          right: 20,
        });
        setShowNotifications(prev => !prev);
      });
    }
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleNavigateToPremium = () => {
    if (isPremium) {
      // If user is already premium, navigate to elderly premium info screen
      navigation.navigate('ElderlyPremiumInfo');
    } else {
      // If user is not premium, show the elderly alert
      showElderlyPremiumAlert();
    }
  };

  const handleOpenQRModal = async () => {
    // Refresh user data to get latest private key before showing modal
    try {
      console.log('🔄 Refreshing user data before showing QR modal...');
      await refreshUserProfile();
      setShowQRModal(true);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Still show modal even if refresh fails
      setShowQRModal(true);
    }
  };

  const handleMarkAllAsRead = () => {
    onNotificationsUpdate(notifications.map(n => ({ ...n, read: true })));
  };

  const handlePressNotification = (notification: any) => {
    onNotificationsUpdate(notifications.map(item => item.id === notification.id ? { ...item, read: true } : item));
    setShowNotifications(false);
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigation.navigate('Notifications', { notifications });
  };

  return (
    <>
      <View style={styles.container}>
          <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Chào buổi sáng</Text>
            <Text style={styles.userName}>{user?.fullName}</Text>
          </View>
            </View>
        <View style={styles.rightIcons}>
          {!isPremium && (
            <TouchableOpacity style={styles.premiumButton} onPress={handleNavigateToPremium}>
              <Feather name="zap" size={16} color="#FFC700" />
              <Text style={styles.premiumText}>Nâng cấp</Text>
                  </TouchableOpacity>
                )}
          
          {/* QR Code Button */}
          <TouchableOpacity 
            style={styles.qrButton} 
            onPress={handleOpenQRModal}
            activeOpacity={0.7}
          >
            <Feather name="grid" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity ref={notificationButtonRef} style={styles.notificationButton} onPress={handleToggleNotifications}>
            <Feather name="bell" size={24} color="#007AFF" />
            {unreadNotificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {showNotifications && (
      <NotificationDropdown 
        visible={showNotifications} 
        notifications={notifications} 
        onClose={handleCloseNotifications} 
        onMarkAllAsRead={handleMarkAllAsRead} 
        onPressNotification={handlePressNotification} 
        onViewAll={handleViewAllNotifications} 
        position={notificationPosition} 
          userPhone={userPhone}
        onConversationsRefresh={onConversationsRefresh}
      />
      )}
      
      {/* Private Key QR Modal */}
      <PrivateKeyQRModal 
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        privateKey={user?.privateKey || ''}
      />
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  greeting: {
    fontSize: 14,
    color: '#8A8A8E',
    marginBottom: 2,
  },
  userName: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#007AFF', 
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  premiumText: {
    color: '#FFC700',
    fontSize: 12,
    fontWeight: '600',
  },
  qrButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: 10,
  },
  notificationButton: { 
    backgroundColor: '#F2F2F7', 
    borderRadius: 20, 
    padding: 10, 
    position: 'relative' 
  },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F8F9FA',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Legacy styles - keeping for backward compatibility
  header: { backgroundColor: 'transparent', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  normalAvatar: { backgroundColor: '#F2F2F7' },
  premiumAvatar: { backgroundColor: 'transparent' },
  avatarGradient: { width: '100%', height: '100%', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  avatarTextNormal: { color: '#007AFF', fontSize: 18, fontWeight: '600' },
  userDetails: { flex: 1 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  upgradeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  upgradeText: { color: '#007AFF', fontSize: 11, fontWeight: '500' },
});

export default Header; 