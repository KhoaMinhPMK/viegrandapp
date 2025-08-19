import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { getUserData, getVitalSignsData, getElderlyInPremium } from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface ElderlyUser {
  userId: number;
  userName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  private_key: string;
  lastHealthCheck?: string;
  healthStatus?: 'good' | 'warning' | 'critical';
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
}

interface VitalSignsData {
  private_key: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  created_at: string;
}

// Sample activity data for elderly users
interface ActivityData {
  dailyHours: number[];
  complianceRate: number;
  averageHours: number;
}

// Sample medication data for elderly users
interface MedicationData {
  dailyCompliance: number[];
  missedDoses: number;
  complianceRate: number;
}

type ReportPeriod = '1d' | '7d' | '30d' | '90d' | '1y';
type ReportType = 'health' | 'activity' | 'medication' | 'overview';

const ReportsScreen = ({ navigation }: any) => {
  const [elderlyUsers, setElderlyUsers] = useState<ElderlyUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ElderlyUser | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('7d');
  const [selectedType, setSelectedType] = useState<ReportType>('overview');
  const [vitalSignsData, setVitalSignsData] = useState<VitalSignsData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [medicationData, setMedicationData] = useState<MedicationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Load current user and elderly users
  useEffect(() => {
    loadCurrentUserAndElderlyUsers();
  }, []);

  // Load vital signs data when user or period changes
  useEffect(() => {
    if (selectedUser) {
      loadVitalSignsData();
      loadSampleActivityData();
      loadSampleMedicationData();
    }
  }, [selectedUser, selectedPeriod]);

  const loadCurrentUserAndElderlyUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      }

      // Get elderly users from premium subscription
      const userDataStr = await AsyncStorage.getItem('user');
      if (!userDataStr) {
        console.error('No user data found in cache');
        setElderlyUsers([]);
        return;
      }

      const currentUser = JSON.parse(userDataStr);
      const relativeUserId = currentUser.id || currentUser.userId;

      console.log('🔄 Loading elderly users for relative ID:', relativeUserId);

      // Get elderly users in premium subscription
      const result = await getElderlyInPremium(relativeUserId);

      if (result.success && result.data) {
        console.log('✅ Elderly users loaded:', result.data.length, 'users');
        
        // Enhance elderly users with additional health data
        const enhancedElderlyUsers = await Promise.all(
          result.data.map(async (elderly) => {
            try {
              // Get additional user data using private key
              const userDataResult = await getUserData(elderly.email);
              if (userDataResult.success && userDataResult.user) {
                return {
                  ...elderly,
                  lastHealthCheck: userDataResult.user.last_health_check || userDataResult.user.lastHealthCheck,
                  healthStatus: getHealthStatus(userDataResult.user),
                  bloodPressure: {
                    systolic: userDataResult.user.blood_pressure_systolic || userDataResult.user.bloodPressureSystolic,
                    diastolic: userDataResult.user.blood_pressure_diastolic || userDataResult.user.bloodPressureDiastolic,
                  },
                  heartRate: userDataResult.user.heart_rate || userDataResult.user.heartRate,
                };
              }
              return elderly;
            } catch (error) {
              console.error('Error fetching additional data for elderly:', elderly.userName, error);
              return elderly;
            }
          })
        );

        setElderlyUsers(enhancedElderlyUsers);
        if (enhancedElderlyUsers.length > 0) {
          setSelectedUser(enhancedElderlyUsers[0]);
        }
      } else {
        console.log('❌ Failed to load elderly users:', result.message);
        setElderlyUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
      setElderlyUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthStatus = (userData: any): 'good' | 'warning' | 'critical' => {
    // Simple health status calculation based on blood pressure and heart rate
    const systolic = userData.blood_pressure_systolic || userData.bloodPressureSystolic;
    const diastolic = userData.blood_pressure_diastolic || userData.bloodPressureDiastolic;
    const heartRate = userData.heart_rate || userData.heartRate;

    if (!systolic && !diastolic && !heartRate) {
      return 'warning'; // No data available
    }

    // Blood pressure ranges
    if (systolic && diastolic) {
      if (systolic >= 180 || diastolic >= 110) return 'critical';
      if (systolic >= 140 || diastolic >= 90) return 'warning';
      if (systolic < 90 || diastolic < 60) return 'warning';
    }

    // Heart rate ranges
    if (heartRate) {
      if (heartRate > 100 || heartRate < 60) return 'warning';
      if (heartRate > 120 || heartRate < 50) return 'critical';
    }

    return 'good';
  };

  const loadVitalSignsData = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      
      // Get vital signs data from API
      const result = await getVitalSignsData(selectedUser.private_key, selectedPeriod);
      
      if (result.success && result.data?.vital_signs) {
        setVitalSignsData(result.data.vital_signs);
      } else {
        // Use mock data for demonstration
        const mockData: VitalSignsData[] = generateMockVitalSignsData();
        setVitalSignsData(mockData);
      }
    } catch (error) {
      console.error('Error loading vital signs:', error);
      // Use mock data as fallback
      const mockData: VitalSignsData[] = generateMockVitalSignsData();
      setVitalSignsData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleActivityData = () => {
    // Generate sample activity data
    const dailyHours = [8, 7.5, 9, 8.5, 7, 6.5, 8];
    const complianceRate = 85;
    const averageHours = dailyHours.reduce((sum, hours) => sum + hours, 0) / dailyHours.length;

    setActivityData({
      dailyHours,
      complianceRate,
      averageHours,
    });
  };

  const loadSampleMedicationData = () => {
    // Generate sample medication data
    const dailyCompliance = [100, 95, 100, 90, 100, 85, 100];
    const missedDoses = 2;
    const complianceRate = Math.round(dailyCompliance.reduce((sum, rate) => sum + rate, 0) / dailyCompliance.length);

    setMedicationData({
      dailyCompliance,
      missedDoses,
      complianceRate,
    });
  };

  const generateMockVitalSignsData = (): VitalSignsData[] => {
    const data: VitalSignsData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        private_key: selectedUser?.private_key || '',
        blood_pressure_systolic: 110 + Math.random() * 40,
        blood_pressure_diastolic: 70 + Math.random() * 20,
        heart_rate: 60 + Math.random() * 40,
        created_at: date.toISOString(),
      });
    }
    
    return data.reverse();
  };

  const getHealthStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return '#34C759';
      case 'warning': return '#FF9500';
      case 'critical': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getHealthStatusText = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'Tốt';
      case 'warning': return 'Cần chú ý';
      case 'critical': return 'Cần can thiệp';
      default: return 'Không xác định';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPeriodText = (period: ReportPeriod) => {
    switch (period) {
      case '1d': return '1 ngày';
      case '7d': return '7 ngày';
      case '30d': return '30 ngày';
      case '90d': return '90 ngày';
      case '1y': return '1 năm';
      default: return '7 ngày';
    }
  };

  const getReportTypeText = (type: ReportType) => {
    switch (type) {
      case 'health': return 'Sức khỏe';
      case 'activity': return 'Hoạt động';
      case 'medication': return 'Thuốc men';
      case 'overview': return 'Tổng quan';
      default: return 'Tổng quan';
    }
  };

  // Build and share a concise report summary
  const handleShare = async () => {
    try {
      if (!selectedUser) {
        Alert.alert('Thông báo', 'Chưa có người dùng để chia sẻ báo cáo');
        return;
      }

      const avg = (values: number[]) => values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : null;

      const avgSys = vitalSignsData && vitalSignsData.length
        ? avg(vitalSignsData.map(d => d.blood_pressure_systolic))
        : (selectedUser.bloodPressure?.systolic || null);

      const avgDia = vitalSignsData && vitalSignsData.length
        ? avg(vitalSignsData.map(d => d.blood_pressure_diastolic))
        : (selectedUser.bloodPressure?.diastolic || null);

      const avgHr = vitalSignsData && vitalSignsData.length
        ? avg(vitalSignsData.map(d => d.heart_rate))
        : (selectedUser.heartRate || null);

      const userName = selectedUser.userName || 'Người dùng';
      const period = getPeriodText(selectedPeriod);

      const summaryLines = [
        `Báo cáo sức khỏe - ${userName}`,
        `Thời gian: ${period}`,
        `Huyết áp TB: ${avgSys ?? '-'} / ${avgDia ?? '-'} mmHg`,
        `Nhịp tim TB: ${avgHr ?? '-'} bpm`,
        selectedUser.lastHealthCheck ? `Lần kiểm tra cuối: ${formatDate(selectedUser.lastHealthCheck)}` : null,
      ].filter(Boolean) as string[];

      const message = summaryLines.join('\n');

      await Share.share({
        title: `Báo cáo sức khỏe - ${userName}`,
        message,
      });
    } catch (error) {
      console.error('Share report error:', error);
      Alert.alert('Lỗi', 'Không thể chia sẻ báo cáo. Vui lòng thử lại.');
    }
  };

  const renderUserSelector = () => (
    <View style={styles.userSelector}>
      <Text style={styles.sectionTitle}>Chọn người dùng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {elderlyUsers.map((user) => (
          <TouchableOpacity
            key={user.userId}
            style={[
              styles.userCard,
              selectedUser?.userId === user.userId && styles.userCardSelected
            ]}
            onPress={() => setSelectedUser(user)}
          >
            <View style={styles.userAvatar}>
              <Text style={styles.userInitials}>
                {user.userName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text style={styles.userName}>{user.userName}</Text>
            <Text style={styles.userAge}>{user.age} tuổi</Text>
            <View style={[
              styles.healthStatus,
              { backgroundColor: getHealthStatusColor(user.healthStatus || 'good') }
            ]}>
              <Text style={styles.healthStatusText}>
                {getHealthStatusText(user.healthStatus || 'good')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <Text style={styles.sectionTitle}>Thời gian</Text>
      <View style={styles.periodButtons}>
        {(['1d', '7d', '30d', '90d', '1y'] as ReportPeriod[]).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive
            ]}>
              {getPeriodText(period)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderReportTypeSelector = () => (
    <View style={styles.reportTypeSelector}>
      <Text style={styles.sectionTitle}>Loại báo cáo</Text>
      <View style={styles.reportTypeButtons}>
        {(['overview', 'health', 'activity', 'medication'] as ReportType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.reportTypeButton,
              selectedType === type && styles.reportTypeButtonActive
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Feather 
              name={getReportTypeIcon(type)} 
              size={20} 
              color={selectedType === type ? '#FFFFFF' : '#007AFF'} 
            />
            <Text style={[
              styles.reportTypeButtonText,
              selectedType === type && styles.reportTypeButtonTextActive
            ]}>
              {getReportTypeText(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'health': return 'heart';
      case 'activity': return 'activity';
      case 'medication': return 'package';
      case 'overview': return 'bar-chart-2';
      default: return 'bar-chart-2';
    }
  };

  const renderOverviewReport = () => (
    <View style={styles.reportSection}>
      <Text style={styles.reportTitle}>Tổng quan sức khỏe</Text>
      
      {/* Health Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Feather name="heart" size={24} color="#FF3B30" />
          <Text style={styles.summaryValue}>
            {selectedUser?.bloodPressure?.systolic || 0}/{selectedUser?.bloodPressure?.diastolic || 0}
          </Text>
          <Text style={styles.summaryLabel}>Huyết áp (mmHg)</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Feather name="activity" size={24} color="#007AFF" />
          <Text style={styles.summaryValue}>
            {selectedUser?.heartRate || 0}
          </Text>
          <Text style={styles.summaryLabel}>Nhịp tim (bpm)</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Feather name="calendar" size={24} color="#34C759" />
          <Text style={styles.summaryValue}>
            {selectedUser?.lastHealthCheck ? formatDate(selectedUser.lastHealthCheck) : 'N/A'}
          </Text>
          <Text style={styles.summaryLabel}>Lần kiểm tra cuối</Text>
        </View>
      </View>

      {/* Blood Pressure Chart */}
      {vitalSignsData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Diễn biến huyết áp</Text>
          <LineChart
            data={{
              labels: vitalSignsData.map((_, index) => `T${index + 1}`),
              datasets: [
                {
                  data: vitalSignsData.map(d => d.blood_pressure_systolic),
                  color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: vitalSignsData.map(d => d.blood_pressure_diastolic),
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#007AFF',
              },
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.legendText}>Tâm thu</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
              <Text style={styles.legendText}>Tâm trương</Text>
            </View>
          </View>
        </View>
      )}

      {/* Heart Rate Chart */}
      {vitalSignsData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Diễn biến nhịp tim</Text>
          <LineChart
            data={{
              labels: vitalSignsData.map((_, index) => `T${index + 1}`),
              datasets: [
                {
                  data: vitalSignsData.map(d => d.heart_rate),
                  color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#34C759',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}
    </View>
  );

  const renderHealthReport = () => (
    <View style={styles.reportSection}>
      <Text style={styles.reportTitle}>Báo cáo sức khỏe chi tiết</Text>
      
      {/* Health Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Huyết áp trung bình</Text>
          <Text style={styles.metricValue}>
            {vitalSignsData.length > 0 
              ? Math.round(vitalSignsData.reduce((sum, d) => sum + d.blood_pressure_systolic, 0) / vitalSignsData.length)
              : 0
            } mmHg
          </Text>
          <Text style={styles.metricSubtitle}>Tâm thu</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Nhịp tim trung bình</Text>
          <Text style={styles.metricValue}>
            {vitalSignsData.length > 0 
              ? Math.round(vitalSignsData.reduce((sum, d) => sum + d.heart_rate, 0) / vitalSignsData.length)
              : 0
            } bpm
          </Text>
          <Text style={styles.metricSubtitle}>Nhịp/phút</Text>
        </View>
      </View>

      {/* Health Status Distribution */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Phân bố trạng thái sức khỏe</Text>
        <PieChart
          data={[
            {
              name: 'Tốt',
              population: 65,
              color: '#34C759',
              legendFontColor: '#7F7F7F',
            },
            {
              name: 'Cần chú ý',
              population: 25,
              color: '#FF9500',
              legendFontColor: '#7F7F7F',
            },
            {
              name: 'Cần can thiệp',
              population: 10,
              color: '#FF3B30',
              legendFontColor: '#7F7F7F',
            },
          ]}
          width={width - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    </View>
  );

  const renderActivityReport = () => (
    <View style={styles.reportSection}>
      <Text style={styles.reportTitle}>Báo cáo hoạt động</Text>
      
      {/* Activity Summary */}
      <View style={styles.activitySummary}>
        <View style={styles.activityCard}>
          <Feather name="clock" size={24} color="#007AFF" />
          <Text style={styles.activityValue}>{activityData?.averageHours.toFixed(1) || 'N/A'} giờ</Text>
          <Text style={styles.activityLabel}>Thời gian hoạt động TB</Text>
        </View>
        
        <View style={styles.activityCard}>
          <Feather name="trending-up" size={24} color="#34C759" />
          <Text style={styles.activityValue}>{activityData?.complianceRate || 0}%</Text>
          <Text style={styles.activityLabel}>Tỷ lệ tuân thủ</Text>
        </View>
      </View>

      {/* Activity Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Hoạt động hàng ngày</Text>
        <BarChart
          data={{
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
            datasets: [
              {
                data: activityData?.dailyHours || [0, 0, 0, 0, 0, 0, 0],
              },
            ],
          }}
          width={width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>
    </View>
  );

  const renderMedicationReport = () => (
    <View style={styles.reportSection}>
      <Text style={styles.reportTitle}>Báo cáo thuốc men</Text>
      
      {/* Medication Summary */}
      <View style={styles.medicationSummary}>
        <View style={styles.medicationCard}>
          <Feather name="check-circle" size={24} color="#34C759" />
          <Text style={styles.medicationValue}>{medicationData?.complianceRate || 0}%</Text>
          <Text style={styles.medicationLabel}>Tỷ lệ uống thuốc đúng giờ</Text>
        </View>
        
        <View style={styles.medicationCard}>
          <Feather name="alert-circle" size={24} color="#FF9500" />
          <Text style={styles.medicationValue}>{medicationData?.missedDoses || 0}</Text>
          <Text style={styles.medicationLabel}>Lần quên thuốc tuần này</Text>
        </View>
      </View>

      {/* Medication Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tuân thủ thuốc theo ngày</Text>
        <BarChart
          data={{
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
            datasets: [
              {
                data: medicationData?.dailyCompliance || [0, 0, 0, 0, 0, 0, 0],
              },
            ],
          }}
          width={width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>
    </View>
  );

  const renderReportContent = () => {
    switch (selectedType) {
      case 'health':
        return renderHealthReport();
      case 'activity':
        return renderActivityReport();
      case 'medication':
        return renderMedicationReport();
      case 'overview':
      default:
        return renderOverviewReport();
    }
  };

  if (isLoading && elderlyUsers.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
      </SafeAreaView>
    );
  }

  if (!isLoading && elderlyUsers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Feather name="share-2" size={20} color="#1C1C1E" />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <Feather name="users" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>Chưa có người cao tuổi</Text>
          <Text style={styles.emptyMessage}>
            Bạn chưa được kết nối với người cao tuổi nào để xem báo cáo sức khỏe.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Feather name="share-2" size={20} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderUserSelector()}
        {renderPeriodSelector()}
        {renderReportTypeSelector()}
        {renderReportContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  userSelector: {
    marginBottom: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  userAge: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  healthStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  periodSelector: {
    marginBottom: 24,
  },
  periodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  reportTypeSelector: {
    marginBottom: 24,
  },
  reportTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  reportTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  reportTypeButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  reportTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  reportSection: {
    marginBottom: 32,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  activitySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  medicationSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  medicationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  medicationLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ReportsScreen; 