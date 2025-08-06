import React, { memo, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface FunctionButtonProps {
  icon: string;
  text: string;
  onPress: () => void;
  isPlus?: boolean; // Special style for 'Thêm' button
}

const FunctionButton = memo(({ icon, text, onPress, isPlus }: FunctionButtonProps) => {
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  if (!icon && !text) {
    return <View style={styles.functionItemEmpty} />;
  }

  return (
    <View style={styles.functionItem}>
      <TouchableOpacity 
        style={[styles.functionButton, isPlus && styles.plusButton]} 
        onPress={handlePress}
      >
        <Feather name={icon} size={22} color={isPlus ? '#8E8E93' : '#007AFF'} />
      </TouchableOpacity>
      <Text style={styles.functionText}>{text}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  functionItem: {
    alignItems: 'center',
    width: '33.33%',
    marginBottom: 16, // Reduced margin for tighter spacing
  },
  functionItemEmpty: {
    width: '33.33%',
  },
  functionButton: {
    width: 56, // Slightly smaller for elegance
    height: 56,
    borderRadius: 18, // More rounded for modern look
    backgroundColor: '#FFFFFF', // Pure white for contrast
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, // Much more subtle shadow
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
    // Add subtle border for definition
    borderWidth: 0.5,
    borderColor: 'rgba(0, 122, 255, 0.1)',
  },
  plusButton: {
    // Optional: Different style for plus button
    backgroundColor: '#F8F9FA',
  },
  functionText: {
    fontSize: 11, // Slightly smaller for refinement
    fontWeight: '500', // Less bold for sophistication  
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: 0.2, // Added letter spacing
  },
});

export default FunctionButton; 