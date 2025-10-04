// src/modules/warehouse/dto/inventory-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryQueryDto {
  @ApiProperty({ required: false, description: '商品编号' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ required: false, description: '仓库编号' })
  @IsString()
  @IsOptional()
  warehouseId?: string;

  @ApiProperty({ required: false, description: '商品名称' })
  @IsString()
  @IsOptional()
  productName?: string;

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