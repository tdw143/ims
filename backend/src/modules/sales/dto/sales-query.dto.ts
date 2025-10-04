// src/modules/sales/dto/sales-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SalesOrderStatus } from './create-sales-order.dto';

export class SalesQueryDto {
  @ApiProperty({ required: false, description: '客户编号' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ required: false, description: '订单状态', enum: SalesOrderStatus })
  @IsEnum(SalesOrderStatus)
  @IsOptional()
  status?: SalesOrderStatus;

  @ApiProperty({ required: false, description: '开始日期 (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期 (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false, description: '页码', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiProperty({ required: false, description: '每页数量', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;
}