import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A',
  })
  name: string;

  @ApiProperty({
    description: 'Địa chỉ email của người dùng',
    example: 'nguyenvana@example.com',
  })
  email: string;
  
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
} 