import React, { useCallback, memo } from 'react';
import { View, StyleSheet, FlatList, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FunctionButton from './FunctionButton';

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
    { id: 'entertainment', icon: 'compass', text: 'Giải trí', action: () => navigation.navigate('EntertainmentHub') },
    { id: 'appointments', icon: 'calendar', text: 'Nhắc nhở', action: () => navigation.navigate('Reminders') },
    { id: 'family', icon: 'users', text: 'Gia đình', action: () => Alert.alert('Thông báo', 'Chức năng đang phát triển') },
    { id: 'messages', icon: 'message-circle', text: 'Tin nhắn', action: () => navigation.navigate('Message') },
    { id: 'settings', icon: 'settings', text: 'Cài đặt', action: () => navigation.navigate('Settings') },
    { id: 'emergency', icon: 'phone', text: 'Gọi khẩn cấp', action: () => console.log('Gọi khẩn cấp') },
    { id: 'add', icon: 'plus', text: 'Thêm', action: () => console.log('Thêm'), isPlus: true },
    { id: 'empty' }, // Placeholder for alignment
  ];

  const renderItem = useCallback(({ item }: { item: FunctionItem }) => (
    <FunctionButton
      icon={item.icon || ''}
      text={item.text || ''}
      onPress={item.action || (() => {})}
      isPlus={item.isPlus}
    />
  ), []);

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
    paddingHorizontal: 10, // Adjusted for container padding
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6D6D70',
    marginHorizontal: 16,
  },
  grid: {
    marginTop: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default FunctionGrid; 