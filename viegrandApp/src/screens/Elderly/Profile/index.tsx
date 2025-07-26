import React, { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserData } from '../../../services/api';
// import { SettingsContainer } from '../../../components/settings/SettingsContainer';
// import { SettingsSection } from '../../../components/settings/SettingsSection';
// import { SettingsRow } from '../../../components/settings/SettingsRow';

// A simple utility to format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Không rõ';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

// Helper functions to format health data labels
const getWorkTypeLabel = (workType: string | undefined) => {
  const workTypeMap: { [key: string]: string } = {
    'Private': 'Tư nhân',
    'Self-employed': 'Tự kinh doanh',
    'Govt_job': 'Công chức',
    'children': 'Trẻ em',
    'Never_worked': 'Chưa làm việc',
  };
  return workType ? workTypeMap[workType] || workType : undefined;
};

const getSmokingStatusLabel = (smokingStatus: string | undefined) => {
  const smokingMap: { [key: string]: string } = {
    'never smoked': 'Không hút',
    'formerly smoked': 'Từng hút',
    'smokes': 'Đang hút',
    'Unknown': 'Không rõ',
  };
  return smokingStatus ? smokingMap[smokingStatus] || smokingStatus : undefined;
};

const ProfileInfoRow = ({ 
  label, 
  value, 
  onPress,
  showChevron = false 
}: { 
  label: string; 
  value: string | undefined;
  onPress?: () => void;
  showChevron?: boolean;
}) => (
  <TouchableOpacity 
    style={[styles.infoRow, onPress && styles.pressableRow]} 
    onPress={onPress}
    activeOpacity={onPress ? 0.6 : 1}
  >
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Chưa cập nhật'}</Text>
    </View>
    {showChevron && (
      <Feather name="chevron-right" size={20} color="#C7C7CC" />
    )}
  </TouchableOpacity>
);


const ElderlyProfileScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data từ API
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Lấy email từ cache
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (!userEmail) {
        console.log('No email found in cache for profile');
        setIsLoading(false);
        return;
      }

      console.log('📱 ElderlyProfile: Fetching user data...');
      
      // Gọi API get user data
      const result = await getUserData(userEmail);
      
      if (result.success && result.user) {
        setUserData(result.user);
        console.log('✅ ElderlyProfile: User data loaded successfully');
        console.log('🔍 ElderlyProfile: chronic_diseases =', result.user.chronic_diseases);
        console.log('🔍 ElderlyProfile: allergies =', result.user.allergies);
        console.log('🔍 ElderlyProfile: blood =', result.user.blood);
      } else {
        console.error('❌ ElderlyProfile: Failed to load user data:', result.message);
      }
    } catch (error) {
      console.error('💥 ElderlyProfile: Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user data khi component mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Refresh khi focus vào màn hình (sau khi edit profile)
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Hồ sơ cá nhân',
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A202C',
      },
      headerStyle: {
        backgroundColor: '#FFFFFF',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E2E8F0',
      },
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('EditProfile')} 
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Thay đổi ảnh đại diện',
      'Chọn nguồn ảnh',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Thư viện', onPress: () => console.log('Open gallery') },
        { text: 'Camera', onPress: () => console.log('Open camera') },
      ]
    );
  };

  const handleUpdateInfo = (field: string) => {
    Alert.alert(
      'Cập nhật thông tin',
      `Bạn muốn cập nhật ${field}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Cập nhật', onPress: () => navigation.navigate('EditProfile', { field }) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        contentInsetAdjustmentBehavior="automatic"
        scrollEventThrottle={16}
        decelerationRate="normal"
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleChangeAvatar}
            activeOpacity={0.8}
          >
            <Feather name="user" size={60} color="#0D4C92" />
            <View style={styles.cameraOverlay}>
              <Feather name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{userData?.userName || user?.fullName || 'Chưa cập nhật tên'}</Text>
          <Text style={styles.email}>{userData?.email || user?.email}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Feather name="edit-2" size={18} color="#0D4C92" />
            <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D4C92" />
            <Text style={styles.loadingText}>Đang tải thông tin...</Text>
          </View>
        ) : (
          <>
            {/* Main Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
              <View style={styles.card}>
                <ProfileInfoRow 
                  label="Số điện thoại" 
                  value={userData?.phone} 
                  onPress={() => handleUpdateInfo('số điện thoại')}
                  showChevron={true}
                />
                <View style={styles.divider} />
                <ProfileInfoRow 
                  label="Số điện thoại người thân" 
                  value={userData?.relative_phone} 
                  onPress={() => handleUpdateInfo('số điện thoại người thân')}
                  showChevron={true}
                />
                <View style={styles.divider} />
                <ProfileInfoRow 
                  label="Tuổi" 
                  value={userData?.age?.toString()} 
                  onPress={() => handleUpdateInfo('tuổi')}
                  showChevron={true}
                />
                <View style={styles.divider} />
                <ProfileInfoRow 
                  label="Giới tính" 
                  value={userData?.gender} 
                  onPress={() => handleUpdateInfo('giới tính')}
                  showChevron={true}
                />
                <View style={styles.divider} />
                <ProfileInfoRow 
                  label="Địa chỉ" 
                  value={userData?.home_address} 
                  onPress={() => handleUpdateInfo('địa chỉ')}
                  showChevron={true}
                />
              </View>
            </View>

            {/* Account Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
              <View style={styles.card}>
                <ProfileInfoRow label="Vai trò" value={user?.role} />
                <View style={styles.divider} />
                <ProfileInfoRow 
                  label="Trạng thái" 
                  value={user?.active ? 'Đang hoạt động' : 'Bị khóa'} 
                />
              </View>
            </View>
            
            {/* Health Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin y tế</Text>
              <View style={styles.card}>
                <ProfileInfoRow 
                  label="Nhóm máu" 
                  value={userData?.blood} 
                  onPress={() => handleUpdateInfo('nhóm máu')}
                  showChevron={true}
                />
                <View style={styles.divider} />
                <ProfileInfoRow 
                  label="Dị ứng" 
                  value={userData?.allergies} 
              onPress={() => handleUpdateInfo('dị ứng')}
              showChevron={true}
            />
            <View style={styles.divider} />
            <ProfileInfoRow 
              label="Bệnh mãn tính" 
              value={userData?.chronic_diseases} 
              onPress={() => handleUpdateInfo('bệnh mãn tính')}
              showChevron={true}
            />
            <View style={styles.divider} />
            <ProfileInfoRow 
              label="Tăng huyết áp" 
              value={userData?.hypertension ? 'Có' : 'Không'} 
              onPress={() => handleUpdateInfo('tăng huyết áp')}
              showChevron={true}
            />
            <View style={styles.divider} />
            <ProfileInfoRow 
              label="Bệnh tim" 
              value={userData?.heart_disease ? 'Có' : 'Không'} 
              onPress={() => handleUpdateInfo('bệnh tim')}
              showChevron={true}
            />
            <View style={styles.divider} />
            <ProfileInfoRow 
              label="Đột quỵ" 
              value={userData?.stroke ? 'Có' : 'Không'} 
              onPress={() => handleUpdateInfo('đột quỵ')}
              showChevron={true}
            />
          </View>
        </View>

        {/* Additional Health Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
          <View style={styles.card}>
            <ProfileInfoRow 
              label="Tình trạng hôn nhân" 
              value={userData?.ever_married === 'Yes' ? 'Đã kết hôn' : 'Chưa kết hôn'} 
              onPress={() => handleUpdateInfo('tình trạng hôn nhân')}
              showChevron={true}
            />
            <View style={styles.divider} />
            <ProfileInfoRow 
              label="Loại công việc" 
              value={getWorkTypeLabel(userData?.work_type)} 
              onPress={() => handleUpdateInfo('loại công việc')}
              showChevron={true}
            />
            <View style={styles.divider} />
            <ProfileInfoRow 
              label="Nơi cư trú" 
              value={userData?.residence_type === 'Urban' ? 'Thành thị' : 'Nông thôn'} 
              onPress={() => handleUpdateInfo('nơi cư trú')}
              showChevron={true}
            />
            <View style={styles.divider} />
            <ProfileInfoRow 
              label="Mức glucose trung bình" 
              value={userData?.avg_glucose_level ? `${userData.avg_glucose_level} mg/dL` : undefined} 
              onPress={() => handleUpdateInfo('mức glucose')}
              showChevron={true}
            />
            <View style={styles.divider} />
            <ProfileInfoRow 
              label="Chỉ số BMI" 
              value={userData?.bmi ? `${userData.bmi}` : undefined} 
              onPress={() => handleUpdateInfo('BMI')}
              showChevron={true}
            />
            <View style={styles.divider} />
            <ProfileInfoRow 
              label="Tình trạng hút thuốc" 
              value={getSmokingStatusLabel(userData?.smoking_status)} 
              onPress={() => handleUpdateInfo('tình trạng hút thuốc')}
              showChevron={true}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Tính năng đang phát triển')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <Feather name="download" size={20} color="#0D4C92" />
            </View>
            <Text style={styles.actionText}>Xuất dữ liệu</Text>
            <Feather name="chevron-right" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Tính năng đang phát triển')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <Feather name="shield" size={20} color="#0D4C92" />
            </View>
            <Text style={styles.actionText}>Bảo mật & Quyền riêng tư</Text>
            <Feather name="chevron-right" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

            <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 0, // Bỏ padding top để tận dụng tối đa không gian
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
    paddingTop: 100, // Tăng padding top để tránh header
    paddingBottom: 200, // Tăng thêm để tránh bottom tab hoàn toàn
    flexGrow: 1,
  },
  container: {
    backgroundColor: '#F8F9FA',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    marginTop: 10, // Giảm margin top
    borderRadius: 12,
    marginHorizontal: 16, // Thêm margin horizontal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0D4C92',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#EBF4FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D4C92',
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    paddingTop: 10,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  pressableRow: {
    backgroundColor: 'rgba(13, 76, 146, 0.02)',
  },
  infoContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1A202C',
    flex: 1,
  },
  infoValue: {
    fontSize: 17,
    color: '#718096',
    flex: 1,
    textAlign: 'right',
    marginRight: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginLeft: 16,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: '#1A202C',
  },
  headerButton: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0D4C92',
  },
  bottomSpacing: {
    height: 100, // Tăng đáng kể để đảm bảo cuộn được hết
  },
});

export default ElderlyProfileScreen;
