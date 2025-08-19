import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { BlurView } from '@react-native-community/blur';
import { PremiumStackParamList } from '../types/navigation';

// Premium Screens
import PremiumScreen from '../screens/Premium/PremiumScreen';
import PlanComparisonScreen from '../screens/Premium/PlanComparisonScreen';
import PaymentMethodScreen from '../screens/Premium/PaymentMethodScreen';
import PaymentProcessingScreen from '../screens/Premium/PaymentProcessingScreen';
import PaymentSuccessScreen from '../screens/Premium/PaymentSuccessScreen';
import PaymentFailedScreen from '../screens/Premium/PaymentFailedScreen';
import PaymentHistoryScreen from '../screens/Premium/PaymentHistoryScreen';

const Stack = createStackNavigator<PremiumStackParamList>();

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

const PremiumNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PremiumHome"
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTransparent: Platform.OS === 'ios',
        headerTitle: '',
        headerLeft: () => <CustomBackButton onPress={() => navigation.goBack()} />,
        cardStyle: { backgroundColor: '#f8f9fa' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        headerStyle: Platform.OS === 'android' ? { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 } : undefined,
      })}
    >
      <Stack.Screen
        name="PremiumHome"
        component={PremiumScreen}
        options={{
            headerShown: false, 
        }}
      />
      
      <Stack.Screen
        name="PlanComparison"
        component={PlanComparisonScreen}
        options={{
            headerShown: false, // This screen has its own title logic
        }}
      />
      
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{
            headerShown: false, // Has its own header
        }}
      />
      
      <Stack.Screen
        name="PaymentProcessing"
        component={PaymentProcessingScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      
      <Stack.Screen
        name="PaymentFailed"
        component={PaymentFailedScreen}
        options={{
            headerShown: false,
            gestureEnabled: false,
        }}
      />
      
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{
            headerShown: false, // Has its own header
        }}
      />
      
      <Stack.Screen
        name="SubscriptionManagement"
        component={PremiumScreen} // Reuse PremiumScreen for now
        options={{
            headerShown: false,
        }}
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

export default PremiumNavigator;
