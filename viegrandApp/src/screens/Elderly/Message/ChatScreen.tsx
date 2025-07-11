import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Keyboard,
  Dimensions,
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
  // const { name, avatar } = route.params;
  // --- MOCK PARAMS FOR DEVELOPMENT ---
  const name = route.params?.name || 'Ngọc Anh (Con gái)';
  const avatar = route.params?.avatar || 'https://i.pravatar.cc/150?img=26';

  const [messages, setMessages] = useState<Message[]>(mockMessages.filter(m => m.sender === 'me' || m.sender === 'contact'));
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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
      
      // Scroll to top after sending message
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 200);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender === 'me';
    return (
      <View style={[styles.messageRow, { justifyContent: isMyMessage ? 'flex-end' : 'flex-start' }]}>
        {!isMyMessage && (
          <View style={styles.contactAvatarContainer}>
            <Image source={{ uri: avatar }} style={styles.messageAvatar} />
          </View>
        )}
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.contactMessageBubble]}>
          <Text style={isMyMessage ? styles.myMessageText : styles.contactMessageText}>{item.text}</Text>
          <Text style={isMyMessage ? styles.myMessageTime : styles.contactMessageTime}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#F1F3F5']}
        style={styles.backgroundGradient}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarContainer}>
            <Image source={{ uri: avatar }} style={styles.headerAvatar} />
            <View style={styles.headerOnlineIndicator} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerStatus}>Đang hoạt động</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.getParent()?.getParent()?.navigate('HomeStack')} style={styles.homeButton}>
          <Feather name="home" size={18} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="phone" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.messagesContainer, { marginBottom: keyboardHeight }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>

      <View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
        <TouchableOpacity style={styles.attachmentButton}>
          <Feather name="plus" size={22} color="#8E8E93" />
        </TouchableOpacity>
        
        <View style={styles.inputWrapper}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder="Tin nhắn..."
            placeholderTextColor="#8E8E93"
            value={inputText}
            onChangeText={setInputText}
            multiline={false}
            maxLength={500}
            onFocus={handleInputFocus}
            autoCorrect={true}
            autoCapitalize="sentences"
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.voiceButton}>
            <Feather name="mic" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          onPress={handleSend} 
          style={[styles.sendButton, inputText.trim().length > 0 && styles.sendButtonActive]}
          disabled={inputText.trim().length === 0}
        >
          <Feather name="send" size={18} color={inputText.trim().length > 0 ? "white" : "#8E8E93"} />
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
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    zIndex: 10,
    elevation: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  headerOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#30D158',
    borderWidth: 2,
    borderColor: 'white',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.2,
  },
  headerStatus: {
    fontSize: 13,
    color: '#30D158',
    fontWeight: '400',
    marginTop: 1,
  },
  homeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 3,
  },
  contactAvatarContainer: {
    marginRight: 8,
    marginBottom: 8,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 6,
    marginLeft: 40,
  },
  contactMessageBubble: {
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderBottomLeftRadius: 6,
    marginRight: 40,
  },
  myMessageText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '400',
    lineHeight: 22,
  },
  contactMessageText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '400',
    lineHeight: 22,
  },
  myMessageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
    fontWeight: '400',
  },
  contactMessageTime: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    alignSelf: 'flex-end',
    fontWeight: '400',
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderTopWidth: 0.33,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    zIndex: 10,
    elevation: 10,
  },
  attachmentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '400',
    lineHeight: 20,
    minHeight: 20,
    padding: 0,
  },
  voiceButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
    shadowColor: 'rgba(0, 122, 255, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default ChatScreen; 