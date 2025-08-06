import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { usePremium } from '../../contexts/PremiumContext'

import { PremiumStackParamList } from '../../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
// --- Icons (as simple, direct components) ---
const BackArrowIcon = () => (
    <View style={styles.iconBackArrow} />
)

const CheckIcon = ({ color = '#FFFFFF', size = 'normal' }: { color?: string, size?: 'normal' | 'small' }) => (
  <View style={size === 'small' ? styles.iconCheckSmall : styles.iconCheckNormal}>
    <View style={[styles.iconCheckMark, { borderColor: color }]} />
  </View>
)

const CloseIcon = () => (
    <View style={styles.iconCloseContainer}>
        <View style={styles.iconCloseLine} />
        <View style={[styles.iconCloseLine, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
)

const StarIcon = () => (
    <Text style={styles.iconStar}>★</Text>
)

// --- Main Screen Component ---
function PlanComparisonScreen({ navigation }: any) {
  const { plans, fetchPlans, loading } = usePremium()
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  
  // ✅ ĐÚNG: Hook được gọi bên trong component
  const handleBack = () => {
    // Check if we can go back in the navigation stack
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If no back stack, navigate to appropriate home based on user role
      const rootNavigation = navigation.getParent();
      if (rootNavigation) {
        rootNavigation.goBack();
      }
    }
  };

  useEffect(() => {
    // Initial fetch of plans
    fetchPlans()
  }, [])

  const handleContinue = () => {
    if (!selectedPlan) {
      Alert.alert('Thông báo', 'Vui lòng chọn một gói Premium.')
      return
    }
    // Navigate to the next step in the purchase flow
    navigation.navigate('PaymentMethod', { plan: selectedPlan })
  }

  // --- Static Data ---
  const features = [
    { name: 'Cuộc gọi video không giới hạn', free: false, premium: true },
    { name: 'Theo dõi sức khỏe AI', free: 'limited', premium: true },
    { name: 'Nhắc nhở uống thuốc thông minh', free: false, premium: true },
    { name: 'Báo cáo sức khỏe hàng tuần', free: false, premium: true },
    { name: 'Hỗ trợ ưu tiên 24/7', free: false, premium: true },
    { name: 'Tư vấn bác sĩ trực tuyến', free: false, premium: true },
    { name: 'Sao lưu cloud không giới hạn', free: 'limited', premium: true },
    { name: 'Chia sẻ với nhiều người thân', free: 'limited', premium: true },
  ]
  
  // --- Render Logic ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Scrollable Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 280 }]}>
          {/* Hero Section */}
          
          <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={24} color="#0D4C92" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={styles.headerRight} />
        </View>



          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Feather name="award" size={36} color="#FFD700" />
            </View>
            <Text style={styles.heroTitle}>Nâng cấp Premium</Text>
            <Text style={styles.heroSubtitle}>Trải nghiệm đầy đủ các tính năng cao cấp dành cho người thân yêu.</Text>
          </View>
          
          {/* Plans Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn gói phù hợp</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 40 }} />
            ) : plans && plans.length > 0 ? (
              <View style={styles.plansContainer}>
                {plans.map(plan => {
                  const isSelected = selectedPlan?.id === plan.id
                  const isYearly = plan.type === 'yearly'
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[styles.planCard, isSelected && styles.planCardSelected]}
                      onPress={() => setSelectedPlan(plan)}
                      activeOpacity={0.8}
                    >
                      {isSelected && (
                        <View style={styles.checkIconContainer}>
                          <Feather name="check" size={16} color="#FFFFFF" />
                        </View>
                      )}
                      {isYearly && (
                        <View style={styles.popularBadge}><Text style={styles.popularText}>Phổ biến nhất</Text></View>
                      )}
                      <Text style={styles.planName}>{plan.name || ''}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceAmount}>{(plan.price || 0).toLocaleString()}</Text>
                        <Text style={styles.pricePeriod}>{`/ ${plan.type === 'monthly' ? 'tháng' : 'năm'}`}</Text>
                      </View>
                      <Text style={styles.planDescription}>{plan.description || ''}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không thể tải các gói Premium.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchPlans}>
                  <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Features Comparison Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>So sánh tính năng</Text>
            <View style={styles.comparisonTable}>
              <View style={styles.comparisonHeader}>
                <Text style={[styles.comparisonCell, styles.comparisonFeatureHeader]}>TÍNH NĂNG</Text>
                <Text style={[styles.comparisonCell, styles.comparisonValueHeader]}>MIỄN PHÍ</Text>
                <Text style={[styles.comparisonCell, styles.comparisonValueHeader, { color: '#007AFF' }]}>PREMIUM</Text>
              </View>
              {features.map((feature, index) => (
                <View key={index} style={styles.comparisonRow}>
                  <Text style={[styles.comparisonCell, styles.featureName]}>{feature.name}</Text>
                  <View style={[styles.comparisonCell, styles.featureValue]}>
                    {typeof feature.free === 'boolean'
                      ? (feature.free ? <CheckIcon color="#34C759" size="small" /> : <CloseIcon />)
                      : (<Text style={styles.limitedText}>Giới hạn</Text>)
                    }
                  </View>
                  <View style={[styles.comparisonCell, styles.featureValue]}>
                    {feature.premium
                      ? <CheckIcon color="#34C759" size="small" />
                      : <CloseIcon />
                    }
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.bottomAction, { paddingBottom: 24 }]}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedPlan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={!selectedPlan ? ['#BDBDBD', '#BDBDBD'] : ['#007AFF', '#5856D6']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>
                {selectedPlan ? `Tiếp tục với ${selectedPlan.name}` : 'Chọn một gói'}
              </Text>
              <Feather name="arrow-right" size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.secureText}>Thanh toán an toàn và bảo mật</Text>
        </View>

        </ScrollView>
        
        {/* Bottom Action Bar */}

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // --- Layout & Structure ---
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1, paddingTop: 60 }, // Added paddingTop to account for transparent header
  scrollContent: { paddingHorizontal: 16 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 16 },

  // --- Header ---
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EAEAEA',
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#000000' },
  headerRightPlaceholder: { width: 40, height: 40 },

  // --- Hero Section ---
  heroSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 20},
  heroIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 199, 0, 0.2)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E', marginTop: 16, marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: '#6A6A6E', textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },

  // --- Plans ---
  plansContainer: { gap: 12 },
  planCard: {
    borderRadius: 16, // Softer corners
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FAFAFA',
    position: 'relative',
    overflow: 'hidden', // Ensures inner elements respect border radius
  },


  
  planCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },




  headerRight: {
    width: 44,
  },
  checkIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  popularBadge: {
    position: 'absolute', top: 0, right: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10, paddingVertical: 4,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  popularText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  planName: { fontSize: 18, fontWeight: '600', color: '#1C1C1E', marginBottom: 4 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  priceAmount: { fontSize: 28, fontWeight: 'bold', color: '#007AFF' },
  pricePeriod: { fontSize: 16, color: '#6A6A6E', marginLeft: 4, fontWeight: '500'},
  planDescription: { fontSize: 14, color: '#6A6A6E' },

  // --- Comparison Table ---
  comparisonTable: { borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, overflow: 'hidden' },
  comparisonHeader: { flexDirection: 'row', backgroundColor: '#F8F8F8', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  comparisonCell: { paddingHorizontal: 8, paddingVertical: 12 },
  comparisonFeatureHeader: { flex: 2, fontWeight: '600', color: '#6A6A6E', fontSize: 12, },
  comparisonValueHeader: { flex: 1, textAlign: 'center', fontWeight: '600', color: '#6A6A6E', fontSize: 12,},
  featureName: { flex: 2, fontSize: 15, color: '#1C1C1E', lineHeight: 20 },
  featureValue: { flex: 1, alignItems: 'center' },
  limitedText: { fontSize: 13, color: '#6A6A6E' },

  // --- Bottom Action ---
  bottomAction: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  continueButton: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
  secureText: { fontSize: 13, color: '#8E8E93', textAlign: 'center', marginTop: 12, paddingBottom: 100},
  
  // --- Loading/Empty ---
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#6A6A6E', marginBottom: 16 },
  retryButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  // --- Icons ---
  iconBackArrow: { width: 10, height: 10, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: '#1C1C1E', transform: [{ rotate: '-45deg' }], marginRight: 2 },
  iconCheckNormal: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#34C759', alignItems: 'center', justifyContent: 'center' },
  iconCheckSmall: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(52, 199, 89, 0.15)', alignItems: 'center', justifyContent: 'center' },
  iconCheckMark: { width: '45%', height: '65%', borderRightWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }], marginTop: -2 },
  iconCloseContainer: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  iconCloseLine: { position: 'absolute', width: 12, height: 2, backgroundColor: '#FF3B30', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  iconStar: { fontSize: 28, color: '#FFC700' },
});

export default PlanComparisonScreen
