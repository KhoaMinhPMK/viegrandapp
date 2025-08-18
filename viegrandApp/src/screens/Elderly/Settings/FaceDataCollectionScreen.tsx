import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../../../contexts/AuthContext';
import { uploadFaceData, uploadFaceDataAlternative, testFaceUploadServer, testSimpleUpload, testFileUpload } from '../../../services/api';

const { width, height } = Dimensions.get('window');

const FaceDataCollectionScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find(device => device.position === 'front');

  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordedVideoPath, setRecordedVideoPath] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [serverStatus, setServerStatus] = useState<string>('unknown');

  useEffect(() => {
    requestCameraPermission();
    testServerConnection();
  }, []);

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập camera',
            message: 'Ứng dụng cần quyền truy cập camera để ghi lại dữ liệu khuôn mặt',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          Alert.alert('Quyền bị từ chối', 'Vui lòng cấp quyền camera trong cài đặt');
        }
      } else {
        const permission = await Camera.requestCameraPermission();
        setHasPermission(permission === 'granted');
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Lỗi', 'Không thể yêu cầu quyền camera');
    }
  };

  const startRecording = async () => {
    if (!camera.current || isRecording) return;

    try {
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);

      const video = await camera.current.startRecording({
        onRecordingFinished: (video) => {
          console.log('Recording finished:', video.path);
          setRecordedVideoPath(video.path);
          setIsRecording(false);
          if (timer) clearInterval(timer);
          setRecordingTimer(null);
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          setIsRecording(false);
          if (timer) clearInterval(timer);
          setRecordingTimer(null);
          Alert.alert('Lỗi', 'Không thể ghi video. Vui lòng thử lại.');
        },
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi video');
    }
  };

  const stopRecording = async () => {
    if (!camera.current || !isRecording) return;

    try {
      await camera.current.stopRecording();
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const uploadVideo = async () => {
    if (!recordedVideoPath || !user?.email) {
      Alert.alert('Lỗi', 'Không có video để tải lên');
      return;
    }

    // Check server connection first
    if (serverStatus !== 'connected') {
      Alert.alert(
        'Lỗi kết nối', 
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thử lại', onPress: testServerConnection }
        ]
      );
      return;
    }

    try {
      setIsUploading(true);
      
      console.log('🔄 Starting video upload...');
      console.log('🔄 Video path:', recordedVideoPath);
      console.log('🔄 User email:', user.email);
      
      // Try the main upload method first
      let result = await uploadFaceData(user.email, recordedVideoPath);
      
      // If it fails, try the alternative method
      if (!result.success) {
        console.log('🔄 Main upload failed, trying alternative method...');
        result = await uploadFaceDataAlternative(user.email, recordedVideoPath);
      }
      
      if (result.success) {
        const isAppended = result.data?.is_appended;
        const message = isAppended 
          ? 'Dữ liệu khuôn mặt đã được cập nhật thành công'
          : 'Dữ liệu khuôn mặt đã được tải lên thành công';
        
        Alert.alert(
          'Thành công',
          message,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Lỗi tải lên', 
          result.message || 'Không thể tải lên video. Vui lòng thử lại.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Thử lại', onPress: uploadVideo }
          ]
        );
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert(
        'Lỗi', 
        'Có lỗi xảy ra khi tải lên video. Vui lòng kiểm tra kết nối mạng và thử lại.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thử lại', onPress: uploadVideo }
        ]
      );
    } finally {
      setIsUploading(false);
    }
  };

  const retakeVideo = () => {
    setRecordedVideoPath(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const testServerConnection = async () => {
    try {
      setServerStatus('testing');
      const result = await testFaceUploadServer();
      if (result.success) {
        setServerStatus('connected');
        console.log('✅ Server connection test successful:', result.data);
      } else {
        setServerStatus('failed');
        console.error('❌ Server connection test failed:', result.message);
      }
    } catch (error) {
      setServerStatus('failed');
      console.error('❌ Server connection test error:', error);
    }
  };

  const testUpload = async () => {
    try {
      console.log('🔄 Testing simple upload...');
      const result = await testSimpleUpload();
      if (result.success) {
        Alert.alert('Test thành công', 'Upload test hoạt động bình thường');
      } else {
        Alert.alert('Test thất bại', result.message || 'Upload test không thành công');
      }
    } catch (error) {
      console.error('Test upload error:', error);
      Alert.alert('Lỗi test', 'Có lỗi xảy ra khi test upload');
    }
  };

  const testAlternativeUpload = async () => {
    if (!recordedVideoPath || !user?.email) {
      Alert.alert('Lỗi', 'Không có video để test');
      return;
    }

    try {
      console.log('🔄 Testing alternative upload method...');
      const result = await uploadFaceDataAlternative(user.email, recordedVideoPath);
      if (result.success) {
        Alert.alert('Test thành công', 'Alternative upload method hoạt động');
      } else {
        Alert.alert('Test thất bại', result.message || 'Alternative upload method không thành công');
      }
    } catch (error) {
      console.error('Test alternative upload error:', error);
      Alert.alert('Lỗi test', 'Có lỗi xảy ra khi test alternative upload');
    }
  };

  const testFileUploadMethod = async () => {
    if (!recordedVideoPath) {
      Alert.alert('Lỗi', 'Không có video để test');
      return;
    }

    try {
      console.log('🔄 Testing file upload with test endpoint...');
      const result = await testFileUpload(recordedVideoPath);
      if (result.success) {
        Alert.alert('Test thành công', 'File upload test hoạt động\n\nDữ liệu nhận được:\n' + JSON.stringify(result.data, null, 2));
      } else {
        Alert.alert('Test thất bại', result.message || 'File upload test không thành công');
      }
    } catch (error) {
      console.error('Test file upload error:', error);
      Alert.alert('Lỗi test', 'Có lỗi xảy ra khi test file upload');
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dữ liệu khuôn mặt</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.permissionContainer}>
          <Feather name="camera-off" size={64} color="#C7C7CC" />
          <Text style={styles.permissionTitle}>Cần quyền camera</Text>
          <Text style={styles.permissionMessage}>
            Ứng dụng cần quyền truy cập camera để ghi lại dữ liệu khuôn mặt của bạn
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Cấp quyền</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dữ liệu khuôn mặt</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.permissionTitle}>Đang tải camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dữ liệu khuôn mặt</Text>
        <TouchableOpacity onPress={testServerConnection} style={styles.testButton}>
          <Feather 
            name={serverStatus === 'connected' ? 'check-circle' : serverStatus === 'failed' ? 'x-circle' : 'wifi'} 
            size={20} 
            color={serverStatus === 'connected' ? '#34C759' : serverStatus === 'failed' ? '#FF3B30' : '#FF9500'} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        {recordedVideoPath ? (
          <View style={styles.previewContainer}>
            <View style={styles.previewPlaceholder}>
              <Feather name="video" size={48} color="#007AFF" />
              <Text style={styles.previewText}>Video đã ghi</Text>
              <Text style={styles.previewSubtext}>Thời gian: {formatTime(recordingTime)}</Text>
            </View>
          </View>
        ) : (
          <Camera
            ref={camera}
            style={styles.camera}
            device={device}
            isActive={true}
            video={true}
            audio={false}
          />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>{formatTime(recordingTime)}</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Hướng dẫn</Text>
          <Text style={styles.instructionsText}>
            • Đặt khuôn mặt vào khung hình{'\n'}
            • Nhìn thẳng vào camera{'\n'}
            • Ghi video ít nhất 5 giây{'\n'}
            • Đảm bảo ánh sáng đủ sáng
          </Text>
          
          {/* Server Status */}
          <View style={styles.serverStatusContainer}>
            <Text style={styles.serverStatusTitle}>Trạng thái máy chủ:</Text>
            <View style={styles.serverStatusRow}>
              <View style={[
                styles.serverStatusDot, 
                { backgroundColor: serverStatus === 'connected' ? '#34C759' : serverStatus === 'failed' ? '#FF3B30' : '#FF9500' }
              ]} />
              <Text style={[
                styles.serverStatusText,
                { color: serverStatus === 'connected' ? '#34C759' : serverStatus === 'failed' ? '#FF3B30' : '#FF9500' }
              ]}>
                {serverStatus === 'connected' ? 'Kết nối thành công' : 
                 serverStatus === 'failed' ? 'Kết nối thất bại' : 
                 serverStatus === 'testing' ? 'Đang kiểm tra...' : 'Chưa kiểm tra'}
              </Text>
            </View>
            
            {/* Test Upload Button */}
            <TouchableOpacity style={styles.testUploadButton} onPress={testUpload}>
              <Feather name="upload" size={16} color="#007AFF" />
              <Text style={styles.testUploadButtonText}>Test Upload</Text>
            </TouchableOpacity>
            
            {/* Alternative Test Upload Button */}
            {recordedVideoPath && (
              <TouchableOpacity style={styles.testUploadButton} onPress={testAlternativeUpload}>
                <Feather name="refresh-cw" size={16} color="#FF9500" />
                <Text style={[styles.testUploadButtonText, { color: '#FF9500' }]}>Test Alternative</Text>
              </TouchableOpacity>
            )}

            {/* File Upload Test Button */}
            {recordedVideoPath && (
              <TouchableOpacity style={styles.testUploadButton} onPress={testFileUploadMethod}>
                <Feather name="upload" size={16} color="#007AFF" />
                <Text style={styles.testUploadButtonText}>Test File Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Control buttons */}
        <View style={styles.controlsContainer}>
          {recordedVideoPath ? (
            <>
              <TouchableOpacity style={styles.retakeButton} onPress={retakeVideo}>
                <Feather name="refresh-cw" size={20} color="#007AFF" />
                <Text style={styles.retakeButtonText}>Ghi lại</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]} 
                onPress={uploadVideo}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="upload" size={20} color="#FFFFFF" />
                )}
                <Text style={styles.uploadButtonText}>
                  {isUploading ? 'Đang tải lên...' : 'Tải lên'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.recordButton, isRecording && styles.recordButtonRecording]} 
              onPress={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <View style={styles.stopIcon} />
              ) : (
                <View style={styles.recordIcon} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  testButton: {
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  previewSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 8,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  serverStatusContainer: {
    marginTop: 16,
  },
  serverStatusTitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  serverStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  serverStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  testUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  testUploadButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  recordButtonRecording: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  recordIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 20,
  },
  retakeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  uploadButtonDisabled: {
    backgroundColor: '#666666',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionMessage: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FaceDataCollectionScreen; 