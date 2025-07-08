import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';
import Feather from 'react-native-vector-icons/Feather';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateCurrentUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [address, setAddress] = useState(user?.address || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const updatedUser = await usersAPI.updateMyProfile({ 
        fullName, 
        phone,
        age: Number(age) || undefined,
        address,
        gender,
      });
      updateCurrentUser(updatedUser);
      Alert.alert('Thành công', 'Thông tin hồ sơ đã được cập nhật.');
      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Chỉnh sửa Hồ sơ',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Feather name="x" size={24} color="#0D4C92" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#0D4C92" />
          ) : (
            <Text style={styles.headerButtonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#F7F7F7',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerShadowVisible: false,
    });
  }, [navigation, isLoading, fullName, phone, age, address, gender]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ và tên của bạn"
            placeholderTextColor="#C7C7CC"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại của bạn"
            keyboardType="phone-pad"
            placeholderTextColor="#C7C7CC"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tuổi</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Nhập tuổi của bạn"
            keyboardType="number-pad"
            placeholderTextColor="#C7C7CC"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Nhập địa chỉ của bạn"
            placeholderTextColor="#C7C7CC"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giới tính</Text>
          <TextInput
            style={styles.input}
            value={gender}
            onChangeText={setGender}
            placeholder="Nhập giới tính của bạn"
            placeholderTextColor="#C7C7CC"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  form: {
    marginTop: 30,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  inputGroup: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C7C7CC',
  },
  label: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: '#333333',
    paddingVertical: 4,
  },
  headerButton: {
    paddingHorizontal: 10,
  },
  headerButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0D4C92',
  },
});

export default EditProfileScreen;
