import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  PremiumContextType,
  PremiumPlan,
  UserSubscription,
  PaymentMethod,
  PaymentTransaction,
} from '../types/premium';
import { updateUserData } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    // Actions - tất cả đều mock functions
    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            // Mock plans data
            const mockPlans: PremiumPlan[] = [
                {
                    id: 1,
                    name: 'Gói Cơ Bản',
                    description: 'Gói premium cơ bản với các tính năng cần thiết',
                    price: 99000,
                    duration: 30,
                    type: 'monthly',
                    features: ['Chăm sóc cơ bản', 'Hỗ trợ 24/7'],
                    isActive: true,
                    sortOrder: 1,
                    isRecommended: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            setPlans(mockPlans);
        } catch (err) {
            setError('Không thể tải danh sách gói Premium.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPremiumStatus = useCallback(async () => {
        setLoading(true);
        try {
            // Mock premium status
            const mockStatus = {
                isPremium: false,
                subscription: null,
                plan: null,
                daysRemaining: 0
            };
            setPremiumStatus(mockStatus);
            setCurrentSubscription(null);
        } catch (err) {
            setError('Không thể lấy trạng thái Premium.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    const fetchPaymentMethods = useCallback(async () => {
        setLoading(true);
        try {
            // Mock payment methods
            const mockMethods: PaymentMethod[] = [
                {
                    id: 'momo',
                    type: 'e_wallet',
                    name: 'Ví MoMo',
                    description: 'Thanh toán qua MoMo',
                    icon: '🐷',
                    enabled: true,
                    isAvailable: true,
                    processingFee: 0
                },
            ];
            setPaymentMethods(mockMethods);
        } catch (err) {
            setError('Không thể tải phương thức thanh toán.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            // Mock empty transactions
            setTransactions([]);
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
            // Lấy email từ cache để update premium status
            const userEmail = await AsyncStorage.getItem('user_email');
            
            if (!userEmail) {
                setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
                return null;
            }

            console.log('Purchasing premium for email:', userEmail);

            // Tính toán ngày bắt đầu và kết thúc gói premium
            const currentDate = new Date();
            const startDate = currentDate.toISOString();
            
            // Tính end date dựa trên plan:
            // planId 1 = Monthly (30 days)
            // planId 2 = Yearly (365 days)
            const daysToAdd = planId === 2 ? 365 : 30;
            const endDate = new Date();
            endDate.setDate(currentDate.getDate() + daysToAdd);
            const endDateISO = endDate.toISOString();

            console.log('Premium dates:', {
                planId,
                startDate,
                endDate: endDateISO,
                daysToAdd
            });

            // Cập nhật premium status và dates cho user
            const updateResult = await updateUserData(userEmail, {
                premium_status: true,
                premium_start_date: startDate,
                premium_end_date: endDateISO
            });

            if (!updateResult.success) {
                setError(updateResult.message || 'Không thể cập nhật trạng thái Premium');
                return null;
            }

            console.log('Premium status updated successfully:', updateResult.user);

            // Mock subscription và transaction data sau khi update thành công
            const mockSubscription: UserSubscription = {
                id: Date.now(),
                userId: updateResult.user?.userId || 1,
                planId: planId,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + (planId === 2 ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                autoRenewal: false,
                paidAmount: planId === 2 ? 990000 : 99000,
                paymentMethod: paymentMethod as any,
                failedPaymentAttempts: 0
            };

            const mockTransaction: PaymentTransaction = {
                id: Date.now(),
                userId: updateResult.user?.userId || 1,
                subscriptionId: mockSubscription.id,
                transactionCode: 'VG_' + Date.now(),
                amount: planId === 2 ? 990000 : 99000,
                status: 'completed',
                paymentMethod: paymentMethod as any,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                planId: planId,
                currency: 'VND',
                type: 'subscription',
                description: `Premium ${planId === 2 ? 'Yearly' : 'Monthly'} subscription`,
                retryCount: 0
            };

            const result = {
                success: true,
                subscription: mockSubscription,
                transaction: mockTransaction,
            };

            setPurchaseResult(result);
            setError(null);
            
            // Refresh premium status
            setTimeout(() => {
                fetchPremiumStatus();
            }, 500);

            return result;
        } catch (err: any) {
            console.error('Purchase premium error:', err);
            const errorMessage = err.message || 'Đã có lỗi xảy ra khi mua Premium.';
            setError(errorMessage);
            return null;
        } finally {
            setIsPurchasing(false);
        }
    }, [fetchPremiumStatus]);

    const cancelSubscription = useCallback(async (reason: string) => {
        if (!currentSubscription) {
            setError('Không có gói nào để hủy.');
            return;
        }
        setLoading(true);
        try {
            // Mock cancel
            console.log('Mock cancel subscription:', reason);
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
