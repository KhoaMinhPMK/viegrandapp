import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

const AboutAppScreen: React.FC = () => {
  const navigation = useNavigation();

  const appInfo = {
    name: process.env.VIEGRAND_APP_NAME,
    version: '1.0.0',
    build: '1',
    description: 'Ứng dụng chăm sóc sức khỏe và kết nối gia đình cho người cao tuổi',
    developer: 'VieGrand Team',
    website: 'https://viegrand.com',
    email: 'support@viegrand.com',
    phone: '+84 123 456 789',
  };

  const handleContact = (type: 'email' | 'phone' | 'website') => {
    switch (type) {
      case 'email':
        Linking.openURL(`mailto:${appInfo.email}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${appInfo.phone}`);
        break;
      case 'website':
        Linking.openURL(appInfo.website);
        break;
    }
  };

  const handleShareApp = () => {
    const shareMessage = `Hãy thử ${appInfo.name} - Ứng dụng chăm sóc sức khỏe và kết nối gia đình cho người cao tuổi!\n\nTải về tại: ${appInfo.website}`;
    
    if (Platform.OS === 'ios') {
      // For iOS, you might want to use a share library
      Alert.alert('Chia sẻ ứng dụng', shareMessage);
    } else {
      // For Android
      Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareMessage)}`);
    }
  };

  const handleRateApp = () => {
    // This would typically open the app store
    Alert.alert('Đánh giá ứng dụng', 'Cảm ơn bạn đã sử dụng VieGrand App!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Về ứng dụng</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo and Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appLogo}>
            <Feather name="heart" size={60} color="#007AFF" />
          </View>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>Phiên bản {appInfo.version} ({appInfo.build})</Text>
          <Text style={styles.appDescription}>{appInfo.description}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShareApp}>
            <Feather name="share-2" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Chia sẻ ứng dụng</Text>
            <Feather name="chevron-right" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleRateApp}>
            <Feather name="star" size={20} color="#FFD700" />
            <Text style={styles.actionButtonText}>Đánh giá ứng dụng</Text>
            <Feather name="chevron-right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={() => handleContact('email')}>
            <View style={styles.contactIcon}>
              <Feather name="mail" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email hỗ trợ</Text>
              <Text style={styles.contactValue}>{appInfo.email}</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={() => handleContact('phone')}>
            <View style={[styles.contactIcon, { backgroundColor: '#34C759' }]}>
              <Feather name="phone" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Điện thoại hỗ trợ</Text>
              <Text style={styles.contactValue}>{appInfo.phone}</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={() => handleContact('website')}>
            <View style={[styles.contactIcon, { backgroundColor: '#5856D6' }]}>
              <Feather name="globe" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>{appInfo.website}</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* App Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết ứng dụng</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Nhà phát triển</Text>
            <Text style={styles.detailValue}>{appInfo.developer}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Phiên bản</Text>
            <Text style={styles.detailValue}>{appInfo.version}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Build</Text>
            <Text style={styles.detailValue}>{appInfo.build}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Hệ điều hành</Text>
            <Text style={styles.detailValue}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
          </View>
        </View>

        {/* Legal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin pháp lý</Text>
          
          <TouchableOpacity style={styles.legalItem} onPress={() => (navigation as any).navigate('TermsOfService')}>
            <Feather name="file-text" size={20} color="#007AFF" />
            <Text style={styles.legalText}>Điều khoản dịch vụ</Text>
            <Feather name="chevron-right" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem} onPress={() => (navigation as any).navigate('PrivacyPolicy')}>
            <Feather name="shield" size={20} color="#007AFF" />
            <Text style={styles.legalText}>Chính sách bảo mật</Text>
            <Feather name="chevron-right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 {appInfo.developer}. Tất cả quyền được bảo lưu.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  appLogo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#000000',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666666',
  },
  detailValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  legalText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default AboutAppScreen; 