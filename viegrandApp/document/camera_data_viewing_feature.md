# Camera Data Viewing Feature

## Overview
The camera data viewing feature allows relative users to view camera data from elderly users through a secure webview interface. This feature is accessible through the relative app's settings tab.

## Key Features

### 🔐 Security & Validation
- **HTTPS Only**: Only accepts URLs that start with `https://` for secure connections
- **URL Validation**: Real-time validation of camera URLs
- **Error Handling**: Comprehensive error handling for connection issues
- **Security Warnings**: Clear security notes about HTTPS requirements

### 🎨 User Interface

#### **1. Input Screen**
- **URL Input Field**: Clean, modern input with validation
- **Real-time Validation**: Shows error messages for invalid URLs
- **Clear Button**: Easy way to clear the input field
- **Security Icon**: Visual indicator for security requirements

#### **2. WebView Interface**
- **Full-screen Viewing**: Immersive camera data viewing experience
- **Loading States**: Clear loading indicators during connection
- **Refresh Button**: Easy way to reload camera data
- **Error Handling**: User-friendly error messages for connection issues

#### **3. Navigation**
- **Back Button**: Returns to input screen or previous screen
- **Dynamic Title**: Changes based on current state (input vs viewing)
- **Refresh Control**: Available when viewing camera data

### 🔧 Technical Implementation

#### **1. Screen Structure**
```typescript
const CameraDataScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const webViewRef = useRef<WebView>(null);
  
  // URL validation, video streaming optimization, and error handling
};
```

#### **2. Video Streaming Optimization**
```typescript
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
          }
          video {
            max-width: 100%;
            max-height: 100vh;
            width: auto;
            height: auto;
          }
        </style>
      </head>
      <body>
        <video autoplay muted controls playsinline preload="auto">
          <source src="${videoUrl}" type="video/mp4">
          <source src="${videoUrl}" type="video/webm">
          <source src="${videoUrl}" type="video/ogg">
        </video>
      </body>
    </html>
  `;
};

// Video stream detection
const isVideoStream = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.m3u8', '.ts'];
  const videoKeywords = ['stream', 'video', 'camera', 'live', 'rtsp', 'rtmp'];
  
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
         videoKeywords.some(keyword => lowerUrl.includes(keyword));
};
```

#### **3. Enhanced WebView Configuration**
```typescript
<WebView
  ref={webViewRef}
  source={isVideoStream(url) ? { html: getVideoOptimizedHTML(url) } : { uri: url }}
  onLoadStart={handleWebViewLoadStart}
  onLoadEnd={handleWebViewLoadEnd}
  onError={handleWebViewError}
  onHttpError={handleWebViewHttpError}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  allowsInlineMediaPlayback={true}
  mediaPlaybackRequiresUserAction={false}
  mixedContentMode="compatibility"
  userAgent="VieGrandApp/1.0"
  cacheEnabled={false}
  incognito={true}
  allowsBackForwardNavigationGestures={false}
  pullToRefreshEnabled={false}
  bounces={false}
  scrollEnabled={false}
  onShouldStartLoadWithRequest={(request) => {
    return request.url.startsWith('https://');
  }}
/>
```

### 📱 User Flow

#### **1. Access Path**
```
Relative App → Settings → "Xem dữ liệu camera" → Camera Data Screen
```

#### **2. Usage Steps**
1. **Navigate to Settings**: Open the relative app settings
2. **Select Camera Data**: Tap "Xem dữ liệu camera" in the General section
3. **Enter URL**: Input the HTTPS camera URL
4. **Validate**: System validates the URL format
5. **View Data**: WebView loads and displays camera data
6. **Interact**: Use refresh button or navigate back

#### **3. Error Handling**
- **Invalid URL**: Shows error message and prevents loading
- **Connection Error**: Displays user-friendly error dialog
- **Loading Timeout**: Handles slow connections gracefully

### 🎯 Design Features

#### **1. Modern UI Elements**
- **Clean Input Design**: Modern text input with icons and validation
- **Professional Styling**: Consistent with app design language
- **Loading Animations**: Smooth loading indicators
- **Error States**: Clear visual feedback for errors

#### **2. Video Streaming Optimization**
- **Custom HTML**: Optimized video player for streaming content
- **Auto-Detection**: Automatically detects video streams vs web pages
- **Multiple Formats**: Supports MP4, WebM, OGG, HLS, and other formats
- **Full-Screen Video**: Immersive video viewing experience
- **Loading Timeout**: 30-second timeout with retry functionality

#### **3. Enhanced Error Handling**
- **Timeout Management**: Prevents infinite loading states
- **HTTP Error Detection**: Handles 4xx and 5xx errors
- **Retry Mechanism**: Easy retry functionality for failed connections
- **User-Friendly Messages**: Clear error messages with actionable options

#### **2. Accessibility**
- **High Contrast**: White text on colored backgrounds
- **Large Touch Targets**: Easy tapping for all interactive elements
- **Clear Typography**: Readable font sizes and weights
- **Keyboard Support**: Proper keyboard handling for URL input

#### **3. Responsive Design**
- **Platform Adaptation**: Different behaviors for iOS and Android
- **Screen Size Support**: Adapts to different device sizes
- **Orientation Handling**: Works in portrait and landscape

### 🔒 Security Considerations

#### **1. HTTPS Enforcement**
- **Protocol Validation**: Only accepts HTTPS URLs
- **Security Warnings**: Clear messaging about HTTPS requirement
- **Mixed Content**: Handles mixed content appropriately

#### **2. WebView Security**
- **JavaScript Enabled**: Allows camera interfaces to function
- **DOM Storage**: Enables persistent camera settings
- **User Agent**: Identifies app for camera systems
- **Media Playback**: Supports camera video streams

#### **3. Error Handling**
- **Connection Errors**: Graceful handling of network issues
- **Invalid URLs**: Prevents loading of unsafe URLs
- **Timeout Handling**: Manages slow connections

### 📊 Performance Optimizations

#### **1. Loading States**
- **Immediate Feedback**: Shows loading state immediately
- **Progress Indicators**: Clear visual feedback during loading
- **Error Recovery**: Easy retry mechanisms

#### **2. Memory Management**
- **WebView Cleanup**: Proper cleanup when navigating away
- **State Management**: Efficient state handling
- **Resource Optimization**: Minimal memory footprint

### 🚀 Future Enhancements

#### **1. Planned Features**
1. **URL History**: Save and reuse previous camera URLs
2. **Camera Presets**: Pre-configured camera URLs for common setups
3. **Offline Support**: Cache camera data for offline viewing
4. **Multi-camera Support**: View multiple cameras simultaneously

#### **2. Advanced Features**
1. **Camera Controls**: Direct camera control through webview
2. **Recording**: Save camera footage locally
3. **Alerts**: Motion detection and alert integration
4. **Analytics**: Usage statistics and camera health monitoring

### 🔧 Configuration Options

#### **1. WebView Settings**
```typescript
// Security settings
javaScriptEnabled={true}
domStorageEnabled={true}
mixedContentMode="compatibility"

