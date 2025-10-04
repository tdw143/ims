// src/modules/reports/dto/inventory-report-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum InventoryReportType {
  STOCK_STATUS = 'stock_status',
  STOCK_MOVEMENT = 'stock_movement',
  STOCK_VALUE = 'stock_value'
}

export class InventoryReportQueryDto {
  @ApiProperty({ 
    required: false, 
    description: '报表类型',
    enum: InventoryReportType,
    default: InventoryReportType.STOCK_STATUS 
  })
  @IsEnum(InventoryReportType)
  @IsOptional()
  reportType?: InventoryReportType = InventoryReportType.STOCK_STATUS;

  @ApiProperty({ required: false, description: '仓库编号' })
  @IsString()
  @IsOptional()
  warehouseId?: string;

  @ApiProperty({ required: false, description: '商品分类' })
  @IsString()
  @IsOptional()
  category?: string;
}