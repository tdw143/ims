// src/modules/sales/dto/update-sales-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SalesOrderStatus } from './create-sales-order.dto';

export class UpdateSalesStatusDto {
  @ApiProperty({ 
    example: 'confirmed', 
    description: '订单状态', 
    enum: SalesOrderStatus 
  })
  @IsEnum(SalesOrderStatus)
  @IsNotEmpty()
  status: SalesOrderStatus;

  @ApiProperty({ example: 'SF123456789', description: '物流单号', required: false })
  @IsString()
  @IsOptional()
  trackingNo?: string;
}