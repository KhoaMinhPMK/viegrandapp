import { PremiumPlan } from './premium';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
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
  Family: undefined;
  Notifications: undefined;
  Premium: undefined;
  Sudoku: undefined;
};

export type RelativeStackParamList = {
  RelativeMain: undefined;
  Premium: undefined;
  EditProfile: undefined;
};

export type RelativeBottomTabParamList = {
  Home: undefined;
  Message: undefined;
  Health: undefined;
  Settings: undefined;
};

export type ElderlyBottomTabParamList = {
  HomeStack: undefined;
  Message: undefined;
  CenterAction: undefined;
  Health: undefined;
  Settings: undefined;
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
    planType?: string;
    planDuration?: number;
  };
  PaymentSuccess: { 
    transactionId: string;
    planName: string;
    planType?: string;
    planDuration?: number;
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
    planType?: string;
    planDuration?: number;
  };
  PaymentSuccess: { 
    transactionId: string;
    planName: string;
    planType?: string;
    planDuration?: number;
  };
  PaymentFailed: { 
    transactionId: string;
    error: string;
  };
  PaymentHistory: undefined;
  SubscriptionManagement: undefined;
};
