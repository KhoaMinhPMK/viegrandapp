import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordChangeOTP, verifyOTPAndChangePassword } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [validationStatus, setValidationStatus] = useState<string>('');

  // Update validation status when step changes
  useEffect(() => {
    if (step === 'verify') {
      updateValidationStatus();
    }
  }, [step]);

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email của bạn');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const result = await sendPasswordChangeOTP(email.trim());
      
      if (result.success) {
        setOtpSent(true);
        setStep('verify');
        
        // For testing: show OTP in alert if it's returned
        if (result.otp) {
          Alert.alert(
            'Thành công',
            `Mã OTP đã được tạo thành công!\n\nMã OTP: ${result.otp}\n\n(Trong môi trường production, mã này sẽ được gửi qua email)`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Thành công',
            'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và spam.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation checks with detailed feedback
    let validationMessage = '';
    
    if (!otp.trim()) {
      validationMessage += '❌ Mã OTP: Chưa nhập\n';
    } else {
      validationMessage += `✅ Mã OTP: ${otp.trim()}\n`;
    }
    
    if (!newPassword.trim()) {
      validationMessage += '❌ Mật khẩu mới: Chưa nhập\n';
    } else if (newPassword.length < 6) {
      validationMessage += `❌ Mật khẩu mới: Quá ngắn (${newPassword.length}/6 ký tự)\n`;
    } else {
      validationMessage += `✅ Mật khẩu mới: ${newPassword.length} ký tự\n`;
    }
    
    if (!confirmPassword.trim()) {
      validationMessage += '❌ Xác nhận mật khẩu: Chưa nhập\n';
    } else if (newPassword !== confirmPassword) {
      validationMessage += '❌ Xác nhận mật khẩu: Không khớp\n';
    } else {
      validationMessage += '✅ Xác nhận mật khẩu: Khớp\n';
    }
    
    // Show validation results
    Alert.alert(
      'Kiểm tra thông tin',
      validationMessage,
      [
        {
          text: 'Tiếp tục',
          onPress: async () => {
            // Check if all validations pass
            if (!otp.trim() || !newPassword.trim() || newPassword.length < 6 || newPassword !== confirmPassword) {
              Alert.alert('Lỗi', 'Vui lòng sửa các lỗi trên trước khi tiếp tục.');
              return;
            }
            
            // Proceed with password change
            setLoading(true);
            try {
              console.log('🔄 Sending password change request:', {
                email: email.trim(),
                otp: otp.trim(),
                passwordLength: newPassword.trim().length
              });
              
              const result = await verifyOTPAndChangePassword(
                email.trim(),
                otp.trim(),
                newPassword.trim()
              );

              console.log('📱 Password change result:', result);

              if (result.success) {
                Alert.alert(
                  'Thành công',
                  'Mật khẩu đã được thay đổi thành công!',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Lỗi xác thực',
                  `Chi tiết lỗi:\n${result.message || 'Không thể thay đổi mật khẩu'}\n\nMã OTP: ${otp.trim()}\nEmail: ${email.trim()}`,
                  [{ text: 'OK' }]
                );
              }
            } catch (error: any) {
              console.error('❌ Error changing password:', error);
              Alert.alert(
                'Lỗi kết nối',
                `Chi tiết lỗi:\n${error.message || 'Có lỗi xảy ra'}\n\nMã OTP: ${otp.trim()}\nEmail: ${email.trim()}`,
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          }
        },
        {
          text: 'Hủy',
          style: 'cancel'
        }
      ]
    );
  };

  const handleResendOTP = () => {
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setStep('request');
    setOtpSent(false);
    setValidationStatus('');
  };

  // Update validation status in real-time
  const updateValidationStatus = () => {
    let status = '';
    
    if (otp.trim()) {
      status += `✅ OTP: ${otp.trim()}\n`;
    } else {
      status += '❌ OTP: Chưa nhập\n';
    }
    
    if (newPassword.trim()) {
      if (newPassword.length >= 6) {
        status += `✅ Mật khẩu: ${newPassword.length} ký tự\n`;
      } else {
        status += `❌ Mật khẩu: ${newPassword.length}/6 ký tự\n`;
      }
    } else {
      status += '❌ Mật khẩu: Chưa nhập\n';
    }
    
    if (confirmPassword.trim()) {
      if (newPassword === confirmPassword) {
        status += '✅ Xác nhận: Khớp\n';
      } else {
        status += '❌ Xác nhận: Không khớp\n';
      }
    } else {
      status += '❌ Xác nhận: Chưa nhập\n';
    }
    
    setValidationStatus(status);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Đổi Mật Khẩu</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {step === 'request' ? (
            // Step 1: Request OTP
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Bước 1: Gửi mã OTP</Text>
              <Text style={styles.description}>
                Nhập email của bạn để nhận mã OTP đổi mật khẩu
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Nhập email của bạn"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRequestOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Gửi mã OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            // Step 2: Verify OTP and Change Password
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Bước 2: Xác thực và đổi mật khẩu</Text>
              <Text style={styles.description}>
                Nhập mã OTP đã gửi đến email {email} và mật khẩu mới
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mã OTP</Text>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    updateValidationStatus();
                  }}
                  placeholder="Nhập mã 6 số"
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mật khẩu mới</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    updateValidationStatus();
                  }}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    updateValidationStatus();
                  }}
                  placeholder="Nhập lại mật khẩu mới"
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              {/* Validation Status Display */}
              {validationStatus && (
                <View style={styles.validationContainer}>
                  <Text style={styles.validationTitle}>Trạng thái kiểm tra:</Text>
                  <Text style={styles.validationText}>{validationStatus}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>Gửi lại mã OTP</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  validationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  validationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  validationText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});

export default ChangePasswordScreen; 