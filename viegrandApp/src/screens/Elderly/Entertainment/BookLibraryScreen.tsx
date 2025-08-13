import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

// Mock data cho thư viện sách
const mockBooks = [
  {
    id: '1',
    title: 'Những Câu Chuyện Hay',
    author: 'Nguyễn Văn A',
    category: 'Văn học',
    progress: 0,
    totalPages: 156,
    coverColor: '#FF6B6B',
    description: 'Tuyển tập những câu chuyện ý nghĩa về cuộc sống, tình yêu và lòng dũng cảm.',
    rating: 4.5,
    readingTime: '2-3 giờ',
  },
  {
    id: '2',
    title: 'Sức Khỏe Tuổi Vàng',
    author: 'Bác sĩ Trần Thị B',
    category: 'Sức khỏe',
    progress: 45,
    totalPages: 89,
    coverColor: '#4ECDC4',
    description: 'Hướng dẫn chăm sóc sức khỏe cho người cao tuổi với những bài tập và chế độ dinh dưỡng phù hợp.',
    rating: 4.8,
    readingTime: '1-2 giờ',
  },
  {
    id: '3',
    title: 'Nghệ Thuật Nấu Ăn',
    author: 'Đầu bếp Lê Văn C',
    category: 'Nấu ăn',
    progress: 0,
    totalPages: 203,
    coverColor: '#45B7D1',
    description: 'Công thức nấu những món ăn ngon, bổ dưỡng và dễ làm cho gia đình.',
    rating: 4.2,
    readingTime: '3-4 giờ',
  },
  {
    id: '4',
    title: 'Thiền Định Mỗi Ngày',
    author: 'Thiền sư Phạm Văn D',
    category: 'Tâm linh',
    progress: 78,
    totalPages: 67,
    coverColor: '#96CEB4',
    description: 'Hướng dẫn thiền định đơn giản để tìm sự bình yên trong tâm hồn.',
    rating: 4.7,
    readingTime: '1-1.5 giờ',
  },
  {
    id: '5',
    title: 'Du Lịch Việt Nam',
    author: 'Nhà văn Nguyễn Thị E',
    category: 'Du lịch',
    progress: 0,
    totalPages: 134,
    coverColor: '#FFEAA7',
    description: 'Khám phá những địa điểm du lịch đẹp và ý nghĩa trên khắp Việt Nam.',
    rating: 4.3,
    readingTime: '2-2.5 giờ',
  },
  {
    id: '6',
    title: 'Làm Vườn Tại Nhà',
    author: 'Kỹ sư nông nghiệp Hoàng Văn F',
    category: 'Làm vườn',
    progress: 23,
    totalPages: 98,
    coverColor: '#DDA0DD',
    description: 'Hướng dẫn trồng rau sạch và hoa tại nhà cho người mới bắt đầu.',
    rating: 4.6,
    readingTime: '1.5-2 giờ',
  },
];

const categories = [
  { id: 'all', name: 'Tất cả', icon: 'grid', color: '#0EA5E9' },
  { id: 'literature', name: 'Văn học', icon: 'book', color: '#FF6B6B' },
  { id: 'health', name: 'Sức khỏe', icon: 'heart', color: '#4ECDC4' },
  { id: 'cooking', name: 'Nấu ăn', icon: 'coffee', color: '#45B7D1' },
  { id: 'spiritual', name: 'Tâm linh', icon: 'zap', color: '#96CEB4' },
  { id: 'travel', name: 'Du lịch', icon: 'map-pin', color: '#FFEAA7' },
  { id: 'gardening', name: 'Làm vườn', icon: 'leaf', color: '#DDA0DD' },
];

const BookLibraryScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [sortBy, setSortBy] = useState('title'); // 'title', 'author', 'rating', 'progress'

  // Tính số lượng sách trong mỗi category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') {
      return mockBooks.length;
    }
    return mockBooks.filter(book => {
      const categoryName = categories.find(c => c.id === categoryId)?.name;
      return book.category === categoryName;
    }).length;
  };

  const filteredBooks = mockBooks.filter(book => {
    const matchesCategory = selectedCategory === 'all' || 
      book.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'rating':
        return b.rating - a.rating;
      case 'progress':
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

  const getCategoryIcon = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'Văn học': 'book',
      'Sức khỏe': 'heart',
      'Nấu ăn': 'coffee',
      'Tâm linh': 'zap',
      'Du lịch': 'map-pin',
      'Làm vườn': 'leaf',
    };
    return categoryMap[category] || 'book-open';
  };

  const renderBookCover = (book: any) => {
    const initials = book.title.split(' ').map((word: string) => word[0]).join('').slice(0, 2);
    
    return (
      <View style={[styles.bookCover, { backgroundColor: book.coverColor }]}>
        <Text style={styles.bookInitials}>{initials}</Text>
        {book.progress > 0 && (
          <View style={styles.progressIndicator}>
            <View style={[styles.progressBar, { width: `${book.progress}%` }]} />
          </View>
        )}
        <View style={styles.ratingContainer}>
          <Feather name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{book.rating}</Text>
        </View>
      </View>
    );
  };

  const renderSearchModal = () => (
    <Modal
      visible={showSearchModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSearchModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.searchModal}>
          <View style={styles.searchModalHeader}>
            <Text style={styles.searchModalTitle}>Tìm kiếm sách</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSearchModal(false)}
            >
              <Feather name="x" size={24} color="#1C1C1E" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm theo tên sách, tác giả..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Feather name="x" size={16} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sortSection}>
            <Text style={styles.sortTitle}>Sắp xếp theo:</Text>
            <View style={styles.sortButtons}>
              {[
                { key: 'title', label: 'Tên sách' },
                { key: 'author', label: 'Tác giả' },
                { key: 'rating', label: 'Đánh giá' },
                { key: 'progress', label: 'Tiến độ' },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.sortButton,
                    sortBy === sort.key && styles.sortButtonActive
                  ]}
                  onPress={() => setSortBy(sort.key)}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === sort.key && styles.sortButtonTextActive
                  ]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.searchResults}>
            <Text style={styles.resultsCount}>
              {filteredBooks.length} kết quả tìm kiếm
            </Text>
          </View>
        </View>
      </View>
    </Modal>
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Thư viện sách</Text>
          <Text style={styles.headerSubtitle}>Khám phá những cuốn sách hay</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearchModal(true)}
          >
            <Feather name="search" size={20} color="#1C1C1E" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('BookStats')}
          >
            <Feather name="bar-chart-2" size={20} color="#1C1C1E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Chủ đề</Text>
          <Text style={styles.categoriesSubtitle}>
            {getCategoryCount(selectedCategory)} cuốn sách
          </Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.categoryIconContainer,
                { backgroundColor: selectedCategory === category.id ? category.color : 'rgba(255, 255, 255, 0.9)' }
              ]}>
                <Feather 
                  name={category.icon as any} 
                  size={18} 
                  color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
                />
              </View>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
              <Text style={[
                styles.categoryCount,
                selectedCategory === category.id && styles.categoryCountActive
              ]}>
                {getCategoryCount(category.id)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Books Grid */}
      <ScrollView 
        style={styles.booksContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksContent}
      >
        {filteredBooks.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={styles.bookCard}
            onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}
            activeOpacity={0.8}
          >
            {renderBookCover(book)}
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {book.author}
              </Text>
              <View style={styles.bookMeta}>
                <View style={styles.categoryTag}>
                  <Feather 
                    name={getCategoryIcon(book.category) as any} 
                    size={12} 
                    color="#8E8E93" 
                  />
                  <Text style={styles.categoryTagText}>{book.category}</Text>
                </View>
                <Text style={styles.readingTime}>{book.readingTime}</Text>
              </View>
              {book.progress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.bookProgressBar}>
                    <View style={[styles.bookProgressFill, { width: `${book.progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{book.progress}%</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {renderSearchModal()}
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
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  categoriesSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 24,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 80,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#1C1C1E',
    fontWeight: '700',
  },
  categoryCount: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 2,
  },
  categoryCountActive: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  booksContainer: {
    flex: 1,
  },
  booksContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  bookCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  bookInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    lineHeight: 22,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  readingTime: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bookProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 8,
  },
  bookProgressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  clearButton: {
    padding: 5,
  },
  sortSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sortTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  sortButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  searchResults: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default BookLibraryScreen; 