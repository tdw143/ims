// src/modules/suppliers/dto/create-supplier.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'S0004', description: '供应商编号' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '新供应商公司', description: '供应商名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '面料供应商', description: '供应商类别', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: '浙江省杭州市', description: '地址', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '陈经理', description: '联系人', required: false })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiProperty({ example: '13700137004', description: '联系电话' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'chen@supplier.com', description: '邮箱', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '新合作供应商', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}