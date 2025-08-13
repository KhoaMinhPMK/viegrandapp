import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import { getElderlyPremiumInfo } from '../../../services/api';

interface ElderlyPremiumData {
  hasSubscription: boolean;
  isActive: boolean;
  subscription?: {
    premiumKey: string;
    startDate: string;
    endDate: string;
    status: string;
    daysRemaining: number;
    note: string;
    elderlyCount: number;
  };
  elderly: {
    userId: number;
    userName: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    private_key: string;
  };
  relative?: {
    userId: number;
    userName: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    private_key: string;
  };
  allElderlyUsers?: Array<{
    userId: number;
    userName: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    private_key: string;
  }>;
}

const ElderlyPremiumInfoScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [premiumData, setPremiumData] = useState<ElderlyPremiumData | null>(null);
  const [userPrivateKey, setUserPrivateKey] = useState<string>('');

  // Load user private key from storage
  useEffect(() => {
    const loadUserPrivateKey = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const privateKey = user.privateKey || user.private_key || '';
          setUserPrivateKey(privateKey);
        }
      } catch (error) {
        console.error('Error loading user private key:', error);
      }
    };
    loadUserPrivateKey();
  }, []);

  // Load premium information
  const loadPremiumInfo = async () => {
    if (!userPrivateKey) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getElderlyPremiumInfo(userPrivateKey);
      
      if (result.success && result.data) {
        setPremiumData(result.data);
      } else {
        console.error('Failed to load premium info:', result.message);
        Alert.alert('Lỗi', result.message || 'Không thể tải thông tin Premium');
      }
    } catch (error) {
      console.error('Error loading premium info:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  // Reload data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadPremiumInfo();
    }, [userPrivateKey])
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Alert.alert('Thông tin', `${label}: ${text}`, [{ text: 'OK', style: 'default' }]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#0D4C92" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin Premium</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D4C92" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#0D4C92" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin Premium</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {premiumData ? (
          <View style={styles.infoContainer}>
            {/* Elderly Info Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="user" size={20} color="#0D4C92" />
                <Text style={styles.cardTitle}>Thông tin của bạn</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tên:</Text>
                  <Text style={styles.infoValue}>{premiumData.elderly.userName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(premiumData.elderly.email, 'Email')}>
                    <Text style={[styles.infoValue, styles.copyableValue]}>{premiumData.elderly.email}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số điện thoại:</Text>
                  <Text style={styles.infoValue}>{premiumData.elderly.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tuổi:</Text>
                  <Text style={styles.infoValue}>{premiumData.elderly.age} tuổi</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Giới tính:</Text>
                  <Text style={styles.infoValue}>{premiumData.elderly.gender}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mã người dùng:</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(premiumData.elderly.private_key, 'Mã người dùng')}>
                    <Text style={[styles.infoValue, styles.copyableValue]}>{premiumData.elderly.private_key}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Premium Status Card */}
            {premiumData.hasSubscription ? (
              <>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Feather name={premiumData.isActive ? "check-circle" : "x-circle"} size={20} color={premiumData.isActive ? "#32CD32" : "#FF3B30"} />
                    <Text style={styles.cardTitle}>Trạng thái Premium</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.statusContainer}>
                      <Text
                        style={[
                          styles.statusText,
                          premiumData.isActive ? styles.activeStatus : styles.inactiveStatus,
                        ]}
                      >
                        {premiumData.isActive ? 'Đang hoạt động' : 'Đã hết hạn'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Premium Details Card */}
                {premiumData.subscription && (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Feather name="star" size={20} color="#FFD700" />
                      <Text style={styles.cardTitle}>Chi tiết gói Premium</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mã Premium:</Text>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(premiumData.subscription!.premiumKey, 'Mã Premium')}
                        >
                          <Text style={[styles.infoValue, styles.copyableValue]}>
                            {premiumData.subscription.premiumKey}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
                        <Text style={styles.infoValue}>{formatDate(premiumData.subscription.startDate)}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày kết thúc:</Text>
                        <Text style={styles.infoValue}>{formatDate(premiumData.subscription.endDate)}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số ngày còn lại:</Text>
                        <Text
                          style={[
                            styles.infoValue,
                            premiumData.subscription.daysRemaining > 0
                              ? styles.positiveValue
                              : styles.negativeValue,
                          ]}
                        >
                          {premiumData.subscription.daysRemaining} ngày
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số người thân:</Text>
                        <Text style={styles.infoValue}>
                          {premiumData.subscription.elderlyCount} người
                        </Text>
                      </View>
                      {premiumData.subscription.note && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Ghi chú:</Text>
                          <Text style={styles.infoValue}>{premiumData.subscription.note}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Relative Info Card */}
                {premiumData.relative && (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Feather name="users" size={20} color="#1E88E5" />
                      <Text style={styles.cardTitle}>Người thân chăm sóc</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tên:</Text>
                        <Text style={styles.infoValue}>{premiumData.relative.userName}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <TouchableOpacity onPress={() => copyToClipboard(premiumData.relative!.email, 'Email người thân')}>
                          <Text style={[styles.infoValue, styles.copyableValue]}>{premiumData.relative.email}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số điện thoại:</Text>
                        <Text style={styles.infoValue}>{premiumData.relative.phone}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tuổi:</Text>
                        <Text style={styles.infoValue}>{premiumData.relative.age} tuổi</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Giới tính:</Text>
                        <Text style={styles.infoValue}>{premiumData.relative.gender}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.emptyState}>
                    <Feather name="info" size={48} color="#C7C7CC" />
                    <Text style={styles.emptyTitle}>Chưa có gói Premium</Text>
                    <Text style={styles.emptySubtitle}>
                      Bạn chưa được thêm vào gói Premium nào. Hãy liên hệ với người thân để được thêm vào gói Premium.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="alert-circle" size={48} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Không có dữ liệu</Text>
            <Text style={styles.emptySubtitle}>Không thể tải thông tin Premium</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C7C7CC',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  placeholder: {
    width: 40,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1D1D1F',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  copyableValue: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  activeStatus: {
    backgroundColor: '#E8F5E8',
    color: '#32CD32',
  },
  inactiveStatus: {
    backgroundColor: '#FFE8E8',
    color: '#FF3B30',
  },
  positiveValue: {
    color: '#32CD32',
  },
  negativeValue: {
    color: '#FF3B30',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});

export default ElderlyPremiumInfoScreen; 