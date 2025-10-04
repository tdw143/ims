// src/modules/sales/sales.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  HttpStatus,
  Query,
  Req
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesQueryDto } from './dto/sales-query.dto';
import { UpdateSalesStatusDto } from './dto/update-sales-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constants';

@ApiTags('销售管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF)
  @ApiOperation({ summary: '创建销售订单' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '销售订单创建成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '客户或商品不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '无效的销售人员' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '商品库存不足' })
  create(@Body() createSalesOrderDto: CreateSalesOrderDto, @Req() req: any) {
    const employeeId = req.user.employeeId;
    return this.salesService.create(createSalesOrderDto, employeeId);
  }

  @Get('orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF, UserRole.FINANCE)
  @ApiOperation({ summary: '获取销售订单列表' })
  @ApiQuery({ name: 'customerId', required: false, description: '客户编号' })
  @ApiQuery({ name: 'status', required: false, description: '订单状态' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取销售订单列表成功' })
  findAll(@Query() query: SalesQueryDto) {
    return this.salesService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取销售统计信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取销售统计成功' })
  getStats() {
    return this.salesService.getSalesStats();
  }

  @Get('products/top')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取热销商品排行' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量', default: 10 })
  @ApiResponse({ status: HttpStatus.OK, description: '获取热销商品成功' })
  getTopProducts(@Query('limit') limit: number = 10) {
    return this.salesService.getTopSellingProducts(limit);
  }

  @Get('orders/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF, UserRole.FINANCE)
  @ApiOperation({ summary: '根据ID获取销售订单详情' })
  @ApiParam({ name: 'id', description: '销售订单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取销售订单详情成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '销售订单不存在' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch('orders/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF)
  @ApiOperation({ summary: '更新销售订单' })
  @ApiParam({ name: 'id', description: '销售订单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '销售订单更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '销售订单不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '只有待处理的订单可以修改' })
  update(@Param('id') id: string, @Body() updateSalesOrderDto: UpdateSalesOrderDto) {
    return this.salesService.update(id, updateSalesOrderDto);
  }

  @Patch('orders/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: '更新销售订单状态' })
  @ApiParam({ name: 'id', description: '销售订单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '订单状态更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '销售订单不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '无效的状态转换' })
  updateStatus(@Param('id') id: string, @Body() updateSalesStatusDto: UpdateSalesStatusDto) {
    return this.salesService.updateStatus(id, updateSalesStatusDto);
  }

  @Delete('orders/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: '删除销售订单' })
  @ApiParam({ name: 'id', description: '销售订单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '销售订单删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '销售订单不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '只有待处理的订单可以删除' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}