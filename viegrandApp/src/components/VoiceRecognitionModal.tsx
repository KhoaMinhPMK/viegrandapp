import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useVoice } from '../contexts/VoiceContext';

const { width } = Dimensions.get('window');

interface VoiceRecognitionModalProps {
  visible: boolean;
  onClose: () => void;
  onResult?: (text: string) => void;
}

const VoiceRecognitionModal: React.FC<VoiceRecognitionModalProps> = ({
  visible,
  onClose,
  onResult,
}) => {
  const { isListening, startListening, stopListening, results, error, clearResults } = useVoice();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      startListening();
    } else {
      stopListening();
    }
  }, [visible]);

  useEffect(() => {
    // if (results.length > 0 && onResult) {
    //   onResult(results[0]);
    // }
  }, [results, onResult]);

  useEffect(() => {
    if (isListening) {
      // Tạo hiệu ứng nhịp đập cho vòng tròn
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleClose = () => {
    stopListening();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color="#94A3B8" />
          </TouchableOpacity>

          {/* <Text style={styles.title}>Nhận diện giọng nói</Text> */}

          <View style={styles.micContainer}>
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: isListening ? 0.3 : 0,
                },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.micButton,
                { backgroundColor: isListening ? '#FF3B30' : '#0EA5E9' },
              ]}
              onPress={isListening ? stopListening : startListening}
            >
              <Feather
                name={isListening ? 'mic-off' : 'mic'}
                size={32}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.statusText}>
            {isListening ? 'Đang nghe...' : 'Nhấn vào micro để bắt đầu'}
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.resultsContainer}>
            {results.length > 0 ? (
              <Text style={styles.resultText}>{results[0]}</Text>
            ) : (
              <Text style={styles.placeholderText}>
                {isListening ? 'Hãy nói điều gì đó...' : 'Kết quả sẽ hiển thị ở đây'}
              </Text>
            )}
          </View>

          {results.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                if (results.length > 0) {
                  clearResults(); // Hàm này đã có trong context
                }
              }}
            >
              <Text style={styles.clearButtonText}>Xóa</Text>
            </TouchableOpacity>
          )}

          {results.length > 0 && (
            <TouchableOpacity
              style={styles.useButton}
              onPress={() => {
                if (results.length > 0 && onResult) {
                  onResult(results[0]);
                  handleClose();
                }
              }}
            >
              <Text style={styles.useButtonText}>Sử dụng kết quả</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 24,
  },
  micContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0EA5E9',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 16,
  },
  resultsContainer: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  resultText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  useButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  clearButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default VoiceRecognitionModal; 