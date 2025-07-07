import { ApiProperty } from '@nestjs/swagger';

export class PremiumPlan {
  @ApiProperty({
    description: 'ID duy nhất của gói Premium',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tên gói Premium',
    example: 'Premium Monthly',
  })
  name: string;

  @ApiProperty({
    description: 'Mô tả chi tiết gói Premium',
    example: 'Gói Premium hàng tháng với đầy đủ tính năng',
  })
  description: string;

  @ApiProperty({
    description: 'Giá gói Premium (VND)',
    example: 99000,
  })
  price: number;

  @ApiProperty({
    description: 'Thời hạn gói (ngày)',
    example: 30,
  })
  duration: number;

  @ApiProperty({
    description: 'Loại gói',
    example: 'monthly',
    enum: ['monthly', 'yearly', 'lifetime'],
  })
  type: string;

  @ApiProperty({
    description: 'Tính năng của gói Premium',
    example: ['Unlimited voice calls', 'AI health monitoring', 'Priority support'],
    type: [String],
  })
  features: string[];

  @ApiProperty({
    description: 'Trạng thái hoạt động của gói',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Thứ tự hiển thị',
    example: 1,
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Gói được đề xuất',
    example: true,
  })
  isRecommended: boolean;

  @ApiProperty({
    description: 'Phần trăm giảm giá',
    example: 20,
  })
  discountPercent?: number;

  @ApiProperty({
    description: 'Thời gian tạo gói',
    example: '2023-07-07T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2023-07-07T10:30:00Z',
  })
  updatedAt: Date;
}
