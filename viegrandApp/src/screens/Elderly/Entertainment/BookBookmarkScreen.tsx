import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

// Mock data cho bookmark và notes
const mockBookmarks = [
  {
    id: '1',
    page: 15,
    title: 'Đoạn hay về tình yêu',
    content: 'Tình yêu không phải là tìm kiếm người hoàn hảo, mà là học cách nhìn thấy sự hoàn hảo trong một người không hoàn hảo.',
    timestamp: '2024-01-15 14:30',
  },
  {
    id: '2',
    page: 23,
    title: 'Bài học về lòng dũng cảm',
    content: 'Lòng dũng cảm không phải là không sợ hãi, mà là hành động bất chấp nỗi sợ hãi.',
    timestamp: '2024-01-16 09:15',
  },
  {
    id: '3',
    page: 45,
    title: 'Suy ngẫm về cuộc sống',
    content: 'Cuộc sống không phải là những gì xảy ra với bạn, mà là cách bạn phản ứng với những gì xảy ra.',
    timestamp: '2024-01-17 16:45',
  },
];

const BookBookmarkScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookmarks = mockBookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBookmark = (bookmark: any) => (
    <TouchableOpacity
      key={bookmark.id}
      style={styles.bookmarkCard}
      onPress={() => {
        // TODO: Navigate to specific page
        navigation.goBack();
      }}
    >
      <View style={styles.bookmarkHeader}>
        <View style={styles.pageIndicator}>
          <Feather name="bookmark" size={16} color="#0EA5E9" />
          <Text style={styles.pageNumber}>Trang {bookmark.page}</Text>
        </View>
        <Text style={styles.timestamp}>{bookmark.timestamp}</Text>
      </View>
      <Text style={styles.bookmarkTitle}>{bookmark.title}</Text>
      <Text style={styles.bookmarkContent} numberOfLines={3}>
        {bookmark.content}
      </Text>
      <View style={styles.bookmarkActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="edit-3" size={16} color="#8E8E93" />
          <Text style={styles.actionText}>Chỉnh sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="share-2" size={16} color="#8E8E93" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="trash-2" size={16} color="#FF3B30" />
          <Text style={[styles.actionText, { color: '#FF3B30' }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh dấu & Ghi chú</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {/* TODO: Add new bookmark */}}
        >
          <Feather name="plus" size={24} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bookmark..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'bookmarks' && styles.tabButtonActive]}
          onPress={() => setActiveTab('bookmarks')}
        >
          <Feather 
            name="bookmark" 
            size={20} 
            color={activeTab === 'bookmarks' ? '#0EA5E9' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'bookmarks' && styles.tabTextActive]}>
            Đánh dấu ({filteredBookmarks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'notes' && styles.tabButtonActive]}
          onPress={() => setActiveTab('notes')}
        >
          <Feather 
            name="edit-3" 
            size={20} 
            color={activeTab === 'notes' ? '#0EA5E9' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            Ghi chú (0)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentScroll}
      >
        {activeTab === 'bookmarks' ? (
          filteredBookmarks.length > 0 ? (
            filteredBookmarks.map(renderBookmark)
          ) : (
            <View style={styles.emptyState}>
              <Feather name="bookmark" size={48} color="#C7C7CC" />
              <Text style={styles.emptyStateTitle}>Chưa có đánh dấu</Text>
              <Text style={styles.emptyStateSubtitle}>
                Bạn có thể đánh dấu những đoạn văn hay để đọc lại sau
              </Text>
            </View>
          )
        ) : (
          <View style={styles.emptyState}>
            <Feather name="edit-3" size={48} color="#C7C7CC" />
            <Text style={styles.emptyStateTitle}>Chưa có ghi chú</Text>
            <Text style={styles.emptyStateSubtitle}>
              Bạn có thể thêm ghi chú cho những ý tưởng của mình
            </Text>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  tabButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bookmarkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
    marginLeft: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  bookmarkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  bookmarkContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  bookmarkActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44, // Đảm bảo touch target đủ lớn cho người cao tuổi
  },
  actionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
});

export default BookBookmarkScreen; 