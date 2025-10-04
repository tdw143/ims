// src/modules/sales/dto/create-sales-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SalesOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class SalesOrderItemDto {
  @ApiProperty({ example: 'P00001', description: '商品编号' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10, description: '销售数量' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 199.0, description: '销售单价' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: '红色连衣裙', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateSalesOrderDto {
  @ApiProperty({ example: 'C0001', description: '客户编号' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: '2024-01-15', description: '订单日期' })
  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

  @ApiProperty({ example: '2024-01-18', description: '预计发货日期', required: false })
  @IsDateString()
  @IsOptional()
  expectDate?: string;

  @ApiProperty({ 
    example: 'pending', 
    description: '订单状态', 
    enum: SalesOrderStatus,
    default: SalesOrderStatus.PENDING 
  })
  @IsEnum(SalesOrderStatus)
  @IsOptional()
  status?: SalesOrderStatus;

  @ApiProperty({ type: [SalesOrderItemDto], description: '销售商品明细' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  items: SalesOrderItemDto[];

  @ApiProperty({ example: '春季新品订单', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}