import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ElderlySettingsScreen from '../screens/Elderly/Settings';
import RelativeSettingsScreen from '../screens/Relative/Settings';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ElderlyProfileScreen from '../screens/Elderly/Profile';

export type SettingsStackParamList = {
  ElderlySettings: undefined;
  RelativeSettings: undefined;
  EditProfile: undefined;
  ElderlyProfile: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

interface SettingsNavigatorProps {
  initialRouteName: keyof SettingsStackParamList;
}

const SettingsNavigator = ({ initialRouteName }: SettingsNavigatorProps) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen 
        name="ElderlySettings" 
        component={ElderlySettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RelativeSettings" 
        component={RelativeSettingsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ElderlyProfile"
        component={ElderlyProfileScreen}
        options={{
          headerTitle: 'Hồ sơ cá nhân',
        }}
      />
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

export default SettingsNavigator;
