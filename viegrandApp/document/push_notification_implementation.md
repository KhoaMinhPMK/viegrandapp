# Push Notification Implementation for VieGrand App

## Overview

This document describes the implementation of push notifications for the VieGrand app, enabling users to receive notifications when they're outside the messages screen, similar to Facebook Messenger.

## Architecture

### **Frontend (React Native)**
- **Firebase Cloud Messaging (FCM)** for Android
- **Apple Push Notification Service (APNs)** for iOS
- **@notifee/react-native** for local notifications
- **@react-native-firebase/messaging** for FCM integration

### **Backend (PHP + Node.js)**
- **Real-time notifications** via Socket.IO (existing)
- **Push notifications** via FCM for offline users
- **Device token management** in database

## Implementation Details

### **1. Frontend Push Notification Service**

**File:** `src/services/pushNotification.ts`

**Features:**
- ✅ **Permission Management**: Request and check notification permissions
- ✅ **FCM Token Management**: Get, store, and refresh FCM tokens
- ✅ **Notification Channels**: Create Android notification channels
- ✅ **Foreground Handling**: Show local notifications when app is open
- ✅ **Background Handling**: Handle notifications when app is in background
- ✅ **App Launch Handling**: Handle notifications when app is launched from notification
- ✅ **Navigation**: Navigate to appropriate screens when notifications are tapped

**Key Methods:**
```typescript
// Initialize push notification service
await pushNotificationService.initialize();

// Show local notification manually
await pushNotificationService.showLocalNotification(title, body, data);

// Check if notifications are enabled
const isEnabled = await pushNotificationService.isEnabled();

// Request permission manually
const granted = await pushNotificationService.requestPermission();
```

### **2. Backend Device Token Management**

**File:** `backend/update_device_token.php`

**Features:**
- ✅ **Token Storage**: Store FCM tokens in user table
- ✅ **Auto Column Creation**: Automatically create device_token column if missing
- ✅ **Token Updates**: Update tokens when they change
- ✅ **Error Handling**: Proper error handling and logging

**API Endpoint:**
```php
POST /backend/update_device_token.php
{
  "email": "user@example.com",
  "device_token": "fcm_token_here"
}
```

### **3. Backend Push Notification Sending**

**File:** `backend/send_push_notification.php`

**Features:**
- ✅ **FCM Integration**: Send notifications via Firebase Cloud Messaging
- ✅ **User Lookup**: Find users by email and get their device tokens
- ✅ **Notification Payload**: Structured notification data
- ✅ **Batch Sending**: Send to multiple users at once
- ✅ **Error Handling**: Comprehensive error handling and logging

**Key Functions:**
```php
// Send to single user
$result = sendPushNotification($userEmail, $title, $body, $data);

// Send to multiple users
$result = sendPushNotificationToMultiple($userEmails, $title, $body, $data);
```

### **4. Message Sending Integration**

**File:** `backend/send_message_complete.php`

**Features:**
- ✅ **Smart Delivery**: Try real-time first, fallback to push notifications
- ✅ **Offline Detection**: Send push notifications only when users are offline
- ✅ **Rich Notifications**: Include sender name and message content
- ✅ **Navigation Data**: Include conversation data for proper navigation

**Flow:**
1. **Send message** to database
2. **Try real-time delivery** via Socket.IO
3. **If offline**, send push notification via FCM
4. **Include navigation data** for proper app navigation

## Setup Instructions

### **1. Firebase Setup**

#### **Android:**
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add Android app with package name `com.viegrandapp`
3. Download `google-services.json` and place in `android/app/`
4. Add Firebase SDK to `android/build.gradle`:
   ```gradle
   classpath 'com.google.gms:google-services:4.3.15'
   ```
5. Add plugin to `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

#### **iOS:**
1. Add iOS app to Firebase project
2. Download `GoogleService-Info.plist` and add to Xcode project
3. Enable Push Notifications capability in Xcode
4. Generate APNs key in Apple Developer Console
5. Upload APNs key to Firebase project

### **2. Environment Configuration**

#### **Backend Configuration:**
1. **Get FCM Server Key** from Firebase Console
2. **Update** `backend/send_push_notification.php`:
   ```php
   define('FCM_SERVER_KEY', 'YOUR_ACTUAL_FCM_SERVER_KEY');
   ```

#### **Frontend Configuration:**
1. **Install dependencies** (already done):
   ```bash
   yarn add @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native
   ```

2. **iOS Setup** (if needed):
   ```bash
   cd ios && pod install
   ```

### **3. Database Setup**

The system automatically creates the `device_token` column in the `user` table when needed.

**Manual Setup (Optional):**
```sql
ALTER TABLE user ADD COLUMN device_token VARCHAR(255) NULL;
```

## Usage Examples

### **1. Sending Push Notifications**

#### **From Backend (PHP):**
```php
require_once 'send_push_notification.php';

// Send to single user
$result = sendPushNotification(
    'user@example.com',
    'Tin nhắn mới từ Bà',
    'Chào con, bà nhớ con quá!',
    [
        'type' => 'message',
        'conversation_id' => 'conv_123',
        'sender_phone' => '0123456789'
    ]
);

