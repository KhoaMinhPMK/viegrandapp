import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usePremium } from '../../contexts/PremiumContext';
import { PremiumPlan, PlanComparison } from '../../types/premium';
import { PremiumStackParamList } from '../../types/navigation';

// Simple icon component
const Icon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => {
  const iconMap: { [key: string]: string } = {
    'arrow-back': '←',
    'checkmark': '✓',
    'close': '✗',
    'star': '⭐',
    'crown': '👑',
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {iconMap[name] || '•'}
    </Text>
  );
};

const { width } = Dimensions.get('window');

interface PlanComparisonItemProps {
  feature: string;
  free: boolean | string;
  premium: boolean | string;
  category: 'core' | 'advanced' | 'exclusive';
}

const PlanComparisonItem: React.FC<PlanComparisonItemProps> = ({
  feature,
  free,
  premium,
  category,
}) => {
  const getCategoryColor = () => {
    switch (category) {
      case 'core': return '#4CAF50';
      case 'advanced': return '#FF9800';
      case 'exclusive': return '#9C27B0';
      default: return '#666';
    }
  };

  const renderFeatureValue = (value: boolean | string, isPremium: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Icon name="checkmark" size={20} color={isPremium ? '#4CAF50' : '#666'} />
      ) : (
        <Icon name="close" size={20} color="#999" />
      );
    }
    return (
      <Text style={[styles.featureValue, isPremium && styles.premiumValue]}>
        {value}
      </Text>
    );
  };

  return (
    <View style={styles.comparisonItem}>
      <View style={styles.featureInfo}>
        <View style={[styles.categoryDot, { backgroundColor: getCategoryColor() }]} />
        <Text style={styles.featureName}>{feature}</Text>
      </View>
      <View style={styles.comparisonValues}>
        <View style={styles.valueColumn}>
          {renderFeatureValue(free, false)}
        </View>
        <View style={styles.valueColumn}>
          {renderFeatureValue(premium, true)}
        </View>
      </View>
    </View>
  );
};

interface PlanCardProps {
  plan: PremiumPlan;
  isSelected: boolean;
  onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onSelect }) => {
  // --- Logic and data preparation ---
  const priceText = `${plan.price.toLocaleString('vi-VN')}đ`;
  const periodText = `/${plan.type === 'monthly' ? 'tháng' : 'năm'}`;
  
  const recommendationNode = plan.isRecommended
    ? (
        <View style={styles.recommendedBadge}>
          <Icon name="star" size={12} color="#fff" />
          <Text style={styles.recommendedText}>KHUYẾN NGHỊ</Text>
        </View>
      )
    : null;

  const discountNode = (plan.discountPercent && plan.discountPercent > 0)
    ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {`Tiết kiệm ${plan.discountPercent}%`}
          </Text>
        </View>
      )
    : null;
    
  const buttonText = isSelected ? 'Đã chọn' : 'Chọn gói này';

  // --- JSX return ---
  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        isSelected && styles.planCardSelected,
        plan.isRecommended && styles.planCardRecommended,
      ]}
      onPress={onSelect}
    >
      {recommendationNode}
      
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.planPrice}>
          <Text style={styles.planPriceAmount}>{priceText}</Text>
          <Text style={styles.planPricePeriod}>{periodText}</Text>
        </View>
        {discountNode}
      </View>
      
      <Text style={styles.planDescription}>{plan.description}</Text>
      
      <TouchableOpacity
        style={[
          styles.selectButton,
          isSelected && styles.selectButtonSelected,
        ]}
        onPress={onSelect}
      >
        <Text style={[
          styles.selectButtonText,
          isSelected && styles.selectButtonTextSelected,
        ]}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

type PlanComparisonScreenRouteProp = RouteProp<PremiumStackParamList, 'PlanComparison'>;

const PlanComparisonScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PlanComparisonScreenRouteProp>();
  const { 
    plans, 
    loading, 
    error, 
    fetchPlans, 
    clearError,
    selectPlan 
  } = usePremium();
  
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(route.params?.initialPlanId || null);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  useEffect(() => {
    if (selectedPlanId) {
      const planToSelect = plans.find(p => p.id === selectedPlanId);
      if (planToSelect) {
        selectPlan(planToSelect);
      }
    }
  }, [selectedPlanId, plans, selectPlan]);

  const featureComparisons: PlanComparisonItemProps[] = [
    // Core Features
    {
      feature: 'Cuộc gọi cơ bản',
      free: true,
      premium: true,
      category: 'core',
    },
    {
      feature: 'Nhắn tin',
      free: true,
      premium: true,
      category: 'core',
    },
    {
      feature: 'Thông báo khẩn cấp',
      free: true,
      premium: true,
      category: 'core',
    },
    {
      feature: 'Giao diện cơ bản',
      free: true,
      premium: true,
      category: 'core',
    },
    
    // Advanced Features
    {
      feature: 'Gọi video',
      free: 'Giới hạn 5 phút',
      premium: 'Không giới hạn',
      category: 'advanced',
    },
    {
      feature: 'Theo dõi sức khỏe',
      free: 'Cơ bản',
      premium: 'AI thông minh',
      category: 'advanced',
    },
    {
      feature: 'Nhắc nhở uống thuốc',
      free: false,
      premium: true,
      category: 'advanced',
    },
    {
      feature: 'Báo cáo sức khỏe',
      free: false,
      premium: 'Hàng tuần',
      category: 'advanced',
    },
    
    // Exclusive Features
    {
      feature: 'Hỗ trợ ưu tiên 24/7',
      free: false,
      premium: true,
      category: 'exclusive',
    },
    {
      feature: 'Tư vấn bác sĩ trực tuyến',
      free: false,
      premium: true,
      category: 'exclusive',
    },
    {
      feature: 'Phân tích AI nâng cao',
      free: false,
      premium: true,
      category: 'exclusive',
    },
    {
      feature: 'Sao lưu cloud',
      free: false,
      premium: 'Không giới hạn',
      category: 'exclusive',
    },
    {
      feature: 'Chia sẻ với nhiều người thân',
      free: '1 người',
      premium: 'Không giới hạn',
      category: 'exclusive',
    },
  ];

  const handleSelectPlan = (plan: PremiumPlan) => {
    setSelectedPlanId(plan.id);
    selectPlan(plan);
  };

  const handleContinue = () => {
    if (!selectedPlanId) {
      Alert.alert('Thông báo', 'Vui lòng chọn một gói Premium');
      return;
    }
    
    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    if (selectedPlan) {
      (navigation as any).navigate('PaymentMethod', { 
        planId: selectedPlan.id,
        billingCycle: selectedPlan.type 
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>So sánh gói</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Plans Selection */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Chọn gói Premium</Text>
          <Text style={styles.sectionSubtitle}>
            Chọn gói phù hợp với nhu cầu của bạn
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.plansScrollView}
            contentContainerStyle={styles.plansContainer}
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                onSelect={() => handleSelectPlan(plan)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Features Comparison */}
        <View style={styles.comparisonSection}>
          <View style={styles.comparisonHeader}>
            <Text style={styles.sectionTitle}>So sánh tính năng</Text>
            <View style={styles.comparisonColumns}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>FREE</Text>
              </View>
              <View style={styles.columnHeader}>
                <Text style={[styles.columnTitle, styles.premiumColumnTitle]}>PREMIUM</Text>
                <Icon name="crown" size={16} color="#FF9800" />
              </View>
            </View>
          </View>

          {/* Category Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Cơ bản</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>Nâng cao</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
              <Text style={styles.legendText}>Độc quyền</Text>
            </View>
          </View>

          {/* Comparison Items */}
          {featureComparisons.map((comparison, index) => (
            <PlanComparisonItem
              key={index}
              feature={comparison.feature}
              free={comparison.free}
              premium={comparison.premium}
              category={comparison.category}
            />
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      {selectedPlanId && (
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Tiếp tục với {plans.find(p => p.id === selectedPlanId)?.name}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  plansSection: {
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  plansScrollView: {
    paddingHorizontal: 20,
  },
  plansContainer: {
    paddingRight: 20,
  },
  planCard: {
    width: width * 0.7,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  planCardRecommended: {
    borderColor: '#FF9800',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPriceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  planPricePeriod: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  discountBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectButtonTextSelected: {
    color: '#fff',
  },
  comparisonSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  comparisonHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  comparisonColumns: {
    flexDirection: 'row',
    marginTop: 16,
    paddingLeft: 120, // Space for feature names
  },
  columnHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  premiumColumnTitle: {
    color: '#FF9800',
    marginRight: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  comparisonValues: {
    flexDirection: 'row',
    width: 120,
  },
  valueColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  featureValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  premiumValue: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100, // Space for fixed button
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlanComparisonScreen;
