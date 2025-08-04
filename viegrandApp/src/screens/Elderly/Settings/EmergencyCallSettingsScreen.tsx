import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import emergencyCallService from '../../../services/emergencyCall';

const EmergencyCallSettingsScreen = () => {
  const navigation = useNavigation();
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmergencySettings();
  }, []);

  const loadEmergencySettings = async () => {
    try {
      // Lấy thông tin hiện tại từ service (đã được load từ API)
      const currentInfo = emergencyCallService.getEmergencyInfo();
      setEmergencyNumber(currentInfo.number);
      setEmergencyName(currentInfo.name);
    } catch (error) {
      console.error('Error loading emergency settings:', error);
      
      // Fallback về cache nếu có lỗi
      try {
        const savedNumber = await AsyncStorage.getItem('emergency_number');
        const savedName = await AsyncStorage.getItem('emergency_name');
        
        if (savedNumber) {
          setEmergencyNumber(savedNumber);
        }
        
        if (savedName) {
          setEmergencyName(savedName);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmergencySettings = async () => {
    try {
      if (!emergencyNumber.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại khẩn cấp');
        return;
      }

      // Hiển thị loading
      setIsLoading(true);

      // Cập nhật qua API
      const result = await emergencyCallService.updateEmergencyNumber(
        emergencyNumber.trim(),
        emergencyName.trim() || 'Số khẩn cấp'
      );

      if (result.success) {
        Alert.alert(
          'Thành công',
          result.message || 'Đã cập nhật số khẩn cấp',
          [{ text: 'Đồng ý', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể cập nhật số khẩn cấp');
      }
    } catch (error) {
      console.error('Error saving emergency settings:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const testEmergencyCall = async () => {
    if (!emergencyNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại trước khi thử gọi');
      return;
    }

    Alert.alert(
      'Thử gọi',
      `Bạn có muốn thử gọi đến ${emergencyName || 'Số khẩn cấp'}?\nSố: ${emergencyNumber}`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Thử gọi', 
          style: 'default',
          onPress: () => emergencyCallService.makeEmergencyCall()
        }
      ]
    );
  };

  if (isLoading && emergencyNumber === '') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt số khẩn cấp</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin số khẩn cấp</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tên liên hệ</Text>
            <TextInput
              style={styles.input}
              value={emergencyName}
              onChangeText={setEmergencyName}
              placeholder="Ví dụ: Con trai, Bác sĩ, v.v."
              placeholderTextColor="#8E8E93"
              maxLength={50}
            />
            <Text style={styles.inputHint}>Tên hiển thị khi gọi khẩn cấp</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput
              style={styles.input}
              value={emergencyNumber}
              onChangeText={setEmergencyNumber}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
              maxLength={20}
            />
            <Text style={styles.inputHint}>Số sẽ được gọi khi nhấn nút khẩn cấp</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thử nghiệm</Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testEmergencyCall}
            activeOpacity={0.8}
          >
            <Feather name="phone" size={20} color="#FFFFFF" />
            <Text style={styles.testButtonText}>Thử gọi</Text>
          </TouchableOpacity>
          <Text style={styles.testDescription}>
            Kiểm tra xem số khẩn cấp có hoạt động không
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Lưu ý:</Text>
          <Text style={styles.infoText}>
            • Số khẩn cấp sẽ được sử dụng khi nhấn nút "Gọi khẩn cấp" trên màn hình chính{'\n'}
            • Đảm bảo số điện thoại chính xác để tránh gọi nhầm{'\n'}
            • Có thể thay đổi số này bất cứ lúc nào{'\n'}
            • Số sẽ được lưu trên server và đồng bộ trên tất cả thiết bị
          </Text>
        </View>
        
        {/* Thêm spacing để tránh bị che bởi bottom tab */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveEmergencySettings}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.buttonLoadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Đang lưu...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Lưu cài đặt</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#FFFFFF',
  },
  inputHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6D6D70',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 150, // Tăng spacing để tránh bị che bởi bottom tab
  },
  footer: {
    padding: 16,
    paddingBottom: 120, // Tăng padding bottom để tránh bị che bởi bottom tab
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3, // Thêm shadow cho Android
    shadowColor: '#000', // Thêm shadow cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EmergencyCallSettingsScreen; 