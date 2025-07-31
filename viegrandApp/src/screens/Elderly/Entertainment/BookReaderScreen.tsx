import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { BackgroundImages } from '../../../utils/assetUtils';

const { width, height } = Dimensions.get('window');

// Mock data cho sách
const mockBook = {
  title: 'Những Câu Chuyện Hay',
  author: 'Tác giả: Nguyễn Văn A',
  currentPage: 1,
  totalPages: 156,
  content: [
    {
      page: 1,
      text: `Chương 1: Khởi Đầu Mới

Một buổi sáng đẹp trời, ánh nắng vàng ươm chiếu qua cửa sổ, đánh thức cả căn nhà nhỏ. Bà Lan thức dậy với tâm trạng thoải mái, hít thở không khí trong lành của buổi sớm mai.

"Chào buổi sáng, thế giới!" bà tự nhủ với nụ cười hiền hậu.

Cuộc sống của bà Lan không có gì đặc biệt, nhưng mỗi ngày đều mang đến những điều mới mẻ. Bà thích ngồi bên cửa sổ, nhâm nhi tách trà nóng và đọc sách. Đó là thói quen đã theo bà suốt mấy chục năm qua.

"Hôm nay mình sẽ đọc gì nhỉ?" bà tự hỏi, tay vuốt ve bìa sách cũ kỹ mà bà yêu thích.`,
    },
    {
      page: 2,
      text: `Trong căn bếp nhỏ, tiếng nước sôi réo lên báo hiệu trà đã sẵn sàng. Bà Lan từ từ đứng dậy, đi về phía bếp với những bước chân chậm rãi nhưng vững chãi.

"Cuộc sống đơn giản nhưng hạnh phúc," bà nghĩ thầm.

Mỗi buổi sáng, bà đều dành thời gian để suy ngẫm về cuộc sống. Những kỷ niệm xưa cũ, những bài học quý giá, và những hy vọng cho tương lai. Dù tuổi đã cao, bà vẫn luôn giữ được sự tò mò và ham học hỏi.

"Tuổi già không có nghĩa là dừng lại," bà tự nhủ, "mà là cơ hội để khám phá những điều mới theo cách riêng của mình."`,
    },
    {
      page: 3,
      text: `Bên ngoài cửa sổ, những chú chim nhỏ đang hót líu lo, tạo nên bản nhạc tự nhiên tuyệt đẹp. Bà Lan mỉm cười, cảm nhận được sự kết nối với thiên nhiên.

"Thiên nhiên luôn có cách để an ủi chúng ta," bà nghĩ.

Cuốn sách trên tay bà là một tác phẩm văn học cổ điển, chứa đựng những câu chuyện về tình yêu, lòng dũng cảm và sự hy sinh. Mỗi trang sách như một cánh cửa mở ra thế giới mới, giúp bà thoát khỏi những lo toan hàng ngày.

"Đọc sách là cách tốt nhất để du lịch mà không cần rời khỏi nhà," bà tự nhủ với nụ cười hiền hậu.`,
    },
  ],
};

