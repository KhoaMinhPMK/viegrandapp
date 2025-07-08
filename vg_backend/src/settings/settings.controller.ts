import { Controller, Get, Body, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { UserSettings } from './entities/settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy cài đặt của người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Cài đặt của người dùng',
    type: UserSettings,
  })
  async getMySettings(@Request() req): Promise<UserSettings> {
    // req.user is populated by the AuthGuard
    return this.settingsService.getSettingsByUserId(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Cập nhật cài đặt của người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Cài đặt đã được cập nhật thành công',
    type: UserSettings,
  })
  async updateMySettings(
    @Request() req,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<UserSettings> {
    return this.settingsService.updateSettings(req.user.id, updateSettingsDto);
  }
}
