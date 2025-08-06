import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PremiumScreen from './PremiumScreen';

const PremiumTabScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Override navigation to use the full-screen Premium navigator
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const unsubscribe = navigation.addListener('focus', () => {
      // Delay navigation to avoid conflicts
      timeoutId = setTimeout(() => {
        // When this tab is focused, navigate to the full-screen Premium instead
        navigation.getParent()?.navigate('Premium');
      }, 100);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [navigation]);

  // This screen will never actually be shown, but we need a component
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