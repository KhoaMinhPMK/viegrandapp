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
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { StackActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleRegister = () => {
    if (!fullName || !phone || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    // Logic đăng ký ở đây
    // Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
    navigation.dispatch(StackActions.replace('SelectRole'));
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
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Đăng ký</Text>
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
});

export default RegisterScreen; 