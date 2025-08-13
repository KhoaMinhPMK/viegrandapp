/**
 * Tiện ích quản lý tài nguyên hình ảnh
 * Giúp tập trung việc quản lý assets và dễ dàng xử lý lỗi
 */

// Tất cả hình ảnh nền
export const BackgroundImages = {
  main: require('../assets/background.png'),
  secondary: require('../assets/bg2.jpg'),
};

// Tất cả hình ảnh logo
export const LogoImages = {
  main: require('../assets/logo.png'),
};

// Tất cả hình ảnh onboarding
export const OnboardingImages = {
  screen1: require('../assets/ob1.png'),
  screen2: require('../assets/ob2.png'),
};

// Tất cả hình ảnh thời tiết
export const WeatherImages = {
  sunCloudAngledRain: require('../assets/weather/Sun_cloud_angled_rain.png'),
  moonCloudFastWind: require('../assets/weather/Moon_cloud_fast_wind.png'),
  sunCloudMidRain: require('../assets/weather/Sun_cloud_mid_rain.png'),
  tornado: require('../assets/weather/Tornado.png'),
  moonCloudMidRain: require('../assets/weather/Moon_cloud_mid_rain.png'),
};

// Hàm helper để lấy hình ảnh thời tiết dựa trên mã thời tiết
export const getWeatherIcon = (weatherCode: string) => {
  switch (weatherCode) {
    case '01d':
    case '01n':
      return WeatherImages.sunCloudAngledRain;
    case '02d':
    case '02n':
    case '03d':
    case '03n':
    case '04d':
    case '04n':
      return WeatherImages.moonCloudFastWind;
    case '09d':
    case '09n':
    case '10d':
    case '10n':
      return WeatherImages.sunCloudMidRain;
    case '11d':
    case '11n':
      return WeatherImages.tornado;
    case '13d':
    case '13n':
      return WeatherImages.moonCloudMidRain;
    case '50d':
    case '50n':
      return WeatherImages.tornado;
    default:
      return WeatherImages.sunCloudAngledRain;
  }
}; 