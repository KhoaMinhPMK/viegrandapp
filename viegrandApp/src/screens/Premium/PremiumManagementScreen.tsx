import React, { useState, useEffect, useCallback } from 'react';
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
  ImageBackground,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPremiumSubscription, addElderlyToPremium, getElderlyInPremium, autoFriendProcess } from '../../services/api';

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

interface ElderlyUser {
  userId: number;
  userName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  private_key: string;
}

const PremiumManagementScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<PremiumSubscriptionData | null>(null);
  const [elderlyUsers, setElderlyUsers] = useState<ElderlyUser[]>([]);
  const [loadingElderly, setLoadingElderly] = useState(false);
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

  // Load elderly users in premium subscription
  const loadElderlyUsers = async () => {
    try {
      setLoadingElderly(true);
      
      // Get current user ID from cache
      const userDataStr = await AsyncStorage.getItem('user');
      if (!userDataStr) {
        console.error('No user data found in cache');
        setElderlyUsers([]);
        return;
      }
      
      const userData = JSON.parse(userDataStr);
      
      // Check if user has premium subscription first
      if (!subscriptionData?.hasSubscription || !subscriptionData?.isActive) {
        console.log('User does not have active premium subscription');
        setElderlyUsers([]);
        return;
      }
      
      const result = await getElderlyInPremium(userData.id || userData.userId);
      
      if (result.success && result.data) {
        setElderlyUsers(result.data);
      } else {
        console.error('Failed to load elderly users:', result.message);
        // Don't show error alert for "User not found or does not have premium status"
        // as this is expected for users without premium
        if (result.message && !result.message.includes('User not found or does not have premium status')) {
          Alert.alert('Lỗi', result.message || 'Không thể tải danh sách người thân');
        }
        setElderlyUsers([]);
      }
    } catch (error) {
      console.error('Error loading elderly users:', error);
      setElderlyUsers([]);
    } finally {
      setLoadingElderly(false);
    }
  };

  // Reload data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadPremiumSubscription();
    }, [])
  );

  // Load elderly users when subscription data changes
  React.useEffect(() => {
    if (subscriptionData) {
      loadElderlyUsers();
    }
  }, [subscriptionData]);

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
      
      // Step 1: Add elderly to premium subscription
      const result = await addElderlyToPremium(userData.id || userData.userId, elderlyPrivateKey.trim());
      
      if (result.success) {
        console.log('✅ Premium subscription updated successfully');
        
        // Step 2: Auto friend process
        console.log('🔄 Starting auto friend process...');
        const autoFriendResult = await autoFriendProcess(userData.phone, elderlyPrivateKey.trim());
        
        if (autoFriendResult.success) {
          console.log('✅ Auto friend process completed successfully');
          
          // Enhanced success message
          const successMessage = autoFriendResult.data?.friendship_created 
            ? `Đã thêm ${result.data?.elderly_user} vào gói Premium.\n\n✅ Tự động kết bạn thành công\n✅ Có thể nhắn tin ngay\n✅ Theo dõi sức khỏe\n\nTổng số người thân: ${result.data?.elderly_count}`
            : `Đã thêm ${result.data?.elderly_user} vào gói Premium.\n\n✅ Đã là bạn bè trước đó\n✅ Có thể nhắn tin ngay\n✅ Theo dõi sức khỏe\n\nTổng số người thân: ${result.data?.elderly_count}`;
          
          Alert.alert(
            'Thành công!',
            successMessage,
            [
              {
                text: 'Tuyệt vời!',
                onPress: () => {
                  setElderlyPrivateKey('');
                  loadPremiumSubscription(); // Refresh subscription data
                  loadElderlyUsers(); // Refresh elderly users list
                }
              }
            ]
          );
        } else {
          console.log('⚠️ Auto friend process failed:', autoFriendResult.message);
          
          // Still show success for premium addition, but mention friend issue
          Alert.alert(
            'Thành công một phần!',
            `Đã thêm ${result.data?.elderly_user} vào gói Premium.\n\n⚠️ Lưu ý: Có thể cần kết bạn thủ công để nhắn tin.\n\nTổng số người thân: ${result.data?.elderly_count}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setElderlyPrivateKey('');
                  loadPremiumSubscription(); // Refresh subscription data
                  loadElderlyUsers(); // Refresh elderly users list
                }
              }
            ]
          );
        }
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể thêm người thân vào gói Premium');
      }
    } catch (error) {
      console.error('Error adding elderly user:', error);
      Alert.alert('Lỗi', 'Không thể thêm người thân vào gói Premium');
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

            {/* Elderly Users List Card */}
            {subscriptionData.hasSubscription && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Feather name="users" size={20} color="#32CD32" />
                  <Text style={styles.cardTitle}>Danh sách người thân</Text>
                </View>
                <View style={styles.cardContent}>
                  {loadingElderly ? (
                    <View style={styles.elderlyLoadingContainer}>
                      <ActivityIndicator size="small" color="#007AFF" />
                      <Text style={styles.elderlyLoadingText}>Đang tải danh sách...</Text>
                    </View>
                  ) : elderlyUsers.length > 0 ? (
                    <>
                      <Text style={styles.elderlyDescription}>
                        Những người thân đang được bảo hiểm trong gói Premium:
                      </Text>
                      {elderlyUsers.map((elderly, index) => (
                        <View key={elderly.userId} style={styles.elderlyItem}>
                          <View style={styles.elderlyInfo}>
                            <Text style={styles.elderlyName}>{elderly.userName}</Text>
                            <Text style={styles.elderlyDetails}>
                              {elderly.age} tuổi • {elderly.gender === 'male' ? 'Nam' : 'Nữ'}
                            </Text>
                            <TouchableOpacity onPress={() => copyToClipboard(elderly.private_key, 'Mã người dùng')}>
                              <Text style={styles.elderlyKey}>{elderly.private_key}</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.elderlyIcon}>
                            <Feather name="user-check" size={20} color="#32CD32" />
                          </View>
                        </View>
                      ))}
                    </>
                  ) : (
                    <View style={styles.emptyElderlyState}>
                      <Feather name="user-x" size={32} color="#C7C7CC" />
                      <Text style={styles.emptyElderlyTitle}>Chưa có người thân nào</Text>
                      <Text style={styles.emptyElderlySubtitle}>
                        Thêm người thân để họ được bảo hiểm bởi gói Premium
                      </Text>
                    </View>
                  )}
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
  elderlyLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  elderlyLoadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
  elderlyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  elderlyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  elderlyInfo: {
    flex: 1,
  },
  elderlyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  elderlyDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  elderlyKey: {
    fontSize: 12,
    color: '#007AFF',
    fontFamily: 'monospace',
    textDecorationLine: 'underline',
  },
  elderlyIcon: {
    marginLeft: 12,
  },
  emptyElderlyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyElderlyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyElderlySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});

export default PremiumManagementScreen;
