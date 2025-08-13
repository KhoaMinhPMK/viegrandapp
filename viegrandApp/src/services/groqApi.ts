import config from '../config/env';

interface HealthReadings {
  huyet_ap_tam_thu: string;
  huyet_ap_tam_truong: string;
  nhip_tim: string;
}

interface GroqResponse {
  success: boolean;
  data?: HealthReadings;
  error?: string;
  details?: string;
}

class GroqApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.API_BASE_URL;
    this.apiKey = config.GROQ_API_KEY;
  }

  async analyzeHealthImage(base64Image: string): Promise<GroqResponse> {
    try {
      // Sử dụng endpoint JSON
      const response = await fetch(`${this.baseUrl}/api/groq-image-chat-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          image: base64Image,
        }),
      });

      // Kiểm tra response type để tránh lỗi JSON parse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received');
        return {
          success: false,
          error: 'Server trả về dữ liệu không hợp lệ.',
        };
      }

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          error: data.error || 'Có lỗi xảy ra khi phân tích ảnh.',
          details: data.details,
        };
      }
    } catch (error) {
      console.error('Groq API error:', error);
      return {
        success: false,
        error: 'Lỗi kết nối. Vui lòng thử lại.',
      };
    }
  }

  // Method to update API key (for future use)
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Method to update base URL (for different environments)
  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
}

export default new GroqApiService();
export type { HealthReadings, GroqResponse }; 