import { 
  Injectable, 
  NestMiddleware, 
  UnauthorizedException, 
  ForbiddenException,
  CanActivate,
  ExecutionContext,
  SetMetadata
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Reflector } from '@nestjs/core';
import { PremiumService } from '../premium.service';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    isPremium?: boolean;
    premiumStatus?: any;
  };
}

@Injectable()
export class PremiumCheckMiddleware implements NestMiddleware {
  constructor(private readonly premiumService: PremiumService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Vui lòng đăng nhập để sử dụng tính năng này');
      }

      // Check if user has premium status
      const isPremium = await this.premiumService.isPremiumUser(req.user.id);
      
      if (!isPremium) {
        throw new ForbiddenException('Tính năng này chỉ dành cho người dùng Premium');
      }

      // Add premium status to request object
      req.user.isPremium = true;
      req.user.premiumStatus = await this.premiumService.getPremiumStatus(req.user.id);

      next();
    } catch (error) {
      throw error;
    }
  }
}

// Decorator to check premium status
export const PREMIUM_REQUIRED_KEY = 'premiumRequired';
export const PremiumRequired = () => SetMetadata(PREMIUM_REQUIRED_KEY, true);

// Guard to check premium status
@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly premiumService: PremiumService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresPremium = this.reflector.getAllAndOverride<boolean>(PREMIUM_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiresPremium) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Vui lòng đăng nhập để sử dụng tính năng này');
    }

    const isPremium = await this.premiumService.isPremiumUser(user.id);
    
    if (!isPremium) {
      throw new ForbiddenException('Tính năng này chỉ dành cho người dùng Premium');
    }

    // Add premium status to request for later use
    request.user!.isPremium = true;
    request.user!.premiumStatus = await this.premiumService.getPremiumStatus(user.id);

    return true;
  }
}

// Admin Guard
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Vui lòng đăng nhập để sử dụng tính năng này');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin mới có thể truy cập tính năng này');
    }

    return true;
  }
}

// Rate limiting middleware for payment
@Injectable()
export class PaymentRateLimitMiddleware implements NestMiddleware {
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxRequests = 5; // Max 5 payment requests per hour
  private readonly windowMs = 60 * 60 * 1000; // 1 hour

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    
    if (!userId) {
      return next();
    }

    const now = Date.now();
    const userKey = `payment_${userId}`;
    const userRequestData = this.requestCounts.get(userKey);

    if (!userRequestData || now > userRequestData.resetTime) {
      // Reset or create new counter
      this.requestCounts.set(userKey, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return next();
    }

    if (userRequestData.count >= this.maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          statusCode: 429,
          message: 'Bạn đã vượt quá giới hạn tạo giao dịch thanh toán. Vui lòng thử lại sau 1 giờ.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    userRequestData.count++;
    next();
  }
}
