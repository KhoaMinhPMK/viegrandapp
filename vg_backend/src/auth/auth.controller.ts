import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  async login(@Body() loginDto: LoginDto) {
    console.log('Login request:', loginDto);
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  @ApiResponse({ 
    status: 201, 
    description: 'Đăng ký thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Email đã được sử dụng' })
  async register(@Body() registerDto: RegisterDto) {
    console.log('Register request:', registerDto);
    return this.authService.register(registerDto);
  }
}
