import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { getWeatherIcon } from '../../utils/assetUtils';

interface WeatherCardProps {
  isPremium: boolean;
}

const WeatherCard = memo(({ isPremium }: WeatherCardProps) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      // It's better to hide API keys in environment variables
      const API_KEY = 'e88c3624f6ac265634567a3ff20c41e3';
      const city = 'Ho Chi Minh City';
      
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=vi`
      );
      const currentData = await currentResponse.json();
      
      if (currentData.cod !== 200) {
        console.error('Weather API error:', currentData.message);
        return;
      }
      setWeatherData(currentData);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=vi`
      );
      const forecastResult = await forecastResponse.json();
      
      if (forecastResult.cod === '200' && forecastResult.list) {
        const dailyForecast = forecastResult.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 3);
        setForecastData(dailyForecast);
      } else {
        console.error('Forecast API error:', forecastResult.message);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  const handleToggleForecast = useCallback(() => {
    setShowForecast(prev => !prev);
  }, []);

  if (!weatherData) {
    // You can return a loading skeleton here for better UX
    return <View style={styles.weatherContainer} />;
  }

  return (
    <TouchableOpacity style={styles.weatherContainer} onPress={handleToggleForecast} activeOpacity={0.9}>
      <View style={styles.weatherContent}>
        <View style={styles.currentWeatherSection}>
          <View style={styles.weatherMainContainer}>
            <View style={styles.weatherShapeContainer}>
              <Svg width="100%" height="100%" viewBox="0 0 342 175" style={styles.trapezoidSvg}>
                <Defs>
                  <SvgLinearGradient id="weatherGradient" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={isPremium ? '#007AFF' : '#6c757d'} />
                    <Stop offset="1" stopColor={isPremium ? '#5856D6' : '#343a40'} />
                  </SvgLinearGradient>
                </Defs>
                <Path d="M0 66.4396C0 31.6455 0 14.2484 11.326 5.24044C22.6519 -3.76754 39.6026 0.147978 73.5041 7.97901L307.903 62.1238C324.259 65.9018 332.436 67.7909 337.218 73.8031C342 79.8154 342 88.2086 342 104.995V131C342 151.742 342 162.113 335.556 168.556C329.113 175 318.742 175 298 175H44C23.2582 175 12.8873 175 6.44365 168.556C0 162.113 0 151.742 0 131V66.4396Z" fill="url(#weatherGradient)" />
              </Svg>
              <View style={styles.weatherShapeContent}>
                <View style={styles.leftSection}>
                  <Text style={styles.temperature}>{Math.round(weatherData.main.temp)}°</Text>
                  <View style={styles.locationInfo}>
                    <Text style={styles.tempRange}>H:{Math.round(weatherData.main.temp_max)}° L:{Math.round(weatherData.main.temp_min)}°</Text>
                    <Text style={styles.location}>TP. Hồ Chí Minh</Text>
                  </View>
                </View>
                <View style={styles.rightSection}>
                  <Text style={styles.description}>{weatherData.weather[0].description}</Text>
                </View>
              </View>
            </View>
            <View style={styles.weatherIconFloating}>
              <Image source={getWeatherIcon(weatherData.weather[0].icon)} style={styles.weatherImage} />
            </View>
          </View>
          {showForecast && (
            <View style={styles.forecastSection}>
              <Text style={styles.forecastTitle}>Dự báo 3 ngày</Text>
              <View style={styles.forecastVertical}>
                {forecastData.map((item: any, index: number) => (
                  <View key={index} style={styles.forecastItem}>
                    <Image source={getWeatherIcon(item.weather[0].icon)} style={styles.forecastIcon} />
                    <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°</Text>
                    <Text style={styles.forecastDay} numberOfLines={1}>{index === 0 ? 'Hôm nay' : formatDate(item.dt)}</Text>
                    <Text style={styles.forecastHumidity}>{item.main.humidity}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
    weatherContainer: { marginHorizontal: 20, marginTop: 20, marginBottom: 0 },
    weatherContent: {},
    currentWeatherSection: {},
    weatherMainContainer: { position: 'relative', height: 180, marginBottom: 15 },
    weatherShapeContainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'visible' },
    trapezoidSvg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
    weatherShapeContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', padding: 20, zIndex: 1 },
    weatherIconFloating: { position: 'absolute', right: -10, top: -15, width: 150, height: 150, zIndex: 10, shadowColor: '#000', shadowOffset: { width: 5, height: 15 }, shadowOpacity: 0.35, shadowRadius: 15 },
    weatherImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    leftSection: { flex: 1, justifyContent: 'space-between', paddingRight: 10 },
    rightSection: { flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' },
    temperature: { fontSize: 64, fontWeight: 'bold', color: '#FFFFFF' },
    locationInfo: {},
    tempRange: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' },
    location: { fontSize: 18, color: '#FFFFFF', fontWeight: '600' },
    description: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500', textAlign: 'right', textTransform: 'capitalize' },
    forecastSection: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#EFEFEF', marginHorizontal: 20 },
    forecastTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10, textAlign: 'center' },
    forecastVertical: { flexDirection: 'row', justifyContent: 'space-between' },
    forecastItem: { alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 15, paddingVertical: 12, paddingHorizontal: 10, flex: 1, marginHorizontal: 5 },
    forecastIcon: { width: 32, height: 32, marginBottom: 8 },
    forecastTemp: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
    forecastDay: { fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', textAlign: 'center', marginBottom: 4 },
    forecastHumidity: { fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' },
});
  
export default WeatherCard; 