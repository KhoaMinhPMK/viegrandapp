import { ApiProperty } from '@nestjs/swagger';

export class PaymentTransaction {
  @ApiProperty({
    description: 'ID duy nhất của giao dịch',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID của người dùng',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'ID của subscription',
    example: 1,
  })
  subscriptionId: number;

  @ApiProperty({
    description: 'ID của gói Premium',
    example: 1,
  })
  planId: number;

  @ApiProperty({
    description: 'Mã giao dịch duy nhất',
    example: 'tx_20230707_123456789',
  })
  transactionCode: string;

  @ApiProperty({
    description: 'Số tiền giao dịch',
    example: 99000,
  })
  amount: number;

  @ApiProperty({
    description: 'Đơn vị tiền tệ',
    example: 'VND',
  })
  currency: string;

  @ApiProperty({
    description: 'Trạng thái giao dịch',
    example: 'completed',
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
  })
  status: string;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    example: 'momo',
    enum: ['momo', 'zalopay', 'vnpay', 'credit_card'],
  })
  paymentMethod: string;

  @ApiProperty({
    description: 'ID giao dịch từ payment gateway',
    example: 'momo_tx_123456789',
  })
  gatewayTransactionId?: string;

  @ApiProperty({
    description: 'Dữ liệu phản hồi từ payment gateway',
    example: '{"status": "success", "message": "Payment completed"}',
  })
  gatewayResponse?: string;

  @ApiProperty({
    description: 'Loại giao dịch',
    example: 'subscription',
    enum: ['subscription', 'renewal', 'refund', 'upgrade'],
  })
  type: string;

  @ApiProperty({
    description: 'Mô tả giao dịch',
    example: 'Thanh toán gói Premium Monthly',
  })
  description: string;

  @ApiProperty({
    description: 'Thông tin khách hàng',
    example: '{"name": "Nguyễn Văn A", "email": "nguyenvana@example.com"}',
  })
  customerInfo?: string;

  @ApiProperty({
    description: 'Địa chỉ IP của khách hàng',
    example: '192.168.1.1',
  })
  ipAddress?: string;

  @ApiProperty({
    description: 'User Agent của khách hàng',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent?: string;

  @ApiProperty({
    description: 'Thời gian thanh toán',
    example: '2023-07-07T10:30:00Z',
  })
  paidAt?: Date;

  @ApiProperty({
    description: 'Thời gian hết hạn giao dịch',
    example: '2023-07-07T11:00:00Z',
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Lý do thất bại (nếu có)',
    example: 'Insufficient funds',
  })
  failureReason?: string;

  @ApiProperty({
    description: 'Số lần thử lại giao dịch',
    example: 0,
  })
  retryCount: number;

  @ApiProperty({
    description: 'Thời gian tạo giao dịch',
    example: '2023-07-07T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2023-07-07T10:30:00Z',
  })
  updatedAt: Date;
}
