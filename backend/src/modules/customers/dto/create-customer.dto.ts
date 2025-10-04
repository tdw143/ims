// src/modules/customers/dto/create-customer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F'
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'C0005', description: '客户编号' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '新客户公司', description: '客户名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'M', description: '性别', enum: Gender, required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ example: '13900139005', description: '联系电话' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'new@example.com', description: '邮箱', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '上海市浦东新区', description: '配送地址', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '新开发客户', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}