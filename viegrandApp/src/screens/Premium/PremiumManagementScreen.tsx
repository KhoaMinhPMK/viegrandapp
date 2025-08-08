import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPremiumSubscription, addElderlyToPremium } from '../../services/api';

interface PremiumSubscriptionData {
  hasSubscription: boolean;
  isActive: boolean;
  subscription?: {
    premiumKey: string;
    startDate: string;
    endDate: string;
    status: string;
    daysRemaining: number;
    elderlyKeys: string[];
    note: string;
  };
  user: {
    name: string;
    email: string;
    youngPersonKey: string;
  };
}

const PremiumManagementScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<PremiumSubscriptionData | null>(null);
  const [elderlyPrivateKey, setElderlyPrivateKey] = useState('');
  const [isAddingElderly, setIsAddingElderly] = useState(false);

  // Load premium subscription details
  const loadPremiumSubscription = async () => {
    try {
      setLoading(true);
      
      // Get user email from cache
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (!userEmail) {
        console.log('No email found in cache');
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }

      // Fetch premium subscription details from API
      const result = await getPremiumSubscription(userEmail);
      
      if (result.success && result.data) {
        setSubscriptionData(result.data);
      } else {
        console.error('Failed to load premium subscription:', result.message);
        Alert.alert('Lỗi', result.message || 'Không thể tải thông tin Premium');
      }
    } catch (error) {
      console.error('Error loading premium subscription:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin Premium');
    } finally {
      setLoading(false);
    }
  };

  // Reload data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadPremiumSubscription();
    }, [])
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
    // Clipboard functionality temporarily disabled
    Alert.alert(
      'Thông tin',
      `${label}: ${text}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const addElderlyUser = async () => {
    if (!elderlyPrivateKey.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã người dùng của người thân');
      return;
    }

    if (!subscriptionData) {
      Alert.alert('Lỗi', 'Không thể tìm thấy thông tin subscription');
      return;
    }

    try {
      setIsAddingElderly(true);
      
      // Get current user ID from cache
      const userDataStr = await AsyncStorage.getItem('user');
      if (!userDataStr) {
        Alert.alert('Lỗi', 'Không thể tìm thấy thông tin người dùng');
        return;
      }
      
      const userData = JSON.parse(userDataStr);
      const result = await addElderlyToPremium(userData.userId, elderlyPrivateKey.trim());
      
      if (result.success) {
        Alert.alert(
          'Thành công!',
          `Đã thêm ${result.data?.elderly_user} vào gói Premium.\nTổng số người thân: ${result.data?.elderly_count}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setElderlyPrivateKey('');
                loadPremiumSubscription(); // Refresh subscription data
              }
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể thêm người thân vào gói Premium');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi thêm người thân');
    } finally {
      setIsAddingElderly(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {subscriptionData ? (
          <View style={styles.subscriptionContainer}>
            {/* User Info Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="user" size={20} color="#007AFF" />
                <Text style={styles.cardTitle}>Thông tin người dùng</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tên:</Text>
                  <Text style={styles.infoValue}>{subscriptionData.user.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(subscriptionData.user.email, 'Email')}>
                    <Text style={[styles.infoValue, styles.copyableValue]}>{subscriptionData.user.email}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mã người dùng:</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(subscriptionData.user.youngPersonKey, 'Mã người dùng')}>
                    <Text style={[styles.infoValue, styles.copyableValue]}>{subscriptionData.user.youngPersonKey}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Subscription Status Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather 
                  name={subscriptionData.isActive ? "check-circle" : "x-circle"} 
                  size={20} 
                  color={subscriptionData.isActive ? "#32CD32" : "#FF3B30"} 
                />
                <Text style={styles.cardTitle}>Trạng thái Premium</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.statusText,
                    subscriptionData.isActive ? styles.activeStatus : styles.inactiveStatus
                  ]}>
                    {subscriptionData.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Subscription Details Card */}
            {subscriptionData.hasSubscription && subscriptionData.subscription ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Feather name="star" size={20} color="#FFD700" />
                  <Text style={styles.cardTitle}>Chi tiết gói Premium</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã Premium:</Text>
                    <TouchableOpacity onPress={() => subscriptionData.subscription && copyToClipboard(subscriptionData.subscription.premiumKey, 'Mã Premium')}>
                      <Text style={[styles.infoValue, styles.copyableValue]}>{subscriptionData.subscription?.premiumKey}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
                    <Text style={styles.infoValue}>{formatDate(subscriptionData.subscription.startDate)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày kết thúc:</Text>
                    <Text style={styles.infoValue}>{formatDate(subscriptionData.subscription.endDate)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Số ngày còn lại:</Text>
                    <Text style={[
                      styles.infoValue,
                      subscriptionData.subscription.daysRemaining > 0 ? styles.positiveValue : styles.negativeValue
                    ]}>
                      {subscriptionData.subscription.daysRemaining} ngày
                    </Text>
                  </View>
                  {subscriptionData.subscription.elderlyKeys.length > 0 && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Người thân được bảo hiểm:</Text>
                      <Text style={styles.infoValue}>{subscriptionData.subscription.elderlyKeys.length} người</Text>
                    </View>
                  )}
                  {subscriptionData.subscription.note && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Ghi chú:</Text>
                      <Text style={styles.infoValue}>{subscriptionData.subscription.note}</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.emptyState}>
                    <Feather name="info" size={32} color="#C7C7CC" />
                    <Text style={styles.emptyTitle}>Chưa có gói Premium</Text>
                    <Text style={styles.emptySubtitle}>
                      Bạn chưa đăng ký gói Premium nào
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Elderly Keys List */}
            {subscriptionData.hasSubscription && subscriptionData.subscription && subscriptionData.subscription.elderlyKeys.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Feather name="users" size={20} color="#32CD32" />
                  <Text style={styles.cardTitle}>Danh sách mã người thân</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.elderlyDescription}>
                    Các mã người thân trong gói Premium ({subscriptionData.subscription.elderlyKeys.length} người):
                  </Text>
                  {subscriptionData.subscription.elderlyKeys.map((elderlyKey, index) => (
                    <View key={index} style={styles.elderlyKeyItem}>
                      <Text style={styles.elderlyKeyNumber}>{index + 1}.</Text>
                      <TouchableOpacity 
                        style={styles.elderlyKeyContainer}
                        onPress={() => copyToClipboard(elderlyKey, `Mã người thân ${index + 1}`)}
                      >
                        <Text style={styles.elderlyKeyText}>{elderlyKey}</Text>
                      </TouchableOpacity>
                      <Feather name="user-check" size={16} color="#32CD32" />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Add Elderly User Card */}
            {subscriptionData.hasSubscription && subscriptionData.isActive && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Feather name="user-plus" size={20} color="#007AFF" />
                  <Text style={styles.cardTitle}>Thêm người thân</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.addElderlyDescription}>
                    Nhập mã người dùng của người thân để thêm vào gói Premium
                  </Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Nhập mã người dùng của người thân"
                      value={elderlyPrivateKey}
                      onChangeText={setElderlyPrivateKey}
                      editable={!isAddingElderly}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.addButton, isAddingElderly && styles.addButtonDisabled]}
                    onPress={addElderlyUser}
                    disabled={isAddingElderly}
                  >
                    {isAddingElderly ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Feather name="plus" size={16} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Thêm người thân</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="alert-circle" size={48} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Không có dữ liệu</Text>
            <Text style={styles.emptySubtitle}>
              Không thể tải thông tin Premium
            </Text>
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
  subscriptionContainer: {
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
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
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
  addElderlyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1D1F',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  elderlyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  elderlyKeyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  elderlyKeyNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginRight: 12,
    minWidth: 20,
  },
  elderlyKeyContainer: {
    flex: 1,
    marginRight: 12,
  },
  elderlyKeyText: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'monospace',
    textDecorationLine: 'underline',
  },
});

export default PremiumManagementScreen;
