import { PremiumPlan } from './premium';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SelectRole: undefined;
  Auth: undefined;
  Elderly: undefined;
  Relative: undefined;
  Premium: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Verification: undefined;
};

export type ElderlyStackParamList = {
  Main: undefined;
  Notifications: undefined;
  Premium: undefined;
  Sudoku: undefined;
};

export type RelativeStackParamList = {
  RelativeHome: undefined;
  RelativeProfile: undefined;
  RelativeSettings: undefined;
  Premium: undefined;
};

export type PremiumStackParamList = {
  PremiumHome: undefined;
  PlanComparison: { initialPlanId?: number } | undefined;
  PaymentMethod: { plan: PremiumPlan };
  PaymentProcessing: { 
    planId: number; 
    billingCycle: string;
    paymentMethod: string;
    amount: number;
  };
  PaymentSuccess: { 
    transactionId: string;
    planName: string;
  };
  PaymentFailed: { 
    transactionId: string;
    error: string;
  };
  PaymentHistory: undefined;
  SubscriptionManagement: undefined;
};

export type PremiumNavigationProps = {
  PremiumHome: undefined;
  PlanComparison: undefined;
  PaymentMethod: { planId: number };
  PaymentProcessing: { 
    planId: number; 
    paymentMethod: string;
    customerInfo: any;
  };
  PaymentSuccess: { 
    transactionId: string;
    planName: string;
  };
  PaymentFailed: { 
    transactionId: string;
    error: string;
  };
  PaymentHistory: undefined;
  SubscriptionManagement: undefined;
};
