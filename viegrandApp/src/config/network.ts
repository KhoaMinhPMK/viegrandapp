import { Platform } from 'react-native';

// Network Configuration
export const NETWORK_CONFIG = {
  // Địa chỉ IP thật của máy tính (thay đổi theo mạng của bạn)
  HOST_IP: '172.28.184.31',
  
  // Để test với localhost (emulator/simulator), đặt USE_LOCALHOST = true
  // Để test với thiết bị thật, đặt USE_LOCALHOST = false
  USE_LOCALHOST: true,
  
  // Port của backend
  PORT: '3000',
  
  // Android Emulator mapping
  ANDROID_EMULATOR_HOST: '10.0.2.2',
  
  // iOS Simulator mapping  
  IOS_SIMULATOR_HOST: 'localhost',
};

// Hàm để lấy host dựa trên cấu hình
export const getAPIHost = (): string => {
  if (NETWORK_CONFIG.USE_LOCALHOST) {
    // Force sử dụng localhost/emulator host
    if (Platform.OS === 'android') {
      return NETWORK_CONFIG.ANDROID_EMULATOR_HOST;
    } else {
      return NETWORK_CONFIG.IOS_SIMULATOR_HOST;
    }
  } else {
    // Sử dụng IP thật (cho thiết bị thật)
    return NETWORK_CONFIG.HOST_IP;
  }
};

// Hàm để lấy URL đầy đủ
export const getAPIURL = (): string => {
  const host = getAPIHost();
  return `http://${host}:${NETWORK_CONFIG.PORT}/api`;
};

// Debug info
export const getNetworkInfo = () => {
  return {
    platform: Platform.OS,
    useLocalhost: NETWORK_CONFIG.USE_LOCALHOST,
    host: getAPIHost(),
    fullURL: getAPIURL(),
    config: NETWORK_CONFIG,
  };
}; 