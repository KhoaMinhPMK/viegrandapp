import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePremiumPlanDto, UpdatePremiumPlanDto } from './dto/premium-plan.dto';
import { CreateUserSubscriptionDto, UpdateUserSubscriptionDto, CancelSubscriptionDto } from './dto/user-subscription.dto';
import { PremiumPlan } from './entities/premium-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';

@Injectable()
export class PremiumService {
  private premiumPlans: PremiumPlan[] = [
    {
      id: 1,
      name: 'Premium Monthly',
      description: 'Gói Premium hàng tháng với đầy đủ tính năng dành cho người cao tuổi',
      price: 99000,
      duration: 30,
      type: 'monthly',
      features: [
        'Gọi video không giới hạn',
        'Theo dõi sức khỏe AI',
        'Hỗ trợ ưu tiên 24/7',
        'Nhắc nhở uống thuốc thông minh',
        'Báo cáo sức khỏe hàng tuần',
        'Kết nối với bác sĩ'
      ],
      isActive: true,
      sortOrder: 1,
      isRecommended: true,
      discountPercent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: 'Premium Yearly',
      description: 'Gói Premium hàng năm tiết kiệm 20% so với thanh toán hàng tháng',
      price: 950000,
      duration: 365,
      type: 'yearly',
      features: [
        'Tất cả tính năng Premium Monthly',
        'Tiết kiệm 20% so với thanh toán hàng tháng',
        'Tư vấn sức khỏe cá nhân hóa',
        'Báo cáo chi tiết hàng tháng',
        'Ưu tiên hỗ trợ kỹ thuật'
      ],
      isActive: true,
      sortOrder: 2,
      isRecommended: false,
      discountPercent: 20,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private userSubscriptions: UserSubscription[] = [];
  private subscriptionIdCounter = 1;

  // Premium Plans Management
  async getAllPlans(): Promise<PremiumPlan[]> {
    return this.premiumPlans.filter(plan => plan.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getPlanById(id: number): Promise<PremiumPlan> {
    const plan = this.premiumPlans.find(p => p.id === id);
    if (!plan) {
      throw new NotFoundException(`Premium plan with ID ${id} not found`);
    }
    return plan;
  }

  async createPlan(createPlanDto: CreatePremiumPlanDto): Promise<PremiumPlan> {
    const newId = Math.max(...this.premiumPlans.map(p => p.id)) + 1;
    const newPlan: PremiumPlan = {
      id: newId,
      ...createPlanDto,
      isActive: createPlanDto.isActive ?? true,
      sortOrder: createPlanDto.sortOrder ?? newId,
      isRecommended: createPlanDto.isRecommended ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.premiumPlans.push(newPlan);
    return newPlan;
  }

  async updatePlan(id: number, updatePlanDto: UpdatePremiumPlanDto): Promise<PremiumPlan> {
    const planIndex = this.premiumPlans.findIndex(p => p.id === id);
    if (planIndex === -1) {
      throw new NotFoundException(`Premium plan with ID ${id} not found`);
    }

    this.premiumPlans[planIndex] = {
      ...this.premiumPlans[planIndex],
      ...updatePlanDto,
      updatedAt: new Date()
    };

    return this.premiumPlans[planIndex];
  }

  async deletePlan(id: number): Promise<void> {
    const planIndex = this.premiumPlans.findIndex(p => p.id === id);
    if (planIndex === -1) {
      throw new NotFoundException(`Premium plan with ID ${id} not found`);
    }

    // Soft delete - set isActive to false
    this.premiumPlans[planIndex].isActive = false;
    this.premiumPlans[planIndex].updatedAt = new Date();
  }

  // User Subscriptions Management
  async getUserSubscription(userId: number): Promise<UserSubscription | null> {
    return this.userSubscriptions.find(sub => 
      sub.userId === userId && sub.status === 'active'
    ) || null;
  }

  async createSubscription(createSubscriptionDto: CreateUserSubscriptionDto): Promise<UserSubscription> {
    // Check if user already has an active subscription
    const existingSubscription = await this.getUserSubscription(createSubscriptionDto.userId);
    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Get plan details
    const plan = await this.getPlanById(createSubscriptionDto.planId);
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    const newSubscription: UserSubscription = {
      id: this.subscriptionIdCounter++,
      userId: createSubscriptionDto.userId,
      planId: createSubscriptionDto.planId,
      status: 'pending',
      startDate,
      endDate,
      autoRenewal: createSubscriptionDto.autoRenewal ?? true,
      nextPaymentDate: plan.type === 'monthly' ? endDate : null,
      paidAmount: 0,
      paymentMethod: createSubscriptionDto.paymentMethod,
      transactionId: null,
      notes: createSubscriptionDto.notes,
      failedPaymentAttempts: 0,
      cancelledAt: null,
      cancelReason: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.userSubscriptions.push(newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: number, updateSubscriptionDto: UpdateUserSubscriptionDto): Promise<UserSubscription> {
    const subscriptionIndex = this.userSubscriptions.findIndex(sub => sub.id === id);
    if (subscriptionIndex === -1) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    this.userSubscriptions[subscriptionIndex] = {
      ...this.userSubscriptions[subscriptionIndex],
      ...updateSubscriptionDto,
      updatedAt: new Date()
    };

    return this.userSubscriptions[subscriptionIndex];
  }

  async cancelSubscription(id: number, cancelDto: CancelSubscriptionDto): Promise<UserSubscription> {
    const subscriptionIndex = this.userSubscriptions.findIndex(sub => sub.id === id);
    if (subscriptionIndex === -1) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    this.userSubscriptions[subscriptionIndex] = {
      ...this.userSubscriptions[subscriptionIndex],
      status: 'cancelled',
      autoRenewal: false,
      cancelledAt: new Date(),
      cancelReason: cancelDto.cancelReason,
      updatedAt: new Date()
    };

    return this.userSubscriptions[subscriptionIndex];
  }

  async getUserSubscriptions(userId: number): Promise<UserSubscription[]> {
    return this.userSubscriptions.filter(sub => sub.userId === userId);
  }

  // Premium Status Check
  async isPremiumUser(userId: number): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return false;
    
    return subscription.status === 'active' && subscription.endDate > new Date();
  }

  async getPremiumStatus(userId: number): Promise<{
    isPremium: boolean;
    subscription: UserSubscription | null;
    plan: PremiumPlan | null;
    daysRemaining: number;
  }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      return {
        isPremium: false,
        subscription: null,
        plan: null,
        daysRemaining: 0
      };
    }

    const plan = await this.getPlanById(subscription.planId);
    const daysRemaining = Math.max(0, 
      Math.ceil((subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      isPremium: subscription.status === 'active' && subscription.endDate > new Date(),
      subscription,
      plan,
      daysRemaining
    };
  }

  // Auto-renewal and subscription management
  async processSubscriptionRenewal(subscriptionId: number): Promise<UserSubscription> {
    const subscription = this.userSubscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    if (!subscription.autoRenewal) {
      throw new BadRequestException('Auto-renewal is disabled for this subscription');
    }

    const plan = await this.getPlanById(subscription.planId);
    const newEndDate = new Date(subscription.endDate);
    newEndDate.setDate(newEndDate.getDate() + plan.duration);

    subscription.endDate = newEndDate;
    subscription.nextPaymentDate = plan.type === 'monthly' ? newEndDate : null;
    subscription.updatedAt = new Date();

    return subscription;
  }

  async checkExpiredSubscriptions(): Promise<UserSubscription[]> {
    const now = new Date();
    const expiredSubscriptions = this.userSubscriptions.filter(sub => 
      sub.status === 'active' && sub.endDate < now
    );

    // Update expired subscriptions
    expiredSubscriptions.forEach(sub => {
      sub.status = 'expired';
      sub.updatedAt = now;
    });

    return expiredSubscriptions;
  }

  // Additional methods for scheduler
  async getExpiringSubscriptions(): Promise<UserSubscription[]> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return this.userSubscriptions.filter(sub => 
      sub.status === 'active' && 
      sub.endDate > now && 
      sub.endDate <= sevenDaysFromNow
    );
  }

  async getSubscriptionsForAutoRenewal(): Promise<UserSubscription[]> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    return this.userSubscriptions.filter(sub => 
      sub.status === 'active' && 
      sub.autoRenewal && 
      sub.endDate <= tomorrow
    );
  }

  async incrementFailedPaymentAttempts(subscriptionId: number): Promise<void> {
    const subscription = this.userSubscriptions.find(sub => sub.id === subscriptionId);
    if (subscription) {
      subscription.failedPaymentAttempts++;
      subscription.updatedAt = new Date();
      
      // Disable auto-renewal if failed attempts exceed 3
      if (subscription.failedPaymentAttempts >= 3) {
        subscription.autoRenewal = false;
      }
    }
  }

  async cleanupOldSubscriptions(): Promise<void> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Remove cancelled subscriptions older than 6 months
    this.userSubscriptions = this.userSubscriptions.filter(sub => 
      !(sub.status === 'cancelled' && sub.cancelledAt && new Date(sub.cancelledAt) < sixMonthsAgo)
    );
  }

  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    cancelled: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: this.userSubscriptions.length,
      active: this.userSubscriptions.filter(sub => sub.status === 'active').length,
      expired: this.userSubscriptions.filter(sub => sub.status === 'expired').length,
      cancelled: this.userSubscriptions.filter(sub => sub.status === 'cancelled').length,
      totalRevenue: this.userSubscriptions
        .filter(sub => sub.status === 'active' || sub.status === 'expired')
        .reduce((sum, sub) => sum + sub.paidAmount, 0),
      monthlyRevenue: this.userSubscriptions
        .filter(sub => 
          (sub.status === 'active' || sub.status === 'expired') && 
          sub.createdAt >= thisMonth
        )
        .reduce((sum, sub) => sum + sub.paidAmount, 0)
    };

    return stats;
  }
}
