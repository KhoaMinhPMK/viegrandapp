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
  name: string;

  @ApiProperty({
    description: 'Địa chỉ email của người dùng',
    example: 'nguyenvana@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: 'user',
    enum: ['admin', 'user', 'elderly', 'relative'],
  })
  role: string;

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