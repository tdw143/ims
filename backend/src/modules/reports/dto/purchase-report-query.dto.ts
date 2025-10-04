// src/modules/reports/dto/purchase-report-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { ReportPeriod } from './sales-report-query.dto';

export class PurchaseReportQueryDto {
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

  @ApiProperty({ required: false, description: '供应商编号' })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ required: false, description: '采购员编号' })
  @IsString()
  @IsOptional()
  employeeId?: string;
}