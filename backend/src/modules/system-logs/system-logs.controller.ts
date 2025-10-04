// src/modules/system-logs/system-logs.controller.ts
import { 
  Controller, 
  Get, 
  Query, 
  Param,
  Delete,
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { SystemLogsService } from './system-logs.service';
import { LogQueryDto } from './dto/log-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constants';

@ApiTags('系统日志')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('system-logs')
export class SystemLogsController {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取系统日志列表' })
  @ApiQuery({ name: 'level', required: false, description: '日志级别' })
  @ApiQuery({ name: 'module', required: false, description: '模块名称' })
  @ApiQuery({ name: 'userId', required: false, description: '用户ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'search', required: false, description: '关键词搜索' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取日志列表成功' })
  findAll(@Query() query: LogQueryDto) {
    return this.systemLogsService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取日志统计信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取日志统计成功' })
  getStats() {
    return this.systemLogsService.getLogStats();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '根据ID获取日志详情' })
  @ApiParam({ name: 'id', description: '日志ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取日志详情成功' })
  findOne(@Param('id') id: string) {
    return this.systemLogsService.findOne(id);
  }

  @Delete('cleanup')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '清理旧日志' })
  @ApiQuery({ name: 'days', required: false, description: '保留天数', default: 30 })
  @ApiResponse({ status: HttpStatus.OK, description: '日志清理成功' })
  cleanupOldLogs(@Query('days') days: number = 30) {
    return this.systemLogsService.cleanupOldLogs(days);
  }
}