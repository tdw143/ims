// src/modules/system-logs/system-logs.module.ts
import { Module } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { SystemLogsController } from './system-logs.controller';
import { PrismaService } from '@/prisma.service';

@Module({
  controllers: [SystemLogsController],
  providers: [SystemLogsService, PrismaService],
  exports: [SystemLogsService],
})
export class SystemLogsModule {}