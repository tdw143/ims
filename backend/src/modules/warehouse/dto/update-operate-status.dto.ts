// src/modules/warehouse/dto/update-operate-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OperateStatus } from './create-inbound-order.dto';

export class UpdateOperateStatusDto {
  @ApiProperty({ 
    example: 'completed', 
    description: '操作状态', 
    enum: OperateStatus 
  })
  @IsEnum(OperateStatus)
  @IsNotEmpty()
  operateStatus: OperateStatus;
}