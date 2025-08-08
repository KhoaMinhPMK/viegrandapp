import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../../../contexts/AuthContext';

const RelativeProfileScreen = ({ navigation }: any) => {
  const { logout } = useAuth();
  
  const profileItems = [
    { id: 1, title: 'Thông tin cá nhân', icon: 'user', action: 'edit' },
    { id: 2, title: 'Danh sách người cao tuổi', icon: 'user', action: 'elderly' },
    { id: 3, title: 'Liên hệ khẩn cấp', icon: 'phone', action: 'emergency' },
    { id: 4, title: 'Lịch sử theo dõi', icon: 'file', action: 'history' },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không? Tất cả dữ liệu sẽ bị xóa.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('🔄 User confirmed logout from profile');
              
              // Thực hiện logout
              await logout();
              
              // Navigate về root level và chọn Auth route với Login screen
              navigation.reset({
                index: 0,
                routes: [{ 
                  name: 'Auth',
                  params: {
                    screen: 'Login'
                  }
                }],
              });
              
              console.log('✅ Logout completed and navigated to Login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
            }
          }
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/background.png')}
      style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#0D4C92" />
          </TouchableOpacity>
          <Text style={styles.title}>Hồ sơ người thân</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Feather name="users" size={60} color="#0D4C92" />
            </View>
            <Text style={styles.name}>Nguyễn Thị B</Text>
            <Text style={styles.role}>Người thân chăm sóc</Text>
          </View>

          <View style={styles.profileSection}>
            {profileItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.profileItem}>
                <Feather name={item.icon as any} size={24} color="#0D4C92" />
                <Text style={styles.profileItemText}>{item.title}</Text>
                <Feather name="chevron-right" size={20} color="#757575" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={24} color="#FF6B6B" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D4C92',
    marginLeft: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D4C92',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#757575',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 15,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default RelativeProfileScreen;
