import 'react-native-gesture-handler';
import React, { memo, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/Onboarding';
import AuthNavigator from './src/navigation/AuthNavigator';
import ElderlyNavigator from './src/navigation/ElderlyNavigator';
import RelativeNavigator from './src/navigation/RelativeNavigator';
import { VoiceProvider } from './src/contexts/VoiceContext';
import { VoiceNavigationProvider } from './src/contexts/VoiceNavigationContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketContext';
import { PremiumProvider } from './src/contexts/PremiumContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { AppStateProvider } from './src/contexts/AppStateContext';
import pushNotificationService from './src/services/pushNotification';
import { navigationRef } from './src/navigation/navigationService';
import FloatingVoiceButton from './src/components/elderly-home/FloatingVoiceButton';
import { useAuth } from './src/contexts/AuthContext';
import { VoiceButtonProvider } from './src/contexts/VoiceButtonContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper component for ElderlyNavigator with VoiceNavigationProvider
const ElderlyNavigatorWithVoice = () => {
  return <ElderlyNavigator />;
};

const AppContent = memo(() => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Elderly" component={ElderlyNavigatorWithVoice} />
      <Stack.Screen name="Relative" component={RelativeNavigator} />
    </Stack.Navigator>
  );
});

const App = () => {
  useEffect(() => {
    pushNotificationService.initialize();
  }, []);

  return (
    <AppStateProvider>
      <AuthProvider>
        <SocketProvider>
          <SafeAreaProvider>
            <PremiumProvider>
              <SettingsProvider>
                <VoiceButtonProvider>
                  <VoiceProvider>
                    <VoiceNavigationProvider>
                      <NavigationContainer ref={navigationRef}>
                        <AppContent />
                      </NavigationContainer>
                    </VoiceNavigationProvider>
                  </VoiceProvider>
                </VoiceButtonProvider>
              </SettingsProvider>
            </PremiumProvider>
          </SafeAreaProvider>
        </SocketProvider>
      </AuthProvider>
    </AppStateProvider>
  );
};

export default App;
