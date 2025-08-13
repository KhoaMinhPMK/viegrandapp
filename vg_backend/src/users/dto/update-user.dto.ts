import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A',
    required: false,
  })
  fullName?: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '0123456789',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Tuổi của người dùng',
    example: 30,
    required: false,
  })
  age?: number;

  @ApiProperty({
    description: 'Địa chỉ của người dùng',
    example: '123 Đường ABC, Quận 1, TP. HCM',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Giới tính của người dùng',
    example: 'Nam',
    required: false,
  })
  gender?: string;

  @ApiProperty({
    description: 'Địa chỉ email của người dùng',
    example: 'nguyenvana@example.com',
  })
  email?: string;
  
  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'new_password123',
  })
  password?: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: 'user',
    enum: ['admin', 'user', 'elderly', 'relative'],
  })
  role?: string;

  @ApiProperty({
    description: 'Trạng thái premium của người dùng',
    example: true,
  })
  active?: boolean;
} 