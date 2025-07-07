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
} 