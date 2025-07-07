import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ElderlyBottomTabNavigator from './ElderlyBottomTabNavigator';
import NotificationsScreen from '../screens/Elderly/Notifications';

const Stack = createStackNavigator();

const ElderlyNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Main" component={ElderlyBottomTabNavigator} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

export default ElderlyNavigator;
