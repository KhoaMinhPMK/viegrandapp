import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
import ForgotPasswordScreen from '../screens/ForgotPassword';
import VerificationScreen from '../screens/Verification';
import SplashScreen from '../screens/SplashScreen';
import ResetPasswordScreen from '../screens/ResetPassword';
import OnboardingScreen from '../screens/Onboarding';

import ElderlyNavigator from './ElderlyNavigator';
import RelativeNavigator from './RelativeNavigator';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Elderly" component={ElderlyNavigator} />
      <Stack.Screen name="Relative" component={RelativeNavigator} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 