import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum } from 'class-validator';

export class PurchaseDto {
  @ApiProperty({
    description: 'ID của gói Premium muốn mua',
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
} 