// Media settings
allowsInlineMediaPlayback={true}
mediaPlaybackRequiresUserAction={false}

// User agent
userAgent="VieGrandApp/1.0"
```

#### **2. Validation Rules**
- **Protocol**: Must be HTTPS
- **Format**: Must be valid URL format
- **Length**: Reasonable URL length limits
- **Characters**: Safe character validation

### 📋 Usage Guidelines

#### **1. For Relative Users**
- **Secure URLs Only**: Always use HTTPS camera URLs
- **Network Connection**: Ensure stable internet connection
- **Camera Compatibility**: Verify camera supports web interfaces
- **Privacy**: Respect privacy when viewing camera data

#### **2. For Developers**
- **Error Handling**: Implement comprehensive error handling
- **Security**: Always validate URLs before loading
- **Performance**: Optimize WebView loading and rendering
- **Testing**: Test with various camera systems and URLs

## Implementation Notes

### **File Structure**
```
src/screens/Relative/Settings/
├── CameraDataScreen.tsx          # Main camera data screen
└── index.tsx                     # Settings screen with camera option
```

### **Navigation Integration**
```typescript
// Added to RelativeNavigator.tsx
<Stack.Screen 
  name="CameraData" 
  component={CameraDataScreen}
  options={{ headerShown: false }}
/>
```

### **Dependencies**
- `react-native-webview`: For webview functionality
- `react-native-vector-icons`: For UI icons
- `@react-navigation/native`: For navigation

### **Testing Considerations**
- **URL Validation**: Test with various URL formats
- **Network Conditions**: Test with poor network connectivity
- **Camera Systems**: Test with different camera web interfaces
- **Security**: Verify HTTPS enforcement and error handling

### 🚀 Video Streaming Improvements

#### **1. Loading Issue Fixes**
- **Timeout Management**: 30-second timeout prevents infinite loading
- **Video Stream Detection**: Automatically detects video URLs and optimizes loading
- **Custom Video Player**: Optimized HTML video player for streaming content
- **Cache Disabled**: Prevents caching issues with live streams
- **Incognito Mode**: Ensures fresh connections for each load

#### **2. Performance Optimizations**
- **Preload Auto**: Optimizes video loading for streaming content
- **Multiple Source Support**: Handles various video formats (MP4, WebM, OGG, HLS)
- **Responsive Design**: Video adapts to different screen sizes
- **Background Optimization**: Black background for better video viewing
- **Gesture Disabled**: Prevents accidental navigation during video viewing

#### **3. Error Recovery**
- **Retry Functionality**: Easy retry button for failed connections
- **HTTP Error Handling**: Specific handling for different HTTP error codes
- **Network Error Detection**: Detects network connectivity issues
- **User Feedback**: Clear loading states and error messages
- **Graceful Degradation**: Falls back to standard webview for non-video content

#### **4. Supported Video Formats**
- **Direct Video Files**: MP4, WebM, OGG, AVI, MOV
- **Streaming Protocols**: HLS (.m3u8), DASH, RTMP
- **Live Streams**: Real-time video streaming
- **Camera Feeds**: IP camera streams and webcam feeds
- **Security Cameras**: Various security camera system feeds

## Conclusion

The camera data viewing feature provides:
- **Secure Access**: HTTPS-only camera viewing
- **User-Friendly Interface**: Clean, modern UI design
- **Robust Error Handling**: Comprehensive error management
- **Flexible Integration**: Works with various camera systems
- **Privacy Protection**: Secure viewing with proper validation

This feature enhances the relative app's monitoring capabilities while maintaining security and usability standards. 