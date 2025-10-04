// src/modules/sales/dto/update-sales-order.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateSalesOrderDto } from './create-sales-order.dto';

export class UpdateSalesOrderDto extends PartialType(CreateSalesOrderDto) {}