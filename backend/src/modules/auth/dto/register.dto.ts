// src/modules/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'admin@ttfashion.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'E001' })
  @IsString()
  @IsOptional()
  employeeId?: string;
}