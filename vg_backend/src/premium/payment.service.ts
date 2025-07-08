import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePaymentTransactionDto, UpdatePaymentTransactionDto, PaymentCallbackDto } from './dto/payment-transaction.dto';
import { PaymentTransaction } from './entities/payment-transaction.entity';

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  gatewayTransactionId?: string;
  paymentUrl?: string;
  message: string;
  data?: any;
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

@Injectable()
export class PaymentService {
  private paymentTransactions: PaymentTransaction[] = [];
  private transactionIdCounter = 1;

  // Mock payment gateway configurations
  private paymentGateways = {
    momo: {
      name: 'MoMo',
      enabled: true,
      mockDelay: 2000, // 2 seconds delay
      successRate: 1 // 100% success rate
    },
    zalopay: {
      name: 'ZaloPay',
      enabled: true,
      mockDelay: 1500,
      successRate: 1 // 100% success rate
    },
    vnpay: {
      name: 'VNPay',
      enabled: true,
      mockDelay: 3000,
      successRate: 1 // 100% success rate
    },
    credit_card: {
      name: 'Credit Card',
      enabled: true,
      mockDelay: 2500,
      successRate: 1 // 100% success rate
    }
  };

  async createTransaction(createTransactionDto: CreatePaymentTransactionDto): Promise<PaymentTransaction> {
    const transactionCode = this.generateTransactionCode();
    
    const newTransaction: PaymentTransaction = {
      id: this.transactionIdCounter++,
      userId: createTransactionDto.userId,
      subscriptionId: createTransactionDto.subscriptionId,
      planId: createTransactionDto.planId,
      transactionCode,
      amount: createTransactionDto.amount,
      currency: 'VND',
      status: 'pending',
      paymentMethod: createTransactionDto.paymentMethod,
      gatewayTransactionId: null,
      gatewayResponse: null,
      type: createTransactionDto.type,
      description: createTransactionDto.description,
      customerInfo: createTransactionDto.customerInfo,
      ipAddress: createTransactionDto.ipAddress,
      userAgent: createTransactionDto.userAgent,
      paidAt: null,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
      failureReason: null,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.paymentTransactions.push(newTransaction);
    return newTransaction;
  }

  async initiatePayment(transactionId: number, request: PaymentInitRequest): Promise<PaymentGatewayResponse> {
    const transaction = this.paymentTransactions.find(t => t.id === transactionId);
    if (!transaction) {
      throw new BadRequestException(`Transaction with ID ${transactionId} not found`);
    }

    if (transaction.status !== 'pending') {
      throw new BadRequestException(`Transaction ${transaction.transactionCode} is not pending`);
    }

    const gateway = this.paymentGateways[request.paymentMethod];
    if (!gateway || !gateway.enabled) {
      throw new BadRequestException(`Payment method ${request.paymentMethod} is not supported`);
    }

    // Update transaction status to processing
    transaction.status = 'processing';
    transaction.updatedAt = new Date();

    // Mock payment gateway response
    const gatewayTransactionId = this.generateGatewayTransactionId(request.paymentMethod);
    const mockPaymentUrl = this.generateMockPaymentUrl(transaction.transactionCode, request.paymentMethod);

    // Simulate gateway processing delay
    setTimeout(() => {
      this.simulatePaymentResult(transaction.id, gateway.successRate);
    }, gateway.mockDelay);

    return {
      success: true,
      transactionId: transaction.transactionCode,
      gatewayTransactionId,
      paymentUrl: mockPaymentUrl,
      message: `Payment initiated successfully via ${gateway.name}`,
      data: {
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
        deepLink: `${request.paymentMethod}://payment/${gatewayTransactionId}`,
        expiresAt: transaction.expiresAt.toISOString()
      }
    };
  }

  async getTransaction(transactionCode: string): Promise<PaymentTransaction | null> {
    return this.paymentTransactions.find(t => t.transactionCode === transactionCode) || null;
  }

  async getTransactionById(id: number): Promise<PaymentTransaction | null> {
    return this.paymentTransactions.find(t => t.id === id) || null;
  }

  async getUserTransactions(userId: number): Promise<PaymentTransaction[]> {
    return this.paymentTransactions.filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateTransaction(id: number, updateDto: UpdatePaymentTransactionDto): Promise<PaymentTransaction> {
    const transactionIndex = this.paymentTransactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) {
      throw new BadRequestException(`Transaction with ID ${id} not found`);
    }

    this.paymentTransactions[transactionIndex] = {
      ...this.paymentTransactions[transactionIndex],
      ...updateDto,
      updatedAt: new Date()
    };

    return this.paymentTransactions[transactionIndex];
  }

  async handlePaymentCallback(callbackDto: PaymentCallbackDto): Promise<PaymentTransaction> {
    const transaction = await this.getTransaction(callbackDto.transactionCode);
    if (!transaction) {
      throw new BadRequestException(`Transaction ${callbackDto.transactionCode} not found`);
    }

    // Map gateway status to our status
    const status = this.mapGatewayStatus(callbackDto.status);
    
    const updates: Partial<PaymentTransaction> = {
      status,
      gatewayTransactionId: callbackDto.gatewayTransactionId,
      gatewayResponse: callbackDto.gatewayResponse,
      updatedAt: new Date()
    };

    if (status === 'completed') {
      updates.paidAt = new Date();
    } else if (status === 'failed') {
      updates.failureReason = `Payment failed via gateway: ${callbackDto.status}`;
    }

    return await this.updateTransaction(transaction.id, updates);
  }

  async retryPayment(transactionId: number): Promise<PaymentGatewayResponse> {
    const transaction = this.paymentTransactions.find(t => t.id === transactionId);
    if (!transaction) {
      throw new BadRequestException(`Transaction with ID ${transactionId} not found`);
    }

    if (transaction.status === 'completed') {
      throw new BadRequestException('Cannot retry completed transaction');
    }

    if (transaction.retryCount >= 3) {
      throw new BadRequestException('Maximum retry attempts reached');
    }

    // Increment retry count
    transaction.retryCount++;
    transaction.status = 'pending';
    transaction.updatedAt = new Date();

    // Retry payment initiation
    const paymentRequest: PaymentInitRequest = {
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      paymentMethod: transaction.paymentMethod,
      customerInfo: JSON.parse(transaction.customerInfo || '{}'),
      callbackUrl: `${process.env.API_BASE_URL}/premium/payment/callback`,
      returnUrl: `${process.env.FRONTEND_URL}/premium/payment/result`
    };

    return await this.initiatePayment(transactionId, paymentRequest);
  }

  async getTransactionStats(userId?: number): Promise<any> {
    const transactions = userId 
      ? this.paymentTransactions.filter(t => t.userId === userId)
      : this.paymentTransactions;

    const stats = {
      total: transactions.length,
      completed: transactions.filter(t => t.status === 'completed').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      totalAmount: transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0)
    };

    return stats;
  }

  // Additional methods for scheduler
  async getExpiredTransactions(): Promise<PaymentTransaction[]> {
    const now = new Date();
    return this.paymentTransactions.filter(t => 
      t.status === 'pending' && t.expiresAt < now
    );
  }

  async cleanupOldTransactions(): Promise<void> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Remove old completed/failed transactions older than 1 year
    this.paymentTransactions = this.paymentTransactions.filter(t => 
      !(['completed', 'failed'].includes(t.status) && t.createdAt < oneYearAgo)
    );
  }

  // Mock payment simulation
  private async simulatePaymentResult(transactionId: number, successRate: number): Promise<void> {
    const transaction = this.paymentTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const isSuccess = Math.random() < successRate;
    
    if (isSuccess) {
      transaction.status = 'completed';
      transaction.paidAt = new Date();
      transaction.gatewayResponse = JSON.stringify({
        status: 'success',
        message: 'Payment completed successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      transaction.status = 'failed';
      transaction.failureReason = 'Mock payment failure for testing';
      transaction.gatewayResponse = JSON.stringify({
        status: 'failed',
        message: 'Payment failed',
        error: 'MOCK_FAILURE',
        timestamp: new Date().toISOString()
      });
    }

    transaction.updatedAt = new Date();
  }

  private generateTransactionCode(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `TX_${timestamp}_${random}`.toUpperCase();
  }

  private generateGatewayTransactionId(paymentMethod: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${paymentMethod.toUpperCase()}_${timestamp}_${random}`;
  }

  private generateMockPaymentUrl(transactionCode: string, paymentMethod: string): string {
    return `https://mock-payment.${paymentMethod}.com/pay/${transactionCode}`;
  }

  private mapGatewayStatus(gatewayStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'success': 'completed',
      'completed': 'completed',
      'failed': 'failed',
      'error': 'failed',
      'cancelled': 'cancelled',
      'pending': 'processing',
      'processing': 'processing'
    };

    return statusMap[gatewayStatus.toLowerCase()] || 'failed';
  }

  // Utility methods
  async getPaymentMethods(): Promise<any[]> {
    return Object.entries(this.paymentGateways)
      .filter(([_, config]) => config.enabled)
      .map(([key, config]) => ({
        id: key,
        type: key === 'momo' || key === 'zalopay' ? 'e_wallet' : 
              key === 'vnpay' ? 'digital_wallet' : 'credit_card',
        name: config.name,
        description: `Thanh toán qua ${config.name}`,
        icon: `/assets/payment-icons/${key}.png`,
        enabled: config.enabled,
        isAvailable: config.enabled,
        processingFee: 0
      }));
  }
}
