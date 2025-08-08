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
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  const [fadeAnim] = useState(new Animated.Value(0));

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
  useEffect(() => {
    const loadPremiumInfo = async () => {
      if (!userPrivateKey) return;
      
      try {
        setLoading(true);
        const result = await getElderlyPremiumInfo(userPrivateKey);
        
        if (result.success && result.data) {
          setPremiumData(result.data);
          
          // Animate in the content
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
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
    
    loadPremiumInfo();
  }, [userPrivateKey, fadeAnim]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#0D4C92' : '#FF6B6B';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Đang hoạt động' : 'Đã hết hạn';
  };

  const renderSubscriptionCard = () => {
    if (!premiumData?.hasSubscription || !premiumData?.subscription) {
      return (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.cardHeader}>
            <Feather name="star" size={20} color="#8E8E93" />
            <Text style={styles.cardTitle}>Thông tin Premium</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.emptyState}>
              <Feather name="info" size={48} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>Chưa có gói Premium</Text>
              <Text style={styles.emptySubtitle}>
                Bạn chưa được thêm vào gói Premium nào
              </Text>
            </View>
          </View>
        </Animated.View>
      );
    }

    const subscription = premiumData.subscription;
    const statusColor = getStatusColor(subscription.status);

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <Feather name="star" size={20} color="#FFD700" />
          <Text style={styles.cardTitle}>Thông tin Premium</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã Premium:</Text>
            <Text style={styles.infoValue}>{subscription.premiumKey}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái:</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(subscription.status)}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
            <Text style={styles.infoValue}>{formatDate(subscription.startDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày kết thúc:</Text>
            <Text style={styles.infoValue}>{formatDate(subscription.endDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Còn lại:</Text>
            <Text style={[styles.infoValue, { color: subscription.daysRemaining > 0 ? '#0D4C92' : '#FF6B6B' }]}>
              {subscription.daysRemaining > 0 ? `${subscription.daysRemaining} ngày` : 'Đã hết hạn'}
            </Text>
          </View>
          {subscription.note && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ghi chú:</Text>
              <Text style={styles.infoValue}>{subscription.note}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderRelativeCard = () => {
    if (!premiumData?.relative) {
      return null;
    }

    const relative = premiumData.relative;

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <Feather name="user" size={20} color="#0D4C92" />
          <Text style={styles.cardTitle}>Người thân chăm sóc</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên:</Text>
            <Text style={styles.infoValue}>{relative.userName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{relative.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{relative.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tuổi:</Text>
            <Text style={styles.infoValue}>{relative.age} tuổi</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>{relative.gender}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderElderlyCard = () => {
    if (!premiumData?.elderly) {
      return null;
    }

    const elderly = premiumData.elderly;

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <Feather name="user" size={20} color="#1E88E5" />
          <Text style={styles.cardTitle}>Thông tin của bạn</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên:</Text>
            <Text style={styles.infoValue}>{elderly.userName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{elderly.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{elderly.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tuổi:</Text>
            <Text style={styles.infoValue}>{elderly.age} tuổi</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>{elderly.gender}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderOtherElderlyCard = () => {
    if (!premiumData?.allElderlyUsers || premiumData.allElderlyUsers.length <= 1) {
      return null;
    }

    const otherElderly = premiumData.allElderlyUsers.filter(
      user => user.private_key !== premiumData.elderly.private_key
    );

    if (otherElderly.length === 0) {
      return null;
    }

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <Feather name="users" size={20} color="#42A5F5" />
          <Text style={styles.cardTitle}>Người cao tuổi khác</Text>
        </View>
        <View style={styles.cardContent}>
          {otherElderly.map((user, index) => (
            <View key={user.userId} style={[styles.infoRow, index > 0 && styles.borderTop]}>
              <Text style={styles.infoLabel}>{user.userName}</Text>
              <Text style={styles.infoValue}>{user.age} tuổi • {user.gender}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#0D4C92" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Thông tin Premium</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Feather name="loader" size={32} color="#0D4C92" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#0D4C92" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thông tin Premium</Text>
          <Text style={styles.headerSubtitle}>Chi tiết gói Premium của bạn</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {renderSubscriptionCard()}
          {renderElderlyCard()}
          {renderRelativeCard()}
          {renderOtherElderlyCard()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 22,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  headerRight: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  cardContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default ElderlyPremiumInfoScreen; 