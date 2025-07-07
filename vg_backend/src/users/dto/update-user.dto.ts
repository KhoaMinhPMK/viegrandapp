import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ email của người dùng',
    example: 'nguyenvana@example.com',
  })
  email?: string;
  
  @ApiPropertyOptional({
    description: 'Mật khẩu của người dùng',
    example: 'new_password123',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Vai trò của người dùng',
    example: 'user',
    enum: ['admin', 'user', 'elderly', 'relative'],
  })
  role?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái premium của người dùng',
    example: true,
  })
  active?: boolean;
} 