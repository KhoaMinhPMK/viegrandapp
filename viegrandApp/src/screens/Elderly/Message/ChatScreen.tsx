import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import { sendMessage, getMessages, uploadChatImage, getUserPhone } from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';
import Feather from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { lastMessageStorage, LastMessage } from '../../../utils/lastMessageStorage';
import { launchImageLibrary } from 'react-native-image-picker';
import { useVoiceButton } from '../../../contexts/VoiceButtonContext';
import emergencyCallService from '../../../services/emergencyCall';

// Import new components
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import TypingIndicator from './TypingIndicator';

// Type definitions
interface Message {
  id: number;
  conversationId: string;
  senderPhone: string;
  receiverPhone: string;
  messageText: string;
  messageType: string;
  fileUrl?: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  requiresFriendship: boolean;
  friendshipStatus: string;
  senderName: string;
  isOwnMessage: boolean;
}

export type MessageStackParamList = {
  MessageList: undefined;
  Chat: {
    conversationId: string;
    name: string;
    avatar: string;
    receiverPhone: string; // Thêm receiver phone
  };
};

type ChatScreenProps = NativeStackScreenProps<MessageStackParamList, 'Chat'>;

const ChatScreen = ({ route, navigation }: ChatScreenProps) => {
  const { conversationId, name, avatar, receiverPhone } = route.params;
  const { user } = useAuth();
  const { socket } = useSocket();
  const { setIsVisible } = useVoiceButton();
  
  // Debug user data
  console.log('🔍 ChatScreen - User data:', {
    user: user,
    userPhone: user?.phone,
    conversationId,
    receiverPhone
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(!!socket?.connected);

  // Load user phone and messages
  useEffect(() => {
    const loadUserPhoneAndMessages = async () => {
      if (!conversationId || !user?.email) return;
      
      try {
        console.log('🔍 ChatScreen: Loading user phone for email:', user.email);
        const phoneResult = await getUserPhone(user.email);
        
        if (phoneResult.success && phoneResult.phone) {
          console.log('✅ ChatScreen: Got user phone:', phoneResult.phone);
          setUserPhone(phoneResult.phone);
          console.log('🔍 ChatScreen: userPhone state set to:', phoneResult.phone);
          
          // Load messages after getting phone
          await loadMessages(phoneResult.phone);
        } else {
          console.log('❌ ChatScreen: Failed to get user phone:', phoneResult.message);
          Alert.alert('Lỗi', 'Không thể lấy số điện thoại người dùng');
        }
      } catch (error) {
        console.error('❌ ChatScreen: Error loading user phone:', error);
        Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng');
      }
    };
    
    loadUserPhoneAndMessages();
  }, [conversationId, user?.email]);

  // Keep local isConnected state in sync and refresh on reconnect
  useEffect(() => {
    if (!socket) return;
    const handleConnect = () => {
      setIsConnected(true);
      if (userPhone) loadMessages(userPhone);
    };
    const handleDisconnect = () => setIsConnected(false);
    const handleReconnect = () => {
      setIsConnected(true);
      if (userPhone) loadMessages(userPhone);
    };

    // Initialize
    setIsConnected(!!socket.connected);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect as any);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect as any);
    };
  }, [socket, userPhone]);

  // Refresh messages when screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      // Hide voice button when entering chat
      console.log('📱 ChatScreen: Hiding voice button');
      setIsVisible(false);
      
      if (userPhone) {
        loadMessages(userPhone);
        // Reset auto-scroll flag when loading new messages
        hasAutoScrolledRef.current = false;
      }
      
      // Show voice button when leaving chat
      return () => {
        console.log('📱 ChatScreen: Showing voice button on cleanup');
        setIsVisible(true);
      };
    }, [userPhone, conversationId, setIsVisible])
  );

  // Wire socket listeners from shared socket
  useEffect(() => {
    if (!socket) return;

    const onChatMessage = (msg: any) => {
      // Only process if it belongs to this conversation (if provided)
      const msgConvId = msg?.conversationId || msg?.conversation_id;
      if (msgConvId && msgConvId !== conversationId) return;

      console.log('📨 App received direct chat message:', msg);
      let messageText = '';
      let senderName = 'Người dùng';
      let isOwnMessage = false;
      let messageType = 'text';
      let fileUrl: string | undefined = undefined;
      
      if (typeof msg === 'string') {
        messageText = msg;
        senderName = 'Người dùng';
        isOwnMessage = false;
        messageType = 'text';
      } else {
        messageText = msg.message || msg.message_text || '';
        senderName = msg.sender || msg.senderName || 'Người dùng';
        isOwnMessage = msg.sender === userPhone || msg.sender_phone === userPhone;
        messageType = msg.message_type || msg.messageType || (msg.file_url ? 'image' : 'text');
        fileUrl = msg.file_url || msg.fileUrl || undefined;
      }
      
      const displayText = messageType === 'image' && !messageText ? '[Hình ảnh]' : messageText;
      
      if (displayText || fileUrl) {
        let sentAt = new Date().toISOString();
        if (msg?.timestamp || msg?.sent_at) {
          try {
            const timestamp = msg.timestamp || msg.sent_at;
            if (typeof timestamp === 'string') {
              const date = new Date(timestamp);
              if (!isNaN(date.getTime())) sentAt = date.toISOString();
            }
          } catch {}
        }
        
        const newMessage: Message = {
          id: msg.id || Date.now(),
          conversationId: msgConvId || conversationId,
          senderPhone: msg.sender || msg.sender_phone || '',
          receiverPhone: msg.receiver || msg.receiver_phone || '',
          messageText: displayText,
          messageType,
          fileUrl,
          isRead: false,
          sentAt,
          requiresFriendship: true,
          friendshipStatus: 'friends',
          senderName,
          isOwnMessage,
        };
        setMessages(prev => [...prev, newMessage]);

        // Cache last message
        const saveLastMessage = async () => {
          const lastMessage: LastMessage = {
            conversationId: newMessage.conversationId,
            messageText: newMessage.messageType === 'image' ? '[Hình ảnh]' : newMessage.messageText,
            senderPhone: newMessage.senderPhone,
            receiverPhone: newMessage.receiverPhone,
            sentAt: newMessage.sentAt,
            senderName: newMessage.senderName,
            isOwnMessage: newMessage.isOwnMessage,
          };
          await lastMessageStorage.saveLastMessage(lastMessage);
        };
        saveLastMessage();
      }
    };

    const onMessageRead = (data: any) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.message_id 
          ? { ...msg, isRead: true, readAt: data.read_at }
          : msg
      ));
    };

    socket.on('chat message', onChatMessage);
    socket.on('message read', onMessageRead);

    return () => {
      socket.off('chat message', onChatMessage);
      socket.off('message read', onMessageRead);
    };
  }, [socket, conversationId, userPhone]);

  // Sửa loadMessages: KHÔNG reverse nữa
  const loadMessages = async (phone?: string) => {
    const userPhoneToUse = phone || userPhone;
    if (!conversationId || !userPhoneToUse) return;

    setIsLoadingMessages(true);
    try {
      const result = await getMessages(conversationId, userPhoneToUse);
      if (result.success && result.messages) {
        const sortedMessages = result.messages.sort((a, b) => 
          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        setMessages(sortedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tin nhắn!');
      return;
    }
    if (!userPhone) {
      Alert.alert('Lỗi', 'Không tìm thấy số điện thoại người dùng!');
      return;
    }

    try {
      const tempId = Date.now();
      const messageText = inputText.trim();
      const sentAtIso = new Date().toISOString();
      const newMessage: Message = {
        id: tempId,
        conversationId,
        senderPhone: userPhone,
        receiverPhone,
        messageText,
        messageType: 'text',
        isRead: false,
        sentAt: sentAtIso,
        requiresFriendship: true,
        friendshipStatus: 'friends',
        senderName: user?.fullName || 'Bạn',
        isOwnMessage: true,
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // 1) Realtime: gửi ngay lập tức qua socket (nếu có)
      if (socket) {
        socket.emit('send message', {
          conversationId,
          senderPhone: userPhone,
          receiverPhone,
          messageText,
          timestamp: sentAtIso,
          messageType: 'text',
        });
      }
      
      // 2) Persist: gửi lên backend để lưu DB và forward đảm bảo
      const messageResult = await sendMessage(
        conversationId,
        userPhone,
        receiverPhone,
        messageText,
        'text',
        undefined
      );
      
      if (messageResult.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { ...msg, id: messageResult.messageId || msg.id }
              : msg
          )
        );

        const lastMessage: LastMessage = {
          conversationId,
          messageText,
          senderPhone: userPhone,
          receiverPhone,
          sentAt: sentAtIso,
          senderName: user?.fullName || 'Bạn',
          isOwnMessage: true,
        };
        await lastMessageStorage.saveLastMessage(lastMessage);
      } else {
        Alert.alert('Lỗi', 'Không thể gửi tin nhắn: ' + messageResult.message);
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()));
    }
  };

  const handleSendImage = async () => {
    try {
      if (!userPhone) {
        Alert.alert('Lỗi', 'Không tìm thấy số điện thoại người dùng!');
        return;
      }

      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.didCancel) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      setIsUploadingImage(true);

      const tempId = Date.now();
      const tempSentAt = new Date().toISOString();
      const tempMessage: Message = {
        id: tempId,
        conversationId,
        senderPhone: userPhone,
        receiverPhone,
        messageText: '[Đang gửi hình ảnh...]',
        messageType: 'image',
        fileUrl: asset.uri,
        isRead: false,
        sentAt: tempSentAt,
        requiresFriendship: true,
        friendshipStatus: 'friends',
        senderName: user?.fullName || 'Bạn',
        isOwnMessage: true,
      };
      setMessages(prev => [...prev, tempMessage]);

      const uploadRes = await uploadChatImage({
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
      });

      if (!uploadRes.success || !uploadRes.data?.url) {
        setIsUploadingImage(false);
        setMessages(prev => prev.filter(m => m.id !== tempId));
        Alert.alert('Lỗi', uploadRes.message || 'Tải ảnh thất bại');
        return;
      }

      const fileUrl = uploadRes.data.url;
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, messageText: '', fileUrl } : m));

      // 1) Realtime: emit ngay lập tức
      if (socket) {
        socket.emit('send message', {
          conversationId,
          senderPhone: userPhone,
          receiverPhone,
          messageText: '',
          timestamp: new Date().toISOString(),
          messageType: 'image',
          fileUrl,
        });
      }

      // 2) Persist: gửi lên backend để lưu DB
      const messageResult = await sendMessage(
        conversationId,
        userPhone,
        receiverPhone,
        '',
        'image',
        fileUrl
      );

      setIsUploadingImage(false);

      if (messageResult.success) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: messageResult.messageId || m.id } : m));
        const lastMessage: LastMessage = {
          conversationId,
          messageText: '[Hình ảnh]',
          senderPhone: userPhone,
          receiverPhone,
          sentAt: new Date().toISOString(),
          senderName: user?.fullName || 'Bạn',
          isOwnMessage: true,
        };
        await lastMessageStorage.saveLastMessage(lastMessage);
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        Alert.alert('Lỗi', messageResult.message || 'Không thể gửi ảnh');
      }
    } catch (e: any) {
      setIsUploadingImage(false);
      Alert.alert('Lỗi', e.message || 'Không thể gửi ảnh');
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const prev = messages[index - 1];
    const showAvatar = !item.isOwnMessage && (
      index === 0 ||
      !prev ||
      prev.isOwnMessage ||
      prev.senderPhone !== item.senderPhone
    );

    return (
      <MessageBubble
        message={item}
        showAvatar={showAvatar}
        avatar={avatar}
        displayName={name}
      />
    );
  };

  const flatListRef = useRef<FlatList>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const isNearBottomRef = useRef(true);
  const hasAutoScrolledRef = useRef(false);

  const scrollToBottom = useCallback((animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      // Force scroll to bottom with multiple approaches
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated });
      }, 50);
      
      // Also try with requestAnimationFrame as backup
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated });
      });
    }
  }, [messages.length]);

  // Auto scroll once when messages first load
  useEffect(() => {
    if (messages.length > 0 && !hasAutoScrolledRef.current && !isLoadingMessages) {
      const delays = [0, 50, 120, 250, 400];
      delays.forEach(delay => setTimeout(() => scrollToBottom(false), delay));
      hasAutoScrolledRef.current = true;
    }
  }, [messages.length, isLoadingMessages, scrollToBottom]);

  // Also scroll to bottom when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      if (messages.length > 0) {
        const delays = [0, 60, 160];
        delays.forEach(d => setTimeout(() => scrollToBottom(false), d));
      }
      const showSub = Keyboard.addListener('keyboardDidShow', () => setTimeout(scrollToBottom, 50));
      return () => {
        showSub.remove();
      };
    }, [messages.length, scrollToBottom])
  );

  // Update near-bottom state on scroll
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const paddingToBottom = 120; // px threshold
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    isNearBottomRef.current = isNearBottom;
    setShowScrollToBottom(!isNearBottom && messages.length > 0);
  };

  // When new message arrives via socket, scroll if user at bottom or it's own message
  useEffect(() => {
    if (!socket) return;

    const onChatMessage = (msg: any) => {
      const msgConvId = msg?.conversationId || msg?.conversation_id;
      if (msgConvId && msgConvId !== conversationId) return;

      let messageText = '';
      let senderName = 'Người dùng';
      let isOwnMessage = false;
      let messageType = 'text';
      let fileUrl: string | undefined = undefined;
      
      if (typeof msg === 'string') {
        messageText = msg;
        senderName = 'Người dùng';
        isOwnMessage = false;
        messageType = 'text';
      } else {
        messageText = msg.message || msg.message_text || '';
        senderName = msg.sender || msg.senderName || 'Người dùng';
        isOwnMessage = msg.sender === userPhone || msg.sender_phone === userPhone;
        messageType = msg.message_type || msg.messageType || (msg.file_url ? 'image' : 'text');
        fileUrl = msg.file_url || msg.fileUrl || undefined;
      }
      
      const displayText = messageType === 'image' && !messageText ? '[Hình ảnh]' : messageText;
      
      if (displayText || fileUrl) {
        let sentAt = new Date().toISOString();
        if (msg?.timestamp || msg?.sent_at) {
          try {
            const timestamp = msg.timestamp || msg.sent_at;
            if (typeof timestamp === 'string') {
              const date = new Date(timestamp);
              if (!isNaN(date.getTime())) sentAt = date.toISOString();
            }
          } catch {}
        }
        
        const newMessage: Message = {
          id: msg.id || Date.now(),
          conversationId: msgConvId || conversationId,
          senderPhone: msg.sender || msg.sender_phone || '',
          receiverPhone: msg.receiver || msg.receiver_phone || '',
          messageText: displayText,
          messageType,
          fileUrl,
          isRead: false,
          sentAt,
          requiresFriendship: true,
          friendshipStatus: 'friends',
          senderName,
          isOwnMessage,
        };
        setMessages(prev => [...prev, newMessage]);

        // Auto scroll if user is near bottom or it's own message
        if (isNearBottomRef.current || isOwnMessage) setTimeout(scrollToBottom, 50);

        const saveLastMessage = async () => {
          const lastMessage: LastMessage = {
            conversationId: newMessage.conversationId,
            messageText: newMessage.messageType === 'image' ? '[Hình ảnh]' : newMessage.messageText,
            senderPhone: newMessage.senderPhone,
            receiverPhone: newMessage.receiverPhone,
            sentAt: newMessage.sentAt,
            senderName: newMessage.senderName,
            isOwnMessage: newMessage.isOwnMessage,
          };
          await lastMessageStorage.saveLastMessage(lastMessage);
        };
        saveLastMessage();
      }
    };

    const onMessageRead = (data: any) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.message_id 
          ? { ...msg, isRead: true, readAt: data.read_at }
          : msg
      ));
    };

    socket.on('chat message', onChatMessage);
    socket.on('message read', onMessageRead);

    return () => {
      socket.off('chat message', onChatMessage);
      socket.off('message read', onMessageRead);
    };
  }, [socket, conversationId, userPhone, scrollToBottom]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={styles.container}>
        <ChatHeader
          name={name}
          avatar={avatar}
          isOnline={isConnected}
          onBack={() => navigation.goBack()}
          onCall={() => {
            const target = receiverPhone || (messages.find(m => !m.isOwnMessage)?.senderPhone) || '';
            emergencyCallService.callNumber(target, name);
          }}
          onVideoCall={() => Alert.alert('Video call', 'Tính năng video call sẽ được thêm sau')}
        />

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={() => {
            if (messages.length > 0) {
              const delays = [0, 80];
              delays.forEach(d => setTimeout(() => scrollToBottom(false), d));
            }
          }}
          onContentSizeChange={() => {
            if (messages.length > 0 && (isNearBottomRef.current || !hasAutoScrolledRef.current)) {
              setTimeout(() => scrollToBottom(false), 40);
            }
          }}
          ListEmptyComponent={
            isLoadingMessages ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
                <Text style={styles.emptySubtext}>Bắt đầu trò chuyện với {name}</Text>
              </View>
            )
          }
        />

        {showScrollToBottom && (
          <TouchableOpacity style={styles.scrollToBottomBtn} onPress={() => scrollToBottom()} activeOpacity={0.8}>
            <Feather name="arrow-down" size={22} color="#fff" />
          </TouchableOpacity>
        )}

        <TypingIndicator isTyping={false} userName={name} />

        <InputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={() => { handleSend(); setTimeout(scrollToBottom, 50); }}
          onEmoji={() => Alert.alert('Emoji', 'Tính năng emoji sẽ được thêm sau')}
          onAttachment={() => { handleSendImage(); setTimeout(scrollToBottom, 100); }}
          onVoice={() => {}}
          placeholder={isUploadingImage ? 'Đang tải ảnh...' : 'Nhập tin nhắn...'}
          disabled={isUploadingImage}
          enableVoiceMode={user?.role === 'elderly'} // Only enable voice mode for elderly users
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollToBottomBtn: {
    position: 'absolute',
    right: 16,
    bottom: 88,
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});

export default ChatScreen; 