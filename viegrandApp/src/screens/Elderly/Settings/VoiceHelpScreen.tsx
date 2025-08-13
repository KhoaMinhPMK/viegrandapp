import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getCommandsByCategory } from '../../../services/voiceNavigationService';

const { width } = Dimensions.get('window');

const VoiceHelpScreen = ({ navigation }: any) => {
  const commandsByCategory = getCommandsByCategory();

  const categoryIcons = {
    main: 'home',
    entertainment: 'play',
    health: 'heart',
    communication: 'message-circle',
    settings: 'settings',
    games: 'gamepad-2',
    books: 'book-open',
  };

  const categoryColors = {
    main: '#007AFF',
    entertainment: '#FF6B6B',
    health: '#4ECDC4',
    communication: '#45B7D1',
    settings: '#96CEB4',
    games: '#FF9F43',
    books: '#5F27CD',
  };

  const categoryTitles = {
    main: 'Chức năng chính',
    entertainment: 'Giải trí',
    health: 'Sức khỏe',
    communication: 'Liên lạc',
    settings: 'Cài đặt',
    games: 'Trò chơi',
    books: 'Sách & Đọc',
  };

  const categoryOrder = ['main', 'communication', 'health', 'entertainment', 'games', 'books', 'settings'];

  const renderCategory = (category: string, commands: any[]) => (
    <View key={category} style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: categoryColors[category as keyof typeof categoryColors] }]}>
          <Feather 
            name={categoryIcons[category as keyof typeof categoryIcons] as any} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
        <Text style={styles.categoryTitle}>{categoryTitles[category as keyof typeof categoryTitles]}</Text>
      </View>
      
      <View style={styles.commandsList}>
        {commands.map((cmd, index) => (
          <View key={index} style={styles.commandItem}>
            <View style={styles.commandContent}>
              <Text style={styles.commandTitle}>{cmd.description}</Text>
              <View style={styles.examplesContainer}>
                {cmd.examples.map((example: string, exampleIndex: number) => (
                  <View key={exampleIndex} style={styles.exampleChip}>
                    <Text style={styles.exampleText}>"{example}"</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lệnh thoại</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionCard}>
          <Feather name="mic" size={24} color="#007AFF" />
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Cách sử dụng</Text>
            <Text style={styles.instructionText}>
              Nhấn vào nút micro ở giữa thanh điều hướng và nói lệnh của bạn
            </Text>
          </View>
        </View>
      </View>

      {/* Commands List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categoryOrder.map(category => {
          const commands = commandsByCategory[category];
          if (commands && commands.length > 0) {
            return renderCategory(category, commands);
          }
          return null;
        })}
        
        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Mẹo sử dụng</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Feather name="volume-2" size={16} color="#007AFF" />
              <Text style={styles.tipText}>Nói rõ ràng và chậm rãi</Text>
            </View>
            <View style={styles.tipItem}>
              <Feather name="mic" size={16} color="#007AFF" />
              <Text style={styles.tipText}>Đặt điện thoại gần miệng</Text>
            </View>
            <View style={styles.tipItem}>
              <Feather name="wifi" size={16} color="#007AFF" />
              <Text style={styles.tipText}>Đảm bảo kết nối internet ổn định</Text>
            </View>
            <View style={styles.tipItem}>
              <Feather name="repeat" size={16} color="#007AFF" />
              <Text style={styles.tipText}>Thử lại nếu lệnh không được hiểu</Text>
            </View>
            <View style={styles.tipItem}>
              <Feather name="help-circle" size={16} color="#007AFF" />
              <Text style={styles.tipText}>Nói "trợ giúp" để xem danh sách lệnh</Text>
            </View>
          </View>
        </View>

        {/* Quick Commands Section */}
        <View style={styles.quickCommandsContainer}>
          <Text style={styles.quickCommandsTitle}>🚀 Lệnh nhanh thường dùng</Text>
          <View style={styles.quickCommandsGrid}>
            <View style={styles.quickCommandItem}>
              <Text style={styles.quickCommandText}>"Tin nhắn"</Text>
            </View>
            <View style={styles.quickCommandItem}>
              <Text style={styles.quickCommandText}>"Sức khỏe"</Text>
            </View>
            <View style={styles.quickCommandItem}>
              <Text style={styles.quickCommandText}>"Đọc sách"</Text>
            </View>
            <View style={styles.quickCommandItem}>
              <Text style={styles.quickCommandText}>"Chơi game"</Text>
            </View>
            <View style={styles.quickCommandItem}>
              <Text style={styles.quickCommandText}>"Thời tiết"</Text>
            </View>
            <View style={styles.quickCommandItem}>
              <Text style={styles.quickCommandText}>"Cài đặt"</Text>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  instructionContent: {
    marginLeft: 12,
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  categoryContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  commandsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  commandItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  commandContent: {
    padding: 16,
  },
  commandTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  examplesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleChip: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  exampleText: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  tipsContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#6C757D',
    marginLeft: 12,
    lineHeight: 20,
  },
  quickCommandsContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickCommandsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  quickCommandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCommandItem: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  quickCommandText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default VoiceHelpScreen; 