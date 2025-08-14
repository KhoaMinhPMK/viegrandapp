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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../contexts/AuthContext';
import { getVitalSignsData } from '../../../services/api';

const { width, height } = Dimensions.get('window');

type Category = 'blood_pressure' | 'heart_rate' | 'all';
type Period = '1d' | '7d' | '30d' | '90d' | '1y';

interface VitalSignsData {
  id: number;
  private_key: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  created_at: string;
}

const HealthChartScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
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
    if (!user?.privateKey) {
      setError('Không tìm thấy thông tin người dùng');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getVitalSignsData(user.privateKey, selectedPeriod);
      
      if (response.success) {
        setVitalSignsData(response.data?.vital_signs || []);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (selectedPeriod === '1d') {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (selectedPeriod === '7d') {
      return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    }
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return {
        labels: ['Không có dữ liệu'],
        datasets: [{ data: [0] }],
      };
    }

    const labels = filteredData.map(item => formatDate(item.created_at));
    
    if (selectedCategory === 'blood_pressure') {
      return {
        labels,
        datasets: [
          {
            data: filteredData.map(item => item.blood_pressure_systolic),
            color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
            strokeWidth: 2,
            legend: 'Tâm thu',
          },
          {
            data: filteredData.map(item => item.blood_pressure_diastolic),
            color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
            strokeWidth: 2,
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
            strokeWidth: 2,
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
            strokeWidth: 2,
            legend: 'Tâm thu',
          },
          {
            data: filteredData.map(item => item.blood_pressure_diastolic),
            color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
            strokeWidth: 2,
            legend: 'Tâm trương',
          },
          {
            data: filteredData.map(item => item.heart_rate),
            color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`,
            strokeWidth: 2,
            legend: 'Nhịp tim',
          },
        ],
      };
    }
  };

  const getChartConfig = () => {
    const baseConfig = {
      backgroundColor: '#FFFFFF',
      backgroundGradientFrom: '#FFFFFF',
      backgroundGradientTo: '#FFFFFF',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#007AFF',
      },
    };

    if (selectedCategory === 'blood_pressure') {
      return {
        ...baseConfig,
        color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
      };
    } else if (selectedCategory === 'heart_rate') {
      return {
        ...baseConfig,
        color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`,
      };
    }

    return baseConfig;
  };

  const getCategoryTitle = () => {
    const category = categories.find(cat => cat.key === selectedCategory);
    return category?.label || 'Biểu đồ sức khỏe';
  };

  const getPeriodTitle = () => {
    const period = periods.find(p => p.key === selectedPeriod);
    return period?.label || '7 ngày';
  };

  const renderCategorySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Loại dữ liệu:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
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
  );

  const renderPeriodSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Thời gian:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
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
  );

  const renderChart = () => {
    const chartData = getChartData();
    const chartConfig = getChartConfig();

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadVitalSignsData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (vitalSignsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="bar-chart-2" size={48} color="#8E8E93" />
          <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
          <Text style={styles.emptySubtitle}>
            Hãy thực hiện kiểm tra sức khỏe để xem biểu đồ
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={width - 40}
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
        
        {/* Legend */}
        {selectedCategory === 'blood_pressure' && (
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.legendText}>Huyết áp tâm thu</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
              <Text style={styles.legendText}>Huyết áp tâm trương</Text>
            </View>
          </View>
        )}
        
        {selectedCategory === 'heart_rate' && (
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#5856D6' }]} />
              <Text style={styles.legendText}>Nhịp tim</Text>
            </View>
          </View>
        )}
        
        {selectedCategory === 'all' && (
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.legendText}>Tâm thu</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
              <Text style={styles.legendText}>Tâm trương</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#5856D6' }]} />
              <Text style={styles.legendText}>Nhịp tim</Text>
            </View>
          </View>
        )}
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
        <Text style={styles.title}>Biểu đồ sức khỏe</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selector */}
        {renderCategorySelector()}

        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Chart */}
        {renderChart()}

        {/* Summary Stats */}
        {vitalSignsData.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Thống kê {getPeriodTitle()}</Text>
            <View style={styles.statsGrid}>
              {selectedCategory !== 'heart_rate' && (
                <>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Tâm thu TB</Text>
                    <Text style={styles.statValue}>
                      {Math.round(
                        vitalSignsData.reduce((sum, item) => sum + item.blood_pressure_systolic, 0) /
                          vitalSignsData.length
                      )}
                    </Text>
                    <Text style={styles.statUnit}>mmHg</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Tâm trương TB</Text>
                    <Text style={styles.statValue}>
                      {Math.round(
                        vitalSignsData.reduce((sum, item) => sum + item.blood_pressure_diastolic, 0) /
                          vitalSignsData.length
                      )}
                    </Text>
                    <Text style={styles.statUnit}>mmHg</Text>
                  </View>
                </>
              )}
              {selectedCategory !== 'blood_pressure' && (
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Nhịp tim TB</Text>
                  <Text style={styles.statValue}>
                    {Math.round(
                      vitalSignsData.reduce((sum, item) => sum + item.heart_rate, 0) /
                        vitalSignsData.length
                    )}
                  </Text>
                  <Text style={styles.statUnit}>bpm</Text>
                </View>
              )}
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  selectorScroll: {
    flexDirection: 'row',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 12,
  },
  selectorButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  selectorButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
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
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
});

export default HealthChartScreen; 