import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

// Mock data cho thống kê
const mockStats = {
  totalReadingTime: 12.5, // hours
  totalPagesRead: 234,
  booksCompleted: 3,
  currentStreak: 7, // days
  averageReadingSpeed: 2.3, // pages per minute
  favoriteGenres: ['Văn học', 'Sức khỏe', 'Tâm linh'],
  weeklyProgress: [
    { day: 'T2', pages: 15, time: 1.2 },
    { day: 'T3', pages: 22, time: 1.8 },
    { day: 'T4', pages: 18, time: 1.5 },
    { day: 'T5', pages: 25, time: 2.1 },
    { day: 'T6', pages: 20, time: 1.7 },
    { day: 'T7', pages: 30, time: 2.5 },
    { day: 'CN', pages: 12, time: 1.0 },
  ],
  recentBooks: [
    { title: 'Những Câu Chuyện Hay', progress: 45, pagesRead: 70 },
    { title: 'Sức Khỏe Tuổi Vàng', progress: 78, pagesRead: 69 },
    { title: 'Thiền Định Mỗi Ngày', progress: 23, pagesRead: 15 },
  ],
};

const BookStatsScreen = ({ navigation }: any) => {
  const getMaxPages = () => {
    return Math.max(...mockStats.weeklyProgress.map(day => day.pages));
  };

  const renderWeeklyChart = () => {
    const maxPages = getMaxPages();
    
    return (
      <View style={styles.chartContainer}>
        {mockStats.weeklyProgress.map((day, index) => (
          <View key={index} style={styles.chartColumn}>
            <View style={styles.chartBarContainer}>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    height: (day.pages / maxPages) * 80,
                    backgroundColor: day.pages > 20 ? '#0EA5E9' : '#E5E5EA'
                  }
                ]} 
              />
            </View>
            <Text style={styles.chartLabel}>{day.day}</Text>
            <Text style={styles.chartValue}>{day.pages}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderStatCard = (title: string, value: string, subtitle: string, icon: string, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Feather name={icon as any} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  const renderRecentBook = (book: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.recentBookCard}
      onPress={() => navigation.navigate('BookDetail', { bookId: index.toString() })}
    >
      <View style={styles.bookProgress}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>{book.progress}%</Text>
        </View>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.bookPages}>{book.pagesRead} trang đã đọc</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#8E8E93" />
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
        <Text style={styles.headerTitle}>Thống kê đọc sách</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {/* TODO: Share stats */}}
        >
          <Feather name="share-2" size={24} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Stats */}
        <View style={styles.mainStats}>
          {renderStatCard(
            'Tổng thời gian đọc',
            `${mockStats.totalReadingTime}h`,
            'Từ khi bắt đầu',
            'clock',
            '#0EA5E9'
          )}
          {renderStatCard(
            'Trang đã đọc',
            mockStats.totalPagesRead.toString(),
            'Tổng cộng',
            'book-open',
            '#10B981'
          )}
          {renderStatCard(
            'Sách hoàn thành',
            mockStats.booksCompleted.toString(),
            'Cuốn sách',
            'check-circle',
            '#F59E0B'
          )}
          {renderStatCard(
            'Chuỗi đọc',
            `${mockStats.currentStreak} ngày`,
            'Liên tiếp',
            'trending-up',
            '#EF4444'
          )}
        </View>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiến độ tuần này</Text>
          <View style={styles.chartSection}>
            {renderWeeklyChart()}
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#0EA5E9' }]} />
              <Text style={styles.legendText}>Trên 20 trang</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E5E5EA' }]} />
              <Text style={styles.legendText}>Dưới 20 trang</Text>
            </View>
          </View>
        </View>

        {/* Reading Speed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tốc độ đọc</Text>
          <View style={styles.speedCard}>
            <View style={styles.speedInfo}>
              <Text style={styles.speedValue}>{mockStats.averageReadingSpeed}</Text>
              <Text style={styles.speedUnit}>trang/phút</Text>
            </View>
            <View style={styles.speedDescription}>
              <Text style={styles.speedTitle}>Tốc độ trung bình</Text>
              <Text style={styles.speedSubtitle}>
                Bạn đọc nhanh hơn 85% người dùng cùng độ tuổi
              </Text>
            </View>
          </View>
        </View>

        {/* Favorite Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thể loại yêu thích</Text>
          <View style={styles.genresContainer}>
            {mockStats.favoriteGenres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Books */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sách gần đây</Text>
          {mockStats.recentBooks.map((book, index) => renderRecentBook(book, index))}
        </View>
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
  shareButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  chartSection: {
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
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chartBar: {
    width: 24, // Tăng width để dễ nhìn hơn
    borderRadius: 12,
  },
  chartLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  speedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  speedInfo: {
    alignItems: 'center',
    marginRight: 20,
  },
  speedValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  speedUnit: {
    fontSize: 14,
    color: '#8E8E93',
  },
  speedDescription: {
    flex: 1,
  },
  speedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  speedSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  recentBookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookProgress: {
    marginRight: 16,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  bookPages: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default BookStatsScreen; 