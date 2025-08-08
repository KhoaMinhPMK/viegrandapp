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
import { getFriendsList } from '../../../services/api';

interface FamilyMember {
  userId: number;
  userName: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  avatar?: string;
  status?: string;
  respondedAt?: string;
  lastActive?: string;
}

const FamilyScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFamilyMembers = useCallback(async () => {
    if (!user?.phone) {
      console.log('No user phone available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Loading family members for phone:', user.phone);
      
      const result = await getFriendsList(user.phone);
      
      if (result.success && result.friends) {
        console.log('✅ Family members loaded:', result.friends.length);
        setFamilyMembers(result.friends);
      } else {
        console.log('❌ Failed to load family members:', result.message);
        setFamilyMembers([]);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
      setFamilyMembers([]);
    } finally {
      setLoading(false);
    }
  }, [user?.phone]);

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

  const formatLastActive = (lastActive?: string, respondedAt?: string) => {
    const dateString = lastActive || respondedAt;
    if (!dateString) {
      return 'Không xác định';
    }
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        return 'Vừa xong';
      } else if (diffHours < 24) {
        return `${Math.floor(diffHours)} giờ trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }
    } catch {
      return 'Không xác định';
    }
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
            <Text style={styles.title}>Gia đình</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D4C92" />
            <Text style={styles.loadingText}>Đang tải danh sách gia đình...</Text>
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
          <Text style={styles.title}>Gia đình</Text>
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
          {familyMembers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="users" size={64} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Chưa có thành viên gia đình</Text>
              <Text style={styles.emptySubtitle}>
                Khi bạn kết bạn với người thân, họ sẽ xuất hiện ở đây
              </Text>
            </View>
          ) : (
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
                      <Text style={styles.memberName}>{member.userName}</Text>
                      <Text style={styles.memberPhone}>{member.phone}</Text>
                      {member.age && (
                        <Text style={styles.memberAge}>
                          {member.age} tuổi • {member.gender === 'male' ? 'Nam' : 'Nữ'}
                        </Text>
                      )}
                      <Text style={styles.lastActive}>
                        Hoạt động: {formatLastActive(member.lastActive, member.respondedAt)}
                      </Text>
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
  familyList: {
    paddingBottom: 20,
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
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
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
  lastActive: {
    fontSize: 12,
    color: '#9CA3AF',
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
});

export default FamilyScreen;
