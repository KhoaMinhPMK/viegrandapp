import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Feather from 'react-native-vector-icons/Feather';

import ElderlySettingsScreen from '../screens/Elderly/Settings';
import RelativeSettingsScreen from '../screens/Relative/Settings';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ElderlyProfileScreen from '../screens/Elderly/Profile';
import EmergencyCallSettingsScreen from '../screens/Elderly/Settings/EmergencyCallSettingsScreen';
import SupportCenterScreen from '../screens/Elderly/Settings/SupportCenterScreen';
import TermsOfServiceScreen from '../screens/Elderly/Settings/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/Elderly/Settings/PrivacyPolicyScreen';

export type SettingsStackParamList = {
  ElderlySettings: undefined;
  RelativeSettings: undefined;
  EditProfile: undefined;
  ElderlyProfile: undefined;
  EmergencyCallSettings: undefined;
  SupportCenter: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

const CustomBackButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.backButton}>
      <BlurView
        style={styles.blurView}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <Feather name="chevron-left" size={24} color="#007AFF" />
    </TouchableOpacity>
);

interface SettingsNavigatorProps {
  initialRouteName: keyof SettingsStackParamList;
}

const SettingsNavigator = ({ initialRouteName }: SettingsNavigatorProps) => {
  return (
    <Stack.Navigator 
        initialRouteName={initialRouteName}
        screenOptions={({ navigation }) => ({
            headerShown: true,
            headerTransparent: Platform.OS === 'ios',
            headerTitle: '',
            headerLeft: () => <CustomBackButton onPress={() => navigation.goBack()} />,
            headerStyle: Platform.OS === 'android' ? { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 } : undefined,
        })}
    >
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
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EmergencyCallSettings"
        component={EmergencyCallSettingsScreen}
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
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
    backButton: {
        marginLeft: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});

export default SettingsNavigator;
