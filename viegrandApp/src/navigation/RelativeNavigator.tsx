import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import RelativeBottomTabNavigator from './RelativeBottomTabNavigator';
import PremiumNavigator from './PremiumNavigator';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import PremiumManagementScreen from '../screens/Premium/PremiumManagementScreen';
import AddReminderScreen from '../screens/Relative/AddReminderScreen';
import RelativeNotificationsScreen from '../screens/Relative/Notifications';
import ChangePasswordScreen from '../screens/Relative/Settings/ChangePasswordScreen';
import AboutAppScreen from '../screens/Relative/Settings/AboutAppScreen';
import SupportCenterScreen from '../screens/Elderly/Settings/SupportCenterScreen';
import TermsOfServiceScreen from '../screens/Elderly/Settings/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/Elderly/Settings/PrivacyPolicyScreen';
import VoiceHelpScreen from '../screens/Elderly/Settings/VoiceHelpScreen';

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
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AboutApp" 
        component={AboutAppScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SupportCenter" 
        component={SupportCenterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TermsOfService" 
        component={TermsOfServiceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="VoiceHelp" 
        component={VoiceHelpScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default RelativeNavigator;
