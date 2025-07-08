import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PremiumModule } from './premium/premium.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PremiumModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 