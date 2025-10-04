// src/modules/warehouse/warehouse.controller.ts
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
import { WarehouseService } from './warehouse.service';
import { CreateInboundOrderDto } from './dto/create-inbound-order.dto';
import { CreateOutboundOrderDto } from './dto/create-outbound-order.dto';
import { UpdateOperateStatusDto } from './dto/update-operate-status.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constants';

@ApiTags('仓储管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // ========== 入库管理 ==========
  @Post('inbound')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.WAREHOUSE_STAFF)
  @ApiOperation({ summary: '创建入库单' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '入库单创建成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '采购订单、商品或仓库不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '无效的仓管人员' })
  createInbound(@Body() createInboundOrderDto: CreateInboundOrderDto, @Req() req: any) {
    const employeeId = req.user.employeeId;
    return this.warehouseService.createInboundOrder(createInboundOrderDto, employeeId);
  }

  @Patch('inbound/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: '更新入库单状态' })
  @ApiParam({ name: 'id', description: '入库单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '入库单状态更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '入库单不存在' })
  updateInboundStatus(@Param('id') id: string, @Body() updateOperateStatusDto: UpdateOperateStatusDto) {
    return this.warehouseService.updateInboundStatus(id, updateOperateStatusDto);
  }

  // ========== 出库管理 ==========
  @Post('outbound')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.WAREHOUSE_STAFF)
  @ApiOperation({ summary: '创建出库单' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '出库单创建成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '销售订单、客户、商品或仓库不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '无效的仓管人员' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '商品库存不足' })
  createOutbound(@Body() createOutboundOrderDto: CreateOutboundOrderDto, @Req() req: any) {
    const employeeId = req.user.employeeId;
    return this.warehouseService.createOutboundOrder(createOutboundOrderDto, employeeId);
  }

  @Patch('outbound/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: '更新出库单状态' })
  @ApiParam({ name: 'id', description: '出库单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '出库单状态更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '出库单不存在' })
  updateOutboundStatus(@Param('id') id: string, @Body() updateOperateStatusDto: UpdateOperateStatusDto) {
    return this.warehouseService.updateOutboundStatus(id, updateOperateStatusDto);
  }

  // ========== 库存管理 ==========
  @Get('inventory')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.WAREHOUSE_STAFF, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取库存列表' })
  @ApiQuery({ name: 'productId', required: false, description: '商品编号' })
  @ApiQuery({ name: 'warehouseId', required: false, description: '仓库编号' })
  @ApiQuery({ name: 'productName', required: false, description: '商品名称' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取库存列表成功' })
  getInventory(@Query() query: InventoryQueryDto) {
    return this.warehouseService.getInventory(query);
  }

  @Get('inventory/alerts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.PURCHASE_MANAGER)
  @ApiOperation({ summary: '获取库存预警' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取库存预警成功' })
  getLowStockAlerts() {
    return this.warehouseService.getLowStockAlerts();
  }

  @Get('inventory/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取库存统计' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取库存统计成功' })
  getInventoryStats() {
    return this.warehouseService.getInventoryStats();
  }

  @Patch('inventory/:productId/:warehouseId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: '更新库存数量' })
  @ApiParam({ name: 'productId', description: '商品编号' })
  @ApiParam({ name: 'warehouseId', description: '仓库编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '库存更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '库存记录不存在' })
  updateInventory(
    @Param('productId') productId: string,
    @Param('warehouseId') warehouseId: string,
    @Body('quantity') quantity: number,
    @Body('note') note?: string
  ) {
    return this.warehouseService.updateInventory(productId, warehouseId, quantity, note);
  }
}