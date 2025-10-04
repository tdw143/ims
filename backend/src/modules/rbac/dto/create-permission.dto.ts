// src/modules/rbac/dto/create-permission.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'sales:write', description: '权限名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '销售写入权限', description: '权限描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'sales', description: '模块名称' })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({ example: 'write', description: '操作类型' })
  @IsString()
  @IsNotEmpty()
  action: string;
}