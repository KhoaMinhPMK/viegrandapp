import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  UseGuards, 
  Request,
  Query,
  HttpStatus,
  HttpException,
  UsePipes
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PremiumService } from './premium.service';
import { PaymentService, PaymentInitRequest } from './payment.service';
import { CreatePremiumPlanDto, UpdatePremiumPlanDto } from './dto/premium-plan.dto';
import { CreateUserSubscriptionDto, UpdateUserSubscriptionDto, CancelSubscriptionDto } from './dto/user-subscription.dto';
import { CreatePaymentTransactionDto, PaymentCallbackDto } from './dto/payment-transaction.dto';
import { PurchaseDto } from './dto/purchase.dto';
import { PremiumPlan } from './entities/premium-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { AdminGuard } from './middleware/premium.middleware';
import { PremiumValidationPipe } from './validators/premium.validator';

@ApiTags('Premium')
@Controller('premium')
export class PremiumController {
  constructor(
    private readonly premiumService: PremiumService,
    private readonly paymentService: PaymentService,
  ) {}

  // Premium Plans Endpoints
  @Get('plans')
  @ApiOperation({ summary: 'Lấy danh sách gói Premium' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách gói Premium',
    type: [PremiumPlan]
  })
  async getAllPlans() {
    return {
      success: true,
      data: await this.premiumService.getAllPlans(),
      message: 'Lấy danh sách gói Premium thành công'
    };
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết gói Premium' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chi tiết gói Premium',
    type: PremiumPlan
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói Premium' })
  async getPlanById(@Param('id') id: string) {
    return {
      success: true,
      data: await this.premiumService.getPlanById(+id),
      message: 'Lấy thông tin gói Premium thành công'
    };
  }

  @Post('plans')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UsePipes(PremiumValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo gói Premium mới (Admin only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Gói Premium đã được tạo thành công',
    type: PremiumPlan
  })
  async createPlan(@Body() createPlanDto: CreatePremiumPlanDto) {
    return {
      success: true,
      data: await this.premiumService.createPlan(createPlanDto),
      message: 'Tạo gói Premium thành công'
    };
  }

  @Put('plans/:id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UsePipes(PremiumValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật gói Premium (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gói Premium đã được cập nhật',
    type: PremiumPlan
  })
  async updatePlan(@Param('id') id: string, @Body() updatePlanDto: UpdatePremiumPlanDto) {
    return {
      success: true,
      data: await this.premiumService.updatePlan(+id, updatePlanDto),
      message: 'Cập nhật gói Premium thành công'
    };
  }

