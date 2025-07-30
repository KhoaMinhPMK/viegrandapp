import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReminders, updateReminderStatus, Reminder } from '../../../services/api';
import ReminderItem from './ReminderItem';
import ReminderStatus from './ReminderStatus';

const RemindersScreen = () => {
  const navigation = useNavigation<any>();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  // Load user email from storage
  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error loading user email:', error);
      }
    };
    loadUserEmail();
  }, []);

  // Load reminders from API
  useEffect(() => {
    const loadReminders = async () => {
      if (!userEmail) return;
      
      setLoading(true);
      try {
        const result = await getReminders(userEmail);
        if (result.success && result.data) {
          setReminders(result.data);
        } else {
          console.error('Failed to load reminders:', result.message);
          Alert.alert('Lỗi', 'Không thể tải nhắc nhở: ' + result.message);
        }
      } catch (error) {
        console.error('Error loading reminders:', error);
        Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, [userEmail]);

  const handleMarkCompleted = async (id: string) => {
    if (!userEmail) return;

    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;

      const newStatus = reminder.isCompleted ? 'pending' : 'completed';
      const result = await updateReminderStatus(id, newStatus, userEmail);
      
      if (result.success) {
        // Update local state
        setReminders(prev =>
          prev.map(reminder =>
            reminder.id === id
              ? { ...reminder, isCompleted: !reminder.isCompleted }
              : reminder
          )
        );
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating reminder status:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    }
  };

  const getRemindersByDate = () => {
    const today = reminders.filter(r => r.date === 'Hôm nay' && !r.isCompleted);
    const tomorrow = reminders.filter(r => r.date === 'Ngày mai' && !r.isCompleted);
    const completed = reminders.filter(r => r.isCompleted);

    return { today, tomorrow, completed };
  };

  const { today, tomorrow, completed } = getRemindersByDate();

  const renderSection = (title: string, data: any[], color: string) => {
    if (data.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={[styles.sectionBadge, { backgroundColor: color }]}>
            <Text style={styles.sectionCount}>{data.length}</Text>
          </View>
        </View>
        <View style={styles.sectionContent}>
          {data.map(item => (
            <ReminderItem
              key={item.id}
              reminder={item}
              onMarkCompleted={handleMarkCompleted}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#0D4C92" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhắc nhở</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Status Summary */}
      <ReminderStatus
        todayCount={today.length}
        tomorrowCount={tomorrow.length}
        completedCount={completed.length}
      />

      {/* Reminders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải nhắc nhở...</Text>
        </View>
      ) : (
        <FlatList
          data={[]} // Empty data, we render sections manually
          renderItem={() => null}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.listContent}>
              {renderSection('Hôm nay', today, '#0D4C92')}
              {renderSection('Ngày mai', tomorrow, '#1E88E5')}
              {renderSection('Đã hoàn thành', completed, '#42A5F5')}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    width: 44,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  sectionBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default RemindersScreen; 