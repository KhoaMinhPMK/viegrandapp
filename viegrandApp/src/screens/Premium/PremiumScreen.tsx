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
import { StackNavigationProp } from '@react-navigation/stack';
import { PremiumStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');

// Minimalist Black Icons - Apple Style
const CrownIcon = ({ size = 24 }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={styles.crownBase} />
    <View style={styles.crownPeak1} />
    <View style={styles.crownPeak2} />
    <View style={styles.crownPeak3} />
  </View>
);

const PlayCircleIcon = ({ size = 24 }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={styles.playCircle} />
    <View style={styles.playTriangle} />
  </View>
);

const ShieldIcon = ({ size = 24 }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={styles.shieldBody} />
    <View style={styles.shieldCheck} />
  </View>
);

const BrainIcon = ({ size = 24 }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={styles.brainLeft} />
    <View style={styles.brainRight} />
    <View style={styles.brainConnector} />
  </View>
);

const InfinityIcon = ({ size = 24 }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={styles.infinityLeft} />
    <View style={styles.infinityRight} />
  </View>
);

const CheckIcon = ({ size = 16, color = '#34C759' }) => (
  <View style={[styles.checkContainer, { width: size, height: size }]}>
    <View style={[styles.checkIcon, { borderColor: color }]} />
  </View>
);

const PremiumScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<PremiumStackParamList>>();

  const handleUpgrade = (planId?: number) => {
    navigation.navigate('PlanComparison', { initialPlanId: planId });
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
            <CrownIcon size={36} />
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
              <PlayCircleIcon size={24} />
              <Text style={styles.featureText}>Video HD</Text>
            </View>
            <View style={styles.featureItem}>
              <ShieldIcon size={24} />
              <Text style={styles.featureText}>Bảo mật</Text>
            </View>
            <View style={styles.featureItem}>
              <BrainIcon size={24} />
              <Text style={styles.featureText}>AI thông minh</Text>
            </View>
            <View style={styles.featureItem}>
              <InfinityIcon size={24} />
              <Text style={styles.featureText}>Không giới hạn</Text>
            </View>
          </View>
        </View>

        {/* Plans Section */}
        <View style={styles.plansSection}>
          <Text style={styles.plansTitle}>Chọn gói phù hợp</Text>
          
          {/* Monthly Plan */}
          <TouchableOpacity style={styles.planCard} onPress={() => handleUpgrade(1)}>
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
          <TouchableOpacity style={[styles.planCard, styles.planCardRecommended]} onPress={() => handleUpgrade(2)}>
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
          <TouchableOpacity style={styles.ctaButton} onPress={() => handleUpgrade()}>
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
  // Minimalist Black Icon Styles - Apple Design
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  
  // Crown Icon - Premium/VIP (Black outline)
  crownBase: {
    width: 18,
    height: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.8)',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 8,
  },
  crownPeak1: {
    width: 3,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 6,
    left: 8,
  },
  crownPeak2: {
    width: 3,
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 2,
    left: 14.5,
  },
  crownPeak3: {
    width: 3,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 6,
    right: 8,
  },
  
  // Play Circle Icon - Video/Media (Black outline)
  playCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.8)',
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: 'rgba(0, 0, 0, 0.8)',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
    left: 9,
    top: 6,
  },
  
  // Shield Icon - Security/Privacy (Black outline)
  shieldBody: {
    width: 16,
    height: 18,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.8)',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    position: 'absolute',
    top: 7,
  },
  shieldCheck: {
    width: 6,
    height: 3,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
    borderLeftColor: 'rgba(0, 0, 0, 0.8)',
    transform: [{ rotate: '-45deg' }],
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 14,
    left: 13,
  },
  
  // Brain Icon - AI Intelligence (Black outline)
  brainLeft: {
    width: 8,
    height: 14,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.8)',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    position: 'absolute',
    left: 6,
    top: 9,
  },
  brainRight: {
    width: 8,
    height: 14,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.8)',
    backgroundColor: 'transparent',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    position: 'absolute',
    right: 6,
    top: 9,
  },
  brainConnector: {
    width: 2,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 12,
    left: 15,
  },
  
  // Infinity Icon - Unlimited (Black outline)
  infinityLeft: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.8)',
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 5,
    top: 12,
  },
  infinityRight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.8)',
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 5,
    top: 12,
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
    backgroundColor: '#F2F2F7', // Apple's light gray background
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    // Apple-like subtle border
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
    paddingVertical: 32,
    marginBottom: 20,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    paddingVertical: 32,
    marginBottom: 20,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    height: 40,
  },
});

export default PremiumScreen;
