import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

const CameraDataScreen: React.FC = () => {
  const navigation = useNavigation();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const webViewRef = useRef<WebView>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const validateUrl = (inputUrl: string) => {
    try {
      const urlObj = new URL(inputUrl);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleUrlChange = (text: string) => {
    setUrl(text);
    const isValid = validateUrl(text);
    setIsValidUrl(isValid);
    setLoadError(false);
  };

  const handleLoadUrl = () => {
    if (!url.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập URL camera');
      return;
    }

    if (!isValidUrl) {
      Alert.alert('Lỗi', 'URL phải bắt đầu bằng https://');
      return;
    }

    setShowWebView(true);
    setIsLoading(true);
    setLoadError(false);
    
    // Set a timeout for loading (30 seconds)
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setLoadError(true);
      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối đến camera. Vui lòng kiểm tra lại URL và thử lại.',
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
      'Không thể kết nối đến camera. Vui lòng kiểm tra lại URL và thử lại.',
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
        `Không thể kết nối đến camera (Mã lỗi: ${nativeEvent.statusCode}). Vui lòng kiểm tra lại URL.`,
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
      setUrl('');
      setIsValidUrl(false);
      setLoadError(false);
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
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
    if (!url) return;
    Linking.openURL(url).catch(() => {
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
    // Only treat as direct video when it clearly has a video extension
    return /\.(mp4|webm|ogg|m3u8|ts)(\?|$)/i.test(url)
  };

  // JS injected into pages to signal readiness quickly (DOM interactive/complete or video can play)
  const injectedReadyScript = `
    (function() {
      function post(type, payload) {
        try { window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload })); } catch (e) {}
      }
      function postReady(extra) { post('ready', extra); }
      // Console capture
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
        // Forward console messages for debugging
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {showWebView ? 'Dữ liệu Camera' : 'Xem Camera'}
        </Text>
        {showWebView && (
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Feather name="refresh-cw" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {!showWebView ? (
        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <View style={styles.iconContainer}>
                <Feather name="camera" size={32} color="#007AFF" />
              </View>
              <Text style={styles.instructionsTitle}>
                Xem dữ liệu camera
              </Text>
              <Text style={styles.instructionsText}>
                Nhập URL camera (HTTPS) để xem dữ liệu trực tiếp từ camera của người cao tuổi.
              </Text>
            </View>

            {/* URL Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>URL Camera (HTTPS)</Text>
              <View style={styles.inputWrapper}>
                <Feather name="link" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, !isValidUrl && url.length > 0 && styles.invalidInput]}
                  placeholder="https://example.com/camera"
                  placeholderTextColor="#8E8E93"
                  value={url}
                  onChangeText={handleUrlChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="go"
                  onSubmitEditing={handleLoadUrl}
                />
                {url.length > 0 && (
                  <TouchableOpacity onPress={() => setUrl('')} style={styles.clearButton}>
                    <Feather name="x" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </View>
              {url.length > 0 && !isValidUrl && (
                <Text style={styles.errorText}>
                  URL phải bắt đầu bằng https://
                </Text>
              )}
            </View>

            {/* Load Button */}
            <TouchableOpacity
              style={[
                styles.loadButton,
                (!url.trim() || !isValidUrl) && styles.disabledButton
              ]}
              onPress={handleLoadUrl}
              disabled={!url.trim() || !isValidUrl}
              activeOpacity={0.8}
            >
              <Feather name="play" size={20} color="#FFFFFF" />
              <Text style={styles.loadButtonText}>Xem Camera</Text>
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Feather name="shield" size={16} color="#34C759" />
              <Text style={styles.securityText}>
                Chỉ kết nối đến các camera có bảo mật HTTPS
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        /* WebView */
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
            source={isVideoStream(url) ? { html: getVideoOptimizedHTML(url) } : { uri: url }}
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
              // Allow https/http navigations and internal blob/data/about navigations
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
      )}
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
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    marginLeft: 4,
  },
  loadButton: {
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
  loadButtonText: {
    fontSize: 16,
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
});

export default CameraDataScreen; 