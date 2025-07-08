import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SettingsContainer } from '../../../components/settings/SettingsContainer';
import { SettingsSection } from '../../../components/settings/SettingsSection';
import { SettingsRow } from '../../../components/settings/SettingsRow';
import { useAuth } from '../../../contexts/AuthContext';
import { useSettings } from '../../../contexts/SettingsContext';

const RelativeSettingsScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { settings, updateSettings, isLoading } = useSettings();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
      ],
      { cancelable: true }
    );
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cài đặt</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D4C92" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cài đặt</Text>
        {isLoading && <ActivityIndicator style={styles.headerLoader} color="#0D4C92" />}
      </View>
      <SettingsContainer>
        {/* Profile Section */}
        <SettingsSection>
          <SettingsRow
            type="navigation"
            icon="user"
            iconBackgroundColor="#1E90FF"
            title={user?.name || 'Người dùng'}
            value={user?.email}
            onPress={() => navigation.navigate('EditProfile')}
            isLast
          />
        </SettingsSection>

        {/* Notification Section */}
        <SettingsSection title="Thông báo & Cảnh báo">
          <SettingsRow
            type="toggle"
            icon="bell"
            iconBackgroundColor="#FF4500"
            title="Thông báo ứng dụng"
            value={settings.relative_appNotificationsEnabled}
            onValueChange={(value) => updateSettings({ relative_appNotificationsEnabled: value })}
          />
          <SettingsRow
            type="toggle"
            icon="mail"
            iconBackgroundColor="#007BFF"
            title="Cảnh báo qua Email"
            value={settings.relative_emailAlertsEnabled}
            onValueChange={(value) => updateSettings({ relative_emailAlertsEnabled: value })}
          />
          <SettingsRow
            type="toggle"
            icon="message-circle"
            iconBackgroundColor="#32CD32"
            title="Cảnh báo qua SMS"
            value={settings.relative_smsAlertsEnabled}
            onValueChange={(value) => updateSettings({ relative_smsAlertsEnabled: value })}
            isLast
          />
        </SettingsSection>

        {/* General Section */}
        <SettingsSection title="Chung">
          <SettingsRow
            type="navigation"
            icon="globe"
            iconBackgroundColor="#4682B4"
            title="Ngôn ngữ"
            value={settings.language === 'vi' ? 'Tiếng Việt' : 'English'}
            onPress={() => Alert.alert('Tính năng đang phát triển')}
          />
          <SettingsRow
            type="navigation"
            icon="shield"
            iconBackgroundColor="#6A5ACD"
            title="Bảo mật"
            onPress={() => Alert.alert('Tính năng đang phát triển')}
          />
          <SettingsRow
            type="navigation"
            icon="info"
            iconBackgroundColor="#708090"
            title="Về ứng dụng"
            onPress={() => Alert.alert('Tính năng đang phát triển')}
            isLast
          />
        </SettingsSection>

        {/* Premium Section */}
        <SettingsSection title="Premium">
            <SettingsRow
              type="navigation"
              icon="star"
              iconBackgroundColor="#FFD700"
              title="Nâng cấp Premium"
              value="Xem chi tiết gói"
              onPress={() => navigation.navigate('Premium')}
              isLast
            />
        </SettingsSection>

        {/* Logout Section */}
        <SettingsSection>
          <SettingsRow
            type="button"
            title="Đăng xuất"
            titleColor="#FF3B30"
            onPress={handleLogout}
            isLast
          />
        </SettingsSection>
      </SettingsContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C7C7CC',
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerLoader: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RelativeSettingsScreen;
