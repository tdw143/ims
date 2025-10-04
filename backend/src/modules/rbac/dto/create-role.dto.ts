// src/modules/rbac/dto/create-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'finance_manager', description: '角色名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '财务经理', description: '角色描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: ['users:read', 'reports:read', 'sales:read'], 
    description: '权限列表',
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}