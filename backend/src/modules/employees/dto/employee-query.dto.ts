// src/modules/employees/dto/employee-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeType } from './create-employee.dto';

export class EmployeeQueryDto {
  @ApiProperty({ required: false, description: '员工姓名' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, description: '员工类型', enum: EmployeeType })
  @IsEnum(EmployeeType)
  @IsOptional()
  type?: EmployeeType;

  @ApiProperty({ required: false, description: '部门编号' })
  @IsString()
  @IsOptional()
  departmentId?: string;

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