import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getElderlyInPremium, getUserData } from '../../../services/api';

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

const MonitoringScreen = () => {
  const navigation = useNavigation();
  const [elderlyUsers, setElderlyUsers] = useState<ElderlyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadElderlyUsers();
    }, [])
  );

  const loadElderlyUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Get current user ID from cache (same logic as PremiumManagementScreen)
      const userDataStr = await AsyncStorage.getItem('user');
      if (!userDataStr) {
        console.error('No user data found in cache');
        setError('Không tìm thấy thông tin người dùng');
        setElderlyUsers([]);
        return;
      }

      const userData = JSON.parse(userDataStr);
      const relativeUserId = userData.id || userData.userId;

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
      } else {
        console.log('❌ Failed to load elderly users:', result.message);
        setError(result.message || 'Không thể tải danh sách người cao tuổi');
        setElderlyUsers([]);
      }
    } catch (error) {
      console.error('❌ Error loading elderly users:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
      setElderlyUsers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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

  const handleRefresh = () => {
    loadElderlyUsers(true);
  };

  const handleElderlyPress = (elderlyUser: ElderlyUser) => {
    if (!elderlyUser.private_key) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin sức khỏe của người dùng này');
      return;
    }

    // Navigate to health chart with the elderly user's private key
    (navigation as any).navigate('ElderlyHealthChart', {
      elderlyUser,
      privateKey: elderlyUser.private_key,
    });
  };

  const getHealthStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return '#34C759';
      case 'warning':
        return '#FF9500';
      case 'critical':
        return '#FF3B30';
      default:
        return '#34C759';
    }
  };

  const getHealthStatusText = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'Tốt';
      case 'warning':
        return 'Cần chú ý';
      case 'critical':
        return 'Cần can thiệp';
      default:
        return 'Tốt';
    }
  };

  const getAvatarText = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatLastHealthCheck = (dateString?: string) => {
    if (!dateString) return 'Chưa có dữ liệu';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Vừa xong';
      } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} ngày trước`;
      }
    } catch (error) {
      return 'Không xác định';
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender?.toLowerCase()) {
      case 'male':
      case 'nam':
        return '👨';
      case 'female':
      case 'nữ':
        return '👩';
      default:
        return '👤';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Theo dõi sức khỏe</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Theo dõi sức khỏe</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadElderlyUsers()}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : elderlyUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="users" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Chưa có người cao tuổi</Text>
            <Text style={styles.emptyMessage}>
              Bạn chưa được kết nối với người cao tuổi nào để theo dõi sức khỏe.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Tổng quan</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{elderlyUsers.length}</Text>
                  <Text style={styles.statLabel}>Người cao tuổi</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {elderlyUsers.filter(u => u.healthStatus === 'good').length}
                  </Text>
                  <Text style={styles.statLabel}>Sức khỏe tốt</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {elderlyUsers.filter(u => u.healthStatus === 'warning').length}
                  </Text>
                  <Text style={styles.statLabel}>Cần chú ý</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {elderlyUsers.filter(u => u.healthStatus === 'critical').length}
                  </Text>
                  <Text style={styles.statLabel}>Cần can thiệp</Text>
                </View>
              </View>
            </View>

            <View style={styles.elderlyList}>
              <Text style={styles.sectionTitle}>Danh sách người cao tuổi</Text>
              {elderlyUsers.map((elderlyUser, index) => (
                <TouchableOpacity
                  key={elderlyUser.userId}
                  style={styles.elderlyCard}
                  onPress={() => handleElderlyPress(elderlyUser)}
                  activeOpacity={0.8}
                >
                  <View style={styles.elderlyInfo}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {getAvatarText(elderlyUser.userName)}
                      </Text>
                    </View>
                    <View style={styles.elderlyDetails}>
                      <View style={styles.nameRow}>
                        <Text style={styles.elderlyName}>{elderlyUser.userName}</Text>
                        <Text style={styles.genderIcon}>{getGenderIcon(elderlyUser.gender)}</Text>
                      </View>
                      <Text style={styles.elderlyAge}>{elderlyUser.age} tuổi</Text>
                      <Text style={styles.elderlyPhone}>{elderlyUser.phone}</Text>
                      <Text style={styles.lastHealthCheck}>
                        Kiểm tra cuối: {formatLastHealthCheck(elderlyUser.lastHealthCheck)}
                      </Text>
                    </View>
                    <View style={styles.healthStatusContainer}>
                      <View 
                        style={[
                          styles.healthStatusIndicator,
                          { backgroundColor: getHealthStatusColor(elderlyUser.healthStatus || 'good') }
                        ]}
                      />
                      <Text style={styles.healthStatusText}>
                        {getHealthStatusText(elderlyUser.healthStatus || 'good')}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Health Data Preview */}
                  {(elderlyUser.bloodPressure || elderlyUser.heartRate) && (
                    <View style={styles.healthPreview}>
                      {elderlyUser.bloodPressure && (
                        <View style={styles.healthDataItem}>
                          <Feather name="activity" size={14} color="#FF3B30" />
                          <Text style={styles.healthDataText}>
                            {elderlyUser.bloodPressure.systolic}/{elderlyUser.bloodPressure.diastolic} mmHg
                          </Text>
                        </View>
                      )}
                      {elderlyUser.heartRate && (
                        <View style={styles.healthDataItem}>
                          <Feather name="heart" size={14} color="#FF3B30" />
                          <Text style={styles.healthDataText}>
                            {elderlyUser.heartRate} bpm
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.viewChartText}>Xem biểu đồ sức khỏe</Text>
                    <Feather name="chevron-right" size={16} color="#007AFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },
  elderlyList: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  elderlyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  elderlyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  elderlyDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  elderlyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  genderIcon: {
    fontSize: 16,
  },
  elderlyAge: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  elderlyPhone: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  lastHealthCheck: {
    fontSize: 12,
    color: '#8E8E93',
  },
  healthStatusContainer: {
    alignItems: 'center',
  },
  healthStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  healthStatusText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  healthPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  healthDataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthDataText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewChartText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default MonitoringScreen; 