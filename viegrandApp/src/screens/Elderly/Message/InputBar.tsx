import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Text,
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
  enableVoiceMode?: boolean; // New prop to control voice mode toggle
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
  enableVoiceMode = true, // Default true for elderly (backward compatibility)
}) => {
  const [isVoiceMode, setIsVoiceMode] = useState(enableVoiceMode); // Use enableVoiceMode as initial state
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
      onChangeText('');
    }
  };

  const handleVoicePress = () => {
    setIsVoiceModalVisible(true);
  };

  const handleVoiceResult = (text: string) => {
    onChangeText(text);
    setIsVoiceModalVisible(false);
    // Switch to text mode after voice input (only if voice mode is enabled)
    if (enableVoiceMode) {
      setIsVoiceMode(false);
    }
  };

  const handleVoiceClose = () => {
    setIsVoiceModalVisible(false);
  };

  const toggleMode = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Left side - Mode toggle and main action */}
          <View style={styles.leftSection}>
            {/* Mode Toggle Button - Only show if voice mode is enabled */}
            {enableVoiceMode && (
              <TouchableOpacity 
                style={styles.modeToggle}
                onPress={toggleMode}
                disabled={disabled}
              >
                <Feather 
                  name={isVoiceMode ? "type" : "mic"} 
                  size={20} 
                  color="#8E8E93" 
                />
              </TouchableOpacity>
            )}

            {/* Main Input/Voice Area */}
            {enableVoiceMode && isVoiceMode ? (
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={handleVoicePress}
                disabled={disabled}
              >
                <LinearGradient
                  colors={['#007AFF', '#0051D5']}
                  style={styles.voiceGradient}
                >
                  <Feather name="mic" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
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
            )}
          </View>

          {/* Right side - Send/Attachment buttons */}
          <View style={styles.rightSection}>
            {/* Attachment Button */}
            {onAttachment && (
              <TouchableOpacity 
                style={styles.attachmentButton} 
                onPress={onAttachment}
                disabled={disabled}
              >
                <Feather name="image" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}

            {/* Send Button - Show when there's text OR when voice mode is disabled */}
            {((!enableVoiceMode && canSend) || (enableVoiceMode && !isVoiceMode && canSend)) && (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!canSend}
              >
                <LinearGradient
                  colors={['#007AFF', '#0051D5']}
                  style={styles.sendGradient}
                >
                  <Feather name="send" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  modeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voiceButton: {
    flex: 1,
    height: 50,
  },
  voiceGradient: {
    flex: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 50,
    maxHeight: 100,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#000000',
    padding: 0,
    textAlignVertical: 'center',
    lineHeight: 22,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default InputBar; 