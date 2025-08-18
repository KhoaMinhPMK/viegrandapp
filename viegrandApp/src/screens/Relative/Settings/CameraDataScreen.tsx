import React, { useState, useRef } from 'react';
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
  const webViewRef = useRef<WebView>(null);

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
  };

  const handleWebViewLoadStart = () => {
    setIsLoading(true);
  };

  const handleWebViewLoadEnd = () => {
    setIsLoading(false);
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setIsLoading(false);
    Alert.alert(
      'Lỗi kết nối',
      'Không thể kết nối đến camera. Vui lòng kiểm tra lại URL và thử lại.',
      [
        { text: 'OK', onPress: () => setShowWebView(false) }
      ]
    );
  };

  const handleGoBack = () => {
    if (showWebView) {
      setShowWebView(false);
      setUrl('');
      setIsValidUrl(false);
    } else {
      navigation.goBack();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

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
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webView}
            onLoadStart={handleWebViewLoadStart}
            onLoadEnd={handleWebViewLoadEnd}
            onError={handleWebViewError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="compatibility"
            userAgent="VieGrandApp/1.0"
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
});

export default CameraDataScreen; 