// src/modules/warehouse/dto/create-inbound-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum OperateStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class InboundOrderItemDto {
  @ApiProperty({ example: 'P00001', description: '商品编号' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'W1', description: '仓库编号' })
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ example: 100, description: '入库数量' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'BATCH202401001', description: '生产批号', required: false })
  @IsString()
  @IsOptional()
  batchNo?: string;

  @ApiProperty({ example: '红色连衣裙入库', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateInboundOrderDto {
  @ApiProperty({ example: 'PO202401001', description: '采购订单编号', required: false })
  @IsString()
  @IsOptional()
  purchaseOrderId?: string;

  @ApiProperty({ example: '2024-01-20', description: '入库日期' })
  @IsDateString()
  @IsNotEmpty()
  inboundDate: string;

  @ApiProperty({ 
    example: 'processing', 
    description: '操作状态', 
    enum: OperateStatus,
    default: OperateStatus.PROCESSING 
  })
  @IsEnum(OperateStatus)
  @IsOptional()
  operateStatus?: OperateStatus;

  @ApiProperty({ type: [InboundOrderItemDto], description: '入库商品明细' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InboundOrderItemDto)
  items: InboundOrderItemDto[];

  @ApiProperty({ example: '春季新品入库', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}