const BookReaderScreen = ({ navigation }: any) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [isNightMode, setIsNightMode] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Timer cho reading time
  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleControls = () => {
    Animated.timing(fadeAnim, {
      toValue: showControls ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowControls(!showControls);
  };

  const nextPage = () => {
    if (currentPageIndex < mockBook.content.length - 1) {
      Vibration.vibrate(50); // Haptic feedback
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      Vibration.vibrate(50); // Haptic feedback
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const toggleNightMode = () => {
    Vibration.vibrate(100);
    setIsNightMode(!isNightMode);
  };

  const toggleBookmark = () => {
    Vibration.vibrate(100);
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Đã xóa bookmark' : 'Đã thêm bookmark',
      isBookmarked ? 'Đã xóa bookmark cho trang này' : 'Đã đánh dấu trang này để đọc sau'
    );
  };

  const formatReadingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const currentContent = mockBook.content[currentPageIndex];

  // Theme colors
  const theme = {
    background: isNightMode ? '#1C1C1E' : '#F8F9FA',
    text: isNightMode ? '#FFFFFF' : '#1C1C1E',
    card: isNightMode ? '#2C2C2E' : '#FFFFFF',
    secondary: isNightMode ? '#8E8E93' : '#8E8E93',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isNightMode ? "light-content" : "dark-content"} />
      
      {/* Background */}
      <View style={[styles.background, { backgroundColor: theme.background }]} />
      
      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bookContainer}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.card }]}
              onPress={() => navigation.goBack()}
            >
              <Feather name="chevron-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={[styles.bookTitle, { color: theme.text }]}>{mockBook.title}</Text>
              <Text style={[styles.bookAuthor, { color: theme.secondary }]}>{mockBook.author}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.fontSizeButton, { backgroundColor: theme.card }]}
                onPress={() => setFontSize(Math.min(fontSize + 2, 24))}
              >
                <Feather name="plus" size={20} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fontSizeButton, { backgroundColor: theme.card }]}
                onPress={() => setFontSize(Math.max(fontSize - 2, 14))}
              >
                <Feather name="minus" size={20} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bookmarkButton, { backgroundColor: theme.card }]}
                onPress={toggleBookmark}
              >
                <Feather 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={isBookmarked ? "#0EA5E9" : theme.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nightModeButton, { backgroundColor: theme.card }]}
                onPress={toggleNightMode}
              >
                <Feather 
                  name={isNightMode ? "sun" : "moon"} 
                  size={20} 
                  color={theme.text} 
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Reading Progress */}
          <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: theme.secondary }]}>
                {formatReadingTime(readingTime)} • {Math.round(((currentPageIndex + 1) / mockBook.content.length) * 100)}% hoàn thành
              </Text>
            </View>
          </Animated.View>

          {/* Book Content */}
          <View style={[styles.contentContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.pageNumber, { color: theme.secondary }]}>
              Trang {currentContent.page} / {mockBook.totalPages}
            </Text>
            <Text style={[styles.contentText, { fontSize, color: theme.text }]}>
              {currentContent.text}
            </Text>
          </View>

          {/* Navigation Controls */}
          <Animated.View style={[styles.navigationControls, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: theme.card }, currentPageIndex === 0 && styles.navButtonDisabled]}
              onPress={prevPage}
              disabled={currentPageIndex === 0}
            >
              <Feather name="chevron-left" size={20} color={currentPageIndex === 0 ? theme.secondary : theme.text} />
              <Text style={[styles.navButtonText, { color: currentPageIndex === 0 ? theme.secondary : theme.text }]}>
                Trước
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <View style={[styles.progressBar, { backgroundColor: theme.secondary }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentPageIndex + 1) / mockBook.content.length) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.pageIndicatorText, { color: theme.secondary }]}>
                {currentPageIndex + 1} / {mockBook.content.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: theme.card }, currentPageIndex === mockBook.content.length - 1 && styles.navButtonDisabled]}
              onPress={nextPage}
              disabled={currentPageIndex === mockBook.content.length - 1}
            >
              <Text style={[styles.navButtonText, { color: currentPageIndex === mockBook.content.length - 1 ? theme.secondary : theme.text }]}>
                Tiếp
              </Text>
              <Feather name="chevron-right" size={20} color={currentPageIndex === mockBook.content.length - 1 ? theme.secondary : theme.text} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Floating action button for controls */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={toggleControls}
        activeOpacity={0.8}
      >
        <Feather name={showControls ? "eye-off" : "eye"} size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  bookContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
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
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#8E8E93',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontSizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  bookmarkButton: {
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
    marginLeft: 8,
  },
  nightModeButton: {
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
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  pageNumber: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  contentText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1C1C1E',
    textAlign: 'justify',
    fontWeight: '400',
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginHorizontal: 8,
  },
  navButtonTextDisabled: {
    color: '#8E8E93',
  },
  pageIndicator: {
    alignItems: 'center',
  },
  progressBar: {
    width: 120,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 2,
  },
  pageIndicatorText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressSection: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default BookReaderScreen; 