// Premium related types and interfaces

// Base User interface (copy from api.ts to avoid circular import)
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  active: boolean;
}

export interface PremiumPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  type: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isActive: boolean;
  sortOrder: number;
  isRecommended: boolean;
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  nextPaymentDate?: string;
  paidAmount: number;
  paymentMethod: 'momo' | 'zalopay' | 'vnpay' | 'credit_card';
  transactionId?: string;
  notes?: string;
  failedPaymentAttempts: number;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: number;
  userId: number;
  subscriptionId: number;
  planId: number;
  transactionCode: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'momo' | 'zalopay' | 'vnpay' | 'credit_card';
  gatewayTransactionId?: string;
  gatewayResponse?: string;
  type: 'subscription' | 'renewal' | 'refund' | 'upgrade';
  description: string;
  customerInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  paidAt?: string;
  expiresAt?: string;
  failureReason?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  subscription: UserSubscription | null;
  plan: PremiumPlan | null;
  daysRemaining: number;
}

// Payment method types
export type PaymentMethodType = 'credit_card' | 'e_wallet' | 'bank_transfer' | 'digital_wallet';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  isAvailable: boolean;
  processingFee: number;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  gatewayTransactionId?: string;
  paymentUrl?: string;
  message: string;
  data?: {
    qrCode?: string;
    deepLink?: string;
    expiresAt?: string;
  };
}

// Request types
export interface CreateSubscriptionRequest {
  planId: number;
  paymentMethod: 'momo' | 'zalopay' | 'vnpay' | 'credit_card';
  autoRenewal?: boolean;
  notes?: string;
}

export interface CreatePaymentRequest {
  subscriptionId: number;
  planId: number;
  amount: number;
  paymentMethod: 'momo' | 'zalopay' | 'vnpay' | 'credit_card';
  type: 'subscription' | 'renewal' | 'refund' | 'upgrade';
  description: string;
  customerInfo?: string;
}

export interface PaymentInitRequest {
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  callbackUrl: string;
  returnUrl: string;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    error?: string;
    timestamp: string;
    path: string;
    method: string;
  };
}

// Premium Context types
export interface PremiumContextType {
  // State
  plans: PremiumPlan[];
  currentSubscription: UserSubscription | null;
  premiumStatus: PremiumStatus | null;
  paymentMethods: PaymentMethod[];
  transactions: PaymentTransaction[];
  loading: boolean;
  error: string | null;
  
  // Selected states for purchase flow
  selectedPlan: PremiumPlan | null;
  selectedPaymentMethod: PaymentMethod | null;
  isPurchasing: boolean;
  purchaseResult: {
    success: boolean;
    subscription: UserSubscription;
    transaction: PaymentTransaction;
  } | null;
  
  // Actions
  fetchPlans: () => Promise<void>;
  fetchPremiumStatus: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  
  // Purchase flow
  selectPlan: (plan: PremiumPlan) => void;
  selectPaymentMethod: (method: PaymentMethod) => void;
  purchasePremium: (planId: number, paymentMethod: string) => Promise<{
    success: boolean;
    subscription: UserSubscription;
    transaction: PaymentTransaction;
  } | null>;
  
  // Subscription management
  cancelSubscription: (reason: string) => Promise<void>;
  retryPayment: (transactionId: number) => Promise<PaymentGatewayResponse>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

// Premium feature types
export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPremium: boolean;
  category: 'health' | 'communication' | 'safety' | 'support';
}

// Premium statistics
export interface PremiumStats {
  totalTransactions: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  subscriptionDuration: number;
  renewalCount: number;
}

// Payment processing states
export interface PaymentProcessingState {
  step: 'selecting_plan' | 'selecting_payment' | 'processing' | 'success' | 'failed';
  selectedPlan?: PremiumPlan;
  selectedPaymentMethod?: PaymentMethod;
  transaction?: PaymentTransaction;
  paymentUrl?: string;
  error?: string;
}

// Enhanced User type with Premium info
export interface UserWithPremium extends User {
  premiumStatus?: PremiumStatus;
  isPremium?: boolean;
}

// Customer info for payment
export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
}

// Premium plan comparison
export interface PlanComparison {
  feature: string;
  free: boolean | string;
  premium: boolean | string;
  category: 'core' | 'advanced' | 'exclusive';
}

// Premium promotion
export interface PremiumPromotion {
  id: number;
  title: string;
  description: string;
  discount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicablePlans: number[];
}

export default {};
