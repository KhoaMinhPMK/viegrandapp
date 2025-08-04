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
          <Feather name="phone" size={28} color="#FFFFFF" />
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
    marginBottom: 20,
  },
  emergencyButton: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#FF3B30', // Màu đỏ khẩn cấp
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 8,
    // Thêm hiệu ứng pulse
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  emergencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF3B30',
    textAlign: 'center',
    lineHeight: 16,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    opacity: 0.6,
    zIndex: 1,
  },
  emergencyNumber: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
});

export default EmergencyCallButton; 