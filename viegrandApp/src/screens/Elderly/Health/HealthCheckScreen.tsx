import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import groqApiService, { HealthReadings } from '../../../services/groqApi';
import { updateUserData } from '../../../services/api';

const { width, height } = Dimensions.get('window');

const HealthCheckScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [readings, setReadings] = useState<HealthReadings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập Camera',
            message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh máy đo.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('📸 Permission request error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const takePicture = async () => {
    try {
      console.log('📸 Checking camera permission...');
      const hasPermission = await requestCameraPermission();
      
      if (!hasPermission) {
        console.log('📸 Camera permission denied');
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập camera trong cài đặt.');
        return;
      }

      console.log('📸 Attempting to launch camera...');
      
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
        saveToPhotos: false,
        cameraType: 'back',
      });

      console.log('📸 Camera result:', result);
      console.log('📸 Result assets:', result.assets);
      console.log('📸 Result didCancel:', result.didCancel);
      console.log('📸 Result errorCode:', result.errorCode);
      console.log('📸 Result errorMessage:', result.errorMessage);

      if (result.didCancel) {
        console.log('📸 User cancelled camera');
        return;
      }

      if (result.errorCode) {
        console.error('📸 Camera error:', result.errorCode, result.errorMessage);
        Alert.alert('Lỗi Camera', `Không thể mở camera: ${result.errorMessage}`);
        return;
      }

      if (result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const base64Data = result.assets[0].base64;
        
        console.log('📸 Image URI:', imageUri);
        console.log('📸 Base64 length:', base64Data ? base64Data.length : 0);
        
        if (imageUri && base64Data) {
          setCapturedImage(imageUri);
          setReadings(null);
          setError(null);
          await analyzeHealthImage(base64Data);
        } else {
          console.error('📸 Missing image data');
          Alert.alert('Lỗi', 'Không thể lấy ảnh từ camera.');
        }
      } else {
        console.error('📸 No assets in result');
        Alert.alert('Lỗi', 'Không có ảnh được chụp.');
      }
    } catch (error) {
      console.error('📸 Camera error:', error);
      Alert.alert('Lỗi', 'Không thể mở camera. Vui lòng thử lại.');
    }
  };

  const analyzeHealthImage = async (base64Image: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await groqApiService.analyzeHealthImage(base64Image);

      if (result.success && result.data) {
        setReadings(result.data);
      } else {
        setError(result.error || 'Có lỗi xảy ra khi phân tích ảnh.');
      }
    } catch (error) {
      console.error('API error:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setReadings(null);
    setError(null);
  };

  const updateHealthData = async () => {
    if (!readings) {
      Alert.alert('Lỗi', 'Không có dữ liệu để cập nhật.');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      // Lấy email từ AsyncStorage
      const userEmail = await AsyncStorage.getItem('user_email');
      console.log('🔍 Retrieved user email:', userEmail);
      
      if (!userEmail) {
        console.log('❌ No user email found in AsyncStorage');
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        return;
      }

      // Chuẩn bị dữ liệu để gửi lên server
      const updateData = {
        blood_pressure_systolic: parseInt(readings.huyet_ap_tam_thu),
        blood_pressure_diastolic: parseInt(readings.huyet_ap_tam_truong),
        heart_rate: parseInt(readings.nhip_tim),
        last_health_check: new Date().toISOString()
      };

      console.log('📤 Sending health data to server:', updateData);
      console.log('📧 User email:', userEmail);

      // Gọi API cập nhật thông tin user
      const response = await updateUserData(userEmail, updateData);

      if (response.success) {
        Alert.alert(
          'Thành công', 
          'Thông tin huyết áp đã được cập nhật thành công!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        setError('Không thể cập nhật thông tin. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Update health data error:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { status: 'normal', color: '#34C759', text: 'Bình thường' };
    if (systolic < 130 && diastolic < 80) return { status: 'elevated', color: '#FF9500', text: 'Cao hơn bình thường' };
    if (systolic >= 130 || diastolic >= 80) return { status: 'high', color: '#FF3B30', text: 'Cao' };
    return { status: 'normal', color: '#34C759', text: 'Bình thường' };
  };

  const getHeartRateStatus = (rate: number) => {
    if (rate >= 60 && rate <= 100) return { status: 'normal', color: '#34C759', text: 'Bình thường' };
    if (rate < 60) return { status: 'low', color: '#FF9500', text: 'Chậm' };
    return { status: 'high', color: '#FF3B30', text: 'Nhanh' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kiểm tra sức khỏe</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {!capturedImage ? (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.cameraTitle}>Chụp ảnh máy đo</Text>
              <Text style={styles.cameraSubtitle}>
                Đặt máy đo huyết áp trong khung hình và chụp ảnh rõ nét
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
            >
              <Text style={styles.captureButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>Đang phân tích ảnh...</Text>
                </View>
              )}
            </View>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {readings && (
              <View style={styles.readingsContainer}>
                <Text style={styles.readingsTitle}>Kết quả đo</Text>
                
                <View style={styles.readingItem}>
                  <View style={styles.readingInfo}>
                    <Text style={styles.readingLabel}>Huyết áp tâm thu</Text>
                    <Text style={styles.readingUnit}>mmHg</Text>
                  </View>
                  <Text style={styles.readingValue}>{readings.huyet_ap_tam_thu}</Text>
                </View>
                
                <View style={styles.readingItem}>
                  <View style={styles.readingInfo}>
                    <Text style={styles.readingLabel}>Huyết áp tâm trương</Text>
                    <Text style={styles.readingUnit}>mmHg</Text>
                  </View>
                  <Text style={styles.readingValue}>{readings.huyet_ap_tam_truong}</Text>
                </View>
                
                <View style={styles.readingItem}>
                  <View style={styles.readingInfo}>
                    <Text style={styles.readingLabel}>Nhịp tim</Text>
                    <Text style={styles.readingUnit}>bpm</Text>
                  </View>
                  <Text style={styles.readingValue}>{readings.nhip_tim}</Text>
                </View>

                {/* Health Status Summary */}
                <View style={styles.statusContainer}>
                  {(() => {
                    const bpStatus = getBloodPressureStatus(
                      parseInt(readings.huyet_ap_tam_thu), 
                      parseInt(readings.huyet_ap_tam_truong)
                    );
                    const hrStatus = getHeartRateStatus(parseInt(readings.nhip_tim));
                    
                    return (
                      <>
                        <View style={styles.statusItem}>
                          <Text style={styles.statusLabel}>Huyết áp</Text>
                          <Text style={[styles.statusValue, { color: bpStatus.color }]}>
                            {bpStatus.text}
                          </Text>
                        </View>
                        <View style={styles.statusItem}>
                          <Text style={styles.statusLabel}>Nhịp tim</Text>
                          <Text style={[styles.statusValue, { color: hrStatus.color }]}>
                            {hrStatus.text}
                          </Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </View>
            )}

            <View style={styles.buttonContainer}>
              {readings && (
                <TouchableOpacity 
                  style={[styles.updateButton, isUpdating && styles.disabledButton]} 
                  onPress={updateHealthData}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
                  )}
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.retakeButton} 
                onPress={retakePicture}
              >
                <Text style={styles.retakeButtonText}>Chụp lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C7C7CC',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    width: width * 0.8,
    height: height * 0.3,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  cameraSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  capturedImage: {
    width: '100%',
    height: height * 0.25,
    borderRadius: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '400',
  },
  readingsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#C7C7CC',
  },
  readingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  readingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C7C7CC',
  },
  readingInfo: {
    flex: 1,
  },
  readingLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  readingUnit: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  readingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  statusContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  retakeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  retakeButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
  },
});

export default HealthCheckScreen; 