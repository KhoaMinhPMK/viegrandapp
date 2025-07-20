import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export interface NetworkDebugInfo {
  platform: string;
  isEmulator: boolean;
  deviceType: string;
  suggestedApiUrl: string;
  timestamp: string;
}

export const getNetworkDebugInfo = async (): Promise<NetworkDebugInfo> => {
  try {
    // const isEmulator = await DeviceInfo.isEmulator();
    // const deviceType = await DeviceInfo.getDeviceType();
    
    // Suggested API URL based on device type
    // let suggestedApiUrl: string;
    
    // if (isEmulator) {
    //   if (Platform.OS === 'android') {
    //     suggestedApiUrl = 'http://10.0.2.2:3000/api';
    //   } else {
    //     suggestedApiUrl = 'http://localhost:3000/api';
    //   }
    // } else {
    //   // Real device - use host IP
    //   suggestedApiUrl = 'http://172.28.184.31:3000/api';
    // }
    
    // return {
    //   platform: Platform.OS,
    //   isEmulator,
    //   deviceType,
    //   suggestedApiUrl,
    //   timestamp: new Date().toISOString(),
    // };
    
    // Tạm thời return mock data
    return {
      platform: Platform.OS,
      isEmulator: false,
      deviceType: 'unknown',
      suggestedApiUrl: 'http://localhost:3000/api (COMMENTED)',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting network debug info:', error);
    return {
      platform: Platform.OS,
      isEmulator: false,
      deviceType: 'unknown',
      suggestedApiUrl: 'http://localhost:3000/api (COMMENTED)',
      timestamp: new Date().toISOString(),
    };
  }
};

export const logNetworkDebugInfo = async (): Promise<void> => {
  const debugInfo = await getNetworkDebugInfo();
  
  console.log('🔍 NETWORK DEBUG INFO (COMMENTED):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📱 Platform: ${debugInfo.platform}`);
  console.log(`🤖 Is Emulator: ${debugInfo.isEmulator}`);
  console.log(`📄 Device Type: ${debugInfo.deviceType}`);
  console.log(`🌐 Suggested API URL: ${debugInfo.suggestedApiUrl}`);
  console.log(`⏰ Timestamp: ${debugInfo.timestamp}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

export const testNetworkConnection = async (baseUrl: string): Promise<boolean> => {
  try {
    console.log(`🔗 Testing connection to: ${baseUrl} (COMMENTED)`);
    
    // Import axios to use same HTTP client as API
    // const axios = (await import('axios')).default;
    
    // Test with root API endpoint instead of /health
    // const testUrl = baseUrl; // This will be like http://172.28.184.31:3000/api
    
    // const response = await axios.get(testUrl, {
    //   timeout: 10000, // 10 second timeout
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    // });
    
    // if (response.status === 200 && response.data) {
    //   console.log('✅ Connection successful');
    //   console.log('📝 Response:', response.data);
    //   return true;
    // } else {
    //   console.log(`❌ Connection failed with status: ${response.status}`);
    //   return false;
    // }
    
    // Tạm thời return false vì đã comment
    console.log('❌ Connection test disabled (COMMENTED)');
    return false;
  } catch (error: any) {
    console.log('❌ Connection failed with error:', error.message || error);
    
    // Log more details for debugging
    // if (error.response) {
    //   console.log(`   Status: ${error.response.status}`);
    //   console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    // } else if (error.request) {
    //   console.log('   No response received - network issue');
    // } else {
    //   console.log('   Request setup error');
    // }
    
    return false;
  }
}; 