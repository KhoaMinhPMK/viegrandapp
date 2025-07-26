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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import io from 'socket.io-client';

// Type definitions
interface Message {
  id: string;
  text: string;
  timestamp: number;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  
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

    newSocket.on('chat message', (msg: string) => {
      console.log('📨 Nhận tin nhắn:', msg);
      const newMessage: Message = {
        id: Date.now().toString(),
        text: msg,
        timestamp: Date.now(),
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
    <View style={styles.messageItem}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString()}
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
          <Text style={styles.headerTitle}>Chat Test Socket</Text>
          <Text style={[styles.headerStatus, { color: isConnected ? '#34C759' : '#FF3B30' }]}>
            {isConnected ? `Đã kết nối (${socketRef.current?.id?.substring(0, 8)}...)` : 'Chưa kết nối'}
          </Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
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
    backgroundColor: '#F2F2F7',
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '80%',
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