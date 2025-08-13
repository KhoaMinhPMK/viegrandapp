import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, IsEnum, IsString, IsDateString } from 'class-validator';

export class CreateUserSubscriptionDto {
  @ApiProperty({
    description: 'ID của người dùng',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'ID của gói Premium',
    example: 1,
  })
  @IsNumber()
  planId: number;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    example: 'momo',
    enum: ['momo', 'zalopay', 'vnpay', 'credit_card'],
  })
  @IsEnum(['momo', 'zalopay', 'vnpay', 'credit_card'])
  paymentMethod: string;

  @ApiProperty({
    description: 'Tự động gia hạn',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Thanh toán thành công',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateUserSubscriptionDto {
  @ApiProperty({
    description: 'Trạng thái subscription',
    example: 'active',
    enum: ['active', 'expired', 'cancelled', 'pending'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'expired', 'cancelled', 'pending'])
  status?: string;

  @ApiProperty({
    description: 'Ngày kết thúc subscription',
    example: '2023-08-07T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({
    description: 'Tự động gia hạn',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @ApiProperty({
    description: 'Ngày thanh toán tiếp theo',
    example: '2023-08-07T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  nextPaymentDate?: Date;

  @ApiProperty({
    description: 'Số tiền đã trả',
    example: 99000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @ApiProperty({
    description: 'ID giao dịch thanh toán',
    example: 'tx_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Thanh toán thành công',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Số lần thử thanh toán thất bại',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  failedPaymentAttempts?: number;

  @ApiProperty({
    description: 'Lý do hủy subscription',
    example: 'User request',
    required: false,
  })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}

export class CancelSubscriptionDto {
  @ApiProperty({
    description: 'Lý do hủy subscription',
    example: 'User request',
  })
  @IsString()
  cancelReason: string;
}
