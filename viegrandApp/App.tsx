import 'react-native-gesture-handler';
import React, { memo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/Onboarding';
import SelectRoleScreen from './src/screens/SelectRole';
import AuthNavigator from './src/navigation/AuthNavigator';
import ElderlyNavigator from './src/navigation/ElderlyNavigator';
import RelativeNavigator from './src/navigation/RelativeNavigator';
import { VoiceProvider } from './src/contexts/VoiceContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketContext';
import { PremiumProvider } from './src/contexts/PremiumContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import HomeNavigator from './src/navigation/HomeNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = memo(() => {
  // Khởi tạo API khi app start - ĐÃ COMMENT LẠI
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Elderly" component={ElderlyNavigator} />
      <Stack.Screen name="Relative" component={RelativeNavigator} />
    </Stack.Navigator>
  );
});

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <SafeAreaProvider>
          <PremiumProvider>
            <SettingsProvider>
              <VoiceProvider>
                <NavigationContainer>
                  <AppContent />
                </NavigationContainer>
              </VoiceProvider>
            </SettingsProvider>
          </PremiumProvider>
        </SafeAreaProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
