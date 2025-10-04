// src/modules/customers/dto/customer-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerQueryDto {
  @ApiProperty({ required: false, description: '客户名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, description: '联系电话' })
  @IsString()
  @IsOptional()
  phone?: string;

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