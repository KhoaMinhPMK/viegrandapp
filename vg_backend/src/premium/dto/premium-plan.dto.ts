import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { IsValidAmount, IsValidDuration } from '../validators/premium.validator';

export class CreatePremiumPlanDto {
  @ApiProperty({
    description: 'Tên gói Premium',
    example: 'Premium Monthly',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Mô tả chi tiết gói Premium',
    example: 'Gói Premium hàng tháng với đầy đủ tính năng',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Giá gói Premium (VND)',
    example: 99000,
  })
  @IsNumber()
  @IsValidAmount()
  price: number;

  @ApiProperty({
    description: 'Thời hạn gói (ngày)',
    example: 30,
  })
  @IsNumber()
  @IsValidDuration()
  duration: number;

  @ApiProperty({
    description: 'Loại gói',
    example: 'monthly',
    enum: ['monthly', 'yearly', 'lifetime'],
  })
  @IsEnum(['monthly', 'yearly', 'lifetime'])
  type: string;

  @ApiProperty({
    description: 'Tính năng của gói Premium',
    example: ['Unlimited voice calls', 'AI health monitoring', 'Priority support'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({
    description: 'Trạng thái hoạt động của gói',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Thứ tự hiển thị',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({
    description: 'Gói được đề xuất',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiProperty({
    description: 'Phần trăm giảm giá',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;
}

export class UpdatePremiumPlanDto {
  @ApiProperty({
    description: 'Tên gói Premium',
    example: 'Premium Monthly',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Mô tả chi tiết gói Premium',
    example: 'Gói Premium hàng tháng với đầy đủ tính năng',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Giá gói Premium (VND)',
    example: 99000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsValidAmount()
  price?: number;

  @ApiProperty({
    description: 'Thời hạn gói (ngày)',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsValidDuration()
  duration?: number;

  @ApiProperty({
    description: 'Loại gói',
    example: 'monthly',
    enum: ['monthly', 'yearly', 'lifetime'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['monthly', 'yearly', 'lifetime'])
  type?: string;

  @ApiProperty({
    description: 'Tính năng của gói Premium',
    example: ['Unlimited voice calls', 'AI health monitoring', 'Priority support'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({
    description: 'Trạng thái hoạt động của gói',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Thứ tự hiển thị',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({
    description: 'Gói được đề xuất',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiProperty({
    description: 'Phần trăm giảm giá',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;
}
