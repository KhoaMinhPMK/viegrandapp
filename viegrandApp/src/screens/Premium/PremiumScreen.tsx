import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PremiumStackParamList } from '../../types/navigation';

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import apiClient from '../../services/api';

const { width } = Dimensions.get('window');

// Interface cho Premium Plan từ API
interface PremiumPlan {
  id: number;
  name: string;
  display_name: string;
  price: number;
  currency: string;
  duration_type: 'monthly' | 'yearly';
  duration_value: number;
  description: string;
  is_recommended: boolean;
  discount_percentage: number;
  savings_text: string | null;
  features: string[];
}

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
  
  // State cho premium plans từ API
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch premium plans từ API
  const fetchPremiumPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get('/get_premium_list.php');
      
      console.log('Premium plans API response:', response.data);
      
      if (response.data.success) {
        setPlans(response.data.data || []);
      } else {
        setError(response.data.message || 'Không thể tải danh sách gói Premium');
      }
    } catch (error: any) {
      console.error('Fetch premium plans error:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data khi component mount
  useEffect(() => {
    fetchPremiumPlans();
  }, []);

  const handleUpgrade = (planId?: number) => {
    navigation.navigate('PlanComparison', { initialPlanId: planId });
  };

  const handleBack = () => {
    // Check if we can go back in the navigation stack
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If no back stack, navigate to appropriate home based on user role
      // This handles the case when Premium is accessed from bottom tabs
      const rootNavigation = navigation.getParent();
      if (rootNavigation) {
        // Try to go back to the previous tab or home
        rootNavigation.goBack();
      }
    }
  };

  // Format giá tiền
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={24} color="#0D4C92" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
              
              <FontAwesome5 name="crown" size={36} color="#006699" />
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
          
          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Đang tải danh sách gói...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchPremiumPlans}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Plans từ API */}
          {!isLoading && !error && plans.map((plan) => (
            <TouchableOpacity 
              key={plan.id}
              style={[
                styles.planCard, 
                plan.is_recommended && styles.planCardRecommended
              ]} 
              onPress={() => handleUpgrade(plan.id)}
            >
              {/* Recommended Badge */}
              {plan.is_recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Được khuyến nghị</Text>
            </View>
              )}
              
              {/* Plan Header */}
            <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.display_name}</Text>
              <View style={styles.planPrice}>
                  <Text style={styles.planPriceAmount}>{formatPrice(plan.price)}</Text>
                <Text style={styles.planPriceCurrency}>đ</Text>
              </View>
            </View>

              {/* Savings Badge */}
              {plan.discount_percentage > 0 && plan.savings_text && (
            <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{plan.savings_text}</Text>
            </View>
              )}

              {/* Plan Description */}
              <Text style={styles.planDescription}>{plan.description}</Text>

              {/* Plan Features */}
            <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.planFeatureRow}>
                <CheckIcon size={16} color="#34C759" />
                    <Text style={styles.planFeatureItem}>{feature}</Text>
              </View>
                ))}
            </View>
          </TouchableOpacity>
          ))}

          {/* CTA Button */}
          <TouchableOpacity style={styles.ctaButton} onPress={() => handleUpgrade()}>
            <Text style={styles.ctaButtonText}>Bắt đầu dùng thử</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: 32 }]}>
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PremiumScreen;
