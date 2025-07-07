import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { premiumAPI } from '../services/api';
import { 
  PremiumPlan, 
  UserSubscription, 
  PremiumStatus, 
  PaymentMethod, 
  PaymentTransaction,
  PremiumContextType,
  CustomerInfo
} from '../types/premium';

// Action types
type PremiumAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLANS'; payload: PremiumPlan[] }
  | { type: 'SET_CURRENT_SUBSCRIPTION'; payload: UserSubscription | null }
  | { type: 'SET_PREMIUM_STATUS'; payload: PremiumStatus | null }
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'SET_TRANSACTIONS'; payload: PaymentTransaction[] }
  | { type: 'SET_SELECTED_PLAN'; payload: PremiumPlan | null }
  | { type: 'SET_SELECTED_PAYMENT_METHOD'; payload: PaymentMethod | null }
  | { type: 'RESET' };

// Initial state
interface PremiumState {
  plans: PremiumPlan[];
  currentSubscription: UserSubscription | null;
  premiumStatus: PremiumStatus | null;
  paymentMethods: PaymentMethod[];
  transactions: PaymentTransaction[];
  loading: boolean;
  error: string | null;
  selectedPlan: PremiumPlan | null;
  selectedPaymentMethod: PaymentMethod | null;
}

const initialState: PremiumState = {
  plans: [],
  currentSubscription: null,
  premiumStatus: null,
  paymentMethods: [],
  transactions: [],
  loading: false,
  error: null,
  selectedPlan: null,
  selectedPaymentMethod: null,
};

// Reducer
const premiumReducer = (state: PremiumState, action: PremiumAction): PremiumState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PLANS':
      return { ...state, plans: action.payload };
    case 'SET_CURRENT_SUBSCRIPTION':
      return { ...state, currentSubscription: action.payload };
    case 'SET_PREMIUM_STATUS':
      return { ...state, premiumStatus: action.payload };
    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_SELECTED_PLAN':
      return { ...state, selectedPlan: action.payload };
    case 'SET_SELECTED_PAYMENT_METHOD':
      return { ...state, selectedPaymentMethod: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// Context
const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// Provider component
export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(premiumReducer, initialState);

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const plans = await premiumAPI.getPlans();
      dispatch({ type: 'SET_PLANS', payload: plans });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Không thể tải danh sách gói Premium' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Fetch premium status
  const fetchPremiumStatus = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [premiumStatus, subscription] = await Promise.all([
        premiumAPI.getMyPremiumStatus(),
        premiumAPI.getMySubscription(),
      ]);
      dispatch({ type: 'SET_PREMIUM_STATUS', payload: premiumStatus });
      dispatch({ type: 'SET_CURRENT_SUBSCRIPTION', payload: subscription });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Không thể tải trạng thái Premium' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const methods = await premiumAPI.getPaymentMethods();
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: methods });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Không thể tải phương thức thanh toán' });
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const transactions = await premiumAPI.getMyTransactions();
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Không thể tải lịch sử giao dịch' });
    }
  }, []);

  // Select plan
  const selectPlan = useCallback((plan: PremiumPlan) => {
    dispatch({ type: 'SET_SELECTED_PLAN', payload: plan });
  }, []);

  // Select payment method
  const selectPaymentMethod = useCallback((method: PaymentMethod) => {
    dispatch({ type: 'SET_SELECTED_PAYMENT_METHOD', payload: method });
  }, []);

  // Purchase premium
  const purchasePremium = useCallback(async (customerInfo: CustomerInfo) => {
    if (!state.selectedPlan || !state.selectedPaymentMethod) {
      throw new Error('Vui lòng chọn gói Premium và phương thức thanh toán');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await premiumAPI.purchasePremium(
        state.selectedPlan.id,
        state.selectedPaymentMethod.id,
        customerInfo
      );

      // Update state with new subscription
      dispatch({ type: 'SET_CURRENT_SUBSCRIPTION', payload: result.subscription });
      
      // Add transaction to list
      dispatch({ 
        type: 'SET_TRANSACTIONS', 
        payload: [result.transaction, ...state.transactions] 
      });

      // Clear selections
      dispatch({ type: 'SET_SELECTED_PLAN', payload: null });
      dispatch({ type: 'SET_SELECTED_PAYMENT_METHOD', payload: null });

      return result;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Không thể mua gói Premium' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.selectedPlan, state.selectedPaymentMethod, state.transactions]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (reason: string) => {
    if (!state.currentSubscription) {
      throw new Error('Không có subscription để hủy');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedSubscription = await premiumAPI.cancelSubscription(
        state.currentSubscription.id,
        reason
      );

      dispatch({ type: 'SET_CURRENT_SUBSCRIPTION', payload: updatedSubscription });
      
      // Refresh premium status
      await fetchPremiumStatus();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Không thể hủy subscription' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentSubscription, fetchPremiumStatus]);

  // Retry payment
  const retryPayment = useCallback(async (transactionId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await premiumAPI.retryPayment(transactionId);
      
      // Refresh transactions
      await fetchTransactions();
      
      return result;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Không thể thử lại thanh toán' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchTransactions]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Reset state
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Context value
  const value: PremiumContextType = {
    // State
    plans: state.plans,
    currentSubscription: state.currentSubscription,
    premiumStatus: state.premiumStatus,
    paymentMethods: state.paymentMethods,
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    selectedPlan: state.selectedPlan,
    selectedPaymentMethod: state.selectedPaymentMethod,

    // Actions
    fetchPlans,
    fetchPremiumStatus,
    fetchPaymentMethods,
    fetchTransactions,
    selectPlan,
    selectPaymentMethod,
    purchasePremium,
    cancelSubscription,
    retryPayment,
    clearError,
    reset,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

// Hook to use premium context
export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

// Hook to check if user has premium
export const useIsPremium = (): boolean => {
  const { premiumStatus } = usePremium();
  return premiumStatus?.isPremium || false;
};

// Hook to get premium features
export const usePremiumFeatures = () => {
  const { premiumStatus, selectedPlan } = usePremium();
  
  const isPremium = premiumStatus?.isPremium || false;
  const currentPlan = premiumStatus?.plan || selectedPlan;
  
  const getFeatureAccess = (featureName: string): boolean => {
    if (!isPremium || !currentPlan) return false;
    return currentPlan.features.includes(featureName);
  };

  const getDaysRemaining = (): number => {
    return premiumStatus?.daysRemaining || 0;
  };

  const getSubscriptionStatus = (): string => {
    if (!premiumStatus?.subscription) return 'none';
    return premiumStatus.subscription.status;
  };

  return {
    isPremium,
    currentPlan,
    getFeatureAccess,
    getDaysRemaining,
    getSubscriptionStatus,
  };
};

// Hook for premium notifications
export const usePremiumNotifications = () => {
  const { premiumStatus } = usePremium();
  
  const getNotifications = () => {
    const notifications: string[] = [];
    
    if (premiumStatus?.subscription) {
      const daysRemaining = premiumStatus.daysRemaining;
      
      if (daysRemaining <= 0) {
        notifications.push('Gói Premium của bạn đã hết hạn');
      } else if (daysRemaining <= 7) {
        notifications.push(`Gói Premium sẽ hết hạn trong ${daysRemaining} ngày`);
      } else if (daysRemaining <= 30) {
        notifications.push(`Gói Premium sẽ hết hạn trong ${daysRemaining} ngày`);
      }
      
      if (premiumStatus.subscription.status === 'cancelled') {
        notifications.push('Gói Premium đã bị hủy');
      }
    }
    
    return notifications;
  };

  return { getNotifications };
};

export default PremiumContext;
