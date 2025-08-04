import { Linking, Alert, PermissionsAndroid, Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEmergencyContact, saveEmergencyContact } from './api';

// Callback để hiển thị modal hướng dẫn
let showPermissionGuide: (() => void) | null = null;

export const setPermissionGuideCallback = (callback: () => void) => {
  showPermissionGuide = callback;
};

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
}

class EmergencyCallService {
  private emergencyNumber = '0902716951';
  private emergencyName = 'Số khẩn cấp';

  // Khởi tạo service và load cài đặt từ API
  async initialize(): Promise<void> {
    try {
      // Lấy email từ cache
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (userEmail) {
        // Gọi API để lấy số khẩn cấp từ database
        const result = await getEmergencyContact(userEmail);
        
        if (result.success && result.data) {
          this.emergencyNumber = result.data.emergency_number;
          this.emergencyName = result.data.contact_name;
          
          // Lưu vào cache để backup
          await AsyncStorage.setItem('emergency_number', this.emergencyNumber);
          await AsyncStorage.setItem('emergency_name', this.emergencyName);
          
          console.log('✅ Emergency contact loaded from API:', {
            number: this.emergencyNumber,
            name: this.emergencyName
          });
        } else {
          // Fallback về cache nếu API thất bại
          const savedNumber = await AsyncStorage.getItem('emergency_number');
          const savedName = await AsyncStorage.getItem('emergency_name');
          
          if (savedNumber) {
            this.emergencyNumber = savedNumber;
          }
          
          if (savedName) {
            this.emergencyName = savedName;
          }
          
          console.log('⚠️ Using cached emergency contact:', {
            number: this.emergencyNumber,
            name: this.emergencyName
          });
        }
      } else {
        // Fallback về cache nếu không có email
        const savedNumber = await AsyncStorage.getItem('emergency_number');
        const savedName = await AsyncStorage.getItem('emergency_name');
        
        if (savedNumber) {
          this.emergencyNumber = savedNumber;
        }
        
        if (savedName) {
          this.emergencyName = savedName;
        }
      }
    } catch (error) {
      console.error('Error loading emergency settings:', error);
      
      // Fallback về cache nếu có lỗi
      try {
        const savedNumber = await AsyncStorage.getItem('emergency_number');
        const savedName = await AsyncStorage.getItem('emergency_name');
        
        if (savedNumber) {
          this.emergencyNumber = savedNumber;
        }
        
        if (savedName) {
          this.emergencyName = savedName;
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  }

  // Kiểm tra quyền gọi điện (Android)
  private async requestCallPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        // Kiểm tra xem quyền đã được cấp chưa
        const hasCallPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
        
        const hasAnswerPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS
        );
        
        if (hasCallPermission && hasAnswerPermission) {
          return true;
        }
        
        // Request các quyền cần thiết
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS,
        ];
        
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        const allGranted = Object.values(granted).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (allGranted) {
          return true;
        } else {
          // Kiểm tra xem có quyền nào bị từ chối vĩnh viễn không
          const neverAskAgain = Object.values(granted).some(
            result => result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          );
          
          if (neverAskAgain) {
            return false;
          } else {
            return false;
          }
        }
      } catch (err) {
        console.warn('Error requesting call permission:', err);
        return false;
      }
    }
    return true; // iOS không cần request permission cho việc gọi
  }

  // Kiểm tra thiết bị có hỗ trợ gọi không
  private async canMakePhoneCall(phoneNumber: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(`tel:${phoneNumber}`);
      return supported;
    } catch (error) {
      console.error('Error checking phone call support:', error);
      return false;
    }
  }

  // Thực hiện cuộc gọi khẩn cấp
  async makeEmergencyCall(): Promise<void> {
    try {
      // 1. Kiểm tra quyền
      const hasPermission = await this.requestCallPermission();
      
      if (!hasPermission) {
        // Nếu có callback hiển thị modal hướng dẫn, sử dụng nó
        if (showPermissionGuide) {
          showPermissionGuide();
        } else {
          // Fallback về Alert thông thường
          Alert.alert(
            'Quyền gọi điện bị từ chối',
            'Để sử dụng tính năng gọi khẩn cấp, vui lòng:\n\n1. Vào Cài đặt > Ứng dụng > ViegrandApp\n2. Chọn "Quyền"\n3. Bật "Gọi điện thoại"\n\nHoặc nhấn "Mở Cài đặt" để đi thẳng đến trang cài đặt app.',
            [
              { text: 'Để sau', style: 'cancel' },
              { 
                text: 'Mở Cài đặt', 
                onPress: () => {
                  // Mở cài đặt app cụ thể
                  if (Platform.OS === 'android') {
                    Linking.openURL('package:com.viegrandapp');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
        }
        return;
      }

      // 2. Kiểm tra hỗ trợ gọi
      const canCall = await this.canMakePhoneCall(this.emergencyNumber);
      
      if (!canCall) {
        Alert.alert(
          'Không thể gọi',
          'Thiết bị không hỗ trợ thực hiện cuộc gọi',
          [{ text: 'Đồng ý', style: 'default' }]
        );
        return;
      }

      // 3. Hiển thị xác nhận trước khi gọi
      Alert.alert(
        'Gọi khẩn cấp',
        `Bạn có chắc muốn gọi cho ${this.emergencyName}?\nSố: ${this.emergencyNumber}`,
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Gọi ngay', 
            style: 'destructive',
            onPress: () => this.executeCall()
          }
        ]
      );

    } catch (error) {
      console.error('Error making emergency call:', error);
      Alert.alert(
        'Lỗi',
        'Không thể thực hiện cuộc gọi. Vui lòng thử lại.',
        [{ text: 'Đồng ý', style: 'default' }]
      );
    }
  }

  // Thực hiện cuộc gọi
  private async executeCall(): Promise<void> {
    try {
      // Gọi trực tiếp bằng native module
      console.log('Making direct call to:', this.emergencyNumber);
      
      if (Platform.OS === 'android') {
        // Android: Gọi trực tiếp bằng native module
        await NativeModules.DirectCallModule.makeDirectCall(this.emergencyNumber);
      } else {
        // iOS: Vẫn sử dụng Linking (iOS không cho phép gọi trực tiếp)
        const phoneNumber = this.emergencyNumber.replace(/\s/g, '');
        await Linking.openURL(`tel:${phoneNumber}`);
      }
      
    } catch (error) {
      console.error('Direct call failed:', error);
      Alert.alert(
        'Lỗi',
        'Không thể thực hiện cuộc gọi. Vui lòng thử lại.',
        [{ text: 'Đồng ý', style: 'default' }]
      );
    }
  }

  // Cập nhật số khẩn cấp
  async updateEmergencyNumber(newNumber: string, newName?: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Lấy email từ cache
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (!userEmail) {
        return { success: false, message: 'Không tìm thấy thông tin người dùng' };
      }
      
      // Gọi API để lưu vào database
      const result = await saveEmergencyContact(userEmail, newNumber, newName);
      
      if (result.success) {
        // Cập nhật local state
        this.emergencyNumber = newNumber;
        if (newName) {
          this.emergencyName = newName;
        }
        
        // Lưu vào cache để backup
        await AsyncStorage.setItem('emergency_number', newNumber);
        if (newName) {
          await AsyncStorage.setItem('emergency_name', newName);
        }
        
        console.log('✅ Emergency contact updated successfully:', {
          number: newNumber,
          name: newName || this.emergencyName
        });
        
        return { success: true, message: 'Cập nhật số khẩn cấp thành công' };
      } else {
        console.error('❌ Failed to update emergency contact:', result.message);
        return { success: false, message: result.message || 'Không thể cập nhật số khẩn cấp' };
      }
    } catch (error) {
      console.error('Error updating emergency number:', error);
      return { success: false, message: 'Lỗi kết nối' };
    }
  }

  // Lấy thông tin số khẩn cấp hiện tại
  getEmergencyInfo(): { number: string; name: string } {
    return {
      number: this.emergencyNumber,
      name: this.emergencyName
    };
  }
}

export const emergencyCallService = new EmergencyCallService();
export default emergencyCallService; 