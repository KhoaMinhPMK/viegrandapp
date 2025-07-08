import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../../../contexts/AuthContext';
import { SettingsContainer } from '../../../components/settings/SettingsContainer';
import { SettingsSection } from '../../../components/settings/SettingsSection';
import { SettingsRow } from '../../../components/settings/SettingsRow';

// A simple utility to format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Không rõ';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const ProfileInfoRow = ({ label, value }: { label: string; value: string | undefined }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'Chưa cập nhật'}</Text>
  </View>
);


const ElderlyProfileScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Hồ sơ cá nhân',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={{ marginRight: 16 }}>
          <Text style={styles.headerButtonText}>Sửa</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  return (
    <SafeAreaView style={styles.safeArea}>
      <SettingsContainer style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {/* Later we can use an Image here */}
            <Feather name="user" size={60} color="#0D4C92" />
          </View>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <SettingsSection title="Thông tin chi tiết">
          <ProfileInfoRow label="Số điện thoại" value={user?.phone} />
          <ProfileInfoRow label="Tuổi" value={user?.age?.toString()} />
          <ProfileInfoRow label="Giới tính" value={user?.gender} />
          <ProfileInfoRow label="Địa chỉ" value={user?.address} />
          <ProfileInfoRow label="Vai trò" value={user?.role} />
          <ProfileInfoRow label="Trạng thái" value={user?.active ? 'Đang hoạt động' : 'Bị khóa'} />
        </SettingsSection>
        
        <SettingsSection title="Thông tin y tế (Sắp có)">
          <ProfileInfoRow label="Nhóm máu" value="Chưa cập nhật" />
          <ProfileInfoRow label="Dị ứng" value="Chưa cập nhật" />
        </SettingsSection>

      </SettingsContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  container: {
    backgroundColor: '#F0F0F0',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  email: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C7C7CC',
  },
  infoLabel: {
    fontSize: 17,
    color: '#000000',
  },
  infoValue: {
    fontSize: 17,
    color: '#8E8E93',
  },
  headerButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0D4C92',
  },
});

export default ElderlyProfileScreen;
