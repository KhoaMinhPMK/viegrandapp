import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import VoiceRecognitionModal from '../../../components/VoiceRecognitionModal';

interface InputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onEmoji?: () => void;
  onAttachment?: () => void;
  onVoice?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({
  value,
  onChangeText,
  onSend,
  onEmoji,
  onAttachment,
  onVoice,
  placeholder = 'Nhập tin nhắn...',
  disabled = false,
}) => {
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
      onChangeText(''); // Clear input sau khi gửi
    }
  };

  const handleVoicePress = () => {
    setIsVoiceModalVisible(true);
  };

  const handleVoiceResult = (text: string) => {
    onChangeText(text);
    setIsVoiceModalVisible(false);
  };

  const handleVoiceClose = () => {
    setIsVoiceModalVisible(false);
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Attachment Button */}
          {onAttachment && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onAttachment}
              disabled={disabled}
            >
              <Feather name="paperclip" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}

          {/* Emoji Button */}
          {onEmoji && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onEmoji}
              disabled={disabled}
            >
              <Feather name="smile" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}

          {/* Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={1000}
              editable={!disabled}
            />
          </View>

          {/* Voice Button or Send Button */}
          {onVoice && !canSend ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVoicePress}
              disabled={disabled}
            >
              <Feather 
                name="mic" 
                size={20} 
                color="#007AFF" 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton,
                canSend && styles.sendButtonActive
              ]}
              onPress={handleSend}
              disabled={!canSend}
            >
              <Feather 
                name="send" 
                size={18} 
                color={canSend ? "#FFFFFF" : "#8E8E93"} 
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Voice Recognition Modal */}
      <VoiceRecognitionModal
        visible={isVoiceModalVisible}
        onClose={handleVoiceClose}
        onResult={handleVoiceResult}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  input: {
    fontSize: 18, // tăng size
    color: '#000000',
    padding: 0,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
},
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  clearButton: {
    marginTop: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
},
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  useButton: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default InputBar; 