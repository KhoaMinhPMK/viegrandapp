import { Module, forwardRef } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { PaymentService } from './payment.service';
import { PremiumController } from './premium.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [PremiumController],
  providers: [PremiumService, PaymentService],
  exports: [PremiumService, PaymentService],
})
export class PremiumModule {}
