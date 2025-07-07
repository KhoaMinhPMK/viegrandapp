import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PremiumModule } from './premium/premium.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PremiumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 