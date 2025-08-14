import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getVitalSignsData } from '../../../services/api';

const { width, height } = Dimensions.get('window');

type Category = 'blood_pressure' | 'heart_rate' | 'all';
type Period = '1d' | '7d' | '30d' | '90d' | '1y';

interface VitalSignsData {
  private_key: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  created_at: string;
}

interface RouteParams {
  elderlyUser: {
    userId: number;
    userName: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    private_key: string;
  };
  privateKey: string;
}

const ElderlyHealthChartScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { elderlyUser, privateKey } = route.params as RouteParams;
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('blood_pressure');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7d');
  const [vitalSignsData, setVitalSignsData] = useState<VitalSignsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { key: 'blood_pressure', label: 'Huyết áp', icon: 'activity' },
    { key: 'heart_rate', label: 'Nhịp tim', icon: 'heart' },
    { key: 'all', label: 'Tất cả', icon: 'bar-chart-2' },
  ];

  const periods = [
    { key: '1d', label: '1 ngày' },
    { key: '7d', label: '7 ngày' },
    { key: '30d', label: '30 ngày' },
    { key: '90d', label: '90 ngày' },
    { key: '1y', label: '1 năm' },
  ];

  useEffect(() => {
    loadVitalSignsData();
  }, [selectedPeriod]);

  const loadVitalSignsData = async () => {
    if (!privateKey) {
      setError('Không tìm thấy thông tin người dùng');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading vital signs for elderly user:', elderlyUser.userName, 'with private key:', privateKey);
      
      const response = await getVitalSignsData(privateKey, selectedPeriod);
      
      if (response.success) {
        setVitalSignsData(response.data?.vital_signs || []);
        console.log('✅ Vital signs loaded:', response.data?.vital_signs?.length || 0, 'records');
      } else {
        setError(response.message || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      console.error('Load vital signs data error:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    const periodMap = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const daysBack = periodMap[selectedPeriod];
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    return vitalSignsData
      .filter(item => new Date(item.created_at) >= cutoffDate)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return {
        labels: ['Không có dữ liệu'],
        datasets: [{ data: [0] }],
      };
    }

    const labels = filteredData.map(item => {
      const date = new Date(item.created_at);
      if (selectedPeriod === '1d') {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      } else if (selectedPeriod === '7d') {
        return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      }
    });

    if (selectedCategory === 'blood_pressure') {
      return {
        labels,
        datasets: [
          {
            data: filteredData.map(item => item.blood_pressure_systolic),
            color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
            strokeWidth: 3,
            legend: 'Tâm thu',
          },
          {
            data: filteredData.map(item => item.blood_pressure_diastolic),
            color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
            strokeWidth: 3,
            legend: 'Tâm trương',
          },
        ],
      };
    } else if (selectedCategory === 'heart_rate') {
      return {
        labels,
        datasets: [
          {
            data: filteredData.map(item => item.heart_rate),
            color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`,
            strokeWidth: 3,
            legend: 'Nhịp tim',
          },
        ],
      };
    } else {
      // All categories
      return {
        labels,
        datasets: [
          {
            data: filteredData.map(item => item.blood_pressure_systolic),
            color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
            strokeWidth: 3,
            legend: 'Tâm thu',
          },
          {
            data: filteredData.map(item => item.blood_pressure_diastolic),
            color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
            strokeWidth: 3,
            legend: 'Tâm trương',
          },
          {
            data: filteredData.map(item => item.heart_rate),
            color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`,
            strokeWidth: 3,
            legend: 'Nhịp tim',
          },
        ],
      };
    }
  };

  const getChartConfig = () => {
    const baseConfig = {
      backgroundColor: 'transparent',
      backgroundGradientFrom: '#F8F9FA',
      backgroundGradientTo: '#F8F9FA',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(108, 117, 125, ${opacity})`,
      style: {
        borderRadius: 20,
      },
      propsForDots: {
        r: '6',
        strokeWidth: '3',
        stroke: '#FFFFFF',
        fill: '#007AFF',
      },
      propsForBackgroundLines: {
        strokeDasharray: '',
        strokeWidth: 1,
        stroke: 'rgba(0, 0, 0, 0.05)',
      },
    };

    if (selectedCategory === 'blood_pressure') {
      return {
        ...baseConfig,
        color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
        propsForDots: {
          ...baseConfig.propsForDots,
          stroke: '#FFFFFF',
          fill: '#FF3B30',
        },
      };
    } else if (selectedCategory === 'heart_rate') {
      return {
        ...baseConfig,
        color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`,
        propsForDots: {
          ...baseConfig.propsForDots,
          stroke: '#FFFFFF',
          fill: '#5856D6',
        },
      };
    }

    return baseConfig;
  };

  const getStatistics = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return {
        systolic: { avg: 0, min: 0, max: 0 },
        diastolic: { avg: 0, min: 0, max: 0 },
        heartRate: { avg: 0, min: 0, max: 0 },
      };
    }

    const systolicValues = filteredData.map(item => item.blood_pressure_systolic);
    const diastolicValues = filteredData.map(item => item.blood_pressure_diastolic);
    const heartRateValues = filteredData.map(item => item.heart_rate);

    return {
      systolic: {
        avg: Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length),
        min: Math.min(...systolicValues),
        max: Math.max(...systolicValues),
      },
      diastolic: {
        avg: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length),
        min: Math.min(...diastolicValues),
        max: Math.max(...diastolicValues),
      },
      heartRate: {
        avg: Math.round(heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length),
        min: Math.min(...heartRateValues),
        max: Math.max(...heartRateValues),
      },
    };
  };

  const renderChart = () => {
    const chartData = getChartData();
    const chartConfig = getChartConfig();

    if (chartData.labels.length === 1 && chartData.labels[0] === 'Không có dữ liệu') {
      return (
        <View style={styles.noDataContainer}>
          <Feather name="bar-chart-2" size={48} color="#C7C7CC" />
          <Text style={styles.noDataText}>Không có dữ liệu sức khỏe</Text>
          <Text style={styles.noDataSubtext}>
            Chưa có dữ liệu sức khỏe trong khoảng thời gian này
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartScrollContainer}
        >
          <LineChart
            data={chartData}
            width={Math.max(width - 40, chartData.labels.length * 80)}
            height={height * 0.4}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={false}
          />
        </ScrollView>
        
        {/* Legend */}
        <View style={styles.legendContainer}>
          {chartData.datasets.map((dataset, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendDot, 
                  { backgroundColor: dataset.color(1) }
                ]} 
              />
              <Text style={styles.legendText}>{dataset.legend}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStatistics = () => {
    const stats = getStatistics();
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
      return null;
    }

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Thống kê ({selectedPeriod})</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Huyết áp tâm thu</Text>
            <Text style={styles.statValue}>{stats.systolic.avg} mmHg</Text>
            <Text style={styles.statRange}>
              {stats.systolic.min} - {stats.systolic.max}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Huyết áp tâm trương</Text>
            <Text style={styles.statValue}>{stats.diastolic.avg} mmHg</Text>
            <Text style={styles.statRange}>
              {stats.diastolic.min} - {stats.diastolic.max}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Nhịp tim</Text>
            <Text style={styles.statValue}>{stats.heartRate.avg} bpm</Text>
            <Text style={styles.statRange}>
              {stats.heartRate.min} - {stats.heartRate.max}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Biểu đồ sức khỏe</Text>
          <Text style={styles.subtitle}>{elderlyUser.userName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Loại dữ liệu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.selectorButton,
                  selectedCategory === category.key && styles.selectorButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.key as Category)}
              >
                <Feather 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.key ? '#FFFFFF' : '#007AFF'} 
                />
                <Text
                  style={[
                    styles.selectorButtonText,
                    selectedCategory === category.key && styles.selectorButtonTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Period Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Thời gian</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.selectorButton,
                  selectedPeriod === period.key && styles.selectorButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.key as Period)}
              >
                <Text
                  style={[
                    styles.selectorButtonText,
                    selectedPeriod === period.key && styles.selectorButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chart */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadVitalSignsData}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderChart()}
            {renderStatistics()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  selectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 6,
  },
  selectorButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  chartScrollContainer: {
    paddingHorizontal: 10,
  },
  chart: {
    borderRadius: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 16,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statRange: {
    fontSize: 10,
    color: '#8E8E93',
  },
});

export default ElderlyHealthChartScreen; 