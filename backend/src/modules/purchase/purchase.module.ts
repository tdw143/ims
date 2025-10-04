// src/modules/purchase/purchase.module.ts
import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaService } from '@/prisma.service';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService, PrismaService],
  exports: [PurchaseService],
})
export class PurchaseModule {}