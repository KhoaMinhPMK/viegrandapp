import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { BlurView } from '@react-native-community/blur';
import { BackgroundImages } from '../../../utils/assetUtils';

const gameItems = [
  {
    title: 'Sudoku',
    subtitle: 'Rèn luyện trí tuệ',
    icon: 'trello', // More block-like icon
    screen: 'Sudoku',
  },
  {
    title: 'Dò mìn',
    subtitle: 'Thử thách logic',
    icon: 'grid',
    screen: 'Minesweeper',
  },
  {
    title: 'Lật hình',
    subtitle: 'Rèn luyện trí nhớ',
    icon: 'copy',
    screen: 'MemoryMatch',
  },
  {
    title: 'Tìm từ',
    subtitle: 'Rèn luyện từ vựng',
    icon: 'search',
    screen: 'WordSearch',
  },
  // Thêm các game khác ở đây
];

const GameHubScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <Image source={BackgroundImages.secondary} style={styles.backgroundImage} resizeMode="cover" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={28} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trò chơi</Text>
          <Text style={styles.headerSubtitle}>Chọn một trò chơi để bắt đầu thư giãn và rèn luyện trí não.</Text>
        </View>
        <View style={styles.grid}>
          {gameItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cardTouchable}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <BlurView
                style={styles.blurOverlay}
                blurType="light"
                blurAmount={15}
                reducedTransparencyFallbackColor="white"
              />
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <Feather name={item.icon} size={24} color="#0EA5E9" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
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
  },
  backgroundImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
    padding: 5, // Larger touch target
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  cardTouchable: {
    width: '48%',
    aspectRatio: 1, // Make it a square
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    // Remove direct background color to see the blur
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Apply a semi-transparent background to content
  },
  card: {
    // This style is not directly used on a component anymore, but its children are
    // keeping the properties for reference in case of future refactoring.
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.1)', // Light blue tint
    marginBottom: 15,
  },
  textContainer: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default GameHubScreen; 