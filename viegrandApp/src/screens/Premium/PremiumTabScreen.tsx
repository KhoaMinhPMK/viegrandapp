import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PremiumScreen from './PremiumScreen';

const PremiumTabScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const hasNavigatedToPremium = useRef(false);
  const isReturningFromPremium = useRef(false);

  // Listen for navigation state changes to detect when returning from Premium
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // If we just returned from Premium, mark it
      if (hasNavigatedToPremium.current) {
        isReturningFromPremium.current = true;
        // Reset after a short delay
        setTimeout(() => {
          isReturningFromPremium.current = false;
        }, 1000);
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Auto-navigate to full-screen Premium when tab is focused (but not when returning)
  useFocusEffect(
    React.useCallback(() => {
      // Don't navigate if we're returning from Premium
      if (isReturningFromPremium.current) {
        return;
      }

      // Don't navigate if we've already navigated to Premium from this tab
      if (hasNavigatedToPremium.current) {
        return;
      }

      const timeoutId = setTimeout(() => {
        hasNavigatedToPremium.current = true;
        navigation.getParent()?.navigate('Premium');
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }, [navigation])
  );

  // Reset navigation flag when component unmounts or tab changes
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Reset the flag when leaving this tab
      setTimeout(() => {
        hasNavigatedToPremium.current = false;
      }, 500);
    });

    return unsubscribe;
  }, [navigation]);

  // This screen will briefly show before navigating
  return (
    <View style={styles.container}>
      <PremiumScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PremiumTabScreen; 