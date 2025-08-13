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
  Platform,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import { useAuth } from '../../../contexts/AuthContext';
import { usePremium } from '../../../contexts/PremiumContext';
import { getUserData } from '../../../services/api';
import { SettingsSection } from '../../../components/settings/SettingsSection';
import { SettingsRow } from '../../../components/settings/SettingsRow';
import { SettingsContainer } from '../../../components/settings/SettingsContainer';
import PermissionStatusIndicator from '../../../components/elderly-home/PermissionStatusIndicator';
import PermissionGuideModal from '../../../components/elderly-home/PermissionGuideModal';
import emergencyCallService, { setPermissionGuideCallback } from '../../../services/emergencyCall';
import { showElderlyPremiumAlert } from '../../../utils/elderlyPremiumAlert';

const ElderlySettingsScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();
    const { premiumStatus } = usePremium();
    
    // State cho modal hướng dẫn quyền
    const [showPermissionGuide, setShowPermissionGuide] = useState(false);
    
    // State cho user data từ API
    const [userData, setUserData] = useState<any>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [premiumEndDate, setPremiumEndDate] = useState<string | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    // Function để fetch user data - gọi API mỗi khi vào trang
    const fetchUserDataAndUpdatePremium = useCallback(async () => {
        try {
            setIsLoadingUserData(true);
            
            // Lấy email từ cache
            const userEmail = await AsyncStorage.getItem('user_email');
            
            if (!userEmail) {
                console.log('No email found in cache for elderly settings');
                setIsLoadingUserData(false);
                return;
            }

            console.log('ElderlySettings: Fetching user data for email:', userEmail);
            
            // Gọi API get user data
            const result = await getUserData(userEmail);
            
            if (result.success && result.user) {
                const apiUser = result.user;
                const premiumStatus = apiUser.premium_status;
                const premiumEndDateFromAPI = apiUser.premium_end_date;
                
                // Tính số ngày còn lại
                let daysLeft = null;
                if (premiumStatus && premiumEndDateFromAPI) {
                    const endDate = new Date(premiumEndDateFromAPI);
                    const currentDate = new Date();
                    const timeDiff = endDate.getTime() - currentDate.getTime();
                    daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    
                    // Nếu hết hạn thì set premium = false
                    if (daysLeft <= 0) {
                        setIsPremium(false);
                        daysLeft = 0;
                    } else {
                        setIsPremium(premiumStatus);
                    }
                } else {
                    setIsPremium(premiumStatus);
                }
                
                // Cập nhật state
                setUserData(apiUser);
                setPremiumEndDate(premiumEndDateFromAPI);
                setDaysRemaining(daysLeft);
                
                console.log('ElderlySettings premium data updated:', {
                    status: premiumStatus,
                    endDate: premiumEndDateFromAPI,
                    daysRemaining: daysLeft
                });
            } else {
                console.error('Failed to fetch user data for elderly settings:', result.message);
            }
        } catch (error) {
            console.error('Error fetching user data for elderly settings:', error);
        } finally {
            setIsLoadingUserData(false);
        }
    }, []);

    // ✅ GỌI API MỖI KHI VÀO TRANG - useFocusEffect đảm bảo data luôn fresh
    useFocusEffect(
        useCallback(() => {
            console.log('🔄 ElderlySettings: Auto-fetching user data on every page visit');
            fetchUserDataAndUpdatePremium();
        }, [fetchUserDataAndUpdatePremium])
    );

    // Backup: Fetch data khi component mount
    useEffect(() => {
        fetchUserDataAndUpdatePremium();
        
        // Set callback cho permission guide
        setPermissionGuideCallback(() => setShowPermissionGuide(true));
    }, [fetchUserDataAndUpdatePremium]);

    const getAvatarText = (fullName: string | undefined) => {
        if (!fullName) return '';
        const names = fullName.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return fullName.slice(0, 2).toUpperCase();
    };

    const handleLogout = async () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất không? Tất cả dữ liệu sẽ bị xóa.',
            [
              { text: 'Hủy', style: 'cancel' },
              { 
                text: 'Đăng xuất', 
                style: 'destructive', 
                onPress: async () => {
                  try {
                    console.log('🔄 User confirmed logout');
                    
                    // Thực hiện logout
                    await logout();
                    
                    // Navigate về root level và chọn Auth route với Login screen
                    navigation.reset({
                      index: 0,
                      routes: [{ 
                        name: 'Auth',
                        params: {
                          screen: 'Login'
                        }
                      }],
                    });
                    
                    console.log('✅ Logout completed and navigated to Login');
                  } catch (error) {
                    console.error('Error during logout:', error);
                    Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
                  }
                }
              },
            ],
            { cancelable: true }
          );
    };

    const handlePremiumPress = () => {
        if (isPremium) {
            // If user is already premium, navigate to elderly premium info screen
            navigation.navigate('ElderlyPremiumInfo');
        } else {
            // If user is not premium, show the elderly alert
            showElderlyPremiumAlert();
        }
    };

    return (
        <SettingsContainer>
            <SafeAreaView style={styles.flex}>
                <ScrollView style={styles.flex}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Cài đặt</Text>
                    </View>

                    {/* User Profile Section */}
                    <TouchableOpacity
                        style={styles.profileSection}
                        onPress={() => navigation.navigate('ElderlyProfile')}
                    >
                        <View style={[styles.avatarContainer, isPremium ? styles.premiumAvatar : styles.normalAvatar]}>
                            {isPremium ? (
                                <LinearGradient colors={['#007AFF', '#5856D6']} style={styles.avatarGradient}>
                                    <Text style={styles.avatarText}>{getAvatarText(user?.fullName)}</Text>
                                </LinearGradient>
                            ) : (
                                <Text style={styles.avatarTextNormal}>{getAvatarText(user?.fullName)}</Text>
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                                {userData?.userName || user?.fullName || 'Chưa có tên'}
                            </Text>
                            <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
                                {userData?.email || user?.email || 'Chưa có email'}
                            </Text>
                            {/* Hiển thị premium status nếu có */}
                            {isPremium && daysRemaining && (
                                <Text style={styles.premiumStatusText}>
                                    Premium • Còn {daysRemaining} ngày
                                </Text>
                            )}
                        </View>
                        <Feather name="chevron-right" size={22} color="#C7C7CC" />
                    </TouchableOpacity>

                    {/* Premium Section */}
                        <SettingsSection>
                        {isLoadingUserData ? (
                            <TouchableOpacity style={styles.premiumRow} onPress={() => {}}>
                                <LinearGradient colors={['#1E3A8A', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.premiumIconContainer}>
                                    <ActivityIndicator size="small" color="#FFD700" />
                                </LinearGradient>
                                <View style={styles.premiumInfo}>
                                    <Text style={styles.premiumTitle}>Premium</Text>
                                    <Text style={styles.premiumSubtitle}>Đang tải...</Text>
                                </View>
                                <Feather name="chevron-right" size={22} color="#C7C7CC" />
                            </TouchableOpacity>
                        ) : isPremium ? (
                            <TouchableOpacity style={styles.premiumRow} onPress={handlePremiumPress}>
                                <LinearGradient colors={['#32CD32', '#228B22']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.premiumIconContainer}>
                                    <Feather name="check" size={20} color="#FFFFFF" />
                                </LinearGradient>
                                <View style={styles.premiumInfo}>
                                    <Text style={styles.premiumTitle}>Premium Active</Text>
                                    <Text style={styles.premiumSubtitle}>
                                        {daysRemaining ? `Còn ${daysRemaining} ngày` : 'Đang hoạt động'}
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={22} color="#C7C7CC" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.premiumRow} onPress={handlePremiumPress}>
                                <LinearGradient colors={['#1E3A8A', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.premiumIconContainer}>
                                    <Feather name="zap" size={20} color="#FFD700" />
                                </LinearGradient>
                                <View style={styles.premiumInfo}>
                                    <Text style={styles.premiumTitle}>Nâng cấp lên Premium</Text>
                                    <Text style={styles.premiumSubtitle}>Mở khóa tất cả tính năng cao cấp</Text>
                                </View>
                                <Feather name="chevron-right" size={22} color="#C7C7CC" />
                            </TouchableOpacity>
                        )}
                        </SettingsSection>

                    <SettingsSection title="Tài khoản">
                        <SettingsRow
                            title="Thông tin cá nhân"
                            icon="user"
                            type="navigation"
                            onPress={() => navigation.navigate('ElderlyProfile')}
                        />
                        <SettingsRow
                            title="Bảo mật"
                            icon="lock"
                            type="navigation"
                            onPress={() => navigation.navigate('ChangePassword')}
                        />
                    </SettingsSection>

                    <SettingsSection title="Thiết bị & Kết nối">
                        <SettingsRow
                            title="Thiết bị đã kết nối"
                            icon="monitor"
                            type="navigation"
                            onPress={() => { /* Navigate to Connected Devices */ }}
                        />
                        <SettingsRow
                            title="Quản lý thông báo"
                            icon="bell"
                            type="navigation"
                            onPress={() => { /* Navigate to Notification Settings */ }}
                        />
                    </SettingsSection>

                    <SettingsSection title="Khẩn cấp">
                        <SettingsRow
                            title="Cài đặt số khẩn cấp"
                            icon="phone"
                            type="navigation"
                            value={emergencyCallService.getEmergencyInfo().number}
                            onPress={() => navigation.navigate('EmergencyCallSettings')}
                        />
                    </SettingsSection>

                    <SettingsSection title="Premium">
                        <SettingsRow
                            title="Thông tin Premium"
                            icon="star"
                            type="navigation"
                            onPress={() => navigation.navigate('ElderlyPremiumInfo')}
                        />
                    </SettingsSection>

                    <SettingsSection title="Nội dung">
                        <SettingsRow
                            title="Nội dung hạn chế"
                            icon="shield"
                            type="navigation"
                            onPress={() => navigation.navigate('RestrictedContentSettings')}
                        />
                    </SettingsSection>
                    
                    {/* Permission Status Indicator */}
                    <View style={styles.permissionContainer}>
                        <PermissionStatusIndicator 
                            onRequestPermission={() => setShowPermissionGuide(true)}
                        />
                    </View>

                    <SettingsSection title="Hỗ trợ">
                        <SettingsRow
                            title="Lệnh thoại"
                            icon="mic"
                            type="navigation"
                            onPress={() => navigation.navigate('VoiceHelp')}
                        />
                        <SettingsRow
                            title="Trung tâm hỗ trợ"
                            icon="info"
                            type="navigation"
                            onPress={() => { /* Navigate to Help Center */ }}
                        />
                        <SettingsRow
                            title="Điều khoản dịch vụ"
                            icon="file"
                            type="navigation"
                            onPress={() => { /* Navigate to ToS */ }}
                        />
                        <SettingsRow
                            title="Chính sách bảo mật"
                            icon="lock"
                            type="navigation"
                            onPress={() => { /* Navigate to Privacy Policy */ }}
                        />
                    </SettingsSection>

                    <SettingsSection>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutText}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </SettingsSection>
                    <View style={styles.footer} />
                </ScrollView>
            </SafeAreaView>
            
            <PermissionGuideModal
                visible={showPermissionGuide}
                onClose={() => setShowPermissionGuide(false)}
                onOpenSettings={() => {
                    setShowPermissionGuide(false);
                    // Mở cài đặt app cụ thể
                    if (Platform.OS === 'android') {
                        Linking.openURL('package:com.viegrandapp');
                    } else {
                        Linking.openSettings();
                    }
                }}
            />
        </SettingsContainer>
    );
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#000',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 10,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    normalAvatar: { backgroundColor: '#F2F2F7' },
    premiumAvatar: { backgroundColor: 'transparent' },
    avatarGradient: { width: '100%', height: '100%', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    avatarTextNormal: { color: '#007AFF', fontSize: 22, fontWeight: '600' },
    userInfo: {
        flex: 1,
        marginRight: 8, // Added margin
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: '#8E8E93',
    },
    premiumStatusText: {
        fontSize: 12,
        color: '#32CD32',
        fontWeight: '600',
        marginTop: 2,
    },
    premiumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
    },
    premiumIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    premiumInfo: {
        flex: 1,
        marginRight: 8, // Added margin
    },
    premiumTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    premiumSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 2,
    },
    logoutButton: {
        backgroundColor: '#FFF',
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 10,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 17,
    },
    footer: {
        height: 40,
    },
    permissionContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    }
});

export default ElderlySettingsScreen;
