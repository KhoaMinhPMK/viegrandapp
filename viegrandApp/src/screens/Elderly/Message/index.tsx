import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { BackgroundImages } from '../../../utils/assetUtils';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageStackParamList } from './ChatScreen';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

// --- TYPE DEFINITIONS ---
interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

// --- MOCK DATA ---
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Ngọc Anh (Con gái)',
    avatar: 'https://i.pravatar.cc/150?img=26', // Placeholder images
    lastMessage: 'Tối nay ba mẹ ăn cơm với gì ạ?',
    time: '18:32',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'Anh Tuấn (Con trai)',
    avatar: 'https://i.pravatar.cc/150?img=32',
    lastMessage: 'Ba nhớ uống thuốc nhé, con mua thêm yến sào rồi ạ.',
    time: '15:10',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Hội người cao tuổi',
    avatar: 'https://i.pravatar.cc/150?img=55',
    lastMessage: 'Chủ nhật này có buổi tập thể dục dưỡng sinh nhé các bác.',
    time: 'Hôm qua',
    unreadCount: 5,
  },
  {
    id: '4',
    name: 'Bác sĩ An',
    avatar: 'https://i.pravatar.cc/150?img=15',
    lastMessage: 'Kết quả khám sức khỏe của bác rất tốt ạ.',
    time: 'Thứ hai',
    unreadCount: 0,
  },
   {
    id: '5',
    name: 'Bạn bè lối xóm',
    avatar: 'https://i.pravatar.cc/150?img=60',
    lastMessage: 'Sáng mai đi bộ cùng chúng tôi không ông ơi?',
    time: 'Thứ hai',
    unreadCount: 0,
  },
];

type MessageScreenProps = NativeStackScreenProps<MessageStackParamList, 'MessageList'>;

const MessageScreen = ({ navigation }: MessageScreenProps) => {
  const [conversations, setConversations] = useState(mockConversations);
  const [searchText, setSearchText] = useState('');

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleNavigateToChat = (item: Conversation) => {
    navigation.navigate('Chat', {
      conversationId: item.id,
      name: item.name,
      avatar: item.avatar,
    });
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.conversationItem} 
      onPress={() => handleNavigateToChat(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.onlineIndicator} />
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.messagePreview}>
          <Text style={item.unreadCount > 0 ? styles.lastMessageUnread : styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
      <Feather name="chevron-right" size={16} color="#C7C7CC" style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#F1F3F5']}
        style={styles.backgroundGradient}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin Nhắn</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="edit" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <Feather name="x-circle" size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <LinearGradient
          colors={['#007AFF', '#0051D5']}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '400',
  },
  clearButton: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#30D158',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 15,
    color: '#8E8E93',
    flex: 1,
    fontWeight: '400',
    lineHeight: 20,
  },
  lastMessageUnread: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 8,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageScreen; 