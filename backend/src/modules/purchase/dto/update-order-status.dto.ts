// src/modules/purchase/dto/update-order-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PurchaseOrderStatus } from './create-purchase-order.dto';

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    example: 'confirmed', 
    description: '订单状态', 
    enum: PurchaseOrderStatus 
  })
  @IsEnum(PurchaseOrderStatus)
  @IsNotEmpty()
  status: PurchaseOrderStatus;
}