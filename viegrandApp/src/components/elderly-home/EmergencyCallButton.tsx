import React, { memo, useCallback, useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import emergencyCallService from '../../services/emergencyCall';

interface EmergencyCallButtonProps {
  onPress?: () => void;
}

const EmergencyCallButton = memo(({ onPress }: EmergencyCallButtonProps) => {
  const [emergencyInfo, setEmergencyInfo] = useState(emergencyCallService.getEmergencyInfo());

  // Refresh emergency info when component mounts
  useEffect(() => {
    const refreshEmergencyInfo = async () => {
      try {
        await emergencyCallService.initialize();
        setEmergencyInfo(emergencyCallService.getEmergencyInfo());
      } catch (error) {
        console.error('Error refreshing emergency info:', error);
      }
    };
    
    refreshEmergencyInfo();
  }, []);

  const handleEmergencyCall = useCallback(async () => {
    try {
              // Refresh emergency number from server before making call
        await emergencyCallService.initialize();
        setEmergencyInfo(emergencyCallService.getEmergencyInfo());
        
        if (onPress) {
          onPress();
        } else {
          await emergencyCallService.makeEmergencyCall();
        }
    } catch (error) {
      console.error('Error refreshing emergency number:', error);
      // Fallback to cached number
      if (onPress) {
        onPress();
      } else {
        await emergencyCallService.makeEmergencyCall();
      }
    }
  }, [onPress]);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.emergencyButton} 
        onPress={handleEmergencyCall}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Feather name="phone" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.pulseRing} />
      </TouchableOpacity>
      <Text style={styles.emergencyText}>Gọi khẩn cấp</Text>
      <Text style={styles.emergencyNumber}>
        {emergencyInfo.number}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '33.33%',
    marginBottom: 16, // Consistent with other buttons
  },
  emergencyButton: {
    width: 56, // Same size as other buttons for consistency
    height: 56,
    borderRadius: 18, // Consistent border radius
    backgroundColor: '#FF3B30', // Keep emergency red
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow
    shadowOpacity: 0.15, // More subtle
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
    // Remove pulse ring for cleaner look
    borderWidth: 0.5,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  emergencyText: {
    fontSize: 11, // Consistent with other buttons
    fontWeight: '500', // Less bold for sophistication
    color: '#FF3B30',
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pulseRing: {
    // Keep for potential animation but hide by default
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    opacity: 0, // Hidden for minimalist design
    zIndex: 1,
  },
  emergencyNumber: {
    fontSize: 9, // Smaller for subtlety
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
});

export default EmergencyCallButton; 