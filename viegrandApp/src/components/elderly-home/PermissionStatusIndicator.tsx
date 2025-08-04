import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface PermissionStatusIndicatorProps {
  onRequestPermission?: () => void;
}

const PermissionStatusIndicator: React.FC<PermissionStatusIndicatorProps> = ({
  onRequestPermission
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const hasCallPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
        
        const hasAnswerPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS
        );
        
        setHasPermission(hasCallPermission && hasAnswerPermission);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      }
    } else {
      // iOS không cần check permission cho gọi điện
      setHasPermission(true);
    }
  };

  const handleRequestPermission = () => {
    if (onRequestPermission) {
      onRequestPermission();
    } else {
      Alert.alert(
        'Quyền gọi điện',
        'Để sử dụng tính năng gọi khẩn cấp, vui lòng cấp quyền gọi điện trong cài đặt.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Cài đặt', onPress: () => {
            // Mở cài đặt app
            if (Platform.OS === 'android') {
              // Linking.openURL('package:com.viegrandapp');
            } else {
              // Linking.openSettings();
            }
          }}
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang kiểm tra quyền...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIcon,
          { backgroundColor: hasPermission ? '#34C759' : '#FF9500' }
        ]}>
          <Feather 
            name={hasPermission ? 'check' : 'alert-triangle'} 
            size={16} 
            color="#FFFFFF" 
          />
        </View>
        <View style={styles.statusText}>
          <Text style={styles.statusTitle}>
            {hasPermission ? 'Quyền gọi điện đã được cấp' : 'Cần cấp quyền gọi điện'}
          </Text>
          <Text style={styles.statusDescription}>
            {hasPermission 
              ? 'Bạn có thể sử dụng tính năng gọi khẩn cấp'
              : 'Để sử dụng tính năng gọi khẩn cấp, vui lòng cấp quyền gọi điện'
            }
          </Text>
        </View>
      </View>
      
      {!hasPermission && (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleRequestPermission}
        >
          <Feather name="settings" size={16} color="#007AFF" />
          <Text style={styles.requestButtonText}>Cấp quyền</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6D6D70',
    lineHeight: 18,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
});

export default PermissionStatusIndicator; 