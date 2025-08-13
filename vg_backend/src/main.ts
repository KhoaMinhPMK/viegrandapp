import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Thiết lập validation pipe toàn cục
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Thiết lập CORS cho frontend
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'exp://192.168.1.100:19000', // For React Native development
      'exp://localhost:19000',
      'exp://192.168.1.38:19000', // Your device
      'exp://192.168.1.38:8081',  // Your device (new Expo Go port)
      /^http:\/\/192\.168\.\d+\.\d+:19000$/, // For React Native on different IPs
      /^exp:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow any expo client on local network
      /^http:\/\/172\.28\.\d+\.\d+:3000$/, // For current network
      /^http:\/\/172\.28\.\d+\.\d+$/, // For current network without port
      /^exp:\/\/172\.28\.\d+\.\d+:\d+$/, // Allow any expo client on current network
      '*', // Allow all for development - REMOVE in production
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Thiết lập tiền tố cho API
  app.setGlobalPrefix('api');

  // Thiết lập Swagger
  const config = new DocumentBuilder()
    .setTitle('VieGrand API')
    .setDescription('API cho ứng dụng VieGrand - Hỗ trợ người cao tuổi')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Xác thực và phân quyền')
    .addTag('Premium', 'Quản lý gói Premium và thanh toán')
    .addTag('Users', 'Quản lý người dùng')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  
  await app.listen(port, host);
  console.log(`🚀 VieGrand API đang chạy tại:`);
  console.log(`   - Local: http://localhost:${port}/api-docs`);
  console.log(`   - Network: http://${host}:${port}/api-docs`);
  console.log(`   - API Base: http://localhost:${port}/api`);
}
bootstrap(); 