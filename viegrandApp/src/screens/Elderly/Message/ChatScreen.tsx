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
import { getMessages, sendMessage, markMessageAsRead, getUserPhone } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { lastMessageStorage, LastMessage } from '../../../utils/lastMessageStorage';

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
      
      let messageText = '';
      let senderName = 'Người dùng';
      let isOwnMessage = false;
      
      if (typeof msg === 'string') {
        // Tin nhắn đơn giản
        messageText = msg;
        senderName = 'Người dùng';
        isOwnMessage = false;
        console.log('📨 Processing string message:', { messageText, senderName, isOwnMessage });
      } else {
        // Tin nhắn có cấu trúc
        messageText = msg.message || msg.message_text || '';
        senderName = msg.sender || msg.senderName || 'Người dùng';
        isOwnMessage = msg.sender === userPhone || msg.sender_phone === userPhone;
        console.log('📨 Processing object message:', { 
          messageText, 
          senderName, 
          isOwnMessage, 
          msgSender: msg.sender,
          msgSenderPhone: msg.sender_phone,
          userPhone 
        });
      }
      
      if (messageText) {
        console.log('📨 App processing message:', {
          messageText,
          senderName,
          isOwnMessage,
          msg,
          timestamp: msg.timestamp,
          sentAt: msg.sent_at
        });
        
        // Chỉ bỏ qua tin nhắn tự gửi nếu sender là chính mình
        if (isOwnMessage) {
          console.log('🚫 Bỏ qua tin nhắn tự gửi trong app');
          return;
        }
        
        // Xử lý timestamp
        let sentAt = new Date().toISOString();
        if (msg.timestamp || msg.sent_at) {
          try {
            const timestamp = msg.timestamp || msg.sent_at;
            if (typeof timestamp === 'string') {
              // Thử parse ISO string
              const date = new Date(timestamp);
              if (!isNaN(date.getTime())) {
                sentAt = date.toISOString();
              }
            }
          } catch (error) {
            console.log('⚠️ Invalid timestamp, using current time:', msg.timestamp);
          }
        }
        
        const newMessage: Message = {
          id: msg.id || Date.now(),
          conversationId: msg.conversationId || msg.conversation_id || conversationId,
          senderPhone: msg.sender || msg.sender_phone || '',
          receiverPhone: msg.receiver || msg.receiver_phone || '',
          messageText: messageText,
          messageType: 'text',
          isRead: false,
          sentAt: sentAt,
          requiresFriendship: true,
          friendshipStatus: 'friends',
          senderName: senderName,
          isOwnMessage: isOwnMessage
        };
        
        console.log('📨 Adding new message to app:', newMessage);
        setMessages(prev => [...prev, newMessage]);

        // Lưu tin nhắn cuối cùng vào bộ nhớ đệm
        const saveLastMessage = async () => {
          const lastMessage: LastMessage = {
            conversationId: newMessage.conversationId,
            messageText: newMessage.messageText,
            senderPhone: newMessage.senderPhone,
            receiverPhone: newMessage.receiverPhone,
            sentAt: newMessage.sentAt,
            senderName: newMessage.senderName,
            isOwnMessage: newMessage.isOwnMessage
          };
          await lastMessageStorage.saveLastMessage(lastMessage);
        };
        saveLastMessage();
      }
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
      const newMessage: Message = {
        id: Date.now(),
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
        inputText.trim()
      );
      
      if (messageResult.success) {
        console.log('✅ Tin nhắn đã gửi thành công:', messageResult.messageId);
        console.log('📤 Socket delivered:', messageResult.data?.socket_delivered);
        
        // Cập nhật ID thực từ database
        setMessages(prev => 
          prev.map(msg => 
            msg.id === Date.now() 
              ? { ...msg, id: messageResult.messageId || msg.id }
              : msg
          )
        );

        // Lưu tin nhắn cuối cùng vào bộ nhớ đệm
        const lastMessage: LastMessage = {
          conversationId,
          messageText: inputText.trim(),
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
        setMessages(prev => prev.filter(msg => msg.id !== Date.now()));
      }
    } catch (error) {
      console.error('❌ Lỗi gửi tin nhắn:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
      
      // Xóa tin nhắn khỏi UI nếu có lỗi
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()));
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
          onAttachment={() => Alert.alert('File', 'Tính năng gửi file sẽ được thêm sau')}
          onVoice={() => {}} // Voice recognition sẽ được xử lý trong InputBar
          placeholder="Nhập tin nhắn..."
          disabled={!isConnected}
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