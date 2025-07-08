import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@ApiTags('Người dùng')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  @ApiResponse({ 
    status: 201, 
    description: 'Người dùng đã được tạo thành công',
    type: User 
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách người dùng',
    type: [User]
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin người dùng hiện tại',
    type: User
  })
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin đã được cập nhật',
    type: User,
  })
  updateMyProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint không cần auth' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test data',
    type: User
  })
  testProfile() {
    return {
      id: 1,
      name: 'Nguyễn Văn Test',
      email: 'test@example.com',
      role: 'relative',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID (test)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin người dùng theo ID',
    type: User
  })
  getProfileById(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chi tiết người dùng',
    type: User
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Người dùng đã được cập nhật',
    type: User
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Người dùng đã được xóa',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
} 