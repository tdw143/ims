import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局启用DTO验证（使用class-validator）
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // 允许跨域（前端与后端不同端口时需要）
  app.enableCors();
  
  const config = new DocumentBuilder()
    .setTitle('跳跳服饰进销存管理系统 API')
    .setDescription('B2B 进销存管理系统接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // 启动服务器，监听指定端口
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`后端服务已启动：http://localhost:${port}`);
  
}

bootstrap();
