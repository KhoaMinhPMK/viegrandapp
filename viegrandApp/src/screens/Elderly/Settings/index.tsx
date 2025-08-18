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
  Dimensions,
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

const { width } = Dimensions.get('window');

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
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Modern Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Cài đặt</Text>
                        <Text style={styles.headerSubtitle}>Quản lý tài khoản và ứng dụng</Text>
                    </View>

                    {/* Enhanced User Profile Card */}
                    <TouchableOpacity
                        style={styles.profileCard}
                        onPress={() => navigation.navigate('ElderlyProfile')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient 
                            colors={isPremium ? ['#1E40AF', '#3B82F6'] : ['#1E3A8A', '#2563EB']}
                            style={styles.profileGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.profileContent}>
                                <View style={styles.avatarContainer}>
                                    {isPremium ? (
                                        <LinearGradient 
                                            colors={['#F59E0B', '#D97706']} 
                                            style={styles.premiumAvatar}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <Text style={styles.avatarText}>{getAvatarText(user?.fullName)}</Text>
                                            <View style={styles.premiumBadge}>
                                                <Feather name="star" size={12} color="#F59E0B" />
                                            </View>
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.normalAvatar}>
                                            <Text style={styles.avatarTextNormal}>{getAvatarText(user?.fullName)}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                                        {userData?.userName || user?.fullName || 'Chưa có tên'}
                                    </Text>
                                    <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
                                        {userData?.email || user?.email || 'Chưa có email'}
                                    </Text>
                                    {isPremium && daysRemaining && (
                                        <View style={styles.premiumStatusContainer}>
                                            <Feather name="check-circle" size={14} color="#4ADE80" />
                                            <Text style={styles.premiumStatusText}>
                                                Premium • Còn {daysRemaining} ngày
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.profileArrow}>
                                    <Feather name="chevron-right" size={24} color="#FFFFFF" />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Enhanced Premium Section */}
                    <View style={styles.sectionContainer}>
                        {isLoadingUserData ? (
                            <View style={styles.premiumCard}>
                                <LinearGradient 
                                    colors={['#1E40AF', '#3B82F6']} 
                                    style={styles.premiumGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.premiumContent}>
                                        <View style={styles.premiumIconContainer}>
                                            <ActivityIndicator size="small" color="#F59E0B" />
                                        </View>
                                        <View style={styles.premiumInfo}>
                                            <Text style={styles.premiumTitle}>Premium</Text>
                                            <Text style={styles.premiumSubtitle}>Đang tải...</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>
                        ) : isPremium ? (
                            <TouchableOpacity 
                                style={styles.premiumCard} 
                                onPress={handlePremiumPress}
                                activeOpacity={0.8}
                            >
                                <LinearGradient 
                                    colors={['#059669', '#10B981']} 
                                    style={styles.premiumGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.premiumContent}>
                                        <View style={styles.premiumIconContainer}>
                                            <Feather name="check" size={24} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.premiumInfo}>
                                            <Text style={styles.premiumTitle}>Premium Active</Text>
                                            <Text style={styles.premiumSubtitle}>
                                                {daysRemaining ? `Còn ${daysRemaining} ngày` : 'Đang hoạt động'}
                                            </Text>
                                        </View>
                                        <Feather name="chevron-right" size={24} color="#FFFFFF" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                style={styles.premiumCard} 
                                onPress={handlePremiumPress}
                                activeOpacity={0.8}
                            >
                                <LinearGradient 
                                    colors={['#1E40AF', '#3B82F6']} 
                                    style={styles.premiumGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.premiumContent}>
                                        <View style={styles.premiumIconContainer}>
                                            <Feather name="zap" size={24} color="#F59E0B" />
                                        </View>
                                        <View style={styles.premiumInfo}>
                                            <Text style={styles.premiumTitle}>Nâng cấp lên Premium</Text>
                                            <Text style={styles.premiumSubtitle}>Mở khóa tất cả tính năng cao cấp</Text>
                                        </View>
                                        <Feather name="chevron-right" size={24} color="#FFFFFF" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Modern Settings Sections */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
                        <View style={styles.settingsCard}>
                            <SettingsRow
                                title="Thông tin cá nhân"
                                icon="user"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => navigation.navigate('ElderlyProfile')}
                            />
                            <SettingsRow
                                title="Bảo mật"
                                icon="lock"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => navigation.navigate('ChangePassword')}
                            />
                            <SettingsRow
                                title="Dữ liệu khuôn mặt"
                                icon="camera"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => navigation.navigate('FaceDataCollection')}
                            />
                        </View>
                    </View>

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>THIẾT BỊ & KẾT NỐI</Text>
                        <View style={styles.settingsCard}>
                            <SettingsRow
                                title="Thiết bị đã kết nối"
                                icon="monitor"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => { /* Navigate to Connected Devices */ }}
                            />
                            <SettingsRow
                                title="Quản lý thông báo"
                                icon="bell"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => { /* Navigate to Notification Settings */ }}
                            />
                        </View>
                    </View>

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>KHẨN CẤP</Text>
                        <View style={styles.settingsCard}>
                            <SettingsRow
                                title="Cài đặt số khẩn cấp"
                                icon="phone"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                value={emergencyCallService.getEmergencyInfo().number}
                                onPress={() => navigation.navigate('EmergencyCallSettings')}
                            />
                        </View>
                    </View>

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>PREMIUM</Text>
                        <View style={styles.settingsCard}>
                            <SettingsRow
                                title="Thông tin Premium"
                                icon="star"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => navigation.navigate('ElderlyPremiumInfo')}
                            />
                        </View>
                    </View>

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>NỘI DUNG</Text>
                        <View style={styles.settingsCard}>
                            <SettingsRow
                                title="Nội dung hạn chế"
                                icon="shield"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => navigation.navigate('RestrictedContentSettings')}
                            />
                        </View>
                    </View>
                    
                    {/* Permission Status Indicator */}
                    <View style={styles.permissionContainer}>
                        <PermissionStatusIndicator 
                            onRequestPermission={() => setShowPermissionGuide(true)}
                        />
                    </View>

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>HỖ TRỢ</Text>
                        <View style={styles.settingsCard}>
                            <SettingsRow
                                title="Lệnh thoại"
                                icon="mic"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => navigation.navigate('VoiceHelp')}
                            />
                            <SettingsRow
                                title="Trung tâm hỗ trợ"
                                icon="info"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => navigation.navigate('SupportCenter')}
                            />
                            <SettingsRow
                                title="Điều khoản dịch vụ"
                                icon="file"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => navigation.navigate('TermsOfService')}
                            />
                            <SettingsRow
                                title="Chính sách bảo mật"
                                icon="lock"
                                iconColor="#FFFFFF"
                                iconBackgroundColor="#3B82F6"
                                type="navigation"
                                onPress={() => navigation.navigate('PrivacyPolicy')}
                            />
                        </View>
                    </View>

                    {/* Modern Logout Button */}
                    <View style={styles.sectionContainer}>
                        <TouchableOpacity 
                            style={styles.logoutButton} 
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
                            <LinearGradient 
                                colors={['#EF4444', '#DC2626']} 
                                style={styles.logoutGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Feather name="log-out" size={20} color="#FFFFFF" />
                                <Text style={styles.logoutText}>Đăng xuất</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    profileCard: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    profileGradient: {
        borderRadius: 20,
        padding: 20,
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    normalAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    premiumAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    premiumBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    avatarTextNormal: {
        color: '#1E40AF',
        fontSize: 24,
        fontWeight: '700',
    },
    userInfo: {
        flex: 1,
        marginRight: 12,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 15,
        color: '#E2E8F0',
        marginBottom: 6,
    },
    premiumStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    premiumStatusText: {
        fontSize: 13,
        color: '#4ADE80',
        fontWeight: '600',
        marginLeft: 4,
    },
    profileArrow: {
        opacity: 0.8,
    },
    sectionContainer: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    premiumCard: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    premiumGradient: {
        borderRadius: 16,
        padding: 20,
    },
    premiumContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    premiumIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    premiumInfo: {
        flex: 1,
        marginRight: 12,
    },
    premiumTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    premiumSubtitle: {
        fontSize: 14,
        color: '#E2E8F0',
        fontWeight: '500',
    },
    settingsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    logoutButton: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
        marginLeft: 8,
    },
    footer: {
        height: 40,
    },
    permissionContainer: {
        marginHorizontal: 20,
        marginTop: 20,
    }
});

export default ElderlySettingsScreen;
