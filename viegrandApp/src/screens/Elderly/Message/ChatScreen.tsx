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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import io from 'socket.io-client';
import { getMessages, sendMessage, markMessageAsRead, getUserPhone } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

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
        
        // Kiểm tra xem có phải tin nhắn tự gửi không
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

  const loadMessages = async (phone?: string) => {
    const userPhoneToUse = phone || userPhone;
    if (!conversationId || !userPhoneToUse) return;
    
    setIsLoadingMessages(true);
    try {
      console.log('🔄 ChatScreen: Loading messages for conversation:', conversationId);
      const result = await getMessages(conversationId, userPhoneToUse);
      
      if (result.success && result.messages) {
        console.log('✅ ChatScreen: Messages loaded successfully:', result.messages.length, 'messages');
        setMessages(result.messages.reverse()); // Reverse để hiển thị tin nhắn cũ ở trên
      } else {
        console.log('⚠️ ChatScreen: No messages found or API error:', result.message);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ ChatScreen: Error loading messages:', error);
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

    if (!isConnected) {
      console.log('❌ handleSend - Socket not connected');
      Alert.alert('Lỗi', 'Socket chưa kết nối!');
      return;
    }

    try {
      console.log('📤 Gửi tin nhắn qua socket:', {
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
        senderName: 'Bạn',
        isOwnMessage: true
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // Gửi qua socket để real-time (bỏ qua API)
      const messageData = {
        conversationId,
        senderPhone: userPhone,
        receiverPhone,
        messageText: inputText.trim(),
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 Socket emit data:', messageData);
      socket?.emit('send message', messageData);
      
      console.log('✅ Tin nhắn đã gửi qua socket');
    } catch (error) {
      console.error('❌ Lỗi gửi tin nhắn:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageItem,
      item.isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={styles.messageText}>{item.messageText}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.sentAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{name}</Text>
          <Text style={[styles.headerStatus, { color: isConnected ? '#34C759' : '#FF3B30' }]}>
            {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
          </Text>
        </View>
      </View>

      {/* Messages List */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          style={styles.messagesList}
          inverted
          showsVerticalScrollIndicator={false}
        />

      {/* Input */}
        <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#8A8A8E"
              value={inputText}
              onChangeText={(text) => {
                console.log('🔍 TextInput onChangeText:', { text, length: text.length });
                setInputText(text);
              }}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
        <TouchableOpacity 
          onPress={() => {
            console.log('🔍 Send button pressed');
            handleSend();
          }} 
          style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
          disabled={!inputText.trim()}>
          <Text style={styles.sendButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageItem: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#F2F2F7',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: '#8A8A8E',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1C1C1E',
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen; 