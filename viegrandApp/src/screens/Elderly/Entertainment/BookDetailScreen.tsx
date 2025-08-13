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
  Alert,
  Share,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

// Mock data cho chi tiết sách
const mockBookDetail = {
  id: '1',
  title: 'Những Câu Chuyện Hay',
  author: 'Nguyễn Văn A',
  category: 'Văn học',
  coverColor: '#FF6B6B',
  description: 'Tuyển tập những câu chuyện ý nghĩa về cuộc sống, tình yêu và lòng dũng cảm. Cuốn sách này sẽ đưa bạn vào những hành trình cảm xúc sâu sắc, khám phá những giá trị nhân văn qua từng trang sách.',
  rating: 4.5,
  totalRatings: 128,
  totalPages: 156,
  currentPage: 23,
  readingTime: '2-3 giờ',
  publishDate: '2023',
  language: 'Tiếng Việt',
  chapters: [
    { id: 1, title: 'Chương 1: Khởi Đầu Mới', page: 1, duration: '15 phút' },
    { id: 2, title: 'Chương 2: Những Kỷ Niệm', page: 15, duration: '20 phút' },
    { id: 3, title: 'Chương 3: Tình Yêu Và Hy Vọng', page: 35, duration: '25 phút' },
    { id: 4, title: 'Chương 4: Lòng Dũng Cảm', page: 60, duration: '18 phút' },
    { id: 5, title: 'Chương 5: Kết Thúc Đẹp', page: 78, duration: '22 phút' },
  ],
  tags: ['Tình cảm', 'Cuộc sống', 'Nhân văn', 'Truyện ngắn'],
  relatedBooks: [
    { id: '2', title: 'Sức Khỏe Tuổi Vàng', author: 'Bác sĩ Trần Thị B', coverColor: '#4ECDC4' },
    { id: '3', title: 'Nghệ Thuật Nấu Ăn', author: 'Đầu bếp Lê Văn C', coverColor: '#45B7D1' },
  ],
};

const BookDetailScreen = ({ navigation, route }: any) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const bookId = route.params?.bookId || '1';
  const book = mockBookDetail;

  const progress = Math.round((book.currentPage / book.totalPages) * 100);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Tôi đang đọc cuốn sách "${book.title}" của ${book.author}. Rất hay và ý nghĩa!`,
        title: book.title,
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chia sẻ sách này');
    }
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    Alert.alert('Cảm ơn!', `Bạn đã đánh giá ${rating} sao cho cuốn sách này.`);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Đã xóa bookmark' : 'Đã thêm bookmark',
      isBookmarked ? 'Đã xóa sách khỏi danh sách yêu thích' : 'Đã thêm sách vào danh sách yêu thích'
    );
  };

  const renderStars = (rating: number, interactive = false, size = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={styles.starButton}
            onPress={() => interactive && handleRating(star)}
            disabled={!interactive}
          >
            <Feather
              name={star <= rating ? "star" : "star"}
              size={size}
              color={star <= rating ? "#FFD700" : "#E0E0E0"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderChapter = (chapter: any, index: number) => (
    <TouchableOpacity
      key={chapter.id}
      style={styles.chapterItem}
      onPress={() => navigation.navigate('BookReader', { bookId, chapterId: chapter.id })}
    >
      <View style={styles.chapterInfo}>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
        <Text style={styles.chapterMeta}>
          Trang {chapter.page} • {chapter.duration}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color="#8E8E93" />
    </TouchableOpacity>
  );

  const renderRelatedBook = (relatedBook: any) => (
    <TouchableOpacity
      key={relatedBook.id}
      style={styles.relatedBookCard}
      onPress={() => navigation.navigate('BookDetail', { bookId: relatedBook.id })}
    >
      <View style={[styles.relatedBookCover, { backgroundColor: relatedBook.coverColor }]}>
        <Text style={styles.relatedBookInitials}>
          {relatedBook.title.split(' ').map((word: string) => word[0]).join('').slice(0, 2)}
        </Text>
      </View>
      <View style={styles.relatedBookInfo}>
        <Text style={styles.relatedBookTitle} numberOfLines={2}>
          {relatedBook.title}
        </Text>
        <Text style={styles.relatedBookAuthor}>{relatedBook.author}</Text>
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
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleBookmark}>
            <Feather 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color={isBookmarked ? "#0EA5E9" : "#1C1C1E"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Feather name="share-2" size={20} color="#1C1C1E" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Book Cover and Basic Info */}
        <View style={styles.bookHeader}>
          <View style={[styles.bookCover, { backgroundColor: book.coverColor }]}>
            <Text style={styles.bookInitials}>
              {book.title.split(' ').map((word: string) => word[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>Tác giả: {book.author}</Text>
            <View style={styles.ratingContainer}>
              {renderStars(book.rating)}
              <Text style={styles.ratingText}>
                {book.rating} ({book.totalRatings} đánh giá)
              </Text>
            </View>
            <View style={styles.bookMeta}>
              <View style={styles.metaItem}>
                <Feather name="file-text" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>{book.totalPages} trang</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="clock" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>{book.readingTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="tag" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>{book.category}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        {book.currentPage > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến độ đọc</Text>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {book.currentPage} / {book.totalPages} trang
            </Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 4}>
            {book.description}
          </Text>
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowFullDescription(!showFullDescription)}
          >
            <Text style={styles.showMoreText}>
              {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
          <View style={styles.ratingSection}>
            {renderStars(userRating, true, 24)}
            <Text style={styles.ratingHint}>
              {userRating > 0 ? `Bạn đã đánh giá ${userRating} sao` : 'Chạm vào sao để đánh giá'}
            </Text>
          </View>
        </View>

        {/* Chapters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách chương</Text>
            <Text style={styles.chapterCount}>{book.chapters.length} chương</Text>
          </View>
          {book.chapters.map(renderChapter)}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thẻ</Text>
          <View style={styles.tagsContainer}>
            {book.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Related Books */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sách liên quan</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedBooksContainer}
          >
            {book.relatedBooks.map(renderRelatedBook)}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {book.currentPage > 0 ? (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('BookReader', { bookId })}
          >
            <Feather name="play" size={20} color="#FFFFFF" />
            <Text style={styles.continueButtonText}>Tiếp tục đọc</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('BookReader', { bookId })}
          >
            <Feather name="book-open" size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Bắt đầu đọc</Text>
          </TouchableOpacity>
        )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 20,
  },
  scrollView: {
    flex: 1,
  },
  bookHeader: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  bookCover: {
    width: 100,
    height: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bookInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 20,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    lineHeight: 32,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1C1C1E',
    textAlign: 'justify',
  },
  showMoreButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  showMoreText: {
    fontSize: 14,
    color: '#0EA5E9',
    textDecorationLine: 'underline',
  },
  ratingSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  ratingHint: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starButton: {
    padding: 5,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  chapterMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  relatedBooksContainer: {
    paddingHorizontal: 8,
  },
  relatedBookCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  relatedBookCover: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedBookInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  relatedBookInfo: {
    padding: 12,
  },
  relatedBookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  relatedBookAuthor: {
    fontSize: 12,
    color: '#8E8E93',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chapterCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  actionButtons: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 56, // Đảm bảo touch target đủ lớn cho người cao tuổi
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 56, // Đảm bảo touch target đủ lớn cho người cao tuổi
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default BookDetailScreen; 