  @Delete('plans/:id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa gói Premium (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gói Premium đã được xóa'
  })
  async deletePlan(@Param('id') id: string) {
    await this.premiumService.deletePlan(+id);
    return {
      success: true,
      message: 'Xóa gói Premium thành công'
    };
  }

  // User Subscription Endpoints
  @Get('my-subscription')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy subscription hiện tại của user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Subscription hiện tại',
    type: UserSubscription
  })
  async getMySubscription(@Request() req) {
    const subscription = await this.premiumService.getUserSubscription(req.user.id);
    return {
      success: true,
      data: subscription,
      message: subscription ? 'Lấy thông tin subscription thành công' : 'Không có subscription nào'
    };
  }

  @Get('my-status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra trạng thái Premium của user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trạng thái Premium'
  })
  async getMyPremiumStatus(@Request() req) {
    const premiumStatus = await this.premiumService.getPremiumStatus(req.user.id);
    return {
      success: true,
      data: premiumStatus,
      message: 'Lấy trạng thái Premium thành công'
    };
  }

  @Get('my-subscriptions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy lịch sử subscription của user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lịch sử subscription',
    type: [UserSubscription]
  })
  async getMySubscriptions(@Request() req) {
    return {
      success: true,
      data: await this.premiumService.getUserSubscriptions(req.user.id),
      message: 'Lấy lịch sử subscription thành công'
    };
  }

  @Post('subscribe')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(PremiumValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng ký gói Premium' })
  @ApiResponse({ 
    status: 201, 
    description: 'Subscription đã được tạo thành công',
    type: UserSubscription
  })
  async subscribe(@Body() createSubscriptionDto: CreateUserSubscriptionDto, @Request() req) {
    // Auto-fill user ID from token
    createSubscriptionDto.userId = req.user.id;
    
    return {
      success: true,
      data: await this.premiumService.createSubscription(createSubscriptionDto),
      message: 'Đăng ký gói Premium thành công'
    };
  }

  @Put('subscription/:id/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hủy subscription' })
  @ApiResponse({ 
    status: 200, 
    description: 'Subscription đã được hủy',
    type: UserSubscription
  })
  async cancelSubscription(@Param('id') id: string, @Body() cancelDto: CancelSubscriptionDto) {
    return {
      success: true,
      data: await this.premiumService.cancelSubscription(+id, cancelDto),
      message: 'Hủy subscription thành công'
    };
  }

  // Payment Endpoints
  @Get('payment-methods')
  @ApiOperation({ summary: 'Lấy danh sách phương thức thanh toán' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách phương thức thanh toán'
  })
  async getPaymentMethods() {
    return {
      success: true,
      data: await this.paymentService.getPaymentMethods(),
      message: 'Lấy danh sách phương thức thanh toán thành công'
    };
  }

  @Post('payment/create')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo giao dịch thanh toán' })
  @ApiResponse({ 
    status: 201, 
    description: 'Giao dịch thanh toán đã được tạo',
    type: PaymentTransaction
  })
  async createPayment(@Body() createPaymentDto: CreatePaymentTransactionDto, @Request() req) {
    // Auto-fill user ID from token
    createPaymentDto.userId = req.user.id;
    
    return {
      success: true,
      data: await this.paymentService.createTransaction(createPaymentDto),
      message: 'Tạo giao dịch thanh toán thành công'
    };
  }

  @Post('payment/:id/initiate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khởi tạo thanh toán' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thanh toán đã được khởi tạo'
  })
  async initiatePayment(@Param('id') id: string, @Body() paymentRequest: PaymentInitRequest) {
    return {
      success: true,
      data: await this.paymentService.initiatePayment(+id, paymentRequest),
      message: 'Khởi tạo thanh toán thành công'
    };
  }

  @Get('payment/transaction/:code')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin giao dịch theo mã' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin giao dịch',
    type: PaymentTransaction
  })
  async getTransaction(@Param('code') code: string) {
    const transaction = await this.paymentService.getTransaction(code);
    if (!transaction) {
      throw new HttpException('Không tìm thấy giao dịch', HttpStatus.NOT_FOUND);
    }
    
    return {
      success: true,
      data: transaction,
      message: 'Lấy thông tin giao dịch thành công'
    };
  }

  @Get('payment/my-transactions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy lịch sử giao dịch của user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lịch sử giao dịch',
    type: [PaymentTransaction]
  })
  async getMyTransactions(@Request() req) {
    return {
      success: true,
      data: await this.paymentService.getUserTransactions(req.user.id),
      message: 'Lấy lịch sử giao dịch thành công'
    };
  }

  @Post('payment/callback')
  @ApiOperation({ summary: 'Callback từ payment gateway' })
  @ApiResponse({ 
    status: 200, 
    description: 'Callback đã được xử lý'
  })
  async handlePaymentCallback(@Body() callbackDto: PaymentCallbackDto) {
    try {
      const transaction = await this.paymentService.handlePaymentCallback(callbackDto);
      
      // If payment is successful, activate subscription
      if (transaction.status === 'completed') {
        await this.premiumService.updateSubscription(transaction.subscriptionId, {
          status: 'active',
          paidAmount: transaction.amount,
          transactionId: transaction.transactionCode
        });
      }
      
      return {
        success: true,
        data: transaction,
        message: 'Callback xử lý thành công'
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('payment/:id/retry')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thử lại thanh toán' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thanh toán được thử lại'
  })
  async retryPayment(@Param('id') id: string) {
    return {
      success: true,
      data: await this.paymentService.retryPayment(+id),
      message: 'Thử lại thanh toán thành công'
    };
  }

  // Statistics Endpoints
  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê thanh toán của user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê thanh toán'
  })
  async getMyStats(@Request() req) {
    return {
      success: true,
      data: await this.paymentService.getTransactionStats(req.user.id),
      message: 'Lấy thống kê thành công'
    };
  }

  // Admin Endpoints
  @Get('admin/stats')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê tổng quan (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê tổng quan'
  })
  async getAdminStats() {
    return {
      success: true,
      data: await this.paymentService.getTransactionStats(),
      message: 'Lấy thống kê tổng quan thành công'
    };
  }

  @Get('admin/expired-subscriptions')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra subscription hết hạn (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách subscription hết hạn'
  })
  async checkExpiredSubscriptions() {
    return {
      success: true,
      data: await this.premiumService.checkExpiredSubscriptions(),
      message: 'Kiểm tra subscription hết hạn thành công'
    };
  }

  // Manual scheduler control endpoints (for development/testing)
  @Post('admin/scheduler/run-check')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chạy kiểm tra scheduler thủ công (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả kiểm tra scheduler'
  })
  async runManualSchedulerCheck() {
    // Import scheduler service dynamically to avoid circular dependency
    const { SchedulerService } = await import('./scheduler.service');
    const schedulerService = new SchedulerService(
      this.premiumService,
      this.paymentService,
      new (await import('./notification.service')).NotificationService()
    );
    
    return {
      success: true,
      data: await schedulerService.runManualCheck(),
      message: 'Kiểm tra scheduler thủ công thành công'
    };
  }

  @Post('admin/scheduler/check-expired')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra subscription hết hạn (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách subscription hết hạn'
  })
  async checkExpiredSubscriptionsManually() {
    return {
      success: true,
      data: await this.premiumService.checkExpiredSubscriptions(),
      message: 'Kiểm tra subscription hết hạn thành công'
    };
  }

  @Post('purchase')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mua gói Premium (All-in-one)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Xử lý mua gói Premium thành công'
  })
  async purchase(@Request() req, @Body() purchaseDto: PurchaseDto) {
    const result = await this.premiumService.purchase(
      req.user.id,
      purchaseDto.planId,
      purchaseDto.paymentMethod,
    );
    return {
      success: result.success,
      data: result,
      message: result.success
        ? 'Giao dịch thành công!'
        : `Giao dịch thất bại: ${result.transaction.failureReason}`,
    };
  }
}
