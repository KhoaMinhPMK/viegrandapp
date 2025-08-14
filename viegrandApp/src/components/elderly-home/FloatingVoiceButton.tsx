import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useVoiceNavigation } from '../../contexts/VoiceNavigationContext';
import { useNavigation } from '@react-navigation/native';
import { processVoiceCommand } from '../../services/voiceNavigationService';
import { useVoiceButton } from '../../contexts/VoiceButtonContext';
import MicrophoneIndicator from './MicrophoneIndicator';

const { width, height } = Dimensions.get('window');

interface FloatingVoiceButtonProps {
  visible?: boolean;
  variant?: 'floating' | 'centerDocked';
}

const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({ visible = true, variant = 'floating' }) => {
  const navigation = useNavigation<any>();
  const { isListening, startListening, stopListening, results, error, clearResults } = useVoiceNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCommand, setProcessedCommand] = useState<string>('');
  const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  
  // Use VoiceButton context to control visibility
  const { isVisible: contextVisible } = useVoiceButton();
  const isVoiceButtonVisible = visible && contextVisible;
  
  // Debug log to check visibility states
  console.log('🎤 VoiceButton Debug:', {
    visible,
    contextVisible,
    isVoiceButtonVisible,
    variant
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Removed breathing animation per UX request

  // Breathing animation removed

  useEffect(() => {
    if (isListening) {
      // Simple pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop pulse animation
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const handleVoicePress = async () => {
    if (isListening) {
      stopListening();
      setModalVisible(false);
      return;
    }

    setModalVisible(true);
    clearResults();
    
    try {
      await startListening();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      Alert.alert('Lỗi', 'Không thể khởi động nhận diện giọng nói');
      setModalVisible(false);
    }
  };

      const handleProcessVoice = async () => {
      if (results.length === 0) {
        Alert.alert('Không có lệnh', 'Vui lòng nói lại lệnh của bạn');
        return;
      }

      const command = results[0];
      setIsProcessing(true);
      setProcessedCommand('');

      try {
        const result = processVoiceCommand(command, navigation);
        
        if (result.success && result.action) {
          // Directly execute the command without confirmation
          if (result.action) {
            result.action();
          }
          setModalVisible(false);
          stopListening();
        } else {
          Alert.alert(
            'Không hiểu lệnh',
            'Bạn có thể thử các lệnh sau:\n\n• "Mở tin nhắn"\n• "Xem thời tiết"\n• "Kiểm tra sức khỏe"\n• "Xem nhắc nhở"\n• "Mở giải trí"\n• "Chơi game"\n• "Đọc sách"\n• "Cài đặt"\n• "Trợ giúp"',
            [
              {
                text: 'Hủy',
                style: 'cancel',
                onPress: () => {
                  setIsProcessing(false);
                  setProcessedCommand('');
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error processing voice command:', error);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý lệnh');
      } finally {
        setIsProcessing(false);
        setProcessedCommand('');
      }
    };

  const handleCancelVoice = () => {
    stopListening();
    setModalVisible(false);
    clearResults();
    setIsProcessing(false);
    setProcessedCommand('');
  };

  const getStatusText = () => {
    if (isListening) return 'Đang nghe...';
    if (isProcessing) return 'Đang xử lý...';
    if (results.length > 0) return 'Lệnh đã nhận';
    if (error) return 'Có lỗi xảy ra';
    return 'Sẵn sàng';
  };

  const getStatusColor = () => {
    if (isListening) return '#007AFF';
    if (isProcessing) return '#FF9500';
    if (results.length > 0) return '#34C759';
    if (error) return '#FF3B30';
    return '#8E8E93';
  };

  // Conditionally render the voice button based on visible prop
  if (!isVoiceButtonVisible) {
    return null;
  }

  return (
    <>
      {/* Floating/Center-docked Voice Button */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          variant === 'centerDocked' ? styles.centerDockedContainer : styles.floatingButton,
          { transform: [{ scale: isListening ? pulseAnim : new Animated.Value(1) }] }
        ]}
      >
        {variant === 'centerDocked' ? (
          <TouchableOpacity
            style={styles.centerTouchableHitbox}
            onPress={handleVoicePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#0EA5E9', '#0369A1']}
              style={[styles.voiceGradient, isListening && styles.voiceGradientListening]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="mic" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonListening]}
            onPress={handleVoicePress}
            activeOpacity={0.8}
          >
            <Feather name="mic" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Voice Recognition Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelVoice}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nhận diện lệnh thoại</Text>
              <TouchableOpacity onPress={handleCancelVoice} style={styles.closeButton}>
                <Feather name="x" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {/* Status Indicator */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>

            {/* Microphone Indicator */}
            <MicrophoneIndicator isListening={isListening} />

            {/* Transcript */}
            {results.length > 0 && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptLabel}>Lệnh đã nhận:</Text>
                <Text style={styles.transcriptText}>"{results[0]}"</Text>
              </View>
            )}

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {results.length > 0 && !isProcessing && (
                <TouchableOpacity
                  style={styles.processButton}
                  onPress={handleProcessVoice}
                >
                  <Feather name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.processButtonText}>Thực hiện</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelVoice}
              >
                <Feather name="x" size={20} color="#8E8E93" />
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>

            {/* Processing Indicator */}
            {isProcessing && (
              <View style={styles.processingContainer}>
                <Text style={styles.processingText}>Đang xử lý lệnh...</Text>
              </View>
            )}


          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 9999, // Very high z-index to ensure it's always on top
  },
  centerDockedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 35,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'box-none', // Allow touches to pass through to underlying elements
  },
  // White cushion matches tab bar background, gives the "dock" look
  centerTouchableHitbox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  // Inner gradient uses the same palette/style as the active tab icon but slightly bigger
  voiceGradient: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceGradientListening: {
    opacity: 0.95,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 0,
  },
  voiceButtonCenterLift: {
    marginBottom: 12,
    backgroundColor: '#007AFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  voiceButtonListening: {
    backgroundColor: '#0D4C92',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: width - 40,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0D4C92',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  transcriptContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D4C92',
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    minWidth: 140,
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    minWidth: 140,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  processingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  processingText: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '500',
  },





});

export default FloatingVoiceButton; 