import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'ID duy nhất của người dùng',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A',
  })
  fullName: string;

  @ApiProperty({
    description: 'Địa chỉ email của người dùng',
    example: 'nguyenvana@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '0123456789',
  })
  phone?: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng (đã mã hóa)',
    example: 'hashedPassword',
  })
  password: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: 'user',
    enum: ['admin', 'user', 'elderly', 'relative'],
  })
  role: string;

  @ApiProperty({
    description: 'Tuổi của người dùng',
    required: false,
  })
  age?: number;

  @ApiProperty({
    description: 'Địa chỉ của người dùng',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Giới tính của người dùng',
    required: false,
  })
  gender?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của người dùng',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Ngày sinh của người dùng',
    example: '1960-01-01',
    required: false,
  })
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'Thông tin liên hệ khẩn cấp',
    example: 'Nguyễn Văn B - 0987654321',
    required: false,
  })
  emergencyContact?: string;

  @ApiProperty({
    description: 'Thời gian tạo tài khoản',
    example: '2023-07-07T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2023-07-07T10:30:00Z',
  })
  updatedAt: Date;
} 