// Send to multiple users
$result = sendPushNotificationToMultiple(
    ['user1@example.com', 'user2@example.com'],
    'Nhắc nhở',
    'Đã đến giờ uống thuốc',
    ['type' => 'reminder']
);
```

#### **From Frontend (React Native):**
```typescript
import pushNotificationService from './src/services/pushNotification';

// Show local notification
await pushNotificationService.showLocalNotification(
    'Tin nhắn mới',
    'Bạn có tin nhắn từ người thân',
    { type: 'message', conversation_id: 'conv_123' }
);
```

### **2. Testing Push Notifications**

#### **Test API Endpoint:**
```bash
curl -X POST "https://viegrand.site/backend/send_push_notification.php" \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "title": "Test Notification",
    "body": "This is a test push notification",
    "data": {
      "type": "message",
      "conversation_id": "test_conv"
    }
  }'
```

#### **Test Device Token Update:**
```bash
curl -X POST "https://viegrand.site/backend/update_device_token.php" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "device_token": "test_fcm_token_123"
  }'
```

## Notification Types

### **1. Message Notifications**
- **Trigger**: New message received when user is offline
- **Title**: "Tin nhắn mới từ [Sender Name]"
- **Body**: Message content (truncated if too long)
- **Data**: Conversation ID, sender info, message details
- **Action**: Navigate to chat screen

### **2. Friend Request Notifications**
- **Trigger**: New friend request received
- **Title**: "Lời mời kết bạn mới"
- **Body**: "[Sender Name] muốn kết bạn với bạn"
- **Data**: Request ID, sender info
- **Action**: Navigate to friend requests screen

### **3. Reminder Notifications**
- **Trigger**: Reminder due
- **Title**: "Nhắc nhở"
- **Body**: Reminder content
- **Data**: Reminder ID, type, details
- **Action**: Navigate to reminders screen

## Security Considerations

### **1. Token Security**
- ✅ **Secure Storage**: FCM tokens stored securely in database
- ✅ **Token Validation**: Validate tokens before sending
- ✅ **Token Refresh**: Handle token refresh automatically

### **2. Permission Management**
- ✅ **User Consent**: Request permission before sending notifications
- ✅ **Permission Status**: Check and handle permission changes
- ✅ **Graceful Degradation**: App works without notifications

### **3. Data Privacy**
- ✅ **Minimal Data**: Only send necessary data in notifications
- ✅ **Encrypted Transport**: FCM uses encrypted connections
- ✅ **User Control**: Users can disable notifications in settings

## Troubleshooting

### **Common Issues:**

#### **1. Notifications Not Received**
- **Check**: FCM token is properly saved
- **Check**: User has granted notification permissions
- **Check**: FCM server key is correct
- **Check**: Device is connected to internet

#### **2. iOS Notifications Not Working**
- **Check**: APNs certificate is valid
- **Check**: Push Notifications capability is enabled
- **Check**: Bundle ID matches Firebase configuration

#### **3. Android Notifications Not Working**
- **Check**: google-services.json is properly placed
- **Check**: Firebase plugin is applied
- **Check**: Notification channels are created

### **Debug Commands:**

#### **Check FCM Token:**
```typescript
const token = await pushNotificationService.getCurrentToken();
console.log('FCM Token:', token);
```

#### **Check Permission Status:**
```typescript
const isEnabled = await pushNotificationService.isEnabled();
console.log('Notifications enabled:', isEnabled);
```

#### **Test Local Notification:**
```typescript
await pushNotificationService.showLocalNotification(
    'Test',
    'This is a test notification',
    { test: true }
);
```

## Performance Considerations

### **1. Battery Optimization**
- ✅ **Smart Delivery**: Only send push when user is offline
- ✅ **Efficient Payload**: Minimize notification data size
- ✅ **Batch Processing**: Send multiple notifications efficiently

### **2. Network Optimization**
- ✅ **Retry Logic**: Handle network failures gracefully
- ✅ **Timeout Handling**: Set appropriate timeouts
- ✅ **Connection Pooling**: Reuse connections when possible

### **3. Storage Optimization**
- ✅ **Token Cleanup**: Remove invalid tokens
- ✅ **Database Indexing**: Index device_token column
- ✅ **Efficient Queries**: Optimize database queries

## Future Enhancements

### **1. Advanced Features**
- **Rich Notifications**: Images, actions, and custom layouts
- **Notification Groups**: Group related notifications
- **Silent Notifications**: Background data sync
- **Notification History**: Store and display notification history

### **2. Analytics**
- **Delivery Tracking**: Track notification delivery rates
- **Engagement Metrics**: Track notification tap rates
- **Performance Monitoring**: Monitor notification performance

### **3. Personalization**
- **User Preferences**: Allow users to customize notification types
- **Quiet Hours**: Set notification quiet hours
- **Priority Levels**: Different notification priorities

## Conclusion

This push notification implementation provides a comprehensive solution for keeping users informed about new messages and important events, even when they're not actively using the app. The system is designed to be reliable, secure, and user-friendly, following best practices for both Android and iOS platforms.

The implementation seamlessly integrates with the existing real-time notification system, providing a fallback mechanism for offline users while maintaining the instant delivery for online users. 