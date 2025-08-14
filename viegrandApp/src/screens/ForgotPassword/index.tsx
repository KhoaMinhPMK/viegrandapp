import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { sendPasswordChangeOTP, verifyOTPAndChangePassword } from '../../services/api';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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
                      onPress: () => navigation.navigate('Login'),
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
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.formContainer}>
            {step === 'request' ? (
              // Step 1: Request OTP
              <>
                <Text style={styles.title}>Quên mật khẩu?</Text>
                <Text style={styles.subtitle}>
                  Đừng lo! Điều đó xảy ra. Vui lòng nhập email liên kết với tài khoản của bạn.
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#757575"
                  editable={!loading}
                />

                <TouchableOpacity 
                  style={[styles.button, loading && styles.buttonDisabled]} 
                  onPress={handleRequestOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Gửi mã OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}>
                  <Text style={styles.backButtonText}>Quay lại Đăng nhập</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Step 2: Verify OTP and Change Password
              <>
                <Text style={styles.title}>Đặt lại mật khẩu</Text>
                <Text style={styles.subtitle}>
                  Nhập mã OTP đã gửi đến email {email} và mật khẩu mới
                </Text>

                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    updateValidationStatus();
                  }}
                  placeholder="Mã OTP (6 số)"
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!loading}
                />

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      updateValidationStatus();
                    }}
                    placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                    secureTextEntry={!isPasswordVisible}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Feather
                      name={isPasswordVisible ? 'eye-off' : 'eye'}
                      size={22}
                      color="#757575"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      updateValidationStatus();
                    }}
                    placeholder="Xác nhận mật khẩu mới"
                    secureTextEntry={!isConfirmPasswordVisible}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                    <Feather
                      name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
                      size={22}
                      color="#757575"
                    />
                  </TouchableOpacity>
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
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>Gửi lại mã OTP</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}>
                  <Text style={styles.backButtonText}>Quay lại Đăng nhập</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: width * 0.85,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#0D4C92',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: 50,
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0D4C92',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#0D4C92',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#0D4C92',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 40,
  },
  backButtonText: {
    fontSize: 14,
    color: '#0D4C92',
    fontWeight: 'bold',
  },
  validationContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0D4C92',
    width: '100%',
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

export default ForgotPasswordScreen;