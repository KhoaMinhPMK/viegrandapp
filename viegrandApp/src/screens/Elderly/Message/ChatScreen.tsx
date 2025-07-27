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
import { getMessages } from '../../../services/api';
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
  };
};

type ChatScreenProps = NativeStackScreenProps<MessageStackParamList, 'Chat'>;

const ChatScreen = ({ route, navigation }: ChatScreenProps) => {
  const { conversationId, name, avatar } = route.params;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
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
      Alert.alert('Thành công', `Đã kết nối socket!\nID: ${newSocket.id}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket đã ngắt kết nối:', reason);
      setIsConnected(false);
    });

    newSocket.on('chat message', (msg: any) => {
      console.log('📨 Nhận tin nhắn:', msg);
      const newMessage: Message = {
        id: Date.now(),
        conversationId: conversationId,
        senderPhone: msg.senderPhone || user?.phone || '',
        receiverPhone: msg.receiverPhone || '',
        messageText: msg.messageText || msg.text || '',
        messageType: 'text',
        isRead: false,
        sentAt: new Date().toISOString(),
        requiresFriendship: true,
        friendshipStatus: 'accepted',
        senderName: msg.senderName || 'Bạn',
        isOwnMessage: false
      };
      setMessages(prev => [newMessage, ...prev]);
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

  // Load messages from API
  useEffect(() => {
    if (conversationId && user?.phone) {
      loadMessages();
    }
  }, [conversationId, user?.phone]);

  const loadMessages = async () => {
    if (!conversationId || !user?.phone) return;
    
    setIsLoadingMessages(true);
    try {
      console.log('🔄 ChatScreen: Loading messages for conversation:', conversationId);
      const result = await getMessages(conversationId, user.phone);
      
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

  const handleSend = () => {
    if (inputText.trim() && socket && isConnected) {
      console.log('📤 Gửi tin nhắn:', inputText.trim());
      socket.emit('chat message', inputText.trim());
      setInputText('');
    } else if (!isConnected) {
      Alert.alert('Lỗi', 'Socket chưa kết nối!');
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
              onChangeText={setInputText}
          onSubmitEditing={handleSend}
              returnKeyType="send"
            />
        <TouchableOpacity 
          onPress={handleSend} 
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