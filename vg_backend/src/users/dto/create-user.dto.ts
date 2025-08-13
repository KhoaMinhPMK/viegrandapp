import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
    required: false,
  })
  phone?: string;
  
  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'password123',
  })
  password: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: 'user',
    enum: ['admin', 'user', 'elderly', 'relative'],
  })
  role: string;

  @ApiProperty({
    description: 'Trạng thái premium của người dùng',
    example: false,
    required: false,
  })
  active?: boolean;
} 