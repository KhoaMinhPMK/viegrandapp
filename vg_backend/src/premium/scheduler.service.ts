import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PremiumService } from './premium.service';
import { PaymentService } from './payment.service';
import { NotificationService } from './notification.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly premiumService: PremiumService,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  // Chạy mỗi giờ để kiểm tra subscription hết hạn
  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredSubscriptions(): Promise<void> {
    this.logger.log('Checking expired subscriptions...');
    
    try {
      const expiredSubscriptions = await this.premiumService.checkExpiredSubscriptions();
      
      if (expiredSubscriptions.length > 0) {
        this.logger.log(`Found ${expiredSubscriptions.length} expired subscriptions`);
        
        // Gửi thông báo cho các subscription hết hạn
        for (const subscription of expiredSubscriptions) {
          await this.notificationService.notifySubscriptionExpired(subscription);
        }
      }
    } catch (error) {
      this.logger.error('Error checking expired subscriptions:', error);
    }
  }

  // Chạy mỗi ngày để kiểm tra subscription sắp hết hạn
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringSubscriptions(): Promise<void> {
    this.logger.log('Checking expiring subscriptions...');
    
    try {
      const expiringSubscriptions = await this.premiumService.getExpiringSubscriptions();
      
      for (const subscription of expiringSubscriptions) {
        const daysLeft = Math.ceil((subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        // Thông báo khi còn 7, 3, 1 ngày
        if ([7, 3, 1].includes(daysLeft)) {
          await this.notificationService.notifySubscriptionExpiringSoon(subscription, daysLeft);
        }
      }
    } catch (error) {
      this.logger.error('Error checking expiring subscriptions:', error);
    }
  }

  // Chạy mỗi ngày để xử lý auto-renewal
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processAutoRenewals(): Promise<void> {
    this.logger.log('Processing auto-renewals...');
    
    try {
      const subscriptionsToRenew = await this.premiumService.getSubscriptionsForAutoRenewal();
      
      for (const subscription of subscriptionsToRenew) {
        try {
          // Tạo giao dịch thanh toán mới cho renewal
          const paymentTransaction = await this.paymentService.createTransaction({
            userId: subscription.userId,
            subscriptionId: subscription.id,
            planId: subscription.planId,
            amount: subscription.paidAmount, // Sử dụng số tiền đã thanh toán trước đó
            paymentMethod: subscription.paymentMethod,
            type: 'renewal',
            description: `Auto-renewal for subscription ${subscription.id}`,
            customerInfo: JSON.stringify({
              name: 'User', // Trong thực tế, cần lấy thông tin user
              email: 'user@example.com'
            })
          });

          // Khởi tạo thanh toán tự động
          await this.paymentService.initiatePayment(paymentTransaction.id, {
            amount: subscription.paidAmount,
            currency: 'VND',
            description: `Auto-renewal for subscription ${subscription.id}`,
            paymentMethod: subscription.paymentMethod,
            customerInfo: {
              name: 'User',
              email: 'user@example.com'
            },
            callbackUrl: `${process.env.API_BASE_URL}/premium/payment/callback`,
            returnUrl: `${process.env.FRONTEND_URL}/premium/payment/result`
          });

          this.logger.log(`Auto-renewal initiated for subscription ${subscription.id}`);
        } catch (error) {
          this.logger.error(`Failed to process auto-renewal for subscription ${subscription.id}:`, error);
          
          // Tăng số lần thanh toán thất bại
          await this.premiumService.incrementFailedPaymentAttempts(subscription.id);
        }
      }
    } catch (error) {
      this.logger.error('Error processing auto-renewals:', error);
    }
  }

  // Chạy mỗi tuần để dọn dẹp dữ liệu cũ
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldData(): Promise<void> {
    this.logger.log('Cleaning up old data...');
    
    try {
      // Xóa giao dịch thanh toán cũ hơn 1 năm
      await this.paymentService.cleanupOldTransactions();
      
      // Xóa subscription đã hủy cũ hơn 6 tháng
      await this.premiumService.cleanupOldSubscriptions();
      
      this.logger.log('Data cleanup completed');
    } catch (error) {
      this.logger.error('Error during data cleanup:', error);
    }
  }

  // Chạy mỗi 30 phút để kiểm tra transaction pending quá lâu
  @Cron('*/30 * * * *')
  async checkPendingTransactions(): Promise<void> {
    this.logger.log('Checking pending transactions...');
    
    try {
      const expiredTransactions = await this.paymentService.getExpiredTransactions();
      
      for (const transaction of expiredTransactions) {
        await this.paymentService.updateTransaction(transaction.id, {
          status: 'failed',
          failureReason: 'Transaction expired'
        });
        
        await this.notificationService.notifyPaymentFailed(transaction);
      }
      
      if (expiredTransactions.length > 0) {
        this.logger.log(`Marked ${expiredTransactions.length} transactions as expired`);
      }
    } catch (error) {
      this.logger.error('Error checking pending transactions:', error);
    }
  }

  // Method để thực hiện kiểm tra thủ công (dùng cho testing)
  async runManualCheck(): Promise<{
    expiredSubscriptions: number;
    expiringSubscriptions: number;
    autoRenewals: number;
    expiredTransactions: number;
  }> {
    this.logger.log('Running manual check...');
    
    const results = {
      expiredSubscriptions: 0,
      expiringSubscriptions: 0,
      autoRenewals: 0,
      expiredTransactions: 0
    };

    try {
      // Check expired subscriptions
      const expiredSubscriptions = await this.premiumService.checkExpiredSubscriptions();
      results.expiredSubscriptions = expiredSubscriptions.length;

      // Check expiring subscriptions
      const expiringSubscriptions = await this.premiumService.getExpiringSubscriptions();
      results.expiringSubscriptions = expiringSubscriptions.length;

      // Check auto-renewals
      const subscriptionsToRenew = await this.premiumService.getSubscriptionsForAutoRenewal();
      results.autoRenewals = subscriptionsToRenew.length;

      // Check expired transactions
      const expiredTransactions = await this.paymentService.getExpiredTransactions();
      results.expiredTransactions = expiredTransactions.length;

      this.logger.log('Manual check completed:', results);
      return results;
    } catch (error) {
      this.logger.error('Error during manual check:', error);
      throw error;
    }
  }
}
