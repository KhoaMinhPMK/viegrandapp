import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Clipboard,
  Dimensions,
} from 'react-native';
// TODO: Install react-native-qrcode-svg library
// import QRCode from 'react-native-qrcode-svg';
import Feather from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

interface PrivateKeyQRModalProps {
  visible: boolean;
  onClose: () => void;
  privateKey: string;
}

const PrivateKeyQRModal = memo(({ visible, onClose, privateKey }: PrivateKeyQRModalProps) => {
  const [isCopying, setIsCopying] = useState(false);

  const copyPrivateKey = async () => {
    if (!privateKey) {
      Alert.alert('Lỗi', 'Private key không tồn tại');
      return;
    }

    try {
      setIsCopying(true);
      await Clipboard.setString(privateKey);
      Alert.alert('Thành công', 'Private key đã được sao chép vào clipboard');
    } catch (error) {
      console.error('Error copying private key:', error);
      Alert.alert('Lỗi', 'Không thể sao chép private key');
    } finally {
      setIsCopying(false);
    }
  };

  if (!privateKey) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Private Key</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Feather name="x" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              {/* Placeholder for QR Code - TODO: Install react-native-qrcode-svg */}
              <View style={styles.qrPlaceholder}>
                <Feather name="qr-code" size={120} color="#E5E5EA" />
                <Text style={styles.qrPlaceholderText}>QR Code</Text>
              </View>
            </View>
            <Text style={styles.qrLabel}>Quét mã QR để lấy Private Key</Text>
          </View>

          {/* Private Key Text Section */}
          <View style={styles.keyContainer}>
            <Text style={styles.keyLabel}>Private Key:</Text>
            <View style={styles.keyTextContainer}>
              <Text style={styles.keyText} numberOfLines={3} ellipsizeMode="middle">
                {privateKey}
              </Text>
            </View>
            
            {/* Copy Button */}
            <TouchableOpacity
              style={[styles.copyButton, isCopying && styles.copyButtonDisabled]}
              onPress={copyPrivateKey}
              disabled={isCopying}
              activeOpacity={0.8}
            >
              <Feather 
                name={isCopying ? "check" : "copy"} 
                size={18} 
                color="#FFFFFF" 
              />
              <Text style={styles.copyButtonText}>
                {isCopying ? "Đã sao chép!" : "Sao chép"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <View style={styles.warningContainer}>
            <Feather name="alert-triangle" size={16} color="#FF9500" />
            <Text style={styles.warningText}>
              Giữ Private Key an toàn! Đây là chìa khóa để khôi phục tài khoản của bạn.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  qrLabel: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  qrPlaceholderText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    fontWeight: '500',
  },
  keyContainer: {
    marginBottom: 20,
  },
  keyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  keyTextContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
  },
  keyText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  copyButtonDisabled: {
    backgroundColor: '#34C759',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default PrivateKeyQRModal; 