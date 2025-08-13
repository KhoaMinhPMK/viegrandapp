import { useAppState } from '../contexts/AppStateContext';
import pushNotificationService from './pushNotification';

interface MessageNotificationData {
  type: string;
  conversation_id: string;
  sender_phone: string;
  receiver_phone: string;
  message_id: string;
  message_text: string;
  message_type: string;
}

class MessageNotificationHandler {
  private static instance: MessageNotificationHandler;
  private appState: any = null;

  static getInstance(): MessageNotificationHandler {
    if (!MessageNotificationHandler.instance) {
      MessageNotificationHandler.instance = new MessageNotificationHandler();
    }
    return MessageNotificationHandler.instance;
  }

  setAppState(appState: any) {
    this.appState = appState;
  }

  shouldShowPushNotification(conversationId: string): boolean {
    if (!this.appState) {
      console.log('📱 MessageNotificationHandler - No app state available, showing notification');
      return true;
    }

    const { isInChatScreen, currentConversationId, isUserActive } = this.appState;

    // Don't show notification if:
    // 1. User is not active (app in background)
    // 2. User is in chat screen AND it's the same conversation
    if (!isUserActive) {
      console.log('📱 MessageNotificationHandler - User not active, showing notification');
      return true;
    }

    if (isInChatScreen && currentConversationId === conversationId) {
      console.log('📱 MessageNotificationHandler - User in same chat, NOT showing notification');
      return false;
    }

    console.log('📱 MessageNotificationHandler - User not in same chat, showing notification');
    return true;
  }

  async handleIncomingMessage(
    messageData: MessageNotificationData,
    senderName: string = 'Người thân'
  ): Promise<void> {
    const { conversation_id, message_text, sender_phone } = messageData;

    // Check if we should show push notification
    if (!this.shouldShowPushNotification(conversation_id)) {
      console.log('📱 MessageNotificationHandler - Skipping push notification (user in chat)');
      return;
    }

    try {
      // Show local notification
      await pushNotificationService.showLocalNotification(
        `Tin nhắn mới từ ${senderName}`,
        message_text,
        {
          type: 'message',
          conversation_id,
          sender_phone,
          message_text,
          screen: 'chat',
          conversationId: conversation_id
        }
      );

      console.log('✅ MessageNotificationHandler - Local notification shown');
    } catch (error) {
      console.error('❌ MessageNotificationHandler - Error showing notification:', error);
    }
  }

  // Hook to use in components
  static useMessageNotificationHandler() {
    const appState = useAppState();
    const handler = MessageNotificationHandler.getInstance();
    handler.setAppState(appState);
    return handler;
  }
}

export default MessageNotificationHandler; 