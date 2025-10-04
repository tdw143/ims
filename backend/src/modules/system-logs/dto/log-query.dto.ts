// src/modules/system-logs/dto/log-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

export enum LogModule {
  AUTH = 'auth',
  SALES = 'sales',
  PURCHASE = 'purchase',
  WAREHOUSE = 'warehouse',
  INVENTORY = 'inventory',
  SYSTEM = 'system'
}

export class LogQueryDto {
  @ApiProperty({ required: false, description: '日志级别', enum: LogLevel })
  @IsEnum(LogLevel)
  @IsOptional()
  level?: LogLevel;

  @ApiProperty({ required: false, description: '模块名称', enum: LogModule })
  @IsEnum(LogModule)
  @IsOptional()
  module?: LogModule;

  @ApiProperty({ required: false, description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ required: false, description: '开始日期 (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期 (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false, description: '关键词搜索' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, description: '页码', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiProperty({ required: false, description: '每页数量', default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 20;
}