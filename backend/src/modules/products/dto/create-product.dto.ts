// src/modules/products/dto/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'P00007', description: '商品编号' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '新款连衣裙', description: '商品名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '连衣裙', description: '商品类别' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: '跳跳', description: '商品品牌', required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ example: 'M', description: '商品规格', required: false })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiProperty({ example: '件', description: '计量单位' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: '红色', description: '颜色', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: '棉', description: '材质', required: false })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiProperty({ example: 85.5, description: '参考进价', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @ApiProperty({ example: 199.0, description: '参考售价', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sellPrice?: number;

  @ApiProperty({ example: '夏季新款', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}