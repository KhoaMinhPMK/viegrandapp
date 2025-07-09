import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import { useAuth } from '../../../contexts/AuthContext';
import { usePremium } from '../../../contexts/PremiumContext';
import { SettingsSection } from '../../../components/settings/SettingsSection';
import { SettingsRow } from '../../../components/settings/SettingsRow';
import { SettingsContainer } from '../../../components/settings/SettingsContainer';

const ElderlySettingsScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();
    const { premiumStatus } = usePremium();
    const isPremium = premiumStatus?.isPremium || false;

    const getAvatarText = (fullName: string | undefined) => {
        if (!fullName) return '';
        const names = fullName.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return fullName.slice(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất không?',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
            ],
            { cancelable: true }
          );
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
                        onPress={() => navigation.navigate('EditProfile')}
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
                            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{user?.fullName || 'Chưa có tên'}</Text>
                            <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">{user?.email || 'Chưa có email'}</Text>
                        </View>
                        <Feather name="chevron-right" size={22} color="#C7C7CC" />
                    </TouchableOpacity>

                    {/* Premium Section */}
                    {!isPremium && (
                        <SettingsSection>
                            <TouchableOpacity style={styles.premiumRow} onPress={() => navigation.navigate('Premium')}>
                                <LinearGradient colors={['#1E3A8A', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.premiumIconContainer}>
                                    <Feather name="star" size={20} color="#FFD700" />
                                </LinearGradient>
                                <View style={styles.premiumInfo}>
                                    <Text style={styles.premiumTitle}>Nâng cấp lên Premium</Text>
                                    <Text style={styles.premiumSubtitle}>Mở khóa tất cả tính năng cao cấp</Text>
                                </View>
                                <Feather name="chevron-right" size={22} color="#C7C7CC" />
                            </TouchableOpacity>
                        </SettingsSection>
                    )}

                    <SettingsSection title="Tài khoản">
                        <SettingsRow
                            title="Thông tin cá nhân"
                            icon="user"
                            type="navigation"
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <SettingsRow
                            title="Bảo mật"
                            icon="shield"
                            type="navigation"
                            onPress={() => { /* Navigate to Security Settings */ }}
                        />
                    </SettingsSection>

                    <SettingsSection title="Thiết bị & Kết nối">
                        <SettingsRow
                            title="Thiết bị đã kết nối"
                            icon="smartphone"
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

                    <SettingsSection title="Hỗ trợ">
                        <SettingsRow
                            title="Trung tâm hỗ trợ"
                            icon="help-circle"
                            type="navigation"
                            onPress={() => { /* Navigate to Help Center */ }}
                        />
                        <SettingsRow
                            title="Điều khoản dịch vụ"
                            icon="file-text"
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
    }
});

export default ElderlySettingsScreen;
