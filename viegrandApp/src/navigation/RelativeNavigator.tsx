import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import RelativeBottomTabNavigator from './RelativeBottomTabNavigator';
import PremiumNavigator from './PremiumNavigator';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import PremiumManagementScreen from '../screens/Premium/PremiumManagementScreen';
import AddReminderScreen from '../screens/Relative/AddReminderScreen';
import RelativeNotificationsScreen from '../screens/Relative/Notifications';

const Stack = createStackNavigator();

const RelativeNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="RelativeMain"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="RelativeMain" component={RelativeBottomTabNavigator} />
      <Stack.Screen name="Premium" component={PremiumNavigator} />
      <Stack.Screen name="PremiumManagement" component={PremiumManagementScreen} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          headerShown: true,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen name="AddReminder" component={AddReminderScreen} />
      <Stack.Screen 
        name="Notifications" 
        component={RelativeNotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default RelativeNavigator;
