// src/modules/reports/dto/sales-report-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export class SalesReportQueryDto {
  @ApiProperty({ 
    required: false, 
    description: '报表周期',
    enum: ReportPeriod,
    default: ReportPeriod.MONTHLY 
  })
  @IsEnum(ReportPeriod)
  @IsOptional()
  period: ReportPeriod = ReportPeriod.MONTHLY;

  @ApiProperty({ required: false, description: '开始日期 (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期 (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false, description: '员工编号' })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({ required: false, description: '客户编号' })
  @IsString()
  @IsOptional()
  customerId?: string;
}