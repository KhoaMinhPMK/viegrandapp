import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PremiumService } from './premium.service';
import { PaymentService } from './payment.service';
import { NotificationService } from './notification.service';
import { SchedulerService } from './scheduler.service';
import { PremiumController } from './premium.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ScheduleModule.forRoot()
  ],
  controllers: [PremiumController],
  providers: [
    PremiumService, 
    PaymentService, 
    NotificationService,
    SchedulerService
  ],
  exports: [
    PremiumService, 
    PaymentService, 
    NotificationService,
    SchedulerService
  ],
})
export class PremiumModule {}
