import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Feather from 'react-native-vector-icons/Feather';

import ElderlyBottomTabNavigator from './ElderlyBottomTabNavigator';
import HealthCheckScreen from '../screens/Elderly/Health/HealthCheckScreen';

const Stack = createStackNavigator();

const ElderlyNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={ElderlyBottomTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HealthCheck" 
        component={HealthCheckScreen} 
        options={{ headerShown: false }}
      />
      {/* 
        Các màn hình Modal toàn màn hình hoặc các luồng khác không có bottom tab 
        sẽ được thêm vào đây trong tương lai.
      */}
    </Stack.Navigator>
  );
};

export default ElderlyNavigator;
