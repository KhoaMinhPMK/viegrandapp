// Environment configuration
// In a real app, you would use react-native-dotenv or similar
// For now, we'll use a simple configuration object

interface EnvironmentConfig {
  GROQ_API_KEY: string;
  API_BASE_URL: string;
}

const config: EnvironmentConfig = {
  GROQ_API_KEY: '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',
  // Use actual IP address for Android compatibility
  API_BASE_URL: 'https://chat.viegrand.site', // Android emulator
  // API_BASE_URL: 'http://192.168.1.xxx:3000', // Real device - replace with your IP
};

export default config; 