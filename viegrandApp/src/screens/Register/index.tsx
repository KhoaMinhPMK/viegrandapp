import React, { useState } from 'react';
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
import { StackActions } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'elderly' | 'relative'>('elderly');
  const { register, isLoading, getUserDataByEmail } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !phone || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
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

    console.log('Attempting register with:', { fullName, phone, email, password: '***', role: selectedRole });
    const success = await register({ fullName, phone, email, password, role: selectedRole });
    if (success) {
      // Lấy thông tin user từ API để có role chính xác
      const userData = await getUserDataByEmail(email);
      if (userData) {
        // Tự động điều hướng dựa trên role
        if (userData.role === 'elderly') {
          navigation.dispatch(StackActions.replace('Elderly'));
        } else if (userData.role === 'relative') {
          navigation.dispatch(StackActions.replace('Relative'));
        } else {
          // Fallback về SelectRole nếu role không xác định
          navigation.dispatch(StackActions.replace('SelectRole'));
        }
      } else {
        // Fallback về SelectRole nếu không lấy được user data
        navigation.dispatch(StackActions.replace('SelectRole'));
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