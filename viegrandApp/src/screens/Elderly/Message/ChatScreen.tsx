import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import io from 'socket.io-client';
import { getMessages, sendMessage, markMessageAsRead, getUserPhone, uploadChatImage } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { lastMessageStorage, LastMessage } from '../../../utils/lastMessageStorage';
import { launchImageLibrary } from 'react-native-image-picker';

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
  
  // Debug user data
  console.log('🔍 ChatScreen - User data:', {
    user: user,
    userPhone: user?.phone,
    conversationId,
    receiverPhone
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Sử dụng ref để tránh multiple connections
  const socketRef = useRef<any>(null);
  const isConnectingRef = useRef<boolean>(false);

  useEffect(() => {
    // Tránh tạo multiple connections
    if (isConnectingRef.current || socketRef.current) {
      console.log('Socket already exists or connecting, skipping...');
      return;
    }

    console.log('🚀 Bắt đầu kết nối socket...');
    isConnectingRef.current = true;

    // Kết nối socket
    const newSocket = io("https://chat.viegrand.site", {
      forceNew: true, // Đảm bảo connection mới
      timeout: 10000, // 10 giây timeout
    });
    
    newSocket.on('connect', () => {
      console.log('✅ Đã kết nối socket:', newSocket.id);
      setIsConnected(true);
      
      // Không join conversation room để tránh duplicate
      // Chỉ đăng ký với phone number
      console.log('🔗 Direct messaging mode - no room joining');
      
      // Đăng ký với server
      if (userPhone) {
        newSocket.emit('register', userPhone);
        console.log('📞 App registered with phone:', userPhone);
      } else {
        console.log('⚠️ No userPhone available for registration');
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket đã ngắt kết nối:', reason);
      setIsConnected(false);
    });

    // Nhận tin nhắn mới từ server (chỉ tin nhắn trực tiếp, không phải từ conversation room)
    newSocket.on('chat message', (msg: any) => {
      console.log('📨 App received direct chat message:', msg);
      console.log('📨 Message type:', typeof msg);
      console.log('📨 Current userPhone:', userPhone);
      console.log('📨 Current conversationId:', conversationId);
      
      // Bỏ qua định dạng cũ dạng string để tránh nhiễu hội thoại khác
      if (typeof msg === 'string') {
        console.log('⏭️ Ignoring legacy string message');
        return;
      }

      const targetConversationId = msg.conversationId || msg.conversation_id;
      const targetSender = msg.sender || msg.sender_phone;
      const targetReceiver = msg.receiver || msg.receiver_phone;

      // Chỉ xử lý tin nhắn thuộc đúng conversation hiện tại
      if (!targetConversationId || targetConversationId !== conversationId) {
        console.log('⏭️ Ignoring message for different conversation:', targetConversationId);
        return;
      }

      // Xác thực cặp người gửi/nhận thuộc cặp đang chat
      const isForThisPair = (
        (targetSender === receiverPhone && targetReceiver === userPhone) ||
        (targetSender === userPhone && targetReceiver === receiverPhone)
      );
      if (!isForThisPair) {
        console.log('⏭️ Ignoring message not matching this user pair', { targetSender, targetReceiver, receiverPhone, userPhone });
        return;
      }

      // Bỏ qua tin nhắn tự gửi để tránh duplicate
      if (targetSender === userPhone) {
        console.log('🚫 Skipping self-sent message duplicate');
        return;
      }

      const messageType = msg.message_type || msg.messageType || (msg.file_url ? 'image' : 'text');
      const fileUrl: string | undefined = msg.file_url || msg.fileUrl || undefined;
      const messageTextRaw = msg.message || msg.message_text || '';

      // Nếu là ảnh và không có text → hiển thị nhãn
      const displayText = messageType === 'image' && !messageTextRaw ? '[Hình ảnh]' : messageTextRaw;
      if (!displayText && !fileUrl) return;

      // Xử lý timestamp
      let sentAt = new Date().toISOString();
      if (msg.timestamp || msg.sent_at) {
        try {
          const timestamp = msg.timestamp || msg.sent_at;
          if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) sentAt = date.toISOString();
          }
        } catch (error) {
          console.log('⚠️ Invalid timestamp, using current time:', msg.timestamp);
        }
      }
      
      const newMessage: Message = {
        id: msg.id || Date.now(),
        conversationId: targetConversationId,
        senderPhone: targetSender || '',
        receiverPhone: targetReceiver || '',
        messageText: displayText,
        messageType: messageType,
        fileUrl: fileUrl,
        isRead: false,
        sentAt: sentAt,
        requiresFriendship: true,
        friendshipStatus: 'friends',
        senderName: msg.senderName || 'Người dùng',
        isOwnMessage: false,
      };
      
      console.log('📨 Adding new message to app:', newMessage);
      setMessages(prev => [...prev, newMessage]);

      // Lưu tin nhắn cuối cùng vào bộ nhớ đệm
      const saveLastMessage = async () => {
        const lastMessage: LastMessage = {
          conversationId: newMessage.conversationId,
          messageText: newMessage.messageType === 'image' ? '[Hình ảnh]' : newMessage.messageText,
          senderPhone: newMessage.senderPhone,
          receiverPhone: newMessage.receiverPhone,
          sentAt: newMessage.sentAt,
          senderName: newMessage.senderName,
          isOwnMessage: newMessage.isOwnMessage
        };
        await lastMessageStorage.saveLastMessage(lastMessage);
      };
      saveLastMessage();
    });

    // Nhận thông báo tin nhắn đã đọc
    newSocket.on('message read', (data: any) => {
      console.log('👁️ Tin nhắn đã đọc:', data);
      setMessages(prev => prev.map(msg => 
        msg.id === data.message_id 
          ? { ...msg, isRead: true, readAt: data.read_at }
          : msg
      ));
    });

    newSocket.on('connect_error', (error: any) => {
      console.log('💥 Lỗi kết nối socket:', error);
      Alert.alert('Lỗi', 'Không thể kết nối socket: ' + error.message);
      isConnectingRef.current = false;
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    isConnectingRef.current = false;

    // Cleanup khi component unmount
    return () => {
      console.log('🧹 Cleanup socket connection...');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, []); // Chỉ chạy 1 lần khi mount

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

  // Monitor userPhone state changes
  useEffect(() => {
    console.log('🔍 ChatScreen - userPhone state changed:', userPhone);
    if (userPhone && socket && isConnected) {
      socket.emit('register', userPhone);
      console.log('📞 Re-registered with new phone:', userPhone);
    }
  }, [userPhone, socket, isConnected]);

  // Sửa loadMessages: KHÔNG reverse nữa
  const loadMessages = async (phone?: string) => {
    const userPhoneToUse = phone || userPhone;
    if (!conversationId || !userPhoneToUse) return;

    setIsLoadingMessages(true);
    try {
      const result = await getMessages(conversationId, userPhoneToUse);
      if (result.success && result.messages) {
        // Sắp xếp tin nhắn từ cũ đến mới (cũ ở trên, mới ở dưới)
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

  // Cleanup khi navigate away
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      console.log('🚪 Navigate away - disconnect socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleSend = async () => {
    console.log('🔍 handleSend - Debug info:', {
      inputText: inputText,
      inputTextTrim: inputText.trim(),
      inputTextLength: inputText.trim().length,
      userPhone: userPhone,
      userPhoneType: typeof userPhone,
      userPhoneLength: userPhone?.length,
      isConnected: isConnected,
      conversationId: conversationId,
      receiverPhone: receiverPhone,
      routeParams: route.params
    });

    if (!inputText.trim()) {
      console.log('❌ handleSend - Input text is empty');
      Alert.alert('Lỗi', 'Vui lòng nhập tin nhắn!');
      return;
    }

    if (!userPhone) {
      console.log('❌ handleSend - User phone is missing');
      Alert.alert('Lỗi', 'Không tìm thấy số điện thoại người dùng!');
      return;
    }

    try {
      console.log('📤 Gửi tin nhắn:', {
        conversationId,
        senderPhone: userPhone,
        receiverPhone,
        messageText: inputText.trim()
      });

      // Tạo tin nhắn mới để hiển thị ngay lập tức
      const tempId = Date.now();
      const newMessage: Message = {
        id: tempId,
        conversationId,
        senderPhone: userPhone,
        receiverPhone,
        messageText: inputText.trim(),
        messageType: 'text',
        isRead: false,
        sentAt: new Date().toISOString(),
        requiresFriendship: true,
        friendshipStatus: 'friends',
        senderName: user?.fullName || 'Bạn', // SỬA LẠI DÒNG NÀY
        isOwnMessage: true
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // Gửi tin nhắn vào database và socket server
      const messageResult = await sendMessage(
        conversationId,
        userPhone,
        receiverPhone,
        inputText.trim(),
        'text',
        undefined
      );
      
      if (messageResult.success) {
        console.log('✅ Tin nhắn đã gửi thành công:', messageResult.messageId);
        console.log('📤 Socket delivered:', messageResult.data?.socket_delivered);
        
        // Cập nhật ID thực từ database
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { ...msg, id: messageResult.messageId || msg.id }
              : msg
          )
        );

        // Lưu tin nhắn cuối cùng vào bộ nhớ đệm
        const lastMessage: LastMessage = {
          conversationId,
          messageText: newMessage.messageText,
          senderPhone: userPhone,
          receiverPhone,
          sentAt: new Date().toISOString(),
          senderName: user?.fullName || 'Bạn',
          isOwnMessage: true
        };
        await lastMessageStorage.saveLastMessage(lastMessage);
      } else {
        console.log('❌ Lỗi gửi tin nhắn:', messageResult.message);
        Alert.alert('Lỗi', 'Không thể gửi tin nhắn: ' + messageResult.message);
        
        // Xóa tin nhắn khỏi UI nếu gửi thất bại
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
    } catch (error) {
      console.error('❌ Lỗi gửi tin nhắn:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
      
      // Xóa tin nhắn khỏi UI nếu có lỗi
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

      // Optimistic UI: show placeholder message
      const tempId = Date.now();
      const tempMessage: Message = {
        id: tempId,
        conversationId,
        senderPhone: userPhone,
        receiverPhone,
        messageText: '[Đang gửi hình ảnh...]',
        messageType: 'image',
        fileUrl: asset.uri,
        isRead: false,
        sentAt: new Date().toISOString(),
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

      // Update UI message with real URL
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, messageText: '', fileUrl } : m));

      // Send message via backend with message_type image
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
          isOwnMessage: true
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
      />
    );
  };

  const flatListRef = useRef<FlatList>(null);

  // Thêm useEffect để auto scroll khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      // Delay một chút để đảm bảo render xong
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* New Chat Header */}
        <ChatHeader
          name={name}
          avatar={avatar}
          isOnline={isConnected}
          onBack={() => navigation.goBack()}
          onCall={() => Alert.alert('Gọi điện', 'Tính năng gọi điện sẽ được thêm sau')}
          onVideoCall={() => Alert.alert('Video call', 'Tính năng video call sẽ được thêm sau')}
          onMenu={() => Alert.alert('Menu', 'Tính năng menu sẽ được thêm sau')}
        />

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => {
            // Tự động cuộn xuống cuối khi có tin nhắn mới
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

        {/* Typing Indicator */}
        <TypingIndicator isTyping={false} userName={name} />

        {/* New Input Bar */}
        <InputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          onEmoji={() => Alert.alert('Emoji', 'Tính năng emoji sẽ được thêm sau')}
          onAttachment={handleSendImage}
          onVoice={() => {}} // Voice recognition sẽ được xử lý trong InputBar
          placeholder={isUploadingImage ? 'Đang tải ảnh...' : 'Nhập tin nhắn...'}
          disabled={!isConnected || isUploadingImage}
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
});

export default ChatScreen; 