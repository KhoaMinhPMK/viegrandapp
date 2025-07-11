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
  KeyboardAvoidingView,
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

  const [messages, setMessages] = useState<Message[]>(
    mockMessages.filter(m => m.sender === 'me' || m.sender === 'contact'),
  );
  const [inputText, setInputText] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (inputText.trim().length > 0) {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        text: inputText.trim(),
        time: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sender: 'me',
      };
      setMessages(prevMessages => [newMessage, ...prevMessages]);
      setInputText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isMyMessage ? 'flex-end' : 'flex-start' },
        ]}>
        {!isMyMessage && (
          <Image source={{ uri: avatar }} style={styles.messageAvatar} />
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.contactMessageBubble,
          ]}>
          <Text
            style={
              isMyMessage ? styles.myMessageText : styles.contactMessageText
            }>
            {item.text}
          </Text>
          <Text
            style={
              isMyMessage ? styles.myMessageTime : styles.contactMessageTime
            }>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F7F8FA']}
        style={styles.backgroundGradient}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={{ uri: avatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerStatus}>Đang hoạt động</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="phone" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="plus" size={22} color="#8A8A8E" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder="Tin nhắn..."
              placeholderTextColor="#8A8A8E"
              value={inputText}
              onChangeText={setInputText}
              multiline
              enablesReturnKeyAutomatically
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="mic" size={20} color="#8A8A8E" />
            </TouchableOpacity>
          </View>
          {inputText.trim().length > 0 && (
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Feather name="arrow-up" size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerStatus: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '400',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    flex: 1,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  contactMessageBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 5,
  },
  myMessageText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
  },
  contactMessageText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  myMessageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  contactMessageTime: {
    fontSize: 11,
    color: '#8A8A8E',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.15)',
    paddingBottom: Platform.OS === 'ios' ? 34 : 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#1C1C1E',
    maxHeight: 100,
  },
  iconButton: {
    padding: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginBottom: 4,
  },
});

export default ChatScreen; 