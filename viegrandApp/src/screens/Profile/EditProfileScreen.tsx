import React, { useState, useLayoutEffect, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserData, getUserData } from '../../services/api';
import Feather from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateCurrentUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [address, setAddress] = useState(user?.address || '');
  const [gender, setGender] = useState(user?.gender || '');
  
  // Health information states
  const [bloodType, setBloodType] = useState(user?.bloodType || '');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [chronicDiseases, setChronicDiseases] = useState(user?.chronicDiseases || '');
  
  // Additional health states
  const [hypertension, setHypertension] = useState(0);
  const [heartDisease, setHeartDisease] = useState(0);
  const [everMarried, setEverMarried] = useState('No');
  const [workType, setWorkType] = useState('Private');
  const [residenceType, setResidenceType] = useState('Urban');
  const [avgGlucoseLevel, setAvgGlucoseLevel] = useState('');
  const [bmi, setBmi] = useState('');
  const [height, setHeight] = useState(''); // cm
  const [weight, setWeight] = useState(''); // kg
  const [smokingStatus, setSmokingStatus] = useState('never smoked');
  const [stroke, setStroke] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);

  // Auto calculate BMI when height or weight changes
  const calculateBMI = (heightCm: string, weightKg: string) => {
    if (heightCm && weightKg) {
      const heightM = parseFloat(heightCm) / 100; // Convert cm to m
      const weightNum = parseFloat(weightKg);
      if (heightM > 0 && weightNum > 0) {
        const bmiValue = weightNum / (heightM * heightM);
        setBmi(bmiValue.toFixed(1));
      }
    } else {
      setBmi('');
    }
  };

  // Get BMI status based on value
  const getBMIStatus = (bmiValue: number) => {
    if (bmiValue < 18.5) return 'Thiếu cân';
    if (bmiValue < 25) return 'Bình thường';
    if (bmiValue < 30) return 'Thừa cân';
    return 'Béo phì';
  };
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load user data từ API
  const loadUserData = async () => {
    try {
      setIsLoadingData(true);
      
      // Lấy email từ cache
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (!userEmail) {
        console.log('No email found in cache');
        setIsLoadingData(false);
        return;
      }

      console.log('Loading user data for editing profile...');
      
      // Gọi API get user data
      const result = await getUserData(userEmail);
      
      if (result.success && result.user) {
        const userData = result.user;
        
        // Update all states với data từ API
        setFullName(userData.userName || '');
        setPhone(userData.phone || '');
        setAge(userData.age?.toString() || '');
        setAddress(userData.home_address || '');
        setGender(userData.gender || '');
        setBloodType(userData.blood || '');
        setAllergies(userData.allergies || '');
        setChronicDiseases(userData.chronic_diseases || '');
        
        // Update health states
        setHypertension(userData.hypertension || 0);
        setHeartDisease(userData.heart_disease || 0);
        setEverMarried(userData.ever_married || 'No');
        setWorkType(userData.work_type || 'Private');
        setResidenceType(userData.residence_type || 'Urban');
        setAvgGlucoseLevel(userData.avg_glucose_level?.toString() || '');
        setBmi(userData.bmi?.toString() || '');
        setHeight(userData.height?.toString() || '');
        setWeight(userData.weight?.toString() || '');
        setSmokingStatus(userData.smoking_status || 'never smoked');
        setStroke(userData.stroke || 0);
        
        console.log('User data loaded successfully for editing');
      } else {
        console.error('Failed to load user data:', result.message);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi tải thông tin');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load user data khi component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      // Lấy email từ cache
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (!userEmail) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin tài khoản');
        setIsLoading(false);
        return;
      }

      console.log('Updating user profile...');
      
      // Chuẩn bị data để update
      const updateData = {
        userName: fullName.trim(),
        phone: phone.trim() || null,
        age: Number(age) || null,
        home_address: address.trim() || null,
        gender: gender || null,
        blood: bloodType || null,
        allergies: allergies.trim() || null,
        chronic_diseases: chronicDiseases.trim() || null,
        // Health fields
        hypertension: hypertension,
        heart_disease: heartDisease,
        ever_married: everMarried,
        work_type: workType,
        residence_type: residenceType,
        avg_glucose_level: avgGlucoseLevel ? parseFloat(avgGlucoseLevel) : null,
        bmi: bmi ? parseFloat(bmi) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        smoking_status: smokingStatus,
        stroke: stroke,
      };

      // Gọi API update user data
      const updateResult = await updateUserData(userEmail, updateData);
      
      if (updateResult.success) {
        console.log('Profile updated successfully');
        
        // Refresh user data để lấy thông tin mới nhất
        const refreshResult = await getUserData(userEmail);
        
        if (refreshResult.success && refreshResult.user) {
          // Update context với data mới
          const updatedUser = {
            ...user!,
            fullName: refreshResult.user.userName,
            phone: refreshResult.user.phone,
            age: refreshResult.user.age,
            address: refreshResult.user.home_address,
            gender: refreshResult.user.gender,
            bloodType: refreshResult.user.blood,
            allergies: refreshResult.user.allergies,
            chronicDiseases: refreshResult.user.chronic_diseases,
          };
          updateCurrentUser(updatedUser);
          
          console.log('User context updated with fresh data');
        }
        
        Alert.alert('Thành công', 'Thông tin hồ sơ đã được cập nhật.');
        navigation.goBack();
      } else {
        console.error('Update failed:', updateResult.message);
        Alert.alert('Lỗi', updateResult.message || 'Không thể cập nhật thông tin');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const AgePicker = () => {
    const [showPicker, setShowPicker] = useState(false);
    
    // Tạo list tuổi từ 18 đến 100
    const ageList = Array.from({ length: 83 }, (_, i) => 18 + i);

    return (
      <View style={styles.agePickerContainer}>
        <TouchableOpacity
          style={[styles.ageButton, age && styles.ageButtonSelected]}
          onPress={() => {
            console.log('AgePicker button pressed, showPicker:', !showPicker);
            setShowPicker(!showPicker);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.ageButtonText, age && styles.ageButtonTextSelected]}>
            {age ? `${age} tuổi` : 'Chọn tuổi của bạn'}
          </Text>
          <Feather 
            name={showPicker ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={age ? '#0D4C92' : '#C7C7CC'} 
          />
        </TouchableOpacity>
        
        {showPicker && (
          <View style={styles.ageOptionsContainer}>
            <ScrollView 
              style={styles.ageScrollView} 
              contentContainerStyle={styles.ageScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={(contentWidth, contentHeight) => {
                console.log('📏 ScrollView content size:', contentHeight);
              }}
            >
              {ageList.map((ageValue, index) => (
                <TouchableOpacity
                  key={ageValue}
                  style={[
                    styles.ageListItem,
                    age === ageValue.toString() && styles.ageListItemSelected,
                    index === ageList.length - 1 && styles.ageListItemLast
                  ]}
                  onPress={() => {
                    console.log('Age selected:', ageValue);
                    setAge(ageValue.toString());
                    setShowPicker(false);
                  }}
                  activeOpacity={0.6}
                >
                  <View style={styles.ageListContent}>
                    <Text style={[
                      styles.ageListText,
                      age === ageValue.toString() && styles.ageListTextSelected
                    ]}>
                      {ageValue} tuổi
                    </Text>
                    {age === ageValue.toString() && (
                      <Feather name="check" size={18} color="#0D4C92" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const GenderSelector = () => (
    <View style={styles.genderContainer}>
      <TouchableOpacity 
        style={[styles.genderOption, gender === 'Nam' && styles.genderSelected]}
        onPress={() => setGender('Nam')}
        activeOpacity={0.7}
      >
        <Feather 
          name={gender === 'Nam' ? 'check-circle' : 'circle'} 
          size={20} 
          color={gender === 'Nam' ? '#0D4C92' : '#C7C7CC'} 
        />
        <Text style={[styles.genderText, gender === 'Nam' && styles.genderTextSelected]}>
          Nam
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.genderOption, gender === 'Nữ' && styles.genderSelected]}
        onPress={() => setGender('Nữ')}
        activeOpacity={0.7}
      >
        <Feather 
          name={gender === 'Nữ' ? 'check-circle' : 'circle'} 
          size={20} 
          color={gender === 'Nữ' ? '#0D4C92' : '#C7C7CC'} 
        />
        <Text style={[styles.genderText, gender === 'Nữ' && styles.genderTextSelected]}>
          Nữ
        </Text>
      </TouchableOpacity>
    </View>
  );

  const BooleanSelector = ({ value, setValue }: { value: number; setValue: (value: number) => void }) => (
    <View style={styles.genderContainer}>
      <TouchableOpacity 
        style={[styles.genderOption, value === 0 && styles.genderSelected]}
        onPress={() => setValue(0)}
        activeOpacity={0.7}
      >
        <Feather 
          name={value === 0 ? 'check-circle' : 'circle'} 
          size={20} 
          color={value === 0 ? '#0D4C92' : '#C7C7CC'} 
        />
        <Text style={[styles.genderText, value === 0 && styles.genderTextSelected]}>
          Không
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.genderOption, value === 1 && styles.genderSelected]}
        onPress={() => setValue(1)}
        activeOpacity={0.7}
      >
        <Feather 
          name={value === 1 ? 'check-circle' : 'circle'} 
          size={20} 
          color={value === 1 ? '#0D4C92' : '#C7C7CC'} 
        />
        <Text style={[styles.genderText, value === 1 && styles.genderTextSelected]}>
          Có
        </Text>
      </TouchableOpacity>
    </View>
  );

  const MarriageSelector = () => (
    <View style={styles.genderContainer}>
      <TouchableOpacity 
        style={[styles.genderOption, everMarried === 'No' && styles.genderSelected]}
        onPress={() => setEverMarried('No')}
        activeOpacity={0.7}
      >
        <Feather 
          name={everMarried === 'No' ? 'check-circle' : 'circle'} 
          size={20} 
          color={everMarried === 'No' ? '#0D4C92' : '#C7C7CC'} 
        />
        <Text style={[styles.genderText, everMarried === 'No' && styles.genderTextSelected]}>
          Chưa kết hôn
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.genderOption, everMarried === 'Yes' && styles.genderSelected]}
        onPress={() => setEverMarried('Yes')}
        activeOpacity={0.7}
      >
        <Feather 
          name={everMarried === 'Yes' ? 'check-circle' : 'circle'} 
          size={20} 
          color={everMarried === 'Yes' ? '#0D4C92' : '#C7C7CC'} 
        />
        <Text style={[styles.genderText, everMarried === 'Yes' && styles.genderTextSelected]}>
          Đã kết hôn
        </Text>
      </TouchableOpacity>
    </View>
  );

  const WorkTypeSelector = () => {
    const workTypes = [
      { value: 'Private', label: 'Tư nhân' },
      { value: 'Self-employed', label: 'Tự kinh doanh' },
      { value: 'Govt_job', label: 'Công chức' },
      { value: 'children', label: 'Trẻ em' },
      { value: 'Never_worked', label: 'Chưa làm việc' },
    ];

    return (
      <View style={styles.workTypeContainer}>
        {workTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[styles.workTypeOption, workType === type.value && styles.workTypeSelected]}
            onPress={() => setWorkType(type.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.workTypeText, workType === type.value && styles.workTypeTextSelected]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const ResidenceSelector = () => (
    <View style={styles.genderContainer}>
      <TouchableOpacity 
        style={[styles.genderOption, residenceType === 'Urban' && styles.genderSelected]}
        onPress={() => setResidenceType('Urban')}
        activeOpacity={0.7}
      >
        <Feather 
          name={residenceType === 'Urban' ? 'check-circle' : 'circle'} 
          size={20} 
          color={residenceType === 'Urban' ? '#0D4C92' : '#C7C7CC'} 
        />
        <Text style={[styles.genderText, residenceType === 'Urban' && styles.genderTextSelected]}>
          Thành thị
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.genderOption, residenceType === 'Rural' && styles.genderSelected]}
        onPress={() => setResidenceType('Rural')}
        activeOpacity={0.7}
      >
        <Feather 
          name={residenceType === 'Rural' ? 'check-circle' : 'circle'} 
          size={20} 
          color={residenceType === 'Rural' ? '#0D4C92' : '#C7C7CC'} 
        />
        <Text style={[styles.genderText, residenceType === 'Rural' && styles.genderTextSelected]}>
          Nông thôn
        </Text>
      </TouchableOpacity>
    </View>
  );

  const SmokingSelector = () => {
    const smokingOptions = [
      { value: 'never smoked', label: 'Không hút' },
      { value: 'formerly smoked', label: 'Từng hút' },
      { value: 'smokes', label: 'Đang hút' },
      { value: 'Unknown', label: 'Không rõ' },
    ];

    return (
      <View style={styles.workTypeContainer}>
        {smokingOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.workTypeOption, smokingStatus === option.value && styles.workTypeSelected]}
            onPress={() => setSmokingStatus(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.workTypeText, smokingStatus === option.value && styles.workTypeTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const BloodTypeSelector = () => {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    return (
      <View style={styles.bloodTypeContainer}>
        {bloodTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.bloodTypeOption, bloodType === type && styles.bloodTypeSelected]}
            onPress={() => setBloodType(type)}
            activeOpacity={0.7}
          >
            <Text style={[styles.bloodTypeText, bloodType === type && styles.bloodTypeTextSelected]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Thông tin cá nhân',
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
        paddingTop: 10, // Thêm padding top để cách thanh trạng thái
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        paddingTop: 5, // Thêm padding top cho title
      },
      headerShadowVisible: false,
    });
  }, [navigation, isLoading, fullName, phone, age, address, gender, bloodType, allergies, chronicDiseases]);

  // Show loading while fetching initial data
  if (isLoadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D4C92" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information */}
        <View style={styles.section}>
          {/* add padding top */}
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
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
            {/* <View style={styles.inputGroup}>
              <Text style={styles.label}>Tuổi</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Nhập tuổi của bạn"
                keyboardType="number-pad"
                placeholderTextColor="#C7C7CC"
              />
            </View> */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tuổi</Text>
            <AgePicker />
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
              <GenderSelector />
            </View>
          </View>
        </View>

        {/* Health Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin y tế</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nhóm máu</Text>
              <BloodTypeSelector />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dị ứng</Text>
              <TextInput
                style={styles.input}
                value={allergies}
                onChangeText={setAllergies}
                placeholder="Nhập các loại dị ứng (nếu có)"
                placeholderTextColor="#C7C7CC"
                multiline={true}
                numberOfLines={3}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bệnh mãn tính</Text>
              <TextInput
                style={styles.input}
                value={chronicDiseases}
                onChangeText={setChronicDiseases}
                placeholder="Nhập các bệnh mãn tính (nếu có)"
                placeholderTextColor="#C7C7CC"
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Additional Health Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin y tế bổ sung</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tăng huyết áp</Text>
              <BooleanSelector value={hypertension} setValue={setHypertension} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bệnh tim</Text>
              <BooleanSelector value={heartDisease} setValue={setHeartDisease} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tình trạng hôn nhân</Text>
              <MarriageSelector />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại công việc</Text>
              <WorkTypeSelector />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nơi cư trú</Text>
              <ResidenceSelector />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mức glucose trung bình (mg/dL)</Text>
              <TextInput
                style={styles.input}
                value={avgGlucoseLevel}
                onChangeText={setAvgGlucoseLevel}
                placeholder="Nhập mức glucose trung bình"
                keyboardType="decimal-pad"
                placeholderTextColor="#C7C7CC"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chiều cao (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={(value) => {
                  setHeight(value);
                  calculateBMI(value, weight);
                }}
                placeholder="Nhập chiều cao (cm)"
                keyboardType="decimal-pad"
                placeholderTextColor="#C7C7CC"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cân nặng (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={(value) => {
                  setWeight(value);
                  calculateBMI(height, value);
                }}
                placeholder="Nhập cân nặng (kg)"
                keyboardType="decimal-pad"
                placeholderTextColor="#C7C7CC"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chỉ số BMI (tự động tính)</Text>
              <View style={styles.bmiContainer}>
                <TextInput
                  style={[styles.input, styles.bmiInput]}
                  value={bmi}
                  editable={false}
                  placeholder="BMI sẽ được tính tự động"
                  placeholderTextColor="#C7C7CC"
                />
                {bmi && (
                  <Text style={styles.bmiStatus}>
                    {getBMIStatus(parseFloat(bmi))}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tình trạng hút thuốc</Text>
              <SmokingSelector />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Đột quỵ</Text>
              <BooleanSelector value={stroke} setValue={setStroke} />
            </View>
          </View>
        </View>
        
        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="check" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Cập nhật thông tin</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Feather name="x" size={20} color="#0D4C92" style={styles.buttonIcon} />
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6A6A6E',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Tăng padding để tránh bottom tab
    flexGrow: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    // marginTop: '10%',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    marginTop: '10%',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 12,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A202C',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlignVertical: 'top',
  },
  // Gender Selector Styles
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
  },
  genderSelected: {
    borderColor: '#0D4C92',
    backgroundColor: '#EBF4FF',
  },
  genderText: {
    fontSize: 16,
    color: '#718096',
    marginLeft: 8,
  },
  genderTextSelected: {
    color: '#0D4C92',
    fontWeight: '500',
  },
  // Blood Type Selector Styles
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodTypeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    minWidth: 50,
    alignItems: 'center',
  },
  bloodTypeSelected: {
    borderColor: '#0D4C92',
    backgroundColor: '#EBF4FF',
  },
  bloodTypeText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  bloodTypeTextSelected: {
    color: '#0D4C92',
    fontWeight: '600',
  },
  headerButton: {
    paddingHorizontal: 10,
  },
  headerButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0D4C92',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 30, // Tăng padding vertical
    paddingBottom: 50, // Thêm padding bottom riêng
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D4C92',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#0D4C92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0D4C92',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  // Age Picker Styles
  agePickerContainer: {
    marginTop: 4,
  },
  ageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    minHeight: 48,
  },
  ageButtonSelected: {
    borderColor: '#0D4C92',
    backgroundColor: '#EBF4FF',
  },
  ageButtonText: {
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  ageButtonTextSelected: {
    color: '#0D4C92',
    fontWeight: '600',
  },
  ageOptionsContainer: {
    marginTop: 8,
    height: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ageScrollView: {
    flex: 1,
  },
  ageScrollContent: {
    flexGrow: 1,
  },
  ageListItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
    backgroundColor: '#FFFFFF',
  },
  ageListItemSelected: {
    backgroundColor: '#EBF4FF',
    borderBottomColor: '#E3F2FD',
  },
  ageListItemLast: {
    borderBottomWidth: 0,
  },
  ageListContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageListText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  ageListTextSelected: {
    color: '#0D4C92',
    fontWeight: '600',
  },
  // Work Type and Smoking Selector Styles
  workTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  workTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    minWidth: 80,
    alignItems: 'center',
  },
  workTypeSelected: {
    borderColor: '#0D4C92',
    backgroundColor: '#EBF4FF',
  },
  workTypeText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  workTypeTextSelected: {
    color: '#0D4C92',
    fontWeight: '600',
  },
  // BMI Calculator Styles
  bmiContainer: {
    marginTop: 4,
  },
  bmiInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  bmiStatus: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EBF4FF',
    color: '#0D4C92',
  },
});

export default EditProfileScreen;

