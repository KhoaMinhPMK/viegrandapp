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
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Removed breathing animation per UX request

  // Breathing animation removed

  useEffect(() => {
    if (isListening) {
      // Start pulse animation when listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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
    setProcessedCommand(command);

    try {
      const result = processVoiceCommand(command, navigation);
      
      if (result.success && result.action) {
        Alert.alert(
          'Thực hiện lệnh',
          `Đang thực hiện: "${command}"`,
          [
            {
              text: 'Hủy',
              style: 'cancel',
              onPress: () => {
                setIsProcessing(false);
                setProcessedCommand('');
              }
            },
            {
              text: 'Thực hiện',
              onPress: () => {
                if (result.action) {
                  result.action();
                }
                setIsProcessing(false);
                setProcessedCommand('');
                setModalVisible(false);
                stopListening();
              }
            }
          ]
        );
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

  // Always render the voice button - never hide it
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
              <Feather name="mic" size={26} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonListening]}
            onPress={handleVoicePress}
            activeOpacity={0.8}
          >
            <Feather name="mic" size={28} color="#FFFFFF" />
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

            {/* Quick Command Suggestions */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Lệnh nhanh:</Text>
              <View style={styles.suggestionsGrid}>
                {['Tin nhắn', 'Thời tiết', 'Sức khỏe', 'Nhắc nhở'].map((command, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => {
                      const mockResult = processVoiceCommand(command, navigation);
                      if (mockResult.success && mockResult.action) {
                        mockResult.action();
                        setModalVisible(false);
                      }
                    }}
                  >
                    <Text style={styles.suggestionText}>"{command}"</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
  },
  // White cushion matches tab bar background, gives the "dock" look
  centerTouchableHitbox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  // Inner gradient uses the same palette/style as the active tab icon but slightly bigger
  voiceGradient: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceGradientListening: {
    opacity: 0.95,
  },
  voiceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D4C92',
    marginBottom: 16,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  suggestionChip: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  suggestionText: {
    fontSize: 14,
    color: '#0D4C92',
    fontWeight: '500',
  },
});

export default FloatingVoiceButton; 