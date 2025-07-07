import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Icon Components
const StarIcon = ({ size = 24, color = '#000000' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.starIcon, { borderColor: color }]} />
  </View>
);

const VideoIcon = ({ size = 24, color = '#000000' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.videoIcon, { borderColor: color, backgroundColor: color }]} />
  </View>
);

const LockIcon = ({ size = 24, color = '#000000' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.lockIcon, { borderColor: color }]} />
    <View style={[styles.lockBody, { backgroundColor: color }]} />
  </View>
);

const TargetIcon = ({ size = 24, color = '#000000' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.targetOuter, { borderColor: color }]} />
    <View style={[styles.targetInner, { backgroundColor: color }]} />
  </View>
);

const LightningIcon = ({ size = 24, color = '#000000' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.lightningIcon, { backgroundColor: color }]} />
  </View>
);

const CheckIcon = ({ size = 16, color = '#34C759' }) => (
  <View style={[styles.checkContainer, { width: size, height: size }]}>
    <View style={[styles.checkIcon, { borderColor: color }]} />
  </View>
);

const PremiumScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleUpgrade = () => {
    Alert.alert('Premium', 'Tính năng đang phát triển...');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <StarIcon size={36} color="rgba(0, 0, 0, 0.8)" />
          </View>
          <Text style={styles.heroTitle}>Nâng cấp trải nghiệm</Text>
          <Text style={styles.heroSubtitle}>
            Mở khóa toàn bộ tính năng cao cấp với gói Premium
          </Text>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresSection}>
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <VideoIcon size={24} color="rgba(0, 0, 0, 0.7)" />
              <Text style={styles.featureText}>Video HD</Text>
            </View>
            <View style={styles.featureItem}>
              <LockIcon size={24} color="rgba(0, 0, 0, 0.7)" />
              <Text style={styles.featureText}>Bảo mật</Text>
            </View>
            <View style={styles.featureItem}>
              <TargetIcon size={24} color="rgba(0, 0, 0, 0.7)" />
              <Text style={styles.featureText}>AI thông minh</Text>
            </View>
            <View style={styles.featureItem}>
              <LightningIcon size={24} color="rgba(0, 0, 0, 0.7)" />
              <Text style={styles.featureText}>Không giới hạn</Text>
            </View>
          </View>
        </View>

        {/* Plans Section */}
        <View style={styles.plansSection}>
          <Text style={styles.plansTitle}>Chọn gói phù hợp</Text>
          
          {/* Monthly Plan */}
          <TouchableOpacity style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Premium Monthly</Text>
              <View style={styles.planPrice}>
                <Text style={styles.planPriceAmount}>99.000</Text>
                <Text style={styles.planPriceCurrency}>đ</Text>
              </View>
            </View>
            <Text style={styles.planDescription}>
              Hàng tháng • Hủy bất kỳ lúc nào
            </Text>
            <View style={styles.planFeatures}>
              <View style={styles.planFeatureRow}>
                <CheckIcon size={16} color="#34C759" />
                <Text style={styles.planFeatureItem}>Gọi video không giới hạn</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <CheckIcon size={16} color="#34C759" />
                <Text style={styles.planFeatureItem}>Theo dõi sức khỏe AI</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <CheckIcon size={16} color="#34C759" />
                <Text style={styles.planFeatureItem}>Hỗ trợ 24/7</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Yearly Plan - Recommended */}
          <TouchableOpacity style={[styles.planCard, styles.planCardRecommended]}>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Được khuyến nghị</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Premium Yearly</Text>
              <View style={styles.planPrice}>
                <Text style={styles.planPriceAmount}>990.000</Text>
                <Text style={styles.planPriceCurrency}>đ</Text>
              </View>
            </View>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Tiết kiệm 20%</Text>
            </View>
            <Text style={styles.planDescription}>
              Hàng năm • Thanh toán một lần
            </Text>
            <View style={styles.planFeatures}>
              <View style={styles.planFeatureRow}>
                <CheckIcon size={16} color="#34C759" />
                <Text style={styles.planFeatureItem}>Tất cả tính năng Premium</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <CheckIcon size={16} color="#34C759" />
                <Text style={styles.planFeatureItem}>Báo cáo sức khỏe chi tiết</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <CheckIcon size={16} color="#34C759" />
                <Text style={styles.planFeatureItem}>Ưu tiên hỗ trợ</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <CheckIcon size={16} color="#34C759" />
                <Text style={styles.planFeatureItem}>Tính năng độc quyền</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* CTA Button */}
          <TouchableOpacity style={styles.ctaButton} onPress={handleUpgrade}>
            <Text style={styles.ctaButtonText}>Bắt đầu dùng thử</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Dùng thử miễn phí 7 ngày • Hủy bất kỳ lúc nào
            </Text>
            <TouchableOpacity style={styles.termsButton}>
              <Text style={styles.termsText}>Điều khoản và điều kiện</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Icon styles
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  starIcon: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000000',
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'transparent',
  },
  videoIcon: {
    width: 18,
    height: 12,
    borderRadius: 2,
    borderWidth: 2,
  },
  lockIcon: {
    width: 12,
    height: 8,
    borderWidth: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 2,
  },
  lockBody: {
    width: 16,
    height: 10,
    borderRadius: 2,
    position: 'absolute',
    bottom: 2,
  },
  targetOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  targetInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 7,
    left: 7,
  },
  lightningIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '15deg' }],
  },
  checkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkIcon: {
    width: 8,
    height: 4,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: '-45deg' }],
    backgroundColor: 'transparent',
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  // Main styles
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButtonText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 44,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIcon: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
  },
  plansSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  plansTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardRecommended: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007AFF',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 24,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    letterSpacing: -0.3,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  planPriceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  planPriceCurrency: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    marginLeft: 2,
    marginTop: 4,
  },
  savingsBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  planDescription: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 20,
    lineHeight: 20,
  },
  planFeatures: {
    marginTop: 4,
  },
  planFeatureItem: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 20,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  termsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 13,
    color: '#007AFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default PremiumScreen;
