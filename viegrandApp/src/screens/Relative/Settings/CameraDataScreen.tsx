import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getElderlyWithCameras, addElderlyCamera, removeElderlyCamera } from '../../../services/api';
import { launchImageLibrary, launchCamera, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';

interface ElderlyUser {
  userId: number;
  userName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  private_key: string;
  cameras: string[];
  room?: string;
}

const { width } = Dimensions.get('window');

const CameraDataScreen: React.FC = () => {
  const navigation = useNavigation();
  const [elderlyUsers, setElderlyUsers] = useState<ElderlyUser[]>([]);
  const [selectedElderly, setSelectedElderly] = useState<ElderlyUser | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const webViewRef = useRef<WebView>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showAddCamera, setShowAddCamera] = useState(false);
  const [newCameraUrl, setNewCameraUrl] = useState('');
  const [newCameraRoom, setNewCameraRoom] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isAddingCamera, setIsAddingCamera] = useState(false);
  const [isRemovingCamera, setIsRemovingCamera] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load elderly users with cameras
  const loadElderlyUsers = async () => {
    try {
      setIsLoadingUsers(true);
      
      const userDataStr = await AsyncStorage.getItem('user');
      if (!userDataStr) {
        console.error('No user data found in cache');
        setElderlyUsers([]);
        return;
      }

      const currentUser = JSON.parse(userDataStr);
      const relativeUserId = currentUser.id || currentUser.userId;

      console.log('🔄 Loading elderly users with cameras for relative ID:', relativeUserId);

      const result = await getElderlyWithCameras(relativeUserId);

      if (result.success && result.data) {
        console.log('✅ Loaded elderly users with cameras:', result.data);
        console.log('📊 Current elderly users count:', result.data.length);
        setElderlyUsers(result.data);
        
        // Update selectedElderly if it exists to point to the fresh data
        if (selectedElderly) {
          const updatedElderly = result.data.find(elderly => elderly.private_key === selectedElderly.private_key);
          if (updatedElderly) {
            setSelectedElderly(updatedElderly);
            console.log('🔄 Updated selectedElderly with fresh data');
          }
        }
        
        console.log('🔄 State updated with new elderly users');
      } else {
        console.error('❌ Failed to load elderly users with cameras:', result.message);
        Alert.alert('Lỗi', result.message || 'Không thể tải danh sách người thân');
        setElderlyUsers([]);
      }
    } catch (error) {
      console.error('❌ Error loading elderly users with cameras:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      setElderlyUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadElderlyUsers();
    }, [])
  );

  const validateUrl = (inputUrl: string) => {
    try {
      const urlObj = new URL(inputUrl);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handleElderlySelect = (elderly: ElderlyUser) => {
    setSelectedElderly(elderly);
    setSelectedCamera('');
    setShowWebView(false);
    setLoadError(false);
    setNewCameraUrl('');
    setIsValidUrl(false);
    
    // If elderly has no cameras, automatically show add camera screen
    if (!elderly.cameras || elderly.cameras.length === 0) {
      console.log('📱 No cameras found for elderly, auto-showing add camera screen');
      setShowAddCamera(true);
    } else {
      setShowAddCamera(false);
    }
  };

  const handleCameraSelect = (cameraUrl: string) => {
    setSelectedCamera(cameraUrl);
    setShowWebView(true);
    setIsLoading(true);
    setLoadError(false);
    
    // Set a timeout for loading (30 seconds)
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setLoadError(true);
      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối đến camera. Vui lòng kiểm tra lại và thử lại.',
        [
          { text: 'Thử lại', onPress: () => handleRetry() },
          { text: 'Quay lại', onPress: () => setShowWebView(false) }
        ]
      );
    }, 30000);
    
    setTimeoutId(timeout);
  };

  const handleRetry = () => {
    setLoadError(false);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleWebViewLoadStart = () => {
    setIsLoading(true);
    setLoadError(false);
  };

  const handleWebViewLoadEnd = () => {
    setIsLoading(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const handleWebViewProgress = ({ nativeEvent }: any) => {
    const progress = nativeEvent.progress || 0;
    setLoadProgress(progress);
    if (progress > 0.1) {
      setIsLoading(false);
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setIsLoading(false);
    setLoadError(true);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    console.log('WebView Error:', nativeEvent);
    
    Alert.alert(
      'Lỗi kết nối',
      'Không thể kết nối đến camera. Vui lòng kiểm tra lại và thử lại.',
      [
        { text: 'Thử lại', onPress: () => handleRetry() },
        { text: 'Quay lại', onPress: () => setShowWebView(false) }
      ]
    );
  };

  const handleWebViewHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log('WebView HTTP Error:', nativeEvent);
    
    if (nativeEvent.statusCode >= 400) {
      Alert.alert(
        'Lỗi kết nối',
        `Không thể kết nối đến camera (Mã lỗi: ${nativeEvent.statusCode}). Vui lòng kiểm tra lại.`,
        [
          { text: 'Thử lại', onPress: () => handleRetry() },
          { text: 'Quay lại', onPress: () => setShowWebView(false) }
        ]
      );
    }
  };

  const handleGoBack = () => {
    if (showWebView) {
      setShowWebView(false);
      setSelectedCamera('');
      setLoadError(false);
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    } else if (showAddCamera) {
      // If elderly has no cameras, go straight back to elderly list
      const isEmptyForSelected = !selectedElderly?.cameras || selectedElderly.cameras.length === 0;
      setShowAddCamera(false);
      setNewCameraUrl('');
      setIsValidUrl(false);
      if (isEmptyForSelected) {
        setSelectedElderly(null);
      }
    } else if (selectedElderly) {
      setSelectedElderly(null);
      setSelectedCamera('');
      setShowAddCamera(false);
      setNewCameraUrl('');
      setIsValidUrl(false);
    } else {
      navigation.goBack();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      setLoadError(false);
      setIsLoading(true);
      webViewRef.current.reload();
    }
  };

  const handleOpenInBrowser = () => {
    if (!selectedCamera) return;
    Linking.openURL(selectedCamera).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở liên kết trong trình duyệt.');
    });
  };

  // Custom HTML for video streaming optimization
  const getVideoOptimizedHTML = (videoUrl: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .video-container {
              width: 100%;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            video {
              max-width: 100%;
              max-height: 100vh;
              width: auto;
              height: auto;
            }
            .loading {
              color: white;
              font-size: 16px;
              text-align: center;
            }
            .error {
              color: #ff6b6b;
              font-size: 16px;
              text-align: center;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="video-container">
            <video 
              autoplay 
              muted 
              controls 
              playsinline
              preload="auto"
              onloadstart="document.getElementById('loading').style.display='block'"
              oncanplay="document.getElementById('loading').style.display='none'"
              onerror="document.getElementById('error').style.display='block'"
            >
              <source src="${videoUrl}" type="video/mp4">
              <source src="${videoUrl}" type="video/webm">
              <source src="${videoUrl}" type="video/ogg">
              <div id="error" class="error" style="display:none">
                Không thể tải video. Vui lòng kiểm tra lại URL.
              </div>
            </video>
            <div id="loading" class="loading">
              Đang tải video...
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Check if URL is likely a video stream
  const isVideoStream = (url: string) => {
    return /\.(mp4|webm|ogg|m3u8|ts)(\?|$)/i.test(url);
  };

  // JS injected into pages to signal readiness quickly
  const injectedReadyScript = `
    (function() {
      function post(type, payload) {
        try { window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload })); } catch (e) {}
      }
      function postReady(extra) { post('ready', extra); }
      ['log','warn','error'].forEach(function(level){
        const orig = console[level];
        console[level] = function(){
          try { post('console_'+level, { args: Array.from(arguments).map(String) }); } catch(e) {}
          try { orig && orig.apply(console, arguments); } catch(e) {}
        }
      });
      window.addEventListener('error', function(e){ post('page_error', { message: e.message, filename: e.filename, lineno: e.lineno }); });
      window.addEventListener('unhandledrejection', function(e){ post('page_unhandledrejection', { reason: String(e.reason) }); });
      if (document.readyState === 'interactive' || document.readyState === 'complete') postReady({ state: document.readyState });
      document.addEventListener('DOMContentLoaded', function() { postReady({ event: 'DOMContentLoaded' }); });
      const vid = document.querySelector('video');
      if (vid) {
        vid.addEventListener('canplay', function() { postReady({ event: 'video_canplay' }); });
        vid.addEventListener('playing', function() { postReady({ event: 'video_playing' }); });
      }
      let tries = 0;
      const iv = setInterval(function() {
        tries++;
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
          postReady({ tick: tries, state: document.readyState });
          clearInterval(iv);
        }
        if (tries > 60) clearInterval(iv);
      }, 500);
    })();
    true;
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data || '{}');
      if (data.type === 'ready') {
        setIsLoading(false);
        setLoadError(false);
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
      } else if (data.type && String(data.type).startsWith('console_')) {
        const level = String(data.type).replace('console_','');
        console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log']('[WebView]', ...(data.payload?.args || []));
      } else if (data.type === 'page_error' || data.type === 'page_unhandledrejection') {
        console.error('[WebView]', data.type, data.payload);
      }
    } catch {}
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const getAvatarColor = (name: string) => {
    const colors = ['#3B82F6', '#1E40AF', '#1D4ED8', '#2563EB', '#3B82F6'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddCamera = () => {
    setShowAddCamera(true);
  };

  const handleNewCameraUrlChange = (text: string) => {
    setNewCameraUrl(text);
    const isValid = validateUrl(text);
    setIsValidUrl(isValid);
  };

  // QR Code detection helpers (reused from PremiumManagementScreen)
  function extractCameraUrl(raw: string): string | null {
    if (!raw) return null;
    const text = String(raw).trim();
    
    // Try to parse JSON payloads
    try {
      const obj = JSON.parse(text);
      const candidate = obj.url || obj.cameraUrl || obj.camera_url || obj.link || obj.uri;
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    } catch { }
    
    // Fallback: assume raw string IS the URL if it looks like a URL
    if (text.startsWith('http://') || text.startsWith('https://')) {
      return text;
    }
    
    return null;
  }

  async function detectQRFromUri(uri?: string, base64?: string) {
    try {
      const res = await RNQRGenerator.detect({ uri: uri as any, base64: base64 as any });
      const values: string[] = res?.values || [];
      if (!values.length) {
        Alert.alert('Không tìm thấy QR', 'Ảnh không chứa mã QR hợp lệ.');
        return;
      }
      
      // Pick first value
      const cameraUrl = extractCameraUrl(values[0]);
      if (!cameraUrl) {
        Alert.alert('Lỗi', 'QR không chứa camera URL hợp lệ.');
        return;
      }
      
      // Validate URL
      const isValid = validateUrl(cameraUrl);
      if (!isValid) {
        Alert.alert('URL không hợp lệ', 'Camera URL phải bắt đầu bằng http:// hoặc https://');
        return;
      }
      
      // Set default room name if not already set
      if (!newCameraRoom.trim()) {
        setNewCameraRoom('Phòng chính');
      }
      
      // Automatically add the camera
      await handleSubmitNewCamera(cameraUrl);
    } catch (err) {
      console.error('QR detect error:', err);
      Alert.alert('Lỗi', 'Không thể đọc mã QR từ ảnh.');
    }
  }

  async function pickImageAndDetectQR() {
    const options: ImageLibraryOptions = { 
      mediaType: 'photo', 
      quality: 0.8, 
      includeBase64: false, 
      selectionLimit: 1 
    };
    const result = await launchImageLibrary(options);
    if (result.didCancel) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    await detectQRFromUri(asset.uri || undefined, undefined);
  }

  async function captureImageAndDetectQR() {
    const options: CameraOptions = { 
      mediaType: 'photo', 
      quality: 0.8, 
      includeBase64: false, 
      saveToPhotos: false 
    };
    const result = await launchCamera(options);
    if (result.didCancel) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    await detectQRFromUri(asset.uri || undefined, undefined);
  }



  const handleSubmitNewCamera = async (cameraUrl?: string) => {
    const urlToUse = cameraUrl || newCameraUrl.trim();
    
    if (!urlToUse) {
      Alert.alert('Lỗi', 'Vui lòng nhập URL camera');
      return;
    }

    const isValid = cameraUrl ? validateUrl(cameraUrl) : isValidUrl;
    if (!isValid) {
      Alert.alert('Lỗi', 'URL không hợp lệ');
      return;
    }

    if (!newCameraRoom.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên phòng');
      return;
    }

    if (!selectedElderly) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người thân');
      return;
    }

    try {
      setIsAddingCamera(true);
      
      const userDataStr = await AsyncStorage.getItem('user');
      if (!userDataStr) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      const currentUser = JSON.parse(userDataStr);
      const relativeUserId = currentUser.id || currentUser.userId;

      const result = await addElderlyCamera(
        relativeUserId,
        selectedElderly.private_key,
        urlToUse,
        newCameraRoom.trim()
      );

      if (result.success) {
        console.log('✅ Camera added successfully, refreshing list...');
        // Close the add camera screen and refresh the list immediately
        setShowAddCamera(false);
        setNewCameraUrl('');
        setNewCameraRoom('');
        setIsValidUrl(false);
        // Reload elderly users to get updated camera list
        await loadElderlyUsers();
        // Force re-render by updating refresh key
        setRefreshKey(prev => prev + 1);
        console.log('✅ List refresh completed');
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể thêm camera');
      }
    } catch (error) {
      console.error('Error adding camera:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    } finally {
      setIsAddingCamera(false);
    }
  };

  const handleRemoveCamera = (cameraUrl: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa camera này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => removeCamera(cameraUrl),
        },
      ]
    );
  };

  const removeCamera = async (cameraUrl: string) => {
    if (!selectedElderly) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người thân');
      return;
    }

    try {
      setIsRemovingCamera(true);
      
      const userDataStr = await AsyncStorage.getItem('user');
      if (!userDataStr) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      const currentUser = JSON.parse(userDataStr);
      const relativeUserId = currentUser.id || currentUser.userId;

      const result = await removeElderlyCamera(
        relativeUserId,
        selectedElderly.private_key,
        cameraUrl
      );

      if (result.success) {
        console.log('✅ Camera removed successfully, refreshing list...');
        // Reload elderly users to get updated camera list immediately
        await loadElderlyUsers();
        // Force re-render by updating refresh key
        setRefreshKey(prev => prev + 1);
        console.log('✅ List refresh completed after removal');
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể xóa camera');
      }
    } catch (error) {
      console.error('Error removing camera:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    } finally {
      setIsRemovingCamera(false);
    }
  };

  if (showWebView) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>
            Camera - {selectedElderly?.userName}
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Feather name="refresh-cw" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Đang kết nối...</Text>
            </View>
          )}
          {loadError && (
            <View style={styles.errorOverlay}>
              <Feather name="wifi-off" size={48} color="#EF4444" />
              <Text style={styles.errorText}>Không thể kết nối</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.retryButton, { backgroundColor: '#1E3A8A', marginTop: 10 }]} onPress={handleOpenInBrowser}>
                <Text style={styles.retryButtonText}>Mở trong trình duyệt</Text>
              </TouchableOpacity>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={isVideoStream(selectedCamera) ? { html: getVideoOptimizedHTML(selectedCamera) } : { uri: selectedCamera }}
            style={styles.webView}
            originWhitelist={["*"]}
            onLoadStart={handleWebViewLoadStart}
            onLoadEnd={handleWebViewLoadEnd}
            onLoadProgress={handleWebViewProgress}
            onMessage={handleWebViewMessage}
            injectedJavaScript={injectedReadyScript}
            onError={handleWebViewError}
            onHttpError={handleWebViewHttpError}
            onNavigationStateChange={(nav) => {
              if (!nav.loading) {
                setIsLoading(false);
                if (timeoutId) {
                  clearTimeout(timeoutId);
                  setTimeoutId(null);
                }
              }
            }}
            javaScriptEnabled={true}
            javaScriptCanOpenWindowsAutomatically={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo={true}
            mixedContentMode={"always"}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            userAgent={"Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.112 Mobile Safari/537.36"}
            cacheEnabled={false}
            allowsBackForwardNavigationGestures={false}
            pullToRefreshEnabled={false}
            bounces={false}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            setSupportMultipleWindows={true}
            onShouldStartLoadWithRequest={(request) => {
              try {
                const u = new URL(request.url);
                if (u.protocol === 'https:' || u.protocol === 'http:' || u.protocol === 'blob:' || u.protocol === 'data:' || u.protocol === 'about:') return true;
                return false;
              } catch {
                return true;
              }
            }}
          />
        </View>
      </SafeAreaView>
    );
  }



  if (showAddCamera) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>
            Thêm Camera - {selectedElderly?.userName}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Add Camera Form */}
        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.addCameraContainer}>
              <View style={styles.iconContainer}>
                <Feather name="plus-circle" size={32} color="#007AFF" />
              </View>
              <Text style={styles.instructionsTitle}>
                Thêm camera mới
              </Text>
              <Text style={styles.instructionsText}>
                                  Nhập URL camera hoặc chụp/chọn QR code để tự động thêm camera cho {selectedElderly?.userName}.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>URL Camera</Text>
              <View style={styles.inputWrapper}>
                <Feather name="link" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, !isValidUrl && newCameraUrl.length > 0 && styles.invalidInput]}
                  placeholder="https://example.com/camera"
                  placeholderTextColor="#8E8E93"
                  value={newCameraUrl}
                  onChangeText={handleNewCameraUrlChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="done"
                  onSubmitEditing={() => handleSubmitNewCamera()}
                />
                {newCameraUrl.length > 0 && (
                  <TouchableOpacity onPress={() => setNewCameraUrl('')} style={styles.clearButton}>
                    <Feather name="x" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </View>
              {newCameraUrl.length > 0 && !isValidUrl && (
                <Text style={styles.errorText}>
                  URL không hợp lệ
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tên phòng</Text>
              <View style={styles.inputWrapper}>
                <Feather name="home" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: Phòng ngủ, Phòng khách, Nhà bếp..."
                  placeholderTextColor="#8E8E93"
                  value={newCameraRoom}
                  onChangeText={setNewCameraRoom}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => handleSubmitNewCamera()}
                />
                {newCameraRoom.length > 0 && (
                  <TouchableOpacity onPress={() => setNewCameraRoom('')} style={styles.clearButton}>
                    <Feather name="x" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* QR Code Options */}
            <View style={styles.qrOptionsContainer}>
              <Text style={styles.qrOptionsTitle}>Hoặc sử dụng QR Code</Text>
              <View style={styles.qrButtonsContainer}>
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={captureImageAndDetectQR}
                  activeOpacity={0.8}
                >
                  <Feather name="camera" size={20} color="#007AFF" />
                  <Text style={styles.qrButtonText}>Chụp QR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={pickImageAndDetectQR}
                  activeOpacity={0.8}
                >
                  <Feather name="upload" size={20} color="#007AFF" />
                  <Text style={styles.qrButtonText}>Chọn QR</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                (!newCameraUrl.trim() || !newCameraRoom.trim() || !isValidUrl || isAddingCamera) && styles.disabledButton
              ]}
                                  onPress={() => handleSubmitNewCamera()}
              disabled={!newCameraUrl.trim() || !newCameraRoom.trim() || !isValidUrl || isAddingCamera}
              activeOpacity={0.8}
            >
              {isAddingCamera ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="plus" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.addButtonText}>
                {isAddingCamera ? 'Đang thêm...' : 'Thêm Camera'}
              </Text>
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Feather name="shield" size={16} color="#34C759" />
              <Text style={styles.securityText}>
                Chỉ thêm các camera có bảo mật HTTPS/HTTP
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (selectedElderly) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>
            Camera - {selectedElderly.userName}
          </Text>
          <TouchableOpacity onPress={handleAddCamera} style={styles.addButtonHeader}>
            <Feather name="plus" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Camera Selection */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header Section */}
          <View style={styles.cameraHeaderSection}>
            <View style={styles.cameraHeaderContent}>
              <View style={styles.cameraHeaderIcon}>
                <Feather name="video" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.cameraHeaderText}>
                <Text style={styles.cameraHeaderTitle}>
                  Camera của {selectedElderly.userName}
                </Text>
                <Text style={styles.cameraHeaderSubtitle}>
                  {selectedElderly.cameras.length} camera đang hoạt động
                </Text>
              </View>
            </View>
            <View style={styles.cameraStatusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Trực tuyến</Text>
            </View>
          </View>

          {/* Camera Grid */}
          <View style={styles.cameraGridContainer}>
            {selectedElderly.cameras.map((cameraUrl, index) => (
              <View key={index} style={styles.cameraCardContainer}>
                <TouchableOpacity
                  style={styles.cameraCard}
                  onPress={() => handleCameraSelect(cameraUrl)}
                  activeOpacity={0.9}
                >
                  {/* Camera Preview Placeholder */}
                  <View style={styles.cameraPreview}>
                    <View style={styles.cameraPreviewOverlay}>
                      <Feather name="play-circle" size={48} color="#FFFFFF" />
                    </View>
                    <View style={styles.cameraLiveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  </View>
                  
                  {/* Camera Info */}
                  <View style={styles.cameraCardContent}>
                    <View style={styles.cameraCardHeader}>
                      <View style={styles.cameraIconSmall}>
                        <Feather name="video" size={16} color="#007AFF" />
                      </View>
                      <Text style={styles.cameraCardTitle}>
                        {selectedElderly?.room || `Camera ${index + 1}`}
                      </Text>
                    </View>
                    
                    <Text style={styles.cameraCardUrl} numberOfLines={1}>
                      {cameraUrl}
                    </Text>
                    
                    {/* Camera Actions */}
                    <View style={styles.cameraCardActions}>
                      <TouchableOpacity
                        style={styles.watchButton}
                        onPress={() => handleCameraSelect(cameraUrl)}
                        activeOpacity={0.8}
                      >
                        <Feather name="eye" size={14} color="#FFFFFF" />
                        <Text style={styles.watchButtonText}>Xem</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.removeButtonCard}
                        onPress={() => handleRemoveCamera(cameraUrl)}
                        disabled={isRemovingCamera}
                        activeOpacity={0.8}
                      >
                        <Feather name="trash-2" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add More Camera Section */}
          <View style={[styles.addMoreSection, {paddingHorizontal: 0}]}>
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={handleAddCamera}
              activeOpacity={0.8}
            >
              <View style={styles.addMoreIcon}>
                <Feather name="plus" size={24} color="#007AFF" />
              </View>
              <Text style={styles.addMoreText}>Thêm camera mới</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Xem Camera</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Elderly Users List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoadingUsers ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tải danh sách...</Text>
          </View>
        ) : elderlyUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="users" size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Không có người thân</Text>
            <Text style={styles.emptyText}>
              Bạn chưa có người thân nào trong gói premium hoặc chưa có camera được cấu hình.
            </Text>
          </View>
        ) : (
          <View style={{paddingHorizontal: 0}}>
            {/* Header Section */}
            <View style={styles.elderlyHeaderSection}>
              <View style={styles.elderlyHeaderContent}>
                <View style={styles.elderlyHeaderIcon}>
                  <Feather name="users" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.elderlyHeaderText}>
                  <Text style={styles.elderlyHeaderTitle}>
                    Người thân của bạn
                  </Text>
                  <Text style={styles.elderlyHeaderSubtitle}>
                    {elderlyUsers.length} người thân có camera
                  </Text>
                </View>
              </View>
              <View style={styles.elderlyStatusBadge}>
                <View style={styles.elderlyStatusDot} />
                <Text style={styles.elderlyStatusText}>Trực tuyến</Text>
              </View>
            </View>

            {/* Elderly Users Grid */}
            <View style={styles.elderlyGridContainer}>
              {elderlyUsers.map((elderly) => (
                <View key={elderly.userId} style={styles.elderlyCardContainer}>
                  <TouchableOpacity
                    style={styles.elderlyCard}
                    onPress={() => handleElderlySelect(elderly)}
                    activeOpacity={0.9}
                  >
                    {/* Elderly Avatar Section */}
                    <View style={styles.elderlyCardHeader}>
                      <View 
                        style={[
                          styles.elderlyAvatar, 
                          { backgroundColor: getAvatarColor(elderly.userName) }
                        ]}
                      >
                        <Text style={styles.elderlyAvatarText}>
                          {getInitials(elderly.userName)}
                        </Text>
                        <View style={styles.elderlyOnlineIndicator}>
                          <View style={styles.onlineDot} />
                        </View>
                      </View>
                      
                      <View style={styles.elderlyCardInfo}>
                        <Text style={styles.elderlyCardName}>
                          {elderly.userName}
                        </Text>
                        <Text style={styles.elderlyCardDetails}>
                          {elderly.age} tuổi • {elderly.gender === 'male' ? 'Nam' : 'Nữ'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Camera Status Section */}
                    <View style={styles.elderlyCameraSection}>
                      <View style={styles.cameraStatusRow}>
                        <View style={styles.elderlyCameraIconContainer}>
                          <Feather name="video" size={16} color="#007AFF" />
                        </View>
                        <Text style={styles.cameraStatusText}>
                          {elderly.cameras.length} camera đang hoạt động
                        </Text>
                      </View>
                      
                      {/* Camera Preview Thumbnails */}
                      {elderly.cameras.length > 0 && (
                        <View style={styles.cameraThumbnails}>
                          {elderly.cameras.slice(0, 3).map((cameraUrl, index) => (
                            <View key={index} style={styles.cameraThumbnail}>
                              <View style={styles.thumbnailPlaceholder}>
                                <Feather name="video" size={12} color="#FFFFFF" />
                              </View>
                              <View style={styles.thumbnailLiveIndicator}>
                                <View style={styles.thumbnailLiveDot} />
                              </View>
                            </View>
                          ))}
                          {elderly.cameras.length > 3 && (
                            <View style={styles.moreCamerasIndicator}>
                              <Text style={styles.moreCamerasText}>
                                +{elderly.cameras.length - 3}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                    
                    {/* Action Button */}
                    <View style={styles.elderlyCardActions}>
                      <TouchableOpacity
                        style={styles.viewCamerasButton}
                        onPress={() => handleElderlySelect(elderly)}
                        activeOpacity={0.8}
                      >
                        <Feather name="eye" size={16} color="#FFFFFF" />
                        <Text style={styles.viewCamerasButtonText}>
                          Xem Camera
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Empty State for No Cameras */}
            {elderlyUsers.length === 0 && (
              <View style={styles.emptyElderlyState}>
                <View style={styles.emptyElderlyIcon}>
                  <Feather name="users" size={48} color="#94A3B8" />
                </View>
                <Text style={styles.emptyElderlyTitle}>
                  Chưa có người thân
                </Text>
                <Text style={styles.emptyElderlyText}>
                  Bạn chưa có người thân nào trong gói premium hoặc chưa có camera được cấu hình.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  elderlyListHeader: {
    marginBottom: 16,
  },
  elderlyListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  elderlyListSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  elderlyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  elderlyInfo: {
    flex: 1,
  },
  elderlyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  elderlyDetails: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  cameraCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  cameraListHeader: {
    marginBottom: 16,
  },
  cameraListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cameraListSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  cameraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cameraIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cameraInfo: {
    flex: 1,
  },
  cameraName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  cameraUrl: {
    fontSize: 12,
    color: '#64748B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonHeader: {
    padding: 8,
  },
  addCameraContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 4,
  },
  invalidInput: {
    borderColor: '#EF4444',
  },
  clearButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  addFirstCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  addFirstCameraButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    textAlign: 'center',
  },
  cameraItemContainer: {
    marginBottom: 12,
  },
  cameraActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  qrOptionsContainer: {
    marginBottom: 24,
  },
  qrOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  qrButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  qrButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  // New Camera List Styles
  cameraHeaderSection: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    // marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cameraHeaderText: {
    flex: 1,
  },
  cameraHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cameraHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  cameraStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraGridContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  cameraCardContainer: {
    marginBottom: 16,
  },
  cameraCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cameraPreview: {
    height: 160,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraPreviewOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cameraLiveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraCardContent: {
    padding: 16,
  },
  cameraCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cameraIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cameraCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cameraCardUrl: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  cameraCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  watchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  removeButtonCard: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  addMoreSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addMoreIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  // New Elderly List Styles
  elderlyHeaderSection: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    // marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  elderlyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  elderlyHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  elderlyHeaderText: {
    flex: 1,
  },
  elderlyHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  elderlyHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  elderlyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  elderlyStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },
  elderlyStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  elderlyGridContainer: {
    // paddingHorizontal: 20,
    marginBottom: 24,
  },
  elderlyCardContainer: {
    marginBottom: 16,
  },
  elderlyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  elderlyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  elderlyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  elderlyAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  elderlyOnlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  elderlyCardInfo: {
    flex: 1,
  },
  elderlyCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  elderlyCardDetails: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  elderlyCameraSection: {
    marginBottom: 16,
  },
  cameraStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  elderlyCameraIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cameraStatusText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  cameraThumbnails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cameraThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailLiveIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  thumbnailLiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  moreCamerasIndicator: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moreCamerasText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  elderlyCardActions: {
    marginTop: 8,
  },
  viewCamerasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  viewCamerasButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyElderlyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyElderlyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyElderlyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyElderlyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CameraDataScreen; 