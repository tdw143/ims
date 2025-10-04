import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  
  // 模块初始化时连接数据库
  async onModuleInit() {
    await this.$connect();
  }

  // 模块销毁时断开连接
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
    