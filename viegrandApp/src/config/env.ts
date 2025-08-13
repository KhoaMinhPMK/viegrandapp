// Environment configuration
// Sử dụng file secrets nội bộ, không cần @env
// Không bao giờ hardcode API keys trực tiếp trong repo

import { GROQ_API_KEY as SECRET_GROQ_API_KEY } from './secrets';

interface EnvironmentConfig {
  GROQ_API_KEY: string;
  API_BASE_URL: string;
  BACKEND_API_URL: string;
}

const config: EnvironmentConfig = {
  GROQ_API_KEY: SECRET_GROQ_API_KEY || '',
  // API cho Groq service
  API_BASE_URL: 'https://chat.viegrand.site',
  // API cho backend services
  BACKEND_API_URL: 'https://viegrand.site/backend/',
};

export default config; 