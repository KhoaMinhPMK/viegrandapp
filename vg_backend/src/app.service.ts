import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Chào mừng đến với VieGrand API!' };
  }
} 