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
        <Feather name={icon} size={24} color={isPlus ? '#007AFF' : '#007AFF'} />
      </TouchableOpacity>
      <Text style={styles.functionText}>{text}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  functionItem: {
    alignItems: 'center',
    width: '33.33%',
    marginBottom: 20,
  },
  functionItemEmpty: {
    width: '33.33%',
  },
  functionButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  plusButton: {
    // Add specific styles for the 'plus' button if needed
  },
  functionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default FunctionButton; 