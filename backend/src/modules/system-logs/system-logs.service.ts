// src/modules/system-logs/system-logs.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { LogQueryDto } from './dto/log-query.dto';

export interface LogStats {
  summary: {
    totalLogs: number;
  };
  byLevel: Array<{
    level: string;
    count: number;
  }>;
  byModule: Array<{
    module: string;
    count: number;
  }>;
  recentErrors: any[];
}

@Injectable()
export class SystemLogsService {
  constructor(private prisma: PrismaService) {}

  async createLog(logData: {
    level: string;
    module: string;
    action: string;
    message: string;
    userId?: string;
    userAgent?: string;
    ipAddress?: string;
    requestData?: any;
    responseData?: any;
    errorStack?: string;
  }) {
    try {
      await this.prisma.systemLog.create({
        data: {
          level: logData.level,
          module: logData.module,
          action: logData.action,
          message: logData.message,
          userId: logData.userId,
          userAgent: logData.userAgent,
          ipAddress: logData.ipAddress,
          requestData: logData.requestData,
          responseData: logData.responseData,
          errorStack: logData.errorStack,
        },
      });
    } catch (error) {
      // 日志记录失败不应该影响主业务流程
      console.error('Failed to write log:', error);
    }
  }

  async findAll(query: LogQueryDto) {
    const { level, module, userId, startDate, endDate, search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (level) {
      where.level = level;
    }

    if (module) {
      where.module = module;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' as any } },
        { action: { contains: search, mode: 'insensitive' as any } },
      ];
    }

    const [logs, total] = await Promise.all([
      this.prisma.systemLog.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.systemLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.systemLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      throw new Error(`Log ${id} not found`);
    }

    return log;
  }

  async getLogStats(): Promise<LogStats> {
    const [totalLogs, logsByLevel, logsByModule, recentErrors] = await Promise.all([
      this.prisma.systemLog.count(),
      this.prisma.systemLog.groupBy({
        by: ['level'],
        _count: {
          id: true,
        },
      }),
      this.prisma.systemLog.groupBy({
        by: ['module'],
        _count: {
          id: true,
        },
      }),
      this.prisma.systemLog.findMany({
        where: {
          level: 'error',
        },
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      }),
    ]);

    return {
      summary: {
        totalLogs,
      },
      byLevel: logsByLevel.map(item => ({
        level: item.level,
        count: item._count.id,
      })),
      byModule: logsByModule.map(item => ({
        module: item.module,
        count: item._count.id,
      })),
      recentErrors,
    };
  }

  async cleanupOldLogs(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.systemLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        level: {
          in: ['info', 'debug'],
        },
      },
    });

    return {
      deletedCount: result.count,
      cutoffDate,
    };
  }
}