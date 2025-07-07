import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: 1,
      name: 'Người dùng mẫu',
      email: 'example@viegrand.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  create(createUserDto: CreateUserDto): User {
    const newUser = {
      id: Date.now(),
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    
    this.users[userIndex] = { 
      ...this.users[userIndex], 
      ...updateUserDto,
      updatedAt: new Date()
    };
    
    return this.users[userIndex];
  }

  remove(id: number): { message: string } {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    
    this.users.splice(userIndex, 1);
    
    return { message: `Người dùng với ID ${id} đã được xóa thành công` };
  }
} 