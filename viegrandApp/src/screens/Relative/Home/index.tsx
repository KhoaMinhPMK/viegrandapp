import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const RelativeHomeScreen = ({ navigation }: any) => {
  const menuItems = [
    { id: 1, title: 'Theo dõi', icon: 'eye', color: '#FF6B6B' },
    { id: 2, title: 'Báo cáo', icon: 'bar-chart-2', color: '#4ECDC4' },
    { id: 3, title: 'Thuốc', icon: 'plus-circle', color: '#45B7D1' },
    { id: 4, title: 'Liên hệ', icon: 'phone', color: '#96CEB4' },
    { id: 5, title: 'Cài đặt', icon: 'settings', color: '#FFEAA7' },
    { id: 6, title: 'Thông báo', icon: 'bell', color: '#DDA0DD' },
  ];

  const elderlyMembers = [
    { id: 1, name: 'Ông Nguyễn Văn A', status: 'Bình thường', lastUpdate: '2 giờ trước' },
    { id: 2, name: 'Bà Trần Thị B', status: 'Cần chú ý', lastUpdate: '1 giờ trước' },
  ];

  const handleMenuPress = (item: any) => {
    switch (item.id) {
      case 5:
        navigation.navigate('RelativeSettings');
        break;
      default:
        // Handle other menu items
        break;
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/background.png')}
      style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Chăm sóc gia đình</Text>
          <Text style={styles.subtitle}>Theo dõi sức khỏe người thân</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('RelativeProfile')}>
            <Feather name="user" size={24} color="#0D4C92" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.elderlyList}>
            <Text style={styles.sectionTitle}>Danh sách người cao tuổi</Text>
            {elderlyMembers.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={[
                    styles.memberStatus,
                    { color: member.status === 'Bình thường' ? '#4ECDC4' : '#FF6B6B' }
                  ]}>
                    {member.status}
                  </Text>
                  <Text style={styles.lastUpdate}>Cập nhật: {member.lastUpdate}</Text>
                </View>
                <TouchableOpacity style={styles.viewButton}>
                  <Feather name="chevron-right" size={20} color="#0D4C92" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            <View style={styles.menuGrid}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, { backgroundColor: item.color }]}
                  onPress={() => handleMenuPress(item)}>
                  <Feather name={item.icon as any} size={30} color="#FFFFFF" />
                  <Text style={styles.menuText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.notifications}>
            <Text style={styles.sectionTitle}>Thông báo gần đây</Text>
            <View style={styles.notificationCard}>
              <View style={styles.notificationItem}>
                <Feather name="alert-circle" size={20} color="#FF6B6B" />
                <Text style={styles.notificationText}>
                  Bà Trần Thị B chưa uống thuốc huyết áp buổi sáng
                </Text>
              </View>
              <View style={styles.notificationItem}>
                <Feather name="check-circle" size={20} color="#4ECDC4" />
                <Text style={styles.notificationText}>
                  Ông Nguyễn Văn A đã hoàn thành bài tập thể dục
                </Text>
              </View>
            </View>
          </View>
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
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    position: 'relative',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D4C92',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 5,
    textAlign: 'center',
  },
  profileButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  elderlyList: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D4C92',
    marginBottom: 15,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  memberStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  viewButton: {
    padding: 10,
  },
  quickActions: {
    marginBottom: 30,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 60) / 2,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  notifications: {
    marginBottom: 30,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 10,
    flex: 1,
  },
});

export default RelativeHomeScreen;
