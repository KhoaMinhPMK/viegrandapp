import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const ResetPasswordScreen = ({ navigation }: any) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp.');
      return;
    }
    // Logic đặt lại mật khẩu ở đây
    Alert.alert('Thành công', 'Mật khẩu của bạn đã được đặt lại.');
    navigation.navigate('Login');
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
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
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
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isConfirmPasswordVisible}
                placeholderTextColor="#757575"
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

            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
            </TouchableOpacity>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResetPasswordScreen; 