import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { acceptFriendRequest, rejectFriendRequest, getConversationsList } from '../services/api';

interface FriendRequestModalProps {
  visible: boolean;
  notification: any;
  userPhone: string;
  onClose: () => void;
  onSuccess: (action: 'accepted' | 'rejected') => void;
}

const FriendRequestModal: React.FC<FriendRequestModalProps> = ({
  visible,
  notification,
  userPhone,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!notification || notification.type !== 'friend_request_received') {
    return null;
  }

  // Parse notification data
  const data = typeof notification.data === 'string' 
    ? JSON.parse(notification.data) 
    : notification.data;

  console.log('🔍 FriendRequestModal: Debug notification data:', {
    notification: notification,
    dataType: typeof notification.data,
    parsedData: data,
    userPhone: userPhone
  });

  const fromName = data?.from_name || 'Người dùng';
  const message = data?.message || 'Muốn kết bạn với bạn.';
  const requestId = data?.request_id;

  console.log('🔍 FriendRequestModal: Extracted values:', {
    fromName,
    message,
    requestId,
    userPhone,
    requestIdType: typeof requestId
  });

  // Generate avatar from name
  const getAvatarText = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        return `${Math.floor(diffHours)} giờ trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }
    } catch {
      return 'Vừa xong';
    }
  };

  const handleAccept = async () => {
    console.log('🔄 FriendRequestModal: handleAccept called with:', {
      requestId,
      userPhone,
      requestIdExists: !!requestId,
      userPhoneExists: !!userPhone,
      requestIdValue: requestId,
      userPhoneValue: userPhone
    });

    if (!requestId || !userPhone) {
      console.log('❌ FriendRequestModal: Validation failed - missing required data');
      Alert.alert('Lỗi', `Thông tin không đầy đủ để xử lý yêu cầu.\n\nRequestId: ${requestId}\nUserPhone: ${userPhone}`);
      return;
    }

    setLoading(true);
    console.log('🔄 FriendRequestModal: Accepting request:', { requestId, userPhone });

    try {
      const result = await acceptFriendRequest(parseInt(requestId), userPhone);
      
      if (result.success) {
        console.log('✅ FriendRequestModal: Accept successful');
        
        // Refresh conversations list after successful accept
        try {
          console.log('🔄 FriendRequestModal: Refreshing conversations list...');
          const conversationsResult = await getConversationsList(userPhone);
          if (conversationsResult.success) {
            console.log('✅ FriendRequestModal: Conversations list refreshed successfully');
          } else {
            console.log('⚠️ FriendRequestModal: Failed to refresh conversations list:', conversationsResult.message);
          }
        } catch (refreshError) {
          console.error('❌ FriendRequestModal: Error refreshing conversations list:', refreshError);
        }
        
        Alert.alert(
          'Thành công!',
          `Bạn và ${fromName} giờ đã là bạn bè! 🎉`,
          [{ text: 'Tuyệt vời!', onPress: () => {
            onSuccess('accepted');
            onClose();
          }}]
        );
        
      } else {
        console.log('❌ FriendRequestModal: Accept failed:', result.message);
        Alert.alert('Lỗi', result.message || 'Không thể chấp nhận lời mời kết bạn');
      }
    } catch (error) {
      console.error('❌ FriendRequestModal: Accept error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chấp nhận lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!requestId || !userPhone) {
      Alert.alert('Lỗi', 'Thông tin không đầy đủ để xử lý yêu cầu');
      return;
    }

    setLoading(true);
    console.log('🔄 FriendRequestModal: Rejecting request:', { requestId, userPhone });

    try {
      const result = await rejectFriendRequest(parseInt(requestId), userPhone);
      
      if (result.success) {
        console.log('✅ FriendRequestModal: Reject successful');
        Alert.alert(
          'Đã từ chối',
          'Lời mời kết bạn đã được từ chối.',
          [{ text: 'OK', onPress: () => {
            onSuccess('rejected');
            onClose();
          }}]
        );
      } else {
        console.log('❌ FriendRequestModal: Reject failed:', result.message);
        Alert.alert('Lỗi', result.message || 'Không thể từ chối lời mời kết bạn');
      }
    } catch (error) {
      console.error('❌ FriendRequestModal: Reject error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi từ chối lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Lời mời kết bạn</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#8A8A8E" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#007AFF', '#5856D6']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{getAvatarText(fromName)}</Text>
              </LinearGradient>
            </View>

            {/* User info */}
            <Text style={styles.userName}>{fromName}</Text>
            <Text style={styles.timeText}>{formatTime(notification.createdAt)}</Text>

            {/* Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>"{message}"</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={handleReject}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <>
                    <Feather name="x" size={20} color="#FF3B30" />
                    <Text style={styles.rejectButtonText}>Từ chối</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={handleAccept}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Feather name="check" size={20} color="white" />
                    <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#8A8A8E',
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  messageText: {
    fontSize: 16,
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
  },
  rejectButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendRequestModal; 