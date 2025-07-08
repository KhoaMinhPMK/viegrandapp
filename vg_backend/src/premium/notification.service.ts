import { Injectable, Logger } from '@nestjs/common';
import { UserSubscription } from './entities/user-subscription.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';

export interface NotificationData {
  userId: number;
  type: 'subscription_created' | 'subscription_activated' | 'subscription_expired' | 'payment_completed' | 'payment_failed' | 'subscription_cancelled';
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendNotification(notification: NotificationData): Promise<void> {
    try {
      // In a real app, this would send push notifications, emails, etc.
      this.logger.log(`Sending notification to user ${notification.userId}: ${notification.title}`);
      
      // Mock notification sending
      await this.mockSendPushNotification(notification);
      await this.mockSendEmail(notification);
      
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
    }
  }

  async notifySubscriptionCreated(subscription: UserSubscription): Promise<void> {
    await this.sendNotification({
      userId: subscription.userId,
      type: 'subscription_created',
      title: 'Đăng ký Premium thành công',
      message: 'Bạn đã đăng ký gói Premium thành công. Vui lòng hoàn tất thanh toán để kích hoạt tài khoản.',
      data: { subscriptionId: subscription.id }
    });
  }

  async notifySubscriptionActivated(subscription: UserSubscription): Promise<void> {
    await this.sendNotification({
      userId: subscription.userId,
      type: 'subscription_activated',
      title: 'Tài khoản Premium đã được kích hoạt',
      message: 'Chúc mừng! Tài khoản Premium của bạn đã được kích hoạt. Hãy khám phá các tính năng mới.',
      data: { subscriptionId: subscription.id }
    });
  }

  async notifySubscriptionExpired(subscription: UserSubscription): Promise<void> {
    await this.sendNotification({
      userId: subscription.userId,
      type: 'subscription_expired',
      title: 'Tài khoản Premium đã hết hạn',
      message: 'Gói Premium của bạn đã hết hạn. Gia hạn ngay để tiếp tục sử dụng các tính năng đặc biệt.',
      data: { subscriptionId: subscription.id }
    });
  }

  async notifyPaymentCompleted(transaction: PaymentTransaction): Promise<void> {
    await this.sendNotification({
      userId: transaction.userId,
      type: 'payment_completed',
      title: 'Thanh toán thành công',
      message: `Thanh toán ${transaction.amount.toLocaleString('vi-VN')} VND đã được xử lý thành công.`,
      data: { transactionId: transaction.transactionCode }
    });
  }

  async notifyPaymentFailed(transaction: PaymentTransaction): Promise<void> {
    await this.sendNotification({
      userId: transaction.userId,
      type: 'payment_failed',
      title: 'Thanh toán thất bại',
      message: 'Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.',
      data: { transactionId: transaction.transactionCode }
    });
  }

  async notifySubscriptionCancelled(subscription: UserSubscription): Promise<void> {
    await this.sendNotification({
      userId: subscription.userId,
      type: 'subscription_cancelled',
      title: 'Gói Premium đã được hủy',
      message: 'Gói Premium của bạn đã được hủy thành công. Cảm ơn bạn đã sử dụng dịch vụ.',
      data: { subscriptionId: subscription.id }
    });
  }

  async notifySubscriptionExpiringSoon(subscription: UserSubscription, daysLeft: number): Promise<void> {
    await this.sendNotification({
      userId: subscription.userId,
      type: 'subscription_expired',
      title: 'Tài khoản Premium sắp hết hạn',
      message: `Gói Premium của bạn sẽ hết hạn trong ${daysLeft} ngày. Gia hạn ngay để không bị gián đoạn dịch vụ.`,
      data: { subscriptionId: subscription.id, daysLeft }
    });
  }

  private async mockSendPushNotification(notification: NotificationData): Promise<void> {
    // Mock implementation - in real app, integrate with Firebase FCM, Apple Push Notification, etc.
    this.logger.log(`[PUSH] ${notification.title} - ${notification.message}`);
  }

  private async mockSendEmail(notification: NotificationData): Promise<void> {
    // Mock implementation - in real app, integrate with SendGrid, AWS SES, etc.
    this.logger.log(`[EMAIL] ${notification.title} - ${notification.message}`);
  }

  // Batch notifications for admin
  async sendBatchNotification(userIds: number[], notification: Omit<NotificationData, 'userId'>): Promise<void> {
    for (const userId of userIds) {
      await this.sendNotification({
        ...notification,
        userId
      });
    }
  }
}
