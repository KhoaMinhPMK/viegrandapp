import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Ngôn ngữ giao diện', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Bật/tắt chế độ tối', example: true })
  @IsOptional()
  @IsBoolean()
  isDarkMode?: boolean;
  
  // --- Elderly Role: Notification Settings ---
  @ApiPropertyOptional({ description: 'Bật/tắt thông báo chung (dành cho người lớn tuổi)' })
  @IsOptional()
  @IsBoolean()
  elderly_notificationsEnabled?: boolean;
  
  @ApiPropertyOptional({ description: 'Bật/tắt âm thanh thông báo (dành cho người lớn tuổi)' })
  @IsOptional()
  @IsBoolean()
  elderly_soundEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Bật/tắt rung khi có thông báo (dành cho người lớn tuổi)' })
  @IsOptional()
  @IsBoolean()
  elderly_vibrationEnabled?: boolean;

  // --- Relative Role: Notification Settings ---
  @ApiPropertyOptional({ description: 'Bật/tắt thông báo đẩy qua ứng dụng (dành cho người thân)' })
  @IsOptional()
  @IsBoolean()
  relative_appNotificationsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Bật/tắt cảnh báo qua email (dành cho người thân)' })
  @IsOptional()
  @IsBoolean()
  relative_emailAlertsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Bật/tắt cảnh báo qua SMS (dành cho người thân)' })
  @IsOptional()
  @IsBoolean()
  relative_smsAlertsEnabled?: boolean;
}
