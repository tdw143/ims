// src/modules/warehouse/dto/create-outbound-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OperateStatus } from './create-inbound-order.dto'

export class OutboundOrderItemDto {
  @ApiProperty({ example: 'P00001', description: '商品编号' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'W1', description: '仓库编号' })
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ example: 10, description: '出库数量' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: '红色连衣裙出库', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateOutboundOrderDto {
  @ApiProperty({ example: 'SO202401001', description: '销售订单编号', required: false })
  @IsString()
  @IsOptional()
  salesOrderId?: string;

  @ApiProperty({ example: 'C0001', description: '客户编号' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: '2024-01-18', description: '出库日期' })
  @IsDateString()
  @IsNotEmpty()
  outboundDate: string;

  @ApiProperty({ example: 'SF123456789', description: '物流单号', required: false })
  @IsString()
  @IsOptional()
  trackingNo?: string;

  @ApiProperty({ 
    example: 'processing', 
    description: '操作状态', 
    enum: OperateStatus,
    default: OperateStatus.PROCESSING 
  })
  @IsEnum(OperateStatus)
  @IsOptional()
  operateStatus?: OperateStatus;

  @ApiProperty({ type: [OutboundOrderItemDto], description: '出库商品明细' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutboundOrderItemDto)
  items: OutboundOrderItemDto[];

  @ApiProperty({ example: '发给时尚精品店', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}