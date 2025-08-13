import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LastMessage {
  conversationId: string;
  messageText: string;
  senderPhone: string;
  receiverPhone: string;
  sentAt: string;
  senderName: string;
  isOwnMessage: boolean;
}

const LAST_MESSAGES_KEY = 'last_messages_cache';

export const lastMessageStorage = {
  // Lưu tin nhắn cuối cùng cho một cuộc hội thoại
  async saveLastMessage(lastMessage: LastMessage): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(LAST_MESSAGES_KEY);
      const lastMessages: Record<string, LastMessage> = existingData ? JSON.parse(existingData) : {};
      
      // Lưu tin nhắn cuối cùng với key là conversationId
      lastMessages[lastMessage.conversationId] = lastMessage;
      
      await AsyncStorage.setItem(LAST_MESSAGES_KEY, JSON.stringify(lastMessages));
      console.log('💾 Đã lưu tin nhắn cuối cùng:', {
        conversationId: lastMessage.conversationId,
        message: lastMessage.messageText.substring(0, 50) + '...'
      });
    } catch (error) {
      console.error('❌ Lỗi khi lưu tin nhắn cuối cùng:', error);
    }
  },

  // Lấy tin nhắn cuối cùng cho một cuộc hội thoại
  async getLastMessage(conversationId: string): Promise<LastMessage | null> {
    try {
      const existingData = await AsyncStorage.getItem(LAST_MESSAGES_KEY);
      if (!existingData) return null;
      
      const lastMessages: Record<string, LastMessage> = JSON.parse(existingData);
      const lastMessage = lastMessages[conversationId];
      
      if (lastMessage) {
        console.log('📖 Đã lấy tin nhắn cuối cùng:', {
          conversationId,
          message: lastMessage.messageText.substring(0, 50) + '...'
        });
      }
      
      return lastMessage || null;
    } catch (error) {
      console.error('❌ Lỗi khi lấy tin nhắn cuối cùng:', error);
      return null;
    }
  },

  // Lấy tất cả tin nhắn cuối cùng
  async getAllLastMessages(): Promise<Record<string, LastMessage>> {
    try {
      const existingData = await AsyncStorage.getItem(LAST_MESSAGES_KEY);
      return existingData ? JSON.parse(existingData) : {};
    } catch (error) {
      console.error('❌ Lỗi khi lấy tất cả tin nhắn cuối cùng:', error);
      return {};
    }
  },

  // Xóa tin nhắn cuối cùng cho một cuộc hội thoại
  async removeLastMessage(conversationId: string): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(LAST_MESSAGES_KEY);
      if (!existingData) return;
      
      const lastMessages: Record<string, LastMessage> = JSON.parse(existingData);
      delete lastMessages[conversationId];
      
      await AsyncStorage.setItem(LAST_MESSAGES_KEY, JSON.stringify(lastMessages));
      console.log('🗑️ Đã xóa tin nhắn cuối cùng cho conversation:', conversationId);
    } catch (error) {
      console.error('❌ Lỗi khi xóa tin nhắn cuối cùng:', error);
    }
  },

  // Xóa tất cả tin nhắn cuối cùng
  async clearAllLastMessages(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LAST_MESSAGES_KEY);
      console.log('🗑️ Đã xóa tất cả tin nhắn cuối cùng');
    } catch (error) {
      console.error('❌ Lỗi khi xóa tất cả tin nhắn cuối cùng:', error);
    }
  }
}; 