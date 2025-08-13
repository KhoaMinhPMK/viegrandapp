import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Image, ImageBackground } from 'react-native';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500); // Increased duration slightly

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim, opacityAnim]);

  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.backgroundImage}>
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </Animated.View>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Change to white background
  },
  logoContainer: {
    // The animated view will handle transforms
  },
  logo: {
    width: width * 0.9, // Increased size by another 40% (approx)
    height: width * 0.9,
    resizeMode: 'contain',
  },
});

export default SplashScreen; 