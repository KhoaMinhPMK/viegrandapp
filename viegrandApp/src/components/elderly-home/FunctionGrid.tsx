import React, { useCallback, memo } from 'react';
import { View, StyleSheet, FlatList, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FunctionButton from './FunctionButton';
import EmergencyCallButton from './EmergencyCallButton';
import emergencyCallService from '../../services/emergencyCall';

interface FunctionItem {
  id: string;
  icon?: string;
  text?: string;
  action?: () => void;
  isPlus?: boolean;
}

const FunctionGrid = memo(() => {
  const navigation = useNavigation<any>();

  // Define data for the grid
  const functions: FunctionItem[] = [
    { id: 'health', icon: 'heart', text: 'Sức khỏe', action: () => navigation.navigate('HealthCheck') },
    { id: 'entertainment', icon: 'play', text: 'Giải trí', action: () => navigation.navigate('EntertainmentHub') },
    { id: 'appointments', icon: 'clock', text: 'Nhắc nhở', action: () => navigation.navigate('Reminders') },
    { id: 'family', icon: 'user', text: 'Gia đình', action: () => navigation.navigate('Family') },
    { id: 'messages', icon: 'message-square', text: 'Tin nhắn', action: () => navigation.navigate('Message') },
    { id: 'settings', icon: 'settings', text: 'Cài đặt', action: () => navigation.navigate('Settings') },
    { 
      id: 'emergency', 
      icon: 'phone', 
      text: 'Gọi khẩn cấp', 
      action: async () => {
        try {
          // Refresh emergency number from server before making call
          await emergencyCallService.initialize();
          await emergencyCallService.makeEmergencyCall();
        } catch (error) {
          console.error('Error refreshing emergency number:', error);
          // Fallback to cached number
          await emergencyCallService.makeEmergencyCall();
        }
      }
    },
    { id: 'add', icon: 'plus', text: 'Thêm', action: () => console.log('Thêm'), isPlus: true },
    { id: 'empty' }, // Placeholder for alignment
  ];

  const renderItem = useCallback(({ item }: { item: FunctionItem }) => {
    // Sử dụng EmergencyCallButton cho nút gọi khẩn cấp
    if (item.id === 'emergency') {
      return <EmergencyCallButton />;
    }
    
    return (
      <FunctionButton
        icon={item.icon || ''}
        text={item.text || ''}
        onPress={item.action || (() => {})}
        isPlus={item.isPlus}
      />
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.dividerSection}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Chức năng</Text>
        <View style={styles.dividerLine} />
      </View>
      <FlatList
        data={functions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={3}
        style={styles.grid}
        scrollEnabled={false} // Disable scroll if it's inside another ScrollView
        columnWrapperStyle={styles.row}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 16, // Reduced for tighter spacing
  },
  dividerLine: {
    flex: 1,
    height: 0.5, // Thinner line for subtlety
    backgroundColor: 'rgba(0, 122, 255, 0.1)', // Subtle blue tint
  },
  dividerText: {
    fontSize: 16, // Smaller for elegance
    fontWeight: '600', // Less bold
    color: '#8E8E93', // Softer gray
    marginHorizontal: 12, // Reduced margin
    letterSpacing: 0.3,
  },
  grid: {
    marginTop: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default FunctionGrid; 