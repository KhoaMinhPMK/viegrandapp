/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import { PremiumProvider } from './src/contexts/PremiumContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <AuthProvider>
      <PremiumProvider>
        <VoiceProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
              <Stack.Screen name="Auth" component={AuthNavigator} />
              <Stack.Screen name="Elderly" component={ElderlyNavigator} />
              <Stack.Screen name="Relative" component={RelativeNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
        </VoiceProvider>
      </PremiumProvider>
    </AuthProvider>
  );
};

export default App;
