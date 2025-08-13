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
const cardWidth = (width - 24 * 2 - 16) / 2; // (screenWidth - padding*2 - gap) / 2

const entertainmentItems = [
  {
    title: 'Trò chơi',
    subtitle: 'Sudoku, Dò mìn & khác',
    icon: 'aperture',
    screen: 'GameHub',
  },
  {
    title: 'Đọc sách',
    subtitle: 'Thư viện sách hay',
    icon: 'book-open',
    screen: 'BookLibrary',
  },
          {
          title: 'Xem Video',
          subtitle: 'Video nấu ăn hay',
          icon: 'youtube',
          screen: 'VideoPlayer',
        },
  {
    title: 'Bài tập',
    subtitle: 'Nâng cao sức khỏe',
    icon: 'trending-up',
    screen: 'Exercise', // Placeholder
  },
];

const EntertainmentHubScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giải trí</Text>
        </View>

        <View style={styles.grid}>
          {entertainmentItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
            >
                <View style={styles.iconContainer}>
                    <Feather name={item.icon} size={24} color="#1C1C1E" />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS-like light gray background
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80, // Space for transparent header
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  card: {
    width: cardWidth,
    height: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'flex-end', // Align content to bottom
    shadowColor: '#8A95A5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#E5E5EA', // Light gray background for all icons
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(60, 60, 67, 0.6)', // Standard iOS secondary text color
    marginTop: 2,
  },
});

export default EntertainmentHubScreen; 