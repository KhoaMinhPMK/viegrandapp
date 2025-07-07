import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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

const PremiumNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PremiumHome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f8f9fa' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="PremiumHome"
        component={PremiumScreen}
        options={{
          title: 'Premium',
          gestureEnabled: true,
        }}
      />
      
      <Stack.Screen
        name="PlanComparison"
        component={PlanComparisonScreen}
        options={{
          title: 'So sánh gói',
          gestureEnabled: true,
        }}
      />
      
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{
          title: 'Phương thức thanh toán',
          gestureEnabled: true,
        }}
      />
      
      <Stack.Screen
        name="PaymentProcessing"
        component={PaymentProcessingScreen}
        options={{
          title: 'Đang xử lý',
          gestureEnabled: false, // Disable gesture during processing
        }}
      />
      
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          title: 'Thành công',
          gestureEnabled: false, // Disable gesture on success
        }}
      />
      
      <Stack.Screen
        name="PaymentFailed"
        component={PaymentFailedScreen}
        options={{
          title: 'Thất bại',
          gestureEnabled: false, // Disable gesture on failure
        }}
      />
      
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{
          title: 'Lịch sử thanh toán',
          gestureEnabled: true,
        }}
      />
      
      <Stack.Screen
        name="SubscriptionManagement"
        component={PremiumScreen} // Reuse PremiumScreen for now
        options={{
          title: 'Quản lý đăng ký',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default PremiumNavigator;
