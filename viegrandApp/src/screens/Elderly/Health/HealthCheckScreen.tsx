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
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
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

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Quyền truy cập Thư viện ảnh',
            message: 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh máy đo.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('📸 Storage permission request error:', err);
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

  const selectImageFromGallery = async () => {
    try {
      console.log('📸 Checking storage permission...');
      const hasPermission = await requestStoragePermission();
      
      if (!hasPermission) {
        console.log('📸 Storage permission denied');
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt.');
        return;
      }

      console.log('📸 Attempting to launch image library...');
      
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
        selectionLimit: 1,
      });

      console.log('📸 Image library result:', result);
      console.log('📸 Result assets:', result.assets);
      console.log('📸 Result didCancel:', result.didCancel);
      console.log('📸 Result errorCode:', result.errorCode);
      console.log('📸 Result errorMessage:', result.errorMessage);

      if (result.didCancel) {
        console.log('📸 User cancelled image selection');
        return;
      }

      if (result.errorCode) {
        console.error('📸 Image library error:', result.errorCode, result.errorMessage);
        Alert.alert('Lỗi Thư viện ảnh', `Không thể mở thư viện ảnh: ${result.errorMessage}`);
        return;
      }

      if (result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const base64Data = result.assets[0].base64;
        
        console.log('📸 Selected Image URI:', imageUri);
        console.log('📸 Base64 length:', base64Data ? base64Data.length : 0);
        
        if (imageUri && base64Data) {
          setCapturedImage(imageUri);
          setReadings(null);
          setError(null);
          await analyzeHealthImage(base64Data);
        } else {
          console.error('📸 Missing image data');
          Alert.alert('Lỗi', 'Không thể lấy ảnh từ thư viện.');
        }
      } else {
        console.error('📸 No assets in result');
        Alert.alert('Lỗi', 'Không có ảnh được chọn.');
      }
    } catch (error) {
      console.error('📸 Image library error:', error);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh. Vui lòng thử lại.');
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
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Kiểm tra sức khỏe</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!capturedImage ? (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <View style={styles.iconContainer}>
                <Feather name="camera" size={48} color="#8E8E93" />
              </View>
              <Text style={styles.cameraTitle}>Chụp hoặc chọn ảnh máy đo</Text>
              <Text style={styles.cameraSubtitle}>
                Chụp ảnh mới hoặc chọn ảnh có sẵn từ thư viện để phân tích
              </Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.captureButton, styles.halfWidth]} 
                onPress={takePicture}
              >
                <Feather name="camera" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.captureButtonText}>Chụp ảnh</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.galleryButton, styles.halfWidth]} 
                onPress={selectImageFromGallery}
              >
                <Feather name="image" size={20} color="#007AFF" style={styles.buttonIcon} />
                <Text style={styles.galleryButtonText}>Chọn ảnh</Text>
              </TouchableOpacity>
            </View>
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
                <View style={styles.readingsHeader}>
                  <Feather name="check-circle" size={24} color="#34C759" />
                  <Text style={styles.readingsTitle}>Kết quả đo</Text>
                </View>
                
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
                    <>
                      <Feather name="upload" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                      <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              
              <View style={styles.retakeButtonRow}>
                <TouchableOpacity 
                  style={[styles.retakeButton, styles.halfWidth]} 
                  onPress={retakePicture}
                >
                  <Feather name="camera" size={18} color="#007AFF" style={styles.buttonIcon} />
                  <Text style={styles.retakeButtonText}>Chụp lại</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.retakeButton, styles.halfWidth]} 
                  onPress={selectImageFromGallery}
                >
                  <Feather name="image" size={18} color="#007AFF" style={styles.buttonIcon} />
                  <Text style={styles.retakeButtonText}>Chọn ảnh khác</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingTop: 35,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    width: width * 0.85,
    height: height * 0.35,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cameraTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  cameraSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
    fontWeight: '400',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  galleryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  galleryButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  resultContainer: {},
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
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  readingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  readingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
    letterSpacing: -0.5,
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
  retakeButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  retakeButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default HealthCheckScreen; 