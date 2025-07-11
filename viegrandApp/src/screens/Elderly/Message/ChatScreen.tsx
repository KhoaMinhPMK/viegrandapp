import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { BackgroundImages } from '../../../utils/assetUtils';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

// --- TYPE DEFINITIONS ---
interface Message {
  id: string;
  text: string;
  time: string;
  sender: 'me' | 'contact' | 'other_contact';
}

// This should be moved to a central navigation types file eventually
export type MessageStackParamList = {
  MessageList: undefined;
  Chat: {
    conversationId: string;
    name: string;
    avatar: string;
  };
};

type ChatScreenProps = NativeStackScreenProps<MessageStackParamList, 'Chat'>;

// --- MOCK DATA ---
const mockMessages: Message[] = [
  { id: '1', text: 'Tối nay ba mẹ ăn cơm với gì ạ?', time: '18:32', sender: 'contact' },
  { id: '2', text: 'Ba mẹ ăn cơm sườn, con gái ăn gì chưa?', time: '18:33', sender: 'me' },
  { id: '3', text: 'Dạ con ăn rồi ạ. Ba mẹ nhớ giữ gìn sức khỏe nhé!', time: '18:35', sender: 'contact' },
  { id: '4', text: 'Con cũng vậy nhé, đi làm cẩn thận.', time: '18:36', sender: 'me' },
  { id: '5', text: 'Ba nhớ uống thuốc nhé, con mua thêm yến sào rồi ạ.', time: '15:10', sender: 'other_contact' },
];

const ChatScreen = ({ route, navigation }: ChatScreenProps) => {
  const name = route.params?.name || 'Ngọc Anh (Con gái)';
  const avatar = route.params?.avatar || 'https://i.pravatar.cc/150?img=26';

  const [messages, setMessages] = useState<Message[]>(mockMessages.filter(m => m.sender === 'me' || m.sender === 'contact'));
  const [inputText, setInputText] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (inputText.trim().length > 0) {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        text: inputText.trim(),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        sender: 'me',
      };
      setMessages(prevMessages => [newMessage, ...prevMessages]);
      setInputText('');
    }
  };

  const testFocus = () => {
    Alert.alert('Test', 'Bấm OK rồi thử focus vào TextInput');
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender === 'me';
    return (
      <View style={[styles.messageRow, { justifyContent: isMyMessage ? 'flex-end' : 'flex-start' }]}>
        {!isMyMessage && (
          <Image source={{ uri: avatar }} style={styles.messageAvatar} />
        )}
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.contactMessageBubble]}>
          <Text style={isMyMessage ? styles.myMessageText : styles.contactMessageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Image source={{ uri: avatar }} style={styles.headerAvatar} />
          <Text style={styles.headerName}>{name}</Text>
        </View>

        <TouchableOpacity onPress={testFocus} style={styles.testButton}>
          <Text style={styles.testButtonText}>Test</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        inverted
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={true}
            selectTextOnFocus={true}
          />
        </View>
        
        <TouchableOpacity 
          onPress={handleSend} 
          style={styles.sendButton}
        >
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  messageList: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
    marginLeft: 50,
  },
  contactMessageBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
    marginRight: 50,
  },
  myMessageText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 20,
  },
  contactMessageText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 40,
    textAlignVertical: 'center',
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