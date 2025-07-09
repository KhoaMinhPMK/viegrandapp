import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ElderlyBottomTabNavigator from './ElderlyBottomTabNavigator';
import NotificationsScreen from '../screens/Elderly/Notifications';
import PremiumNavigator from './PremiumNavigator';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import SudokuScreen from '../screens/Games/Sudoku';

const Stack = createStackNavigator();

const ElderlyNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Main" component={ElderlyBottomTabNavigator} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Premium" component={PremiumNavigator} />
      <Stack.Screen name="Sudoku" component={SudokuScreen} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          headerShown: true,
          presentation: 'modal',
        }} 
      />
    </Stack.Navigator>
  );
};

export default ElderlyNavigator;
