import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../../../contexts/AuthContext';
import { getPremiumFamilyMembers } from '../../../services/api';

interface FamilyMember {
  userId: number;
  userName: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  avatar?: string;
  role: string;
  memberType: 'relative' | 'elderly';
  isManager: boolean;
  private_key: string;
}

interface PremiumSubscription {
  premiumKey: string;
  startDate: string;
  endDate: string;
  status: string;
  daysRemaining: number;
  note?: string;
}

const FamilyScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null);
  const [hasPremiumFamily, setHasPremiumFamily] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFamilyMembers = useCallback(async () => {
    if (!user?.privateKey) {
      console.log('No user private key available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Loading premium family members for user:', user.fullName);
      
      const result = await getPremiumFamilyMembers(user.privateKey);
      
      if (result.success && result.data) {
        console.log('✅ Premium family members loaded:', result.data.familyMembers?.length || 0);
        setFamilyMembers(result.data.familyMembers || []);
        setSubscription(result.data.subscription || null);
        setHasPremiumFamily(result.data.hasPremiumFamily || false);
      } else {
        console.log('❌ Failed to load premium family members:', result.message);
        setFamilyMembers([]);
        setSubscription(null);
        setHasPremiumFamily(false);
      }
    } catch (error) {
      console.error('Error loading premium family members:', error);
      setFamilyMembers([]);
      setSubscription(null);
      setHasPremiumFamily(false);
    } finally {
      setLoading(false);
    }
  }, [user?.privateKey]);

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadFamilyMembers();
    }, [loadFamilyMembers])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFamilyMembers();
    setRefreshing(false);
  }, [loadFamilyMembers]);

  const handleCallFamilyMember = (member: FamilyMember) => {
    Alert.alert(
      'Gọi điện',
      `Bạn có muốn gọi cho ${member.userName} không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Gọi', 
          onPress: () => {
            // TODO: Implement phone call functionality
            Alert.alert('Thông báo', `Đang gọi cho ${member.userName}...`);
          }
        }
      ]
    );
  };

  const handleMessageFamilyMember = (member: FamilyMember) => {
    // Navigate to message screen with the family member
    navigation.navigate('Message', { 
      screen: 'MessageList',
      params: { selectedFriend: member }
    });
  };

  const getRoleDisplayName = (role: string, memberType: string, isManager: boolean) => {
    if (isManager) return 'Người quản lý';
    if (role === 'relative') return 'Người thân';
    if (role === 'elderly') return 'Người cao tuổi';
    return 'Thành viên';
  };

  const getRoleColor = (role: string, isManager: boolean) => {
    if (isManager) return '#FF6B35'; // Orange for manager
    if (role === 'relative') return '#28A745'; // Green for relative
    if (role === 'elderly') return '#007AFF'; // Blue for elderly
    return '#6C757D'; // Gray for others
  };

  const getAvatarText = (name: string, avatar?: string) => {
    if (avatar) {
      return avatar;
    }
    
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground 
          source={require('../../../assets/background.png')} 
          style={styles.backgroundImage}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#0D4C92" />
            </TouchableOpacity>
            <Text style={styles.title}>Gia đình Premium</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D4C92" />
            <Text style={styles.loadingText}>Đang tải thông tin gia đình...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={require('../../../assets/background.png')} 
        style={styles.backgroundImage}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#0D4C92" />
          </TouchableOpacity>
          <Text style={styles.title}>Gia đình Premium</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Feather name="refresh-cw" size={20} color="#0D4C92" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {!hasPremiumFamily ? (
            <View style={styles.emptyContainer}>
              <Feather name="users" size={64} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Chưa có gia đình Premium</Text>
              <Text style={styles.emptySubtitle}>
                Bạn cần đăng ký gói Premium để tạo gia đình và kết nối với người thân
              </Text>
            </View>
          ) : (
            <>
              {/* Premium Subscription Info */}
              {subscription && (
                <View style={styles.subscriptionCard}>
                  <View style={styles.subscriptionHeader}>
                    <Feather name="star" size={24} color="#FFD700" />
                    <Text style={styles.subscriptionTitle}>Gói Premium</Text>
                  </View>
                  <View style={styles.subscriptionDetails}>
                    <Text style={styles.subscriptionKey}>Mã: {subscription.premiumKey}</Text>
                    <Text style={styles.subscriptionDate}>
                      {new Date(subscription.startDate).toLocaleDateString('vi-VN')} - {new Date(subscription.endDate).toLocaleDateString('vi-VN')}
                    </Text>
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: subscription.status === 'active' ? '#28A745' : '#DC3545' }
                      ]}>
                        <Text style={styles.statusText}>
                          {subscription.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                        </Text>
                      </View>
                      {subscription.status === 'active' && (
                        <Text style={styles.daysRemaining}>
                          Còn {subscription.daysRemaining} ngày
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Family Members */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Thành viên gia đình ({familyMembers.length})</Text>
              </View>

              <View style={styles.familyList}>
                {familyMembers.map((member, index) => (
                  <View key={member.userId} style={styles.familyMemberCard}>
                    <View style={styles.memberInfo}>
                      <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                          {getAvatarText(member.userName, member.avatar)}
                        </Text>
                      </View>
                      <View style={styles.memberDetails}>
                        <View style={styles.nameRow}>
                          <Text style={styles.memberName}>{member.userName}</Text>
                          <View style={[
                            styles.roleBadge,
                            { backgroundColor: getRoleColor(member.role, member.isManager) }
                          ]}>
                            <Text style={styles.roleText}>
                              {getRoleDisplayName(member.role, member.memberType, member.isManager)}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.memberPhone}>{member.phone}</Text>
                        {member.age && (
                          <Text style={styles.memberAge}>
                            {member.age} tuổi • {member.gender === 'male' ? 'Nam' : 'Nữ'}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleCallFamilyMember(member)}
                      >
                        <Feather name="phone" size={20} color="#28A745" />
                        <Text style={styles.actionButtonText}>Gọi</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleMessageFamilyMember(member)}
                      >
                        <Feather name="message-square" size={20} color="#007AFF" />
                        <Text style={styles.actionButtonText}>Nhắn tin</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D4C92',
  },
  refreshButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  familyMemberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0D4C92',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  memberDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  roleBadge: {
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0D4C92',
  },
  memberPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberAge: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D4C92',
    marginLeft: 8,
  },
  subscriptionDetails: {
    marginTop: 8,
  },
  subscriptionKey: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  subscriptionDate: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  daysRemaining: {
    fontSize: 12,
    color: '#4B5563',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D4C92',
    marginBottom: 12,
  },
  familyList: {
    paddingBottom: 100,
  },
});

export default FamilyScreen;
