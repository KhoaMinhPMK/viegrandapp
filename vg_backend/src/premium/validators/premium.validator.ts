import {
  ValidationPipe,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PremiumValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const errorMessages = errors.map((error) => {
          return {
            property: error.property,
            constraints: error.constraints,
            value: error.value,
          };
        });

        return new BadRequestException({
          message: 'Dữ liệu đầu vào không hợp lệ',
          errors: errorMessages,
        });
      },
    });
  }
}

// Custom validation decorators
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsVietnamesePhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isVietnamesePhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const phoneRegex = /^(\+84|0)(3|5|7|8|9)\d{8}$/;
          return typeof value === 'string' && phoneRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx)';
        },
      },
    });
  };
}

export function IsValidAmount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidAmount',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && value > 0 && value <= 10000000; // Max 10M VND
        },
        defaultMessage(args: ValidationArguments) {
          return 'Số tiền phải lớn hơn 0 và không quá 10,000,000 VND';
        },
      },
    });
  };
}

export function IsValidDuration(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDuration',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && value > 0 && value <= 365; // Max 1 year
        },
        defaultMessage(args: ValidationArguments) {
          return 'Thời hạn phải từ 1 đến 365 ngày';
        },
      },
    });
  };
}
