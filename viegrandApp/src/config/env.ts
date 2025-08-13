// Environment configuration
// In a real app, you would use react-native-dotenv or similar
// For now, we'll use a simple configuration object

interface EnvironmentConfig {
  GROQ_API_KEY: string;
  API_BASE_URL: string;
  BACKEND_API_URL: string;
}

const config: EnvironmentConfig = {
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  // API cho Groq service
  API_BASE_URL: 'https://chat.viegrand.site',
  // API cho backend services
  BACKEND_API_URL: 'https://viegrand.site/backend/',
};

export default config; 