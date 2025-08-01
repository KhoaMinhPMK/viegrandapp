import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface MessageBubbleProps {
  message: {
    id: number;
    messageText: string;
    sentAt: string;
    isRead: boolean;
    isOwnMessage: boolean;
    senderName: string;
    senderPhone: string;
  };
  showAvatar?: boolean;
  avatar?: string;
  isLastInGroup?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = false,
  avatar,
  isLastInGroup = false,
}) => {
  // Hàm tạo chữ viết tắt từ tên
  const getInitials = (name: string) => {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
  };

  // Hàm tạo màu background cho avatar dựa trên tên
  const getAvatarColor = (name: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Vừa xong';
    }
  };

  const getStatusIcon = () => {
    if (message.isRead) {
      return <Feather name="check-circle" size={14} color="#30D158" />;
    }
    return <Feather name="check" size={14} color="#8E8E93" />;
  };

  if (message.isOwnMessage) {
    return (
      <View style={styles.ownMessageContainer}>
        <View style={styles.ownMessageContent}>
          <View style={styles.ownBubble}>
            <Text style={styles.ownMessageText}>{message.messageText}</Text>
          </View>
          
          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>{formatTime(message.sentAt)}</Text>
            <View style={styles.statusContainer}>
              {getStatusIcon()}
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.otherMessageContainer}>
      {showAvatar && (
        <View style={[
          styles.avatar,
          { backgroundColor: getAvatarColor(message.senderName) }
        ]}>
          <Text style={styles.avatarText}>
            {getInitials(message.senderName)}
          </Text>
        </View>
      )}
      
      <View style={styles.otherMessageContent}>
        {showAvatar && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        
        <View style={styles.otherBubble}>
          <Text style={styles.otherMessageText}>{message.messageText}</Text>
        </View>
        
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>{formatTime(message.sentAt)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ownMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  ownMessageContent: {
    maxWidth: '75%',
    alignItems: 'flex-end',
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomRightRadius: 4,
  },
  ownMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
  },
  otherMessageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  otherMessageContent: {
    maxWidth: '75%',
  },
  senderName: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
    marginLeft: 4,
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomLeftRadius: 4,
  },
  otherMessageText: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginRight: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#8E8E93',
    marginRight: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MessageBubble; 