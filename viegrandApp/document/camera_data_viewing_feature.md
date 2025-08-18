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
  const webViewRef = useRef<WebView>(null);
  
  // URL validation and WebView handling
};
```

#### **2. URL Validation**
```typescript
const validateUrl = (inputUrl: string) => {
  try {
    const urlObj = new URL(inputUrl);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};
```

#### **3. WebView Configuration**
```typescript
<WebView
  ref={webViewRef}
  source={{ uri: url }}
  onLoadStart={handleWebViewLoadStart}
  onLoadEnd={handleWebViewLoadEnd}
  onError={handleWebViewError}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  allowsInlineMediaPlayback={true}
  mediaPlaybackRequiresUserAction={false}
  mixedContentMode="compatibility"
  userAgent="VieGrandApp/1.0"
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
- **Clean Input Design**: Modern text input with icons
- **Gradient Buttons**: Professional button styling
- **Loading Animations**: Smooth loading indicators
- **Error States**: Clear visual feedback for errors

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

## Conclusion

The camera data viewing feature provides:
- **Secure Access**: HTTPS-only camera viewing
- **User-Friendly Interface**: Clean, modern UI design
- **Robust Error Handling**: Comprehensive error management
- **Flexible Integration**: Works with various camera systems
- **Privacy Protection**: Secure viewing with proper validation

This feature enhances the relative app's monitoring capabilities while maintaining security and usability standards. 