import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserRestrictedContent, updateUserRestrictedContent } from '../../../services/api';

const RestrictedContentSettingsScreen = ({ navigation }: any) => {
  const [restrictedKeywords, setRestrictedKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserRestrictedContent();
  }, []);

  const loadUserRestrictedContent = async () => {
    try {
      setIsLoading(true);
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
        
        console.log('Loading restricted content for user ID:', user.id);
        const result = await getUserRestrictedContent(user.id);
        console.log('API result:', result);
        
        if (result.success && result.restricted_contents) {
          setRestrictedKeywords(result.restricted_contents);
        } else if (result.success && Array.isArray(result.restricted_contents)) {
          // Handle case where restricted_contents is empty array
          setRestrictedKeywords(result.restricted_contents);
        } else {
          console.log('No restricted content found, using empty array');
          setRestrictedKeywords([]);
        }
      } else {
        console.log('No user data found in AsyncStorage');
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      }
    } catch (error) {
      console.error('Error loading restricted content:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách từ khóa hạn chế: ' + (error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRestrictedContent = async () => {
    if (!currentUserId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateUserRestrictedContent(currentUserId, restrictedKeywords);
      
      if (result.success) {
        Alert.alert('Thành công', 'Đã cập nhật danh sách từ khóa hạn chế');
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể cập nhật danh sách');
      }
    } catch (error) {
      console.error('Error saving restricted content:', error);
      Alert.alert('Lỗi', 'Không thể lưu danh sách từ khóa hạn chế');
    } finally {
      setIsSaving(false);
    }
  };

  const addKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase();
    if (!keyword) return;
    
    if (restrictedKeywords.includes(keyword)) {
      Alert.alert('Thông báo', 'Từ khóa này đã có trong danh sách');
      return;
    }
    
    setRestrictedKeywords([...restrictedKeywords, keyword]);
    setNewKeyword('');
  };

  const removeKeyword = (keyword: string) => {
    setRestrictedKeywords(restrictedKeywords.filter(k => k !== keyword));
  };

  const renderKeywordItem = (keyword: string, index: number) => (
    <View key={index} style={styles.keywordItem}>
      <Text style={styles.keywordText}>{keyword}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeKeyword(keyword)}
      >
        <Feather name="x" size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nội dung hạn chế</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={saveRestrictedContent}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Quản lý nội dung hạn chế</Text>
          <Text style={styles.descriptionText}>
            Thêm từ khóa để lọc bỏ video không phù hợp. Những video chứa từ khóa này sẽ không hiển thị trong kết quả tìm kiếm.
          </Text>
        </View>

        {/* Add new keyword */}
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Thêm từ khóa mới</Text>
          <View style={styles.addInputContainer}>
            <TextInput
              style={styles.addInput}
              placeholder="Nhập từ khóa cần hạn chế..."
              value={newKeyword}
              onChangeText={setNewKeyword}
              onSubmitEditing={addKeyword}
            />
            <TouchableOpacity
              style={[styles.addButton, !newKeyword.trim() && styles.addButtonDisabled]}
              onPress={addKeyword}
              disabled={!newKeyword.trim()}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current keywords */}
        <View style={styles.currentSection}>
          <Text style={styles.sectionTitle}>
            Từ khóa hiện tại ({restrictedKeywords.length})
          </Text>
          {restrictedKeywords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="shield" size={48} color="#E5E7EB" />
              <Text style={styles.emptyText}>Chưa có từ khóa hạn chế nào</Text>
            </View>
          ) : (
            <View style={styles.keywordsContainer}>
              {restrictedKeywords.map(renderKeywordItem)}
            </View>
          )}
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  saveButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  addSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  addInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#0EA5E9',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  currentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  keywordsContainer: {
    gap: 12,
  },
  keywordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  keywordText: {
    fontSize: 16,
    color: '#1C1C1E',
    flex: 1,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RestrictedContentSettingsScreen; 