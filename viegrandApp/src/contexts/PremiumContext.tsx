import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  PremiumContextType,
  PremiumPlan,
  UserSubscription,
  PaymentMethod,
  PaymentTransaction,
} from '../types/premium';
import { premiumAPI } from '../services/api';

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State
    const [plans, setPlans] = useState<PremiumPlan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
    const [premiumStatus, setPremiumStatus] = useState<any>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Purchase flow state
    const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseResult, setPurchaseResult] = useState<any>(null);
    
    // Refresh trigger state
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Actions
    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const plansData = await premiumAPI.getPlans();
            setPlans(plansData);
        } catch (err) {
            setError('Không thể tải danh sách gói Premium.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPremiumStatus = useCallback(async () => {
        setLoading(true);
        try {
            const statusData = await premiumAPI.getMyPremiumStatus();
            setPremiumStatus(statusData);
            setCurrentSubscription(statusData.subscription);
        } catch (err) {
            setError('Không thể lấy trạng thái Premium.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    const fetchPaymentMethods = useCallback(async () => {
        setLoading(true);
        try {
            const methodsData = await premiumAPI.getPaymentMethods();
            setPaymentMethods(methodsData);
        } catch (err) {
            setError('Không thể tải phương thức thanh toán.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const transactionsData = await premiumAPI.getMyTransactions();
            setTransactions(transactionsData);
        } catch (err) {
            setError('Không thể tải lịch sử giao dịch.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    const selectPlan = useCallback((plan: PremiumPlan) => {
        setSelectedPlan(plan);
    }, []);

    const selectPaymentMethod = useCallback((method: PaymentMethod) => {
        setSelectedPaymentMethod(method);
    }, []);

    const purchasePremium = useCallback(async (planId: number, paymentMethod: string) => {
        if (!planId || !paymentMethod) {
            setError('Vui lòng chọn gói và phương thức thanh toán.');
            return null;
        }

        setIsPurchasing(true);
        setError(null);
        setPurchaseResult(null);

        try {
            const result = await premiumAPI.purchase(planId, paymentMethod);

            // Set result regardless of success or failure
            setPurchaseResult(result);

            if (result.success) {
                // On success, clear any previous error and refresh data
                setError(null);
                await fetchPremiumStatus();
                await fetchTransactions();
                
                // Thêm một delay nhỏ để đảm bảo data được cập nhật
                setTimeout(() => {
                    fetchPremiumStatus();
                }, 1000);
            } else {
                // On logical failure, set the error message from the server
                setError(result.message || 'Giao dịch không thành công.');
            }
            
            return result;

        } catch (err: any) {
            // Handle network or server errors
            const errorMessage = err.response?.data?.message || err.message || 'Đã có lỗi mạng xảy ra.';
            setError(errorMessage);
            const result = err.response?.data?.data || { success: false, transaction: null };
            setPurchaseResult(result);
            return result;
        } finally {
            setIsPurchasing(false);
        }
    }, [fetchPremiumStatus, fetchTransactions]);

    const cancelSubscription = useCallback(async (reason: string) => {
        if (!currentSubscription) {
            setError('Không có gói nào để hủy.');
            return;
        }
        setLoading(true);
        try {
            await premiumAPI.cancelSubscription(currentSubscription.id, reason);
            await fetchPremiumStatus(); // Refresh status
        } catch (err) {
            setError('Không thể hủy gói Premium.');
        } finally {
            setLoading(false);
        }
    }, [currentSubscription, fetchPremiumStatus]);
    
    const retryPayment = useCallback(async (transactionId: number) => {
      // Logic for retrying payment can be implemented here
      // For now, it will return a mock response
      return Promise.resolve({ success: true, paymentUrl: 'mock_retry_url' } as any);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const reset = useCallback(() => {
        setSelectedPlan(null);
        setSelectedPaymentMethod(null);
        setError(null);
        setPurchaseResult(null);
    }, []);

    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Auto refresh premium status when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchPremiumStatus();
        }
    }, [refreshTrigger, fetchPremiumStatus]);

    const value: PremiumContextType = useMemo(() => ({
        plans,
        currentSubscription,
        premiumStatus,
        paymentMethods,
        transactions,
        loading,
        error,
        selectedPlan,
        selectedPaymentMethod,
        isPurchasing,
        purchaseResult,
        refreshTrigger,
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
        triggerRefresh,
    }), [
        plans, currentSubscription, premiumStatus, paymentMethods, transactions,
        loading, error, selectedPlan, selectedPaymentMethod, isPurchasing, purchaseResult, refreshTrigger,
        fetchPlans, fetchPremiumStatus, fetchPaymentMethods, fetchTransactions,
        selectPlan, selectPaymentMethod, purchasePremium, cancelSubscription, retryPayment,
        clearError, reset, triggerRefresh
    ]);

    return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = () => {
    const context = useContext(PremiumContext);
    if (context === undefined) {
        throw new Error('usePremium must be used within a PremiumProvider');
    }
    return context;
};
