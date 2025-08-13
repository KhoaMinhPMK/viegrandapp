import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreatePaymentTransactionDto {
  @ApiProperty({
    description: 'ID của người dùng',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'ID của subscription',
    example: 1,
  })
  @IsNumber()
  subscriptionId: number;

  @ApiProperty({
    description: 'ID của gói Premium',
    example: 1,
  })
  @IsNumber()
  planId: number;

  @ApiProperty({
    description: 'Số tiền giao dịch',
    example: 99000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    example: 'momo',
    enum: ['momo', 'zalopay', 'vnpay', 'credit_card'],
  })
  @IsEnum(['momo', 'zalopay', 'vnpay', 'credit_card'])
  paymentMethod: string;

  @ApiProperty({
    description: 'Loại giao dịch',
    example: 'subscription',
    enum: ['subscription', 'renewal', 'refund', 'upgrade'],
  })
  @IsEnum(['subscription', 'renewal', 'refund', 'upgrade'])
  type: string;

  @ApiProperty({
    description: 'Mô tả giao dịch',
    example: 'Thanh toán gói Premium Monthly',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Thông tin khách hàng',
    example: '{"name": "Nguyễn Văn A", "email": "nguyenvana@example.com"}',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerInfo?: string;

  @ApiProperty({
    description: 'Địa chỉ IP của khách hàng',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'User Agent của khách hàng',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class UpdatePaymentTransactionDto {
  @ApiProperty({
    description: 'Trạng thái giao dịch',
    example: 'completed',
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
  status?: string;

  @ApiProperty({
    description: 'ID giao dịch từ payment gateway',
    example: 'momo_tx_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;

  @ApiProperty({
    description: 'Dữ liệu phản hồi từ payment gateway',
    example: '{"status": "success", "message": "Payment completed"}',
    required: false,
  })
  @IsOptional()
  @IsString()
  gatewayResponse?: string;

  @ApiProperty({
    description: 'Thời gian thanh toán',
    example: '2023-07-07T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  paidAt?: Date;

  @ApiProperty({
    description: 'Lý do thất bại (nếu có)',
    example: 'Insufficient funds',
    required: false,
  })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @ApiProperty({
    description: 'Số lần thử lại giao dịch',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  retryCount?: number;
}

export class PaymentCallbackDto {
  @ApiProperty({
    description: 'Mã giao dịch',
    example: 'tx_20230707_123456789',
  })
  @IsString()
  transactionCode: string;

  @ApiProperty({
    description: 'Trạng thái từ payment gateway',
    example: 'success',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'ID giao dịch từ payment gateway',
    example: 'momo_tx_123456789',
  })
  @IsString()
  gatewayTransactionId: string;

  @ApiProperty({
    description: 'Số tiền',
    example: 99000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Dữ liệu phản hồi từ payment gateway',
    example: '{"status": "success", "message": "Payment completed"}',
    required: false,
  })
  @IsOptional()
  @IsString()
  gatewayResponse?: string;
}
