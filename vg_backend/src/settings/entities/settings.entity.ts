import { ApiProperty } from '@nestjs/swagger';

export class UserSettings {
  @ApiProperty({ description: 'ID duy nhất của cài đặt', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID của người dùng liên kết', example: 1 })
  userId: number;

  // --- General Settings ---
  @ApiProperty({ description: 'Ngôn ngữ giao diện', example: 'vi', default: 'vi' })
  language: string;

  @ApiProperty({ description: 'Bật/tắt chế độ tối', example: false, default: false })
  isDarkMode: boolean;

  // --- Elderly Role: Notification Settings ---
  @ApiProperty({ 
    description: 'Bật/tắt thông báo chung (dành cho người lớn tuổi)', 
    example: true, 
    default: true 
  })
  elderly_notificationsEnabled: boolean;
  
  @ApiProperty({ 
    description: 'Bật/tắt âm thanh thông báo (dành cho người lớn tuổi)', 
    example: true, 
    default: true 
  })
  elderly_soundEnabled: boolean;

  @ApiProperty({ 
    description: 'Bật/tắt rung khi có thông báo (dành cho người lớn tuổi)', 
    example: true, 
    default: true 
  })
  elderly_vibrationEnabled: boolean;

  // --- Relative Role: Notification Settings ---
  @ApiProperty({ 
    description: 'Bật/tắt thông báo đẩy qua ứng dụng (dành cho người thân)', 
    example: true, 
    default: true 
  })
  relative_appNotificationsEnabled: boolean;

  @ApiProperty({ 
    description: 'Bật/tắt cảnh báo qua email (dành cho người thân)', 
    example: true, 
    default: true 
  })
  relative_emailAlertsEnabled: boolean;

  @ApiProperty({ 
    description: 'Bật/tắt cảnh báo qua SMS (dành cho người thân)', 
    example: false, 
    default: false 
  })
  relative_smsAlertsEnabled: boolean;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật cuối cùng' })
  updatedAt: Date;
}
