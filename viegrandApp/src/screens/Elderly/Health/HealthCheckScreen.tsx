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
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import groqApiService, { HealthReadings } from '../../../services/groqApi';

const { width, height } = Dimensions.get('window');

const HealthCheckScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏥 Kiểm tra sức khỏe</Text>
      </View>

      <View style={styles.content}>
        {!capturedImage ? (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraPlaceholderText}>📷</Text>
              <Text style={styles.cameraPlaceholderText}>Chụp ảnh máy đo</Text>
            </View>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Text style={styles.captureButtonText}>📸 Chụp ảnh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Đang phân tích ảnh...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>❌ {error}</Text>
              </View>
            )}

            {readings && (
              <View style={styles.readingsContainer}>
                <Text style={styles.readingsTitle}>📊 Kết quả đo</Text>
                
                <View style={styles.readingItem}>
                  <Text style={styles.readingLabel}>💓 Huyết áp tâm thu</Text>
                  <Text style={styles.readingValue}>{readings.huyet_ap_tam_thu}</Text>
                </View>
                
                <View style={styles.readingItem}>
                  <Text style={styles.readingLabel}>💔 Huyết áp tâm trương</Text>
                  <Text style={styles.readingValue}>{readings.huyet_ap_tam_truong}</Text>
                </View>
                
                <View style={styles.readingItem}>
                  <Text style={styles.readingLabel}>❤️ Nhịp tim</Text>
                  <Text style={styles.readingValue}>{readings.nhip_tim}</Text>
                </View>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
                <Text style={styles.retakeButtonText}>🔄 Chụp lại</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  cameraPlaceholderText: {
    fontSize: 24,
    color: '#666',
    marginBottom: 8,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
  },
  capturedImage: {
    width: '100%',
    height: height * 0.3,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  readingsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  readingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  readingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  readingLabel: {
    fontSize: 16,
    color: '#333',
  },
  readingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HealthCheckScreen; 