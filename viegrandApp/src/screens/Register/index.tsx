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
  Clipboard,
  Animated,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { StackActions } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { generateRandomString } from '../../utils/randomString';
import { checkPrivateKey } from '../../services/api';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'elderly' | 'relative'>('elderly');
  const [privateKey, setPrivateKey] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [rotateAnim] = useState(new Animated.Value(0));
  const { register, isLoading, getUserDataByEmail } = useAuth();

  // Animation for loading icon
  const startRotateAnimation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotateAnimation = () => {
    rotateAnim.stopAnimation();
  };

  // Tự động generate private key khi component mount
  useEffect(() => {
    const autoGeneratePrivateKey = async () => {
      if (!privateKey) {
        setIsGeneratingKey(true);
        startRotateAnimation();
        try {
          const key = await generatePrivateKey();
          console.log('Auto-generated private key:', key);
        } catch (error) {
          console.error('Error auto-generating private key:', error);
        } finally {
          setIsGeneratingKey(false);
          stopRotateAnimation();
        }
      }
    };

    autoGeneratePrivateKey();
  }, []);

  const generatePrivateKey = async () => {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const newKey = generateRandomString();
      console.log('Generated private key:', newKey);
      
      // Check if the private key already exists
      const result = await checkPrivateKey(newKey);
      
      if (result.success && !result.exists) {
        console.log('Setting private key:', newKey);
        setPrivateKey(newKey);
        return newKey; // Return the generated key
      }
      
      attempts++;
    }
    
    // If we can't find a unique private key after max attempts, append timestamp
    const fallbackKey = generateRandomString() + Date.now().toString().slice(-4);
    console.log('Setting fallback private key:', fallbackKey);
    setPrivateKey(fallbackKey);
    return fallbackKey; // Return the fallback key
  };

  const copyPrivateKey = async () => {
    if (privateKey) {
      try {
        await Clipboard.setString(privateKey);
        Alert.alert('Thành công', 'Private key đã được sao chép vào clipboard');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        Alert.alert('Lỗi', 'Không thể sao chép private key');
      }
    }
  };

  const handleRegister = async () => {
    if (!fullName || !phone || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (!privateKey) {
      Alert.alert('Lỗi', 'Private key chưa được tạo. Vui lòng thử lại.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ.');
      return;
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại phải có ít nhất 10 chữ số.');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    // Validate phone number
    if (phone.length < 10) {
      Alert.alert('Lỗi', 'Số điện thoại phải có ít nhất 10 số.');
      return;
    }

    // Show confirmation dialog about private key importance
    Alert.alert(
      'Xác nhận đăng ký',
      `🔑 Bạn đã sao chép và lưu trữ Private Key an toàn chưa?\n\nPrivate Key: ${privateKey}\n\n⚠️ Quan trọng: Bạn sẽ cần mã này để khôi phục tài khoản nếu quên mật khẩu. Hãy lưu trữ ở nơi an toàn!`,
      [
        {
          text: 'Tôi chưa sao chép',
          style: 'cancel'
        },
        {
          text: 'Đã sao chép, tiếp tục',
          onPress: proceedWithRegistration
        }
      ]
    );
  };

  const proceedWithRegistration = async () => {
    // Generate private key if not already generated
    let finalPrivateKey = privateKey;
    if (!privateKey) {
      console.log('No private key found, generating...');
      finalPrivateKey = await generatePrivateKey();
      console.log('Private key after generation:', finalPrivateKey);
      console.log('Private key type:', typeof finalPrivateKey);
      console.log('Private key length:', finalPrivateKey ? finalPrivateKey.length : 0);
    } else {
      console.log('Private key already exists:', privateKey);
      console.log('Existing private key type:', typeof privateKey);
      console.log('Existing private key length:', privateKey ? privateKey.length : 0);
      finalPrivateKey = privateKey;
    }

    console.log('Attempting register with:', { 
      fullName, 
      phone, 
      email, 
      password: '***', 
      role: selectedRole,
      privateKey: finalPrivateKey || 'NULL'
    });
    
    // Additional debugging for privateKey before sending
    console.log('Final privateKey details:');
    console.log('- Value:', finalPrivateKey);
    console.log('- Type:', typeof finalPrivateKey);
    console.log('- Length:', finalPrivateKey ? finalPrivateKey.length : 0);
    console.log('- Is empty?', !finalPrivateKey);
    console.log('- Is null?', finalPrivateKey === null);
    console.log('- Is undefined?', finalPrivateKey === undefined);
    
    const registerData = { 
      fullName, 
      phone, 
      email, 
      password, 
      privateKey: finalPrivateKey,
      role: selectedRole
    };
    
    console.log('Calling register with data:', {
      ...registerData,
      password: '***',
      privateKey: registerData.privateKey || 'NULL'
    });
    
    const success = await register(registerData);
    
    if (success) {
      // Lấy thông tin user từ API để có role chính xác
      const userData = await getUserDataByEmail(email);
      if (userData && userData.role) {
        // Tự động điều hướng dựa trên role
        if (userData.role === 'elderly') {
          navigation.dispatch(StackActions.replace('Elderly'));
        } else if (userData.role === 'relative') {
          navigation.dispatch(StackActions.replace('Relative'));
        } else {
          // Fallback về elderly nếu role không xác định
          navigation.dispatch(StackActions.replace('Elderly'));
        }
      } else {
        // Fallback dựa trên selectedRole nếu không lấy được user data từ API
        if (selectedRole === 'elderly') {
          navigation.dispatch(StackActions.replace('Elderly'));
        } else {
          navigation.dispatch(StackActions.replace('Relative'));
        }
      }
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#757575"
            />
            <TextInput
              style={styles.textInput}
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#757575"
            />
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#757575"
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor="#757575"
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

            {/* Private Key Section */}
            <View style={styles.uniqueCodeContainer}>
              <Text style={styles.uniqueCodeLabel}>Private Key (Mã định danh):</Text>
              <View style={styles.uniqueCodeInputContainer}>
                <TextInput
                  style={styles.uniqueCodeInput}
                  placeholder={isGeneratingKey ? "Đang tạo private key..." : "Private key sẽ được tạo tự động"}
                  value={privateKey}
                  onChangeText={setPrivateKey}
                  placeholderTextColor="#757575"
                  editable={false}
                />
                <View style={styles.keyActionButtons}>
                  <TouchableOpacity
                    style={[styles.copyButton, !privateKey && styles.buttonDisabled]}
                    onPress={copyPrivateKey}
                    disabled={!privateKey}
                  >
                    <Feather name="copy" size={16} color="#FFFFFF" />
                    <Text style={styles.copyButtonText}>Sao chép</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.generateButton, isGeneratingKey && styles.buttonDisabled]}
                    onPress={async () => {
                      if (!isGeneratingKey) {
                        setIsGeneratingKey(true);
                        startRotateAnimation();
                        try {
                          const key = await generatePrivateKey();
                          console.log('Manual generation result:', key);
                        } finally {
                          setIsGeneratingKey(false);
                          stopRotateAnimation();
                        }
                      }
                    }}
                    disabled={isGeneratingKey}
                  >
                    {isGeneratingKey ? (
                      <Animated.View
                        style={{
                          transform: [{
                            rotate: rotateAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg']
                            })
                          }]
                        }}
                      >
                        <Feather name="loader" size={16} color="#FFFFFF" />
                      </Animated.View>
                    ) : (
                      <Feather name="refresh-cw" size={16} color="#FFFFFF" />
                    )}
                    <Text style={styles.generateButtonText}>Tạo mới</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.uniqueCodeHint}>
                ⚠️ Mã này rất quan trọng! Hãy sao chép và lưu trữ an toàn. Bạn sẽ cần mã này để khôi phục tài khoản nếu quên mật khẩu.
              </Text>
            </View>
            
            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Chọn vai trò:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'elderly' && styles.roleButtonActive
                  ]}
                  onPress={() => setSelectedRole('elderly')}
                >
                  <Feather 
                    name="user" 
                    size={20} 
                    color={selectedRole === 'elderly' ? '#FFFFFF' : '#0D4C92'} 
                  />
                  <Text style={[
                    styles.roleButtonText,
                    selectedRole === 'elderly' && styles.roleButtonTextActive
                  ]}>
                    Người cao tuổi
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'relative' && styles.roleButtonActive
                  ]}
                  onPress={() => setSelectedRole('relative')}
                >
                  <Feather 
                    name="users" 
                    size={20} 
                    color={selectedRole === 'relative' ? '#FFFFFF' : '#0D4C92'} 
                  />
                  <Text style={[
                    styles.roleButtonText,
                    selectedRole === 'relative' && styles.roleButtonTextActive
                  ]}>
                    Người thân
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginText, styles.loginLink]}>
                  Đăng nhập
                </Text>
              </TouchableOpacity>
            </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 168,
    height: 168,
    resizeMode: 'contain',
  },
  formContainer: {
    width: width * 0.85,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#0D4C92',
    marginBottom: 30,
  },
  textInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333333',
    marginBottom: 20,
  },
  input: {
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: 50,
    justifyContent: 'center',
  },
  uniqueCodeContainer: {
    width: '100%',
    marginBottom: 20,
  },
  uniqueCodeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  uniqueCodeInputContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  keyActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  uniqueCodeInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333333',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28A745',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 5,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 5,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uniqueCodeHint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5,
    fontStyle: 'italic',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0D4C92',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#0D4C92',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  loginText: {
    fontSize: 14,
    color: '#757575',
  },
  loginLink: {
    color: '#0D4C92',
    fontWeight: 'bold',
  },
  roleContainer: {
    width: '100%',
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0D4C92',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: '#0D4C92',
    borderColor: '#0D4C92',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D4C92',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default RegisterScreen;