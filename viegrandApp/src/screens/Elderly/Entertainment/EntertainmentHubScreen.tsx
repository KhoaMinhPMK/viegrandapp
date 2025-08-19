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
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 24 * 2 - 16) / 2; // (screenWidth - padding*2 - gap) / 2

const entertainmentItems = [
  {
    title: 'Trò chơi',
    subtitle: 'Sudoku, Dò mìn & khác',
    icon: 'aperture',
    screen: 'GameHub',
    gradientColors: ['#3B82F6', '#1D4ED8'],
  },
  {
    title: 'Đọc sách',
    subtitle: 'Thư viện sách hay',
    icon: 'book-open',
    screen: 'BookLibrary',
    gradientColors: ['#3B82F6', '#1D4ED8'],
  },
  {
    title: 'Xem Video',
    subtitle: 'Video nấu ăn hay',
    icon: 'youtube',
    screen: 'VideoPlayer',
    gradientColors: ['#3B82F6', '#1D4ED8'],
  },
  {
    title: 'Bài tập',
    subtitle: 'Nâng cao sức khỏe',
    icon: 'trending-up',
    screen: 'Exercise', // Placeholder
    gradientColors: ['#3B82F6', '#1D4ED8'],
  },
];

const EntertainmentHubScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giải trí</Text>
        <Text style={styles.headerSubtitle}>Khám phá nội dung thú vị</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {entertainmentItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.gradientColors}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconContainer}>
                  <Feather name={item.icon} size={28} color="#FFFFFF" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Feather name="chevron-right" size={20} color="rgba(255, 255, 255, 0.8)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  card: {
    width: cardWidth,
    height: 'auto',
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  cardArrow: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default EntertainmentHubScreen; 