import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Switch,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ElderlySettingsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [vibrationEnabled, setVibrationEnabled] = React.useState(false);

  const settingsItems = [
    { id: 1, title: 'Ngôn ngữ', icon: 'globe', value: 'Tiếng Việt', type: 'navigation' },
    { id: 2, title: 'Chế độ tối', icon: 'moon', value: 'Tắt', type: 'navigation' },
    { id: 3, title: 'Kích thước chữ', icon: 'type', value: 'Vừa', type: 'navigation' },
    { id: 4, title: 'Bảo mật', icon: 'shield', value: '', type: 'navigation' },
    { id: 5, title: 'Về ứng dụng', icon: 'info', value: '', type: 'navigation' },
  ];

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
          <Text style={styles.title}>Cài đặt</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông báo</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <Feather name="bell" size={24} color="#0D4C92" />
                <Text style={styles.settingText}>Thông báo</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#767577', true: '#0D4C92' }}
                  thumbColor={notifications ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
              <View style={styles.settingItem}>
                <Feather name="volume-2" size={24} color="#0D4C92" />
                <Text style={styles.settingText}>Âm thanh</Text>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: '#767577', true: '#0D4C92' }}
                  thumbColor={soundEnabled ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
              <View style={styles.settingItem}>
                <Feather name="smartphone" size={24} color="#0D4C92" />
                <Text style={styles.settingText}>Rung</Text>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{ false: '#767577', true: '#0D4C92' }}
                  thumbColor={vibrationEnabled ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chung</Text>
            <View style={styles.settingsCard}>
              {settingsItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.settingItem}>
                  <Feather name={item.icon as any} size={24} color="#0D4C92" />
                  <Text style={styles.settingText}>{item.title}</Text>
                  <View style={styles.settingValue}>
                    {item.value && (
                      <Text style={styles.valueText}>{item.value}</Text>
                    )}
                    <Feather name="chevron-right" size={20} color="#757575" />
                  </View>
                </TouchableOpacity>
              ))}
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D4C92',
    marginBottom: 15,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 15,
    flex: 1,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: '#757575',
    marginRight: 10,
  },
});

export default ElderlySettingsScreen;
