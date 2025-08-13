import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Hệ thống')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy thông tin chào mừng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về thông điệp chào mừng',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Chào mừng đến với VieGrand API!' }
      }
    } 
  })
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra trạng thái sức khỏe của API' })
  @ApiResponse({ 
    status: 200, 
    description: 'API đang hoạt động bình thường',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
        timestamp: { type: 'string', example: '2025-01-27T10:30:00.000Z' },
        uptime: { type: 'number', example: 12345 }
      }
    } 
  })
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'VieGrand API đang hoạt động bình thường'
    };
  }
} 