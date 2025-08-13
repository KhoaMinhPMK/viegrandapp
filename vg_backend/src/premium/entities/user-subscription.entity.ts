import { ApiProperty } from '@nestjs/swagger';

export class UserSubscription {
  @ApiProperty({
    description: 'ID duy nhất của subscription',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID của người dùng',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'ID của gói Premium',
    example: 1,
  })
  planId: number;

  @ApiProperty({
    description: 'Trạng thái subscription',
    example: 'active',
    enum: ['active', 'expired', 'cancelled', 'pending'],
  })
  status: string;

  @ApiProperty({
    description: 'Ngày bắt đầu subscription',
    example: '2023-07-07T10:30:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Ngày kết thúc subscription',
    example: '2023-08-07T10:30:00Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Tự động gia hạn',
    example: true,
  })
  autoRenewal: boolean;

  @ApiProperty({
    description: 'Ngày thanh toán tiếp theo',
    example: '2023-08-07T10:30:00Z',
  })
  nextPaymentDate?: Date;

  @ApiProperty({
    description: 'Số tiền đã trả',
    example: 99000,
  })
  paidAmount: number;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    example: 'momo',
    enum: ['momo', 'zalopay', 'vnpay', 'credit_card'],
  })
  paymentMethod: string;

  @ApiProperty({
    description: 'ID giao dịch thanh toán',
    example: 'tx_123456789',
  })
  transactionId?: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Thanh toán thành công',
  })
  notes?: string;

  @ApiProperty({
    description: 'Số lần thử thanh toán thất bại',
    example: 0,
  })
  failedPaymentAttempts: number;

  @ApiProperty({
    description: 'Ngày hủy subscription',
    example: '2023-08-07T10:30:00Z',
  })
  cancelledAt?: Date;

  @ApiProperty({
    description: 'Lý do hủy subscription',
    example: 'User request',
  })
  cancelReason?: string;

  @ApiProperty({
    description: 'Thời gian tạo subscription',
    example: '2023-07-07T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2023-07-07T10:30:00Z',
  })
  updatedAt: Date;
}
