import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateDeviceToken } from './api';
import { navigate } from '../navigation/navigationService';

// Notification channel for Android
const CHANNEL_ID = 'viegrand_messages';
const CHANNEL_NAME = 'VieGrand Messages';
const CHANNEL_DESCRIPTION = 'Messages from family members';

class PushNotificationService {
  private isInitialized = false;
  private unsubscribeForeground: (() => void) | null = null;
  private unsubscribeNotifee: (() => void) | null = null;
  // Track displayed message ids to prevent duplicates within app session
  private displayedMessageIds = new Set<string>();

  // Initialize push notification service
  async initialize() {
    if (this.isInitialized) {
      console.log('⏭️ Push notification service already initialized, skipping...');
      return;
    }

    try {
      console.log('🚀 Initializing push notification service...');

      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Push notification permission granted');
        
        // Create notification channel for Android
        if (Platform.OS === 'android') {
          await this.createNotificationChannel();
        }

        // Get FCM token
        await this.getFCMToken();

        // Set up message handlers
        this.setupMessageHandlers();

        this.isInitialized = true;
        console.log('✅ Push notification service initialized successfully');
      } else {
        console.log('❌ Push notification permission denied');
      }
    } catch (error) {
      console.error('❌ Error initializing push notification service:', error);
    }
  }

  // Create notification channel for Android
  private async createNotificationChannel() {
    try {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: CHANNEL_NAME,
        description: CHANNEL_DESCRIPTION,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500] as number[],
      });
      console.log('✅ Notification channel created');
    } catch (error) {
      console.error('❌ Error creating notification channel:', error);
    }
  }

  // Get FCM token and save to server
  private async getFCMToken() {
    try {
      const token = await messaging().getToken();
      console.log('📱 FCM Token:', token);

      if (token) {
        // Save token to AsyncStorage
        await AsyncStorage.setItem('fcm_token', token);

        // Get user email from user object instead of separate user_email key
        try {
          const userString = await AsyncStorage.getItem('user');
          const user = userString ? JSON.parse(userString) : null;
          
          if (user && user.email) {
            console.log('🔄 PushNotification: Updating device token for user:', user.email);
            const result = await updateDeviceToken(user.email, token);
            if (result.success) {
              console.log('✅ FCM token saved to server successfully');
            } else {
              console.error('❌ Failed to save FCM token to server:', result.message);
            }
          } else {
            console.log('⚠️ No user email found for device token update');
          }
        } catch (userError) {
          console.error('❌ Error getting user data for device token update:', userError);
        }
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
    }
  }

  // Set up message handlers
  private setupMessageHandlers() {
    // Clean up any existing handlers
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }
    if (this.unsubscribeNotifee) {
      this.unsubscribeNotifee();
      this.unsubscribeNotifee = null;
    }

    // Handle messages when app is in foreground (FCM)
    this.unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('📨 Foreground message received:', remoteMessage);
      await this.handleForegroundMessage(remoteMessage);
    });

    // Handle notification tap when app is in background (FCM)
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📨 Background notification tapped:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Handle notification tap when app is closed (FCM)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📨 App opened from notification:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });

    // Handle local notification press in foreground (Notifee)
    this.unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail?.notification) {
        console.log('🔔 Notifee press in foreground:', detail.notification);
        const data = detail.notification.data || {};
        this.handleNotificationTap({ data });
      }
    });

    // Handle token refresh
    messaging().onTokenRefresh((token) => {
      console.log('🔄 FCM token refreshed:', token);
      this.getFCMToken();
    });
  }

  // Get a stable message id for de-dup (falls back if missing)
  private getMessageId(data: any): string | null {
    if (!data) return null;
    const id = data['message.id'] || data.message_id || data.messageId;
    if (id) return String(id);
    const text = data['message.text'] || data.message_text || '';
    const ts = data.timestamp || '';
    if (!text) return null;
    return `${text}::${ts}`;
  }

  // Whether we already showed this message notification in this session
  private alreadyDisplayed(data: any): boolean {
    const id = this.getMessageId(data);
    if (!id) return false;
    if (this.displayedMessageIds.has(id)) return true;
    this.displayedMessageIds.add(id);
    // Avoid unbounded growth
    if (this.displayedMessageIds.size > 500) {
      // Reset if too large
      this.displayedMessageIds = new Set<string>();
      this.displayedMessageIds.add(id);
    }
    return false;
  }

  // Handle foreground messages
  private async handleForegroundMessage(remoteMessage: any) {
    try {
      const { data = {}, notification } = remoteMessage || {};

      // De-dup within session
      if (this.alreadyDisplayed(data)) {
        console.log('⏭️ Skipping duplicate foreground notification');
        return;
      }

      // Support both dotted and underscored keys from FCM data
      const senderName = data['sender.name'] || data.sender_name || 'Người thân';
      const messageText = data['message.text'] || data.message_text || notification?.body || 'Bạn có tin nhắn mới';
      const title = notification?.title || `Tin nhắn mới từ ${senderName}`;
      const messageId = this.getMessageId(data);

      // Show local notification for foreground messages
      await notifee.displayNotification({
        id: messageId || 'message_' + Date.now(), // Use message ID to prevent duplicates
        title,
        body: messageText,
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [300, 500] as number[],
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
        data: data || {},
      });

      console.log('✅ Foreground notification displayed');
    } catch (error) {
      console.error('❌ Error displaying foreground notification:', error);
    }
  }

  // Handle notification tap
  private handleNotificationTap(remoteMessage: any) {
    try {
      const { data = {} } = remoteMessage || {};

      // Navigate to appropriate screen based on notification type
      const type = data.type;
      if (type === 'message') {
        // Navigate to chat screen with conversation data
        this.navigateToChat(data);
      } else if (type === 'friend_request') {
        // Navigate to friend requests
        this.navigateToFriendRequests();
      } else if (type === 'reminder') {
        // Navigate to reminders
        this.navigateToReminders();
      }

      console.log('✅ Notification tap handled');
    } catch (error) {
      console.error('❌ Error handling notification tap:', error);
    }
  }

  // Navigate to chat screen
  private async navigateToChat(data: any) {
    try {
      console.log('📱 Navigating to chat:', data);
      
      // Read from dotted or underscored keys
      const conversationId = data['conversation.id'] || data.conversation_id;
      const senderPhone = data['sender.phone'] || data.sender_phone;
      const receiverPhone = data['receiver.phone'] || data.receiver_phone;
      const senderName = data['sender.name'] || data.sender_name || 'Người thân';
      const messageText = data['message.text'] || data.message_text;
      const navigationData = { conversationId, senderPhone, receiverPhone, senderName, messageText, timestamp: data.timestamp };

      // Try immediate deep navigation into Elderly -> Main(Tab) -> Message -> Chat
      navigate('Elderly', {
        screen: 'Main',
        params: {
          screen: 'Message',
          params: {
            screen: 'Chat',
            params: {
              conversationId,
              name: senderName,
              avatar: '',
              receiverPhone: senderPhone,
            }
          }
        }
      } as any);

      // Also store as pending in case navigation tree isn't ready yet
      await AsyncStorage.setItem('pending_chat_navigation', JSON.stringify({
        type: 'message',
        conversationId,
        senderPhone,
        receiverPhone,
        senderName,
        messageText,
        timestamp: data.timestamp
      }));
      console.log('✅ Chat navigation data saved (pending fallback)');
    } catch (error) {
      console.error('❌ Error navigating to chat:', error);
    }
  }

  // Navigate to friend requests
  private navigateToFriendRequests() {
    console.log('📱 Navigating to friend requests');
    // You'll need to implement navigation logic here
  }

  // Navigate to reminders
  private navigateToReminders() {
    console.log('📱 Navigating to reminders');
    // You'll need to implement navigation logic here
  }

  // Show local notification manually
  async showLocalNotification(title: string, body: string, data?: any) {
    try {
      // De-dup when called manually too
      if (data && this.alreadyDisplayed(data)) {
        console.log('⏭️ Skipping duplicate manual notification');
        return;
      }

      const messageId = data ? this.getMessageId(data) : null;

      await notifee.displayNotification({
        id: messageId || 'manual_' + Date.now(), // Use message ID to prevent duplicates
        title,
        body,
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [300, 500] as number[],
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
        data: data || {},
      });

      console.log('✅ Local notification displayed');
    } catch (error) {
      console.error('❌ Error showing local notification:', error);
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      await notifee.cancelAllNotifications();
      console.log('✅ All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  // Get current FCM token
  async getCurrentToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('❌ Error getting current FCM token:', error);
      return null;
    }
  }

  // Check if push notifications are enabled
  async isEnabled(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } catch (error) {
      console.error('❌ Error checking push notification status:', error);
      return false;
    }
  }

  // Request permission manually
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        await this.getFCMToken();
      }

      return enabled;
    } catch (error) {
      console.error('❌ Error requesting push notification permission:', error);
      return false;
    }
  }

  // Cleanup method
  cleanup() {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }
    if (this.unsubscribeNotifee) {
      this.unsubscribeNotifee();
      this.unsubscribeNotifee = null;
    }
    this.isInitialized = false;
    this.displayedMessageIds.clear();
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService; 