// src/modules/rbac/dto/assign-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 'user123', description: '用户ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    example: ['sales_manager', 'finance'], 
    description: '角色名称列表' 
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  roleNames: string[];
}