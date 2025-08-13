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
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const fontSizes = [
  { id: 'small', name: 'Nhỏ', size: 16 },
  { id: 'medium', name: 'Vừa', size: 18 },
  { id: 'large', name: 'Lớn', size: 20 },
  { id: 'xlarge', name: 'Rất lớn', size: 22 },
];

const themes = [
  { id: 'light', name: 'Sáng', bgColor: '#FFFFFF', textColor: '#1C1C1E' },
  { id: 'sepia', name: 'Vàng nhạt', bgColor: '#FDF6E3', textColor: '#2C1810' },
  { id: 'dark', name: 'Tối', bgColor: '#1C1C1E', textColor: '#FFFFFF' },
];

const lineSpacings = [
  { id: 'tight', name: 'Chặt', spacing: 1.2 },
  { id: 'normal', name: 'Bình thường', spacing: 1.5 },
  { id: 'loose', name: 'Rộng', spacing: 1.8 },
];

const BookSettingsScreen = ({ navigation }: any) => {
  const [selectedFontSize, setSelectedFontSize] = useState('medium');
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedLineSpacing, setSelectedLineSpacing] = useState('normal');

  const renderFontSizeOption = (option: any) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionCard,
        selectedFontSize === option.id && styles.optionCardSelected
      ]}
      onPress={() => setSelectedFontSize(option.id)}
    >
      <View style={styles.optionContent}>
        <Text style={[
          styles.optionText,
          { fontSize: option.size },
          selectedFontSize === option.id && styles.optionTextSelected
        ]}>
          {option.name}
        </Text>
        {selectedFontSize === option.id && (
          <Feather name="check" size={20} color="#0EA5E9" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderThemeOption = (option: any) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.themeOptionCard,
        { backgroundColor: option.bgColor },
        selectedTheme === option.id && styles.themeOptionCardSelected
      ]}
      onPress={() => setSelectedTheme(option.id)}
    >
      <View style={styles.themePreview}>
        <View style={[styles.themePreviewLine, { backgroundColor: option.textColor }]} />
        <View style={[styles.themePreviewLine, { backgroundColor: option.textColor, width: '70%' }]} />
        <View style={[styles.themePreviewLine, { backgroundColor: option.textColor, width: '90%' }]} />
      </View>
      <Text style={[
        styles.themeOptionText,
        { color: option.textColor }
      ]}>
        {option.name}
      </Text>
      {selectedTheme === option.id && (
        <View style={styles.checkmarkContainer}>
          <Feather name="check" size={20} color="#0EA5E9" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderLineSpacingOption = (option: any) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionCard,
        selectedLineSpacing === option.id && styles.optionCardSelected
      ]}
      onPress={() => setSelectedLineSpacing(option.id)}
    >
      <View style={styles.optionContent}>
        <View style={styles.spacingPreview}>
          <View style={[styles.spacingLine, { height: option.spacing * 4 }]} />
          <View style={[styles.spacingLine, { height: option.spacing * 4 }]} />
          <View style={[styles.spacingLine, { height: option.spacing * 4 }]} />
        </View>
        <Text style={[
          styles.optionText,
          selectedLineSpacing === option.id && styles.optionTextSelected
        ]}>
          {option.name}
        </Text>
        {selectedLineSpacing === option.id && (
          <Feather name="check" size={20} color="#0EA5E9" />
        )}
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
        <Text style={styles.headerTitle}>Cài đặt đọc</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            // TODO: Save settings
            navigation.goBack();
          }}
        >
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Font Size Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cỡ chữ</Text>
          <View style={styles.optionsGrid}>
            {fontSizes.map(renderFontSizeOption)}
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giao diện</Text>
          <View style={styles.themeGrid}>
            {themes.map(renderThemeOption)}
          </View>
        </View>

        {/* Line Spacing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khoảng cách dòng</Text>
          <View style={styles.optionsGrid}>
            {lineSpacings.map(renderLineSpacingOption)}
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xem trước</Text>
          <View style={[
            styles.previewContainer,
            { 
              backgroundColor: themes.find(t => t.id === selectedTheme)?.bgColor || '#FFFFFF',
            }
          ]}>
            <Text style={[
              styles.previewText,
              { 
                fontSize: fontSizes.find(f => f.id === selectedFontSize)?.size || 18,
                lineHeight: (lineSpacings.find(l => l.id === selectedLineSpacing)?.spacing || 1.5) * 18,
                color: themes.find(t => t.id === selectedTheme)?.textColor || '#1C1C1E',
              }
            ]}>
              Đây là ví dụ về cách văn bản sẽ hiển thị với các cài đặt đã chọn. Bạn có thể điều chỉnh cỡ chữ, giao diện và khoảng cách dòng để có trải nghiệm đọc thoải mái nhất.
            </Text>
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
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#0EA5E9',
    minHeight: 44, // Đảm bảo touch target đủ lớn
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: '#0EA5E9',
    borderWidth: 1,
  },
  optionContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  optionTextSelected: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  themeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOptionCard: {
    width: '30%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  themeOptionCardSelected: {
    borderColor: '#0EA5E9',
    borderWidth: 2,
  },
  themePreview: {
    width: '100%',
    height: 40,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  themePreviewLine: {
    height: 3,
    borderRadius: 2,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacingPreview: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
    marginBottom: 8,
  },
  spacingLine: {
    width: 3,
    backgroundColor: '#1C1C1E',
    borderRadius: 2,
    marginHorizontal: 1,
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  previewText: {
    textAlign: 'justify',
  },
});

export default BookSettingsScreen; 