import React from 'react';
import { View, StyleSheet } from 'react-native';
import FloatingVoiceButton from './FloatingVoiceButton';

interface VoiceButtonWrapperProps {
  children: React.ReactNode;
  showVoiceButton?: boolean;
}

const VoiceButtonWrapper: React.FC<VoiceButtonWrapperProps> = ({ 
  children, 
  showVoiceButton = true 
}) => {
  return (
    <View style={styles.container}>
      {children}
      {showVoiceButton && <FloatingVoiceButton />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VoiceButtonWrapper; 