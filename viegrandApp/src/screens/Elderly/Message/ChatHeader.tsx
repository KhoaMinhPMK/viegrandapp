import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

interface ChatHeaderProps {
  name: string;
  avatar: string;
  isOnline?: boolean;
  lastSeen?: string;
  onBack: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onMenu?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  isOnline = false,
  lastSeen,
  onBack,
  onCall,
  onVideoCall,
  onMenu,
}) => {
  const getStatusText = () => {
    if (isOnline) return 'Đang hoạt động';
    if (lastSeen) return `Hoạt động ${lastSeen}`;
    return 'Không hoạt động';
  };

  const getStatusColor = () => {
    if (isOnline) return '#30D158';
    return '#8E8E93';
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F8F9FA']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* User Info */}
        <TouchableOpacity style={styles.userInfo} onPress={onMenu}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.statusText} numberOfLines={1}>
              {getStatusText()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {onCall && (
            <TouchableOpacity style={styles.actionButton} onPress={onCall}>
              <Feather name="phone" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
          
          {onVideoCall && (
            <TouchableOpacity style={styles.actionButton} onPress={onVideoCall}>
              <Feather name="video" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
          
          {onMenu && (
            <TouchableOpacity style={styles.actionButton} onPress={onMenu}>
              <Feather name="more-vertical" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50, // Safe area
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ChatHeader; 