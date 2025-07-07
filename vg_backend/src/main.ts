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
  
  // Thiết lập CORS
  app.enableCors();
  
  // Thiết lập tiền tố cho API
  app.setGlobalPrefix('api');

  // Thiết lập Swagger
  const config = new DocumentBuilder()
    .setTitle('VieGrand API')
    .setDescription('API cho ứng dụng VieGrand')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
  console.log(`Ứng dụng đang chạy tại: http://localhost:3000/api-docs`);
}
bootstrap(); 