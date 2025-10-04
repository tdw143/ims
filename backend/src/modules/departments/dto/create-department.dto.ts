// src/modules/departments/dto/create-department.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'D04', description: '部门编号' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '财务部', description: '部门名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '张财务', description: '联系人', required: false })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiProperty({ example: '13800138008', description: '部门电话', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'finance@ttfashion.com', description: '部门邮箱', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'E008', description: '经理编号', required: false })
  @IsString()
  @IsOptional()
  managerId?: string;

  @ApiProperty({ example: '负责公司财务管理', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}