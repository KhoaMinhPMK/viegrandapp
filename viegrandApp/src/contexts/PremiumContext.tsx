import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  PremiumContextType,
  PremiumPlan,
  UserSubscription,
  PaymentMethod,
  PaymentTransaction,
} from '../types/premium';
import apiClient from '../services/api';

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

    // Actions
    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/premium/plans');
            if (response.data.success) {
                setPlans(response.data.data);
            }
        } catch (err) {
            setError('Không thể tải danh sách gói Premium.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPremiumStatus = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/premium/my-status');
            if (response.data.success) {
                setPremiumStatus(response.data.data);
                setCurrentSubscription(response.data.data.subscription);
            }
        } catch (err) {
            setError('Không thể lấy trạng thái Premium.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    const fetchPaymentMethods = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/premium/payment-methods');
            if (response.data.success) {
                setPaymentMethods(response.data.data);
            }
        } catch (err) {
            setError('Không thể tải phương thức thanh toán.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/premium/payment/my-transactions');
            if (response.data.success) {
                setTransactions(response.data.data);
            }
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
            const response = await apiClient.post('/premium/purchase', {
                planId,
                paymentMethod,
            });

            // Set result regardless of success or failure
            setPurchaseResult(response.data.data);

            if (response.data.success) {
                // On success, clear any previous error and refresh data
                setError(null);
                await fetchPremiumStatus();
                await fetchTransactions();
            } else {
                // On logical failure, set the error message from the server
                setError(response.data.message || 'Giao dịch không thành công.');
            }
            
            return response.data.data;

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
            await apiClient.put(`/premium/subscription/${currentSubscription.id}/cancel`, { cancelReason: reason });
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
    }), [
        plans, currentSubscription, premiumStatus, paymentMethods, transactions,
        loading, error, selectedPlan, selectedPaymentMethod, isPurchasing, purchaseResult,
        fetchPlans, fetchPremiumStatus, fetchPaymentMethods, fetchTransactions,
        selectPlan, selectPaymentMethod, purchasePremium, cancelSubscription, retryPayment,
        clearError, reset
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
