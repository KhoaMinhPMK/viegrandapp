import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PremiumService } from '../premium/premium.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => PremiumService))
    private premiumService: PremiumService,
    @Inject(forwardRef(() => SettingsService))
    private settingsService: SettingsService,
  ) {}

  private users: User[] = [
    {
      id: 1,
      fullName: 'Người dùng mẫu',
      email: 'example@viegrand.com',
      password: 'hashedPassword',
      role: 'user',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = {
      id: Date.now(),
      ...createUserDto,
      active: createUserDto.active ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);

    await this.settingsService.createDefaultSettings(newUser.id);
    
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

  findByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  getProfile(id: number): User {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    // Return user without password
    const { password, ...userProfile } = user;
    return userProfile as User;
  }

  async getProfileWithPremium(id: number): Promise<User & { premiumStatus: any }> {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }

    // Get premium status
    const premiumStatus = await this.premiumService.getPremiumStatus(id);
    
    // Return user without password but with premium status
    const { password, ...userProfile } = user;
    return {
      ...userProfile,
      premiumStatus
    } as User & { premiumStatus: any };
  }

  async isPremiumUser(id: number): Promise<boolean> {
    return await this.premiumService.isPremiumUser(id);
  }

  async getUserSubscriptionHistory(id: number) {
    return await this.premiumService.getUserSubscriptions(id);
  }

  async updatePremiumStatus(id: number, isPremium: boolean): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    
    // Update user's active status (can be used as premium indicator)
    this.users[userIndex] = { 
      ...this.users[userIndex], 
      active: isPremium,
      updatedAt: new Date()
    };
    
    return this.users[userIndex];
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