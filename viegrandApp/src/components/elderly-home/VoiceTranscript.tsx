import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { BlurView } from '@react-native-community/blur';
import { useVoiceNavigation } from '../../contexts/VoiceNavigationContext';
import { useNavigation } from '@react-navigation/native';
import { processVoiceCommand, VOICE_FEEDBACK_MESSAGES } from '../../services/voiceNavigationService';

const VoiceTranscript = memo(() => {
  const { isListening, stopListening, results, error, clearResults } = useVoiceNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCommand, setProcessedCommand] = useState<string | null>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (isListening) {
      setIsVisible(true);
      setProcessedCommand(null);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (results.length > 0) {
      setIsVisible(true);
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        setProcessedCommand(null);
        setIsProcessing(false);
      });
    }
  }, [isListening, results, animation]);

  const handleProcessVoice = useCallback(async () => {
    if (results.length > 0) {
      const command = results[0];
      console.log('🎤 Lệnh thoại đã nhận:', command);

      setIsProcessing(true);
      setProcessedCommand(command);

      try {
        // Process the voice command
        const result = processVoiceCommand(command, navigation);

        if (result.success) {
          console.log('✅ Lệnh được xử lý:', result.command, '->', result.screen);

          // Show success feedback
          Alert.alert(
            'Thành công!',
            result.message || 'Đang thực hiện lệnh...',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Execute the navigation action
                  if (result.action) {
                    result.action();
                  }
                  clearResults();
                }
              }
            ]
          );
        } else {
          console.log('❌ Không hiểu lệnh:', command);

          // Show error feedback with suggestions
          Alert.alert(
            'Không hiểu lệnh',
            'Bạn có thể thử các lệnh sau:\n\n• "Mở tin nhắn"\n• "Xem thời tiết"\n• "Kiểm tra sức khỏe"\n• "Xem nhắc nhở"\n• "Mở giải trí"\n• "Chơi game"\n• "Đọc sách"\n• "Cài đặt"\n• "Trợ giúp"',
            [
              {
                text: 'Thử lại',
                onPress: () => {
                  clearResults();
                  // Restart listening
                  setTimeout(() => {
                    // This will be handled by the voice context
                  }, 500);
                }
              },
              {
                text: 'Hủy',
                onPress: () => clearResults(),
                style: 'cancel'
              }
            ]
          );
        }
      } catch (error) {
        console.error('❌ Lỗi xử lý lệnh thoại:', error);
        Alert.alert(
          'Lỗi xử lý',
          'Có lỗi xảy ra khi xử lý lệnh thoại. Vui lòng thử lại.',
          [
            {
              text: 'OK',
              onPress: () => clearResults()
            }
          ]
        );
      } finally {
        setIsProcessing(false);
      }
    }
  }, [results, navigation, clearResults]);

  const handleCancelVoice = useCallback(() => {
    stopListening();
    clearResults();
    setProcessedCommand(null);
    setIsProcessing(false);
  }, [stopListening, clearResults]);

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

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <BlurView
        style={styles.blurView}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.9)"
      />
      
      <View style={styles.content}>
        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {/* Transcript Content */}
        {results.length > 0 && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptLabel}>Lệnh đã nhận:</Text>
            <Text style={styles.transcriptText}>"{results[0]}"</Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancelVoice}
            activeOpacity={0.7}
          >
            <Feather name="x" size={20} color="#FF3B30" />
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          {results.length > 0 && !isProcessing && (
            <TouchableOpacity
              style={[styles.button, styles.processButton]}
              onPress={handleProcessVoice}
              activeOpacity={0.7}
            >
              <Feather name="check" size={20} color="#FFFFFF" />
              <Text style={styles.processButtonText}>Thực hiện</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>Đang xử lý lệnh...</Text>
          </View>
        )}

        {/* Quick Command Suggestions */}
        {!isListening && results.length === 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Lệnh nhanh:</Text>
            <View style={styles.suggestionsGrid}>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => {
                  // Simulate voice command
                  const mockResult = processVoiceCommand('tin nhắn', navigation);
                  if (mockResult.success && mockResult.action) {
                    mockResult.action();
                  }
                }}
              >
                <Text style={styles.suggestionText}>"Tin nhắn"</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => {
                  const mockResult = processVoiceCommand('sức khỏe', navigation);
                  if (mockResult.success && mockResult.action) {
                    mockResult.action();
                  }
                }}
              >
                <Text style={styles.suggestionText}>"Sức khỏe"</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => {
                  const mockResult = processVoiceCommand('giải trí', navigation);
                  if (mockResult.success && mockResult.action) {
                    mockResult.action();
                  }
                }}
              >
                <Text style={styles.suggestionText}>"Giải trí"</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  content: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transcriptContainer: {
    marginBottom: 16,
  },
  transcriptLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  processButton: {
    backgroundColor: '#007AFF',
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  processingText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  suggestionText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default VoiceTranscript; 