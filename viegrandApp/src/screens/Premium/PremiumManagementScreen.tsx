import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import { getPremiumSubscription, addElderlyToPremium, getElderlyInPremium, removeElderlyFromPremium, autoFriendProcess, getUserData } from '../../services/api';
// QR detect from image
import RNQRGenerator from 'rn-qr-generator';
import {launchImageLibrary, launchCamera, ImageLibraryOptions, CameraOptions} from 'react-native-image-picker';

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
  const [elderlyPrivateKey, setElderlyPrivateKey] = useState('');
  const [isAddingElderly, setIsAddingElderly] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    elderlyName: string;
    elderlyCount: number;
    friendshipCreated: boolean;
    message: string;
  } | null>(null);
  const [loadingElderly, setLoadingElderly] = useState(false);
  const [elderlyUsers, setElderlyUsers] = useState<ElderlyUser[]>([]);
  const [removingElderly, setRemovingElderly] = useState<string | null>(null);
  // Remove live scanner; use image-based detection

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
        // Avoid noisy alert for expected message
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
    if (subscriptionData) loadElderlyUsers();
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
    Alert.alert('Thông tin', `${label}: ${text}`, [{ text: 'OK', style: 'default' }]);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    setElderlyPrivateKey('');
    loadPremiumSubscription();
    loadElderlyUsers();
  };

  // Remove elderly user from premium subscription
  const removeElderlyUser = async (elderlyPrivateKey: string) => {
    try {
      setRemovingElderly(elderlyPrivateKey);

      // Get current user ID from cache
      const userDataStr = await AsyncStorage.getItem('user');
      if (!userDataStr) {
        Alert.alert('Lỗi', 'Không thể tìm thấy thông tin người dùng');
        return;
      }

      const userData = JSON.parse(userDataStr);

      const result = await removeElderlyFromPremium(userData.id || userData.userId, elderlyPrivateKey);

      if (result.success) {
        console.log('✅ Elderly user removed successfully');
        Alert.alert(
          'Thành công', 
          `Đã xóa người thân khỏi gói Premium.\n\nTổng số người thân: ${result.data?.elderly_count || 0}`, 
          [
            {
              text: 'OK',
              onPress: () => {
                loadPremiumSubscription();
                loadElderlyUsers();
              },
            },
          ]
        );
      } else {
        console.log('❌ Failed to remove elderly user:', result.message);
        Alert.alert('Lỗi', result.message || 'Không thể xóa người thân khỏi gói Premium');
      }
    } catch (error) {
      console.error('Error removing elderly user:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    } finally {
      setRemovingElderly(null);
    }
  };

  // Custom Success Modal Component
  const SuccessModal = ({
    visible,
    data,
    onClose,
  }: {
    visible: boolean;
    data: {
      elderlyName: string;
      elderlyCount: number;
      friendshipCreated: boolean;
      message: string;
    } | null;
    onClose: () => void;
  }) => {
    if (!data) return null;

    return (
      <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Text style={{ fontSize: 32, color: '#FFFFFF' }}>✔️</Text>
              </View>
            </View>

            <Text style={styles.modalTitle}>Thành công!</Text>

            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>Đã thêm {data.elderlyName} vào gói Premium</Text>

              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Text style={{ fontSize: 20, color: '#4CAF50' }}>✅</Text>
                  <Text style={styles.featureText}>
                    {data.friendshipCreated ? 'Tự động kết bạn thành công' : 'Đã là bạn bè trước đó'}
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <Text style={{ fontSize: 20, color: '#4CAF50' }}>💬</Text>
                  <Text style={styles.featureText}>Có thể nhắn tin ngay</Text>
                </View>

                <View style={styles.featureItem}>
                  <Text style={{ fontSize: 20, color: '#4CAF50' }}>❤️</Text>
                  <Text style={styles.featureText}>Theo dõi sức khỏe</Text>
                </View>
              </View>

              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>Tổng số người thân: {data.elderlyCount}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Tuyệt vời!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Refactor: add optional key param to reuse for QR flow
  const addElderlyUser = async (scannedKey?: string) => {
    const keyToUse = (scannedKey ?? elderlyPrivateKey).trim();

    if (!keyToUse) {
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

      // Get user's phone number from API
      const userDataResult = await getUserData(userData.email);
      if (!userDataResult.success || !userDataResult.user?.phone) {
        Alert.alert('Lỗi', 'Không thể lấy số điện thoại người dùng');
        return;
      }

      const relativePhone = userDataResult.user.phone;
      console.log('✅ Relative phone number:', relativePhone);

      // Step 1: Add elderly to premium subscription
      const result = await addElderlyToPremium(userData.id || userData.userId, keyToUse);

      if (result.success) {
        console.log('✅ Premium subscription updated successfully');

        // Step 2: Auto friend process
        console.log('🔄 Starting auto friend process...');
        const autoFriendResult = await autoFriendProcess(relativePhone, keyToUse);

        if (autoFriendResult.success) {
          console.log('✅ Auto friend process completed successfully');

          // Set success data for modal
          setSuccessData({
            elderlyName: result.data?.elderly_user || 'Người thân',
            elderlyCount: result.data?.elderly_count || 0,
            friendshipCreated: autoFriendResult.data?.friendship_created || false,
            message: autoFriendResult.message || 'Tự động kết bạn thành công',
          });

          // Show success modal
          setShowSuccessModal(true);
        } else {
          console.log('⚠️ Auto friend process failed:', autoFriendResult.message);

          // Still show success for premium addition, but mention friend issue
          Alert.alert('Thành công một phần!', `Đã thêm ${result.data?.elderly_user} vào gói Premium.\n\n⚠️ Lưu ý: Có thể cần kết bạn thủ công để nhắn tin.\n\nTổng số người thân: ${result.data?.elderly_count}`, [
            {
              text: 'OK',
              onPress: () => {
                setElderlyPrivateKey('');
                loadPremiumSubscription();
                loadElderlyUsers();
              },
            },
          ]);
        }
      } else {
        // Check if it's the specific error about elderly already in another family
        if (result.message && result.message.includes('đã thuộc về gia đình khác')) {
          Alert.alert(
            'Không thể thêm người thân', 
            result.message,
            [{ text: 'OK', style: 'default' }]
          );
        } else {
          Alert.alert('Lỗi', result.message || 'Không thể thêm người thân vào gói Premium');
        }
      }
    } catch (error) {
      console.error('Error adding elderly user:', error);
      Alert.alert('Lỗi', 'Không thể thêm người thân vào gói Premium');
    } finally {
      setIsAddingElderly(false);
    }
  };

  // --- QR Scan helpers ---
  function extractPrivateKey(raw: string): string | null {
    if (!raw) return null;
    const text = String(raw).trim();
    // Try parse JSON payloads
    try {
      const obj = JSON.parse(text);
      const candidate = obj.privateKey || obj.private_key || obj.key || obj.id;
      if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate.trim();
    } catch { }
    // Fallback: assume raw string IS the key
    if (text.length > 0) return text;
    return null;
  }

  async function detectQRFromUri(uri?: string, base64?: string) {
    try {
      const res = await RNQRGenerator.detect({ uri: uri as any, base64: base64 as any });
      const values: string[] = res?.values || [];
      if (!values.length) {
        Alert.alert('Không tìm thấy QR', 'Ảnh không chứa mã QR hợp lệ.');
        return;
      }
      // Pick first value
      const key = extractPrivateKey(values[0]);
      if (!key) {
        Alert.alert('Lỗi', 'QR không chứa private key hợp lệ.');
        return;
      }
      setElderlyPrivateKey(key);
      setTimeout(() => addElderlyUser(key), 150);
    } catch (err) {
      console.error('QR detect error:', err);
      Alert.alert('Lỗi', 'Không thể đọc mã QR từ ảnh.');
    }
  }

  async function pickImageAndDetectQR() {
    const options: ImageLibraryOptions = { mediaType: 'photo', quality: 0.8, includeBase64: false, selectionLimit: 1 };
    const result = await launchImageLibrary(options);
    if (result.didCancel) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    await detectQRFromUri(asset.uri || undefined, undefined);
  }

  async function captureImageAndDetectQR() {
    const options: CameraOptions = { mediaType: 'photo', quality: 0.8, includeBase64: false, saveToPhotos: false };
    const result = await launchCamera(options);
    if (result.didCancel) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    await detectQRFromUri(asset.uri || undefined, undefined);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 24, color: '#007AFF' }}>←</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: '#007AFF' }}>←</Text>
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
                <Text style={{ fontSize: 20, color: '#007AFF' }}>👤</Text>
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
                <Text style={{ fontSize: 20, color: subscriptionData.isActive ? '#32CD32' : '#FF3B30' }}>
                  {subscriptionData.isActive ? '✅' : '❌'}
                </Text>
                <Text style={styles.cardTitle}>Trạng thái Premium</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.statusContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      subscriptionData.isActive ? styles.activeStatus : styles.inactiveStatus,
                    ]}
                  >
                    {subscriptionData.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Subscription Details Card */}
            {subscriptionData.hasSubscription && subscriptionData.subscription ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={{ fontSize: 20, color: '#FFD700' }}>⭐</Text>
                  <Text style={styles.cardTitle}>Chi tiết gói Premium</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã Premium:</Text>
                    <TouchableOpacity
                      onPress={() =>
                        subscriptionData.subscription &&
                        copyToClipboard(subscriptionData.subscription.premiumKey, 'Mã Premium')
                      }
                    >
                      <Text style={[styles.infoValue, styles.copyableValue]}>
                        {subscriptionData.subscription?.premiumKey}
                      </Text>
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
                    <Text
                      style={[
                        styles.infoValue,
                        subscriptionData.subscription.daysRemaining > 0
                          ? styles.positiveValue
                          : styles.negativeValue,
                      ]}
                    >
                      {subscriptionData.subscription.daysRemaining} ngày
                    </Text>
                  </View>
                  {subscriptionData.subscription.elderlyKeys.length > 0 && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Người thân được bảo hiểm:</Text>
                      <Text style={styles.infoValue}>
                        {subscriptionData.subscription.elderlyKeys.length} người
                      </Text>
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
                    <Text style={{ fontSize: 32, color: '#C7C7CC' }}>⚠️</Text>
                    <Text style={styles.emptyTitle}>Chưa có gói Premium</Text>
                    <Text style={styles.emptySubtitle}>Bạn chưa đăng ký gói Premium nào</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Elderly Keys List */}
            {subscriptionData.hasSubscription && subscriptionData.subscription &&
              subscriptionData.subscription.elderlyKeys.length > 0 && (
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
                        <View style={styles.elderlyKeyActions}>
                          <Feather name="user-check" size={16} color="#32CD32" />
                          <TouchableOpacity
                            style={[
                              styles.removeButton,
                              removingElderly === elderlyKey && styles.removeButtonDisabled
                            ]}
                            onPress={() => {
                              Alert.alert(
                                'Xác nhận xóa',
                                'Bạn có chắc chắn muốn xóa người thân này khỏi gói Premium?',
                                [
                                  { text: 'Hủy', style: 'cancel' },
                                  { 
                                    text: 'Xóa', 
                                    style: 'destructive',
                                    onPress: () => removeElderlyUser(elderlyKey)
                                  }
                                ]
                              );
                            }}
                            disabled={removingElderly === elderlyKey}
                          >
                            {removingElderly === elderlyKey ? (
                              <ActivityIndicator size="small" color="#FF3B30" />
                            ) : (
                              <Feather name="trash-2" size={16} color="#FF3B30" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

            {/* Add Elderly User Card */}
            {subscriptionData.hasSubscription && subscriptionData.isActive && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={{ fontSize: 20, color: '#007AFF' }}>👥</Text>
                  <Text style={styles.cardTitle}>Thêm người thân</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.addElderlyDescription}>
                    Nhập mã người dùng của người thân hoặc chọn/chụp ảnh QR để thêm vào gói Premium
                  </Text>
                  <View style={styles.inputContainerFull}>
                    <TextInput
                      style={[styles.textInput, styles.textInputFull]}
                      placeholder="Nhập mã người dùng của người thân"
                      value={elderlyPrivateKey}
                      onChangeText={setElderlyPrivateKey}
                      editable={!isAddingElderly}
                      multiline={false}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={() => addElderlyUser()}
                    />
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.scanButton, { flex: 1 }]} onPress={pickImageAndDetectQR} disabled={isAddingElderly}>
                      <Feather name="image" size={18} color="#FFFFFF" />
                      <Text style={styles.scanButtonText}>Chọn ảnh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.scanButtonAlt, { flex: 1 }]} onPress={captureImageAndDetectQR} disabled={isAddingElderly}>
                      <Feather name="camera" size={18} color="#FFFFFF" />
                      <Text style={styles.scanButtonText}>Chụp ảnh</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.addButton, isAddingElderly && styles.addButtonDisabled]}
                    onPress={() => addElderlyUser()}
                    disabled={isAddingElderly}
                  >
                    {isAddingElderly ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={{ fontSize: 16, color: '#FFFFFF' }}>＋</Text>
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
            <Text style={{ fontSize: 48, color: '#C7C7CC' }}>⚠️</Text>
            <Text style={styles.emptyTitle}>Không có dữ liệu</Text>
            <Text style={styles.emptySubtitle}>Không thể tải thông tin Premium</Text>
          </View>
        )}
      </ScrollView>
      <SuccessModal visible={showSuccessModal} data={successData} onClose={handleModalClose} />
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
    flex: 1,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanButtonAlt: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
  elderlyKeyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FFE8E8',
  },
  removeButtonDisabled: {
    opacity: 0.5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#1D1D1F',
    marginLeft: 10,
  },
  summaryContainer: {
    width: '100%',
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Scanner modal styles
  scannerOverlay: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scannerClose: {
    padding: 6,
  },
  scannerContainer: {
    flex: 1,
  },
  scannerTop: {
    flex: 0,
    alignItems: 'center',
    paddingVertical: 12,
  },
  scannerBottom: {
    flex: 0,
    alignItems: 'center',
    paddingVertical: 20,
  },
  scannerHint: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  scannerCancel: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  scannerCancelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainerFull: {
    marginBottom: 12,
  },
  textInputFull: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
});

export default PremiumManagementScreen;
