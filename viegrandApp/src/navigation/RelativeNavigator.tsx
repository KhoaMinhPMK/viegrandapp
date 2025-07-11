import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import RelativeHomeScreen from '../screens/Relative/Home';
import RelativeProfileScreen from '../screens/Relative/Profile';
import RelativeSettingsScreen from '../screens/Relative/Settings';
import PremiumNavigator from './PremiumNavigator';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';

const Stack = createStackNavigator();

const RelativeNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="RelativeHome"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="RelativeHome" component={RelativeHomeScreen} />
      <Stack.Screen name="RelativeProfile" component={RelativeProfileScreen} />
      <Stack.Screen name="RelativeSettings" component={RelativeSettingsScreen} />
      <Stack.Screen name="Premium" component={PremiumNavigator} />
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

export default RelativeNavigator;
