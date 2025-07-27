import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { BackgroundImages } from '../../../utils/assetUtils';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageStackParamList } from './ChatScreen';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { searchFriend, requestFriend, getUserData, cancelFriendRequest, getUserPhone, acceptFriendRequest, rejectFriendRequest, getFriendsList, getConversationsList, debugConversations } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// --- TYPE DEFINITIONS ---
interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

interface SearchResult {
  userId: number;
  userName: string;
  phone: string;
  avatar: string;
  isFound: boolean;
}

type ListItem = Conversation | SearchResult;

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
  const { user } = useAuth();
  const { notifications } = useSocket(); // Get notifications from SocketContext
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  
  // Modal states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<SearchResult | null>(null);
  const [friendRequestMessage, setFriendRequestMessage] = useState('');
  
  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  // Already sent modal states
  const [showAlreadySentModal, setShowAlreadySentModal] = useState(false);
  const [existingRequestData, setExistingRequestData] = useState<any>(null);

  // Lấy số điện thoại của user hiện tại
  useEffect(() => {
    const getCurrentUserPhone = async () => {
      console.log('🔄 MessageScreen: Getting current user phone...');
      
      try {
        // Thử lấy từ AuthContext trước
        if (user?.phone) {
          console.log('✅ MessageScreen: Got phone from AuthContext:', user.phone);
          setUserPhone(user.phone);
          return;
        }

        // Nếu không có trong AuthContext, gọi API
        const userEmail = await AsyncStorage.getItem('user_email');
        console.log('🔄 MessageScreen: Fetching phone for email:', userEmail);
        
        if (userEmail) {
          // Thử dùng API chuyên lấy phone trước
          const phoneResult = await getUserPhone(userEmail);
          console.log('📞 MessageScreen: getUserPhone result:', phoneResult);
          
          if (phoneResult.success && phoneResult.phone) {
            console.log('✅ MessageScreen: Setting phone from getUserPhone API:', phoneResult.phone);
            setUserPhone(phoneResult.phone);
            return;
          }

          // Fallback: dùng getUserData nếu getUserPhone thất bại
          console.log('🔄 MessageScreen: getUserPhone failed, trying getUserData...');
          const result = await getUserData(userEmail);
          console.log('📞 MessageScreen: getUserData result:', { 
            success: result.success, 
            phone: result.user?.phone,
            userEmail: result.user?.email 
          });
          
          if (result.success && result.user?.phone) {
            console.log('✅ MessageScreen: Setting phone from getUserData API:', result.user.phone);
            setUserPhone(result.user.phone);
          } else {
            console.log('❌ MessageScreen: User exists but has no phone number in database');
            console.log('📋 User data:', { 
              email: result.user?.email, 
              userName: result.user?.userName,
              phone: result.user?.phone 
            });
          }
        } else {
          console.log('❌ MessageScreen: No email found in AsyncStorage');
        }
      } catch (error) {
        console.error('❌ MessageScreen: Error getting user phone:', error);
      }
    };

    getCurrentUserPhone();
  }, [user]); // Thêm user vào dependency để re-run khi user thay đổi

  // Load conversations list when userPhone is available
  useEffect(() => {
    if (userPhone) {
      loadConversationsList();
    }
  }, [userPhone]);

  // Auto-refresh conversations when notifications change (friend request accepted)
  useEffect(() => {
    if (userPhone && notifications.length > 0) {
      // Check if there are any friend request notifications
      const hasFriendRequestNotifications = notifications.some(notif => 
        notif.type === 'friend_request_received' && !notif.isRead
      );
      
      if (hasFriendRequestNotifications) {
        console.log('🔄 MessageScreen: Friend request notification detected, refreshing conversations...');
        loadConversationsList();
      }
    }
  }, [notifications, userPhone]);

  // Auto-refresh conversations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userPhone) {
        console.log('🔄 MessageScreen: Screen focused, refreshing conversations...');
        loadConversationsList();
      }
    }, [userPhone])
  );

  // Function to load conversations list from API
  const loadConversationsList = async () => {
    if (!userPhone) return;
    
    setIsLoadingConversations(true);
    try {
      console.log('🔄 MessageScreen: Loading conversations for user:', userPhone);
      
      // Debug conversations first
      console.log('🔍 MessageScreen: Debugging conversations...');
      const debugResult = await debugConversations(userPhone);
      if (debugResult.success) {
        console.log('🔍 MessageScreen: Debug data:', debugResult.data);
      } else {
        console.log('⚠️ MessageScreen: Debug failed:', debugResult.message);
      }
      
      const result = await getConversationsList(userPhone);
      
      if (result.success && result.conversations) {
        console.log('✅ MessageScreen: Conversations loaded successfully:', result.conversations.length, 'conversations');
        
        // Convert conversations to UI format
        const conversationsAsUI: Conversation[] = result.conversations.map(conv => ({
          id: conv.id,
          name: conv.otherParticipantName,
          avatar: conv.avatar,
          lastMessage: conv.lastMessage,
          time: formatTime(conv.lastMessageTime),
          unreadCount: 0 // TODO: Implement unread count
        }));
        
        setConversations(conversationsAsUI);
      } else {
        console.log('⚠️ MessageScreen: No conversations found or API error:', result.message);
        setConversations([]);
      }
    } catch (error) {
      console.error('❌ MessageScreen: Error loading conversations:', error);
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Filter conversations based on search text (for existing conversations)
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Check if search text looks like a phone number
  const isPhoneSearch = /^[0-9+\-\s()]*$/.test(searchText) && searchText.length >= 10;

  const handleSearchFriend = async (phone: string) => {
    if (!phone || phone.length < 10) return;
    
    setIsSearching(true);
    try {
      const result = await searchFriend(phone, user?.email);
      
      if (result.success && result.results) {
        setSearchResults(result.results);
        setShowSearchResults(true);
        
        if (result.results.length === 0) {
          Alert.alert('Không tìm thấy', 'Không có người dùng nào với số điện thoại này');
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(true);
        Alert.alert('Lỗi', result.message || 'Không thể tìm kiếm bạn bè');
      }
    } catch (error) {
      console.error('Search friend error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    
    if (text.length === 0) {
      setShowSearchResults(false);
      setSearchResults([]);
    } else if (isPhoneSearch && text.length >= 10) {
      // Auto search when typing phone number
      const timeoutId = setTimeout(() => {
        handleSearchFriend(text);
      }, 1000); // Debounce 1 second
      
      return () => clearTimeout(timeoutId);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleNavigateToChat = (item: Conversation) => {
    navigation.navigate('Chat', {
      conversationId: item.id,
      name: item.name,
      avatar: item.avatar,
    });
  };

  const handleAddFriend = async (friend: SearchResult) => {
    console.log('🔄 MessageScreen: handleAddFriend called:', { userPhone, friend: friend.userName });
    if (!userPhone) {
      console.log('❌ MessageScreen: No userPhone available for friend request');
      Alert.alert(
        'Cần cập nhật số điện thoại', 
        'Tài khoản của bạn chưa có số điện thoại. Vui lòng vào Cài đặt → Hồ sơ để cập nhật số điện thoại trước khi sử dụng tính năng này.',
        [
          { text: 'Đi đến Cài đặt', onPress: () => {
            // Navigate to settings/profile
            // navigation.navigate('Settings');
            console.log('Navigate to settings to update phone number');
          }},
          { text: 'Đóng', style: 'cancel' }
        ]
      );
      return;
    }

    console.log('✅ MessageScreen: Setting up friend request modal');
    setSelectedFriend(friend);
    setFriendRequestMessage(`Xin chào ${friend.userName}, tôi muốn kết bạn với bạn!`);
    setShowMessageModal(true);
  };

  const handleSendFriendRequest = async () => {
    if (!selectedFriend || !userPhone) {
      console.log('❌ MessageScreen: Cannot send friend request - missing data:', { selectedFriend: !!selectedFriend, userPhone });
      return;
    }

    console.log('🔄 MessageScreen: Sending friend request:', {
      from: userPhone,
      to: selectedFriend.phone,
      toName: selectedFriend.userName,
      message: friendRequestMessage
    });

    try {
      setShowMessageModal(false);
      
      const result = await requestFriend(userPhone, selectedFriend.phone, friendRequestMessage);
      
      console.log('📤 MessageScreen: Friend request result:', result);
      
      if (result.success) {
        if (result.data?.alreadySent) {
          // Đã gửi request trước đó - hiển thị modal
          setExistingRequestData(result.data.existingRequest);
          setShowAlreadySentModal(true);
        } else if (result.canAccept && result.existingRequest) {
          // Người kia đã gửi request cho mình
          Alert.alert(
            'Có lời mời kết bạn',
            `${result.existingRequest.from_name} đã gửi lời mời kết bạn cho bạn:\n\n"${result.existingRequest.message}"\n\nBạn có muốn chấp nhận không?`,
            [
              { text: 'Từ chối', style: 'cancel' },
              {
                text: 'Chấp nhận',
                onPress: () => {
                  // TODO: Implement accept friend API
                  setSuccessTitle('Kết bạn thành công!');
                  setSuccessMessage(`Bạn và ${selectedFriend.userName} giờ đã là bạn bè. Hãy bắt đầu trò chuyện nhé!`);
                  setShowSuccessModal(true);
                  addToConversationsList(selectedFriend);
                }
              }
            ]
          );
        } else {
          // Gửi lời mời thành công - hiển thị modal đẹp
          setSuccessTitle('Lời mời đã gửi!');
          setSuccessMessage(`Lời mời kết bạn đã được gửi đến ${selectedFriend.userName}. Họ sẽ nhận được thông báo và có thể chấp nhận lời mời của bạn.`);
          setShowSuccessModal(true);
          setSearchText('');
          setShowSearchResults(false);
        }
      } else {
        console.log('❌ MessageScreen: Friend request failed:', result.message);
        Alert.alert('Lỗi', result.message || 'Không thể gửi lời mời kết bạn');
      }
    } catch (error) {
      console.error('❌ MessageScreen: Error sending friend request:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi lời mời kết bạn');
    } finally {
      setSelectedFriend(null);
      setFriendRequestMessage('');
    }
  };

  const handleCancelRequest = () => {
    setShowMessageModal(false);
    setSelectedFriend(null);
    setFriendRequestMessage('');
  };

  const handleCancelFriendRequest = async () => {
    if (!userPhone || !existingRequestData) return;

    try {
      const result = await cancelFriendRequest(
        userPhone, 
        existingRequestData.to_phone, 
        existingRequestData.id
      );

      if (result.success) {
        setShowAlreadySentModal(false);
        setSuccessTitle('Đã hủy lời mời!');
        setSuccessMessage(`Lời mời kết bạn đến ${existingRequestData.to_name} đã được hủy thành công.`);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể hủy lời mời kết bạn');
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi hủy lời mời kết bạn');
    } finally {
      setExistingRequestData(null);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
    setSuccessTitle('');
  };

  const handleCloseAlreadySentModal = () => {
    setShowAlreadySentModal(false);
    setExistingRequestData(null);
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        return `${Math.floor(diffHours)} giờ trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }
    } catch {
      return 'Vừa xong';
    }
  };

  const addToConversationsList = async (friend: SearchResult) => {
    // Refresh the entire conversations list instead of just adding one
    console.log('🔄 MessageScreen: Refreshing conversations list after accepting friend request');
    await loadConversationsList();
    
    setSearchText('');
    setShowSearchResults(false);
    
    // Navigate to chat with the new friend
    navigation.navigate('Chat', {
      conversationId: friend.phone, // Use phone as ID
      name: friend.userName,
      avatar: friend.avatar,
    });
  };

  // Function to refresh conversations list (can be called from outside)
  const refreshConversationsList = useCallback(async () => {
    if (userPhone) {
      console.log('🔄 MessageScreen: Manual refresh of conversations list');
      await loadConversationsList();
    }
  }, [userPhone]);

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

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.searchResultItem} 
      onPress={() => handleAddFriend(item)}
      activeOpacity={0.7}
    >
      <View style={styles.searchAvatarContainer}>
        <View style={styles.searchAvatar}>
          <Text style={styles.searchAvatarText}>{item.avatar}</Text>
        </View>
      </View>
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultName}>{item.userName}</Text>
        <Text style={styles.searchResultPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Feather name="plus" size={16} color="#007AFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: ListItem }) => {
    if ('userId' in item) {
      // SearchResult
      return renderSearchResult({ item: item as SearchResult });
    } else {
      // Conversation
      return renderConversation({ item: item as Conversation });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#F1F3F5']}
        style={styles.backgroundGradient}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('HomeStack')} style={styles.homeButton}>
          <Feather name="arrow-left" size={20} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin Nhắn</Text>
        {/* <TouchableOpacity style={styles.headerAction}> */}
          {/* <Feather name="edit" size={22} color="#007AFF" /> */}
        {/* </TouchableOpacity> */}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={isPhoneSearch ? "Nhập số điện thoại để tìm bạn bè..." : "Tìm kiếm..."}
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={handleSearchTextChange}
            keyboardType={isPhoneSearch ? "phone-pad" : "default"}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setShowSearchResults(false); }} style={styles.clearButton}>
              <Feather name="x-circle" size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
          {isSearching && (
            <Feather name="loader" size={16} color="#007AFF" style={styles.loadingIcon} />
          )}
        </View>
        {isPhoneSearch && searchText.length >= 10 && (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => handleSearchFriend(searchText)}
            disabled={isSearching}
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? 'Đang tìm...' : 'Tìm bạn bè'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showSearchResults && (
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsTitle}>
            Kết quả tìm kiếm ({searchResults.length})
          </Text>
        </View>
      )}

      {isLoadingConversations && !showSearchResults ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải danh sách cuộc trò chuyện...</Text>
        </View>
      ) : (
        <FlatList<ListItem>
          data={showSearchResults ? searchResults : filteredConversations}
          renderItem={renderListItem}
          keyExtractor={(item, index) => {
            if ('userId' in item) {
              return `search-${item.userId}`;
            } else {
              return item.id;
            }
          }}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !showSearchResults && !isLoadingConversations ? (
              <View style={styles.emptyContainer}>
                <Feather name="users" size={48} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>Chưa có bạn bè</Text>
                <Text style={styles.emptySubtitle}>
                  Tìm kiếm và kết bạn với người thân, bạn bè để bắt đầu trò chuyện
                </Text>
              </View>
            ) : null
          }
        />
      )}
      
      {/* <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <LinearGradient
          colors={['#007AFF', '#0051D5']}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity> */}
      
      {/* Friend Request Message Modal */}
      <Modal
        visible={showMessageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelRequest}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gửi lời mời kết bạn</Text>
              <TouchableOpacity onPress={handleCancelRequest} style={styles.modalCloseButton}>
                <Feather name="x" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            {selectedFriend && (
              <View style={styles.friendInfo}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>{selectedFriend.avatar}</Text>
                </View>
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{selectedFriend.userName}</Text>
                  <Text style={styles.friendPhone}>{selectedFriend.phone}</Text>
                </View>
              </View>
            )}
            
            <Text style={styles.messageLabel}>Tin nhắn kèm theo:</Text>
            <TextInput
              style={styles.messageInput}
              value={friendRequestMessage}
              onChangeText={setFriendRequestMessage}
              placeholder="Nhập tin nhắn muốn gửi kèm theo lời mời..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.characterCount}>{friendRequestMessage.length}/200</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelRequest}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendFriendRequest}
              >
                <Text style={styles.sendButtonText}>Gửi lời mời</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Feather name="check" size={32} color="white" />
              </View>
            </View>
            
            <Text style={styles.successTitle}>{successTitle}</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
            
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.successButtonText}>Tuyệt vời!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Already Sent Modal */}
      <Modal
        visible={showAlreadySentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseAlreadySentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lời mời đã gửi</Text>
              <TouchableOpacity onPress={handleCloseAlreadySentModal} style={styles.modalCloseButton}>
                <Feather name="x" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            {existingRequestData && (
              <>
                <View style={styles.friendInfo}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>
                      {existingRequestData.to_name?.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendDetails}>
                    <Text style={styles.friendName}>{existingRequestData.to_name}</Text>
                    <Text style={styles.friendPhone}>{existingRequestData.to_phone}</Text>
                  </View>
                </View>
                
                <View style={styles.sentMessageContainer}>
                  <Text style={styles.sentMessageLabel}>Tin nhắn đã gửi:</Text>
                  <Text style={styles.sentMessageText}>"{existingRequestData.message}"</Text>
                  <Text style={styles.sentMessageTime}>
                    Gửi lúc: {new Date(existingRequestData.sent_at).toLocaleString('vi-VN')}
                  </Text>
                </View>
                
                <Text style={styles.alreadySentInfo}>
                  Bạn đã gửi lời mời kết bạn đến người này. Họ sẽ nhận được thông báo và có thể chấp nhận lời mời của bạn.
                </Text>
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelRequestButton}
                onPress={handleCancelFriendRequest}
              >
                <Text style={styles.cancelRequestButtonText}>Hủy lời mời</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.okButton}
                onPress={handleCloseAlreadySentModal}
              >
                <Text style={styles.okButtonText}>Đã hiểu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: "10%",
    paddingBottom: 16,
  },
  homeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
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
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  searchResultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchResultsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
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
  searchAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.2,
  },
  searchResultPhone: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  addButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: 'rgba(0, 122, 255, 0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalCloseButton: {
    padding: 4,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  friendPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  sendButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#30D158',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 25,
  },
  successButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  sentMessageContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
  },
  sentMessageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
  },
  sentMessageText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  sentMessageTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  alreadySentInfo: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  cancelRequestButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    alignItems: 'center',
  },
  cancelRequestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  okButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MessageScreen; 