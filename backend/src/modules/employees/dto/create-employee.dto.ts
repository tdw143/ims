// src/modules/employees/dto/create-employee.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsDateString, IsEnum } from 'class-validator';

export enum EmployeeType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  WAREHOUSE = 'warehouse',
  FINANCE = 'finance',
  MANAGER = 'manager'
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F'
}

export class CreateEmployeeDto {
  @ApiProperty({ example: 'E009', description: '员工编号' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '陈员工', description: '员工姓名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'M', description: '性别', enum: Gender })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ example: '1990-01-01', description: '出生日期', required: false })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ example: '北京市朝阳区', description: '户籍地址', required: false })
  @IsString()
  @IsOptional()
  residence?: string;

  @ApiProperty({ example: '110101199001011234', description: '身份证号', required: false })
  @IsString()
  @IsOptional()
  idCard?: string;

  @ApiProperty({ example: '本科', description: '最高学历', required: false })
  @IsString()
  @IsOptional()
  education?: string;

  @ApiProperty({ example: '13800138009', description: '联系电话' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'chen@ttfashion.com', description: '邮箱', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '2023-01-01', description: '入职日期' })
  @IsDateString()
  @IsNotEmpty()
  entryDate: string;

  @ApiProperty({ 
    example: 'sales', 
    description: '员工类型', 
    enum: EmployeeType 
  })
  @IsEnum(EmployeeType)
  @IsNotEmpty()
  type: EmployeeType;

  @ApiProperty({ example: 'D01', description: '部门编号' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ example: '新入职销售员工', description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}