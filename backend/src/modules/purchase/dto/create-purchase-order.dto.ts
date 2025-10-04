// src/modules/purchase/dto/create-purchase-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum PurchaseOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class PurchaseOrderItemDto {
  @ApiProperty({ example: 'P00001', description: '商品编号' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 100, description: '采购数量' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 89.5, description: '采购单价' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: '红色连衣裙采购', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 'S0001', description: '供应商编号' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({ example: '2024-01-15', description: '订单日期' })
  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

  @ApiProperty({ example: '2024-01-25', description: '预计到货日期', required: false })
  @IsDateString()
  @IsOptional()
  expectDate?: string;

  @ApiProperty({ 
    example: 'pending', 
    description: '订单状态', 
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.PENDING 
  })
  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @ApiProperty({ type: [PurchaseOrderItemDto], description: '采购商品明细' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];

  @ApiProperty({ example: '春季新品采购', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}