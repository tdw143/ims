// src/modules/purchase/purchase.controller.ts
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
import { PurchaseService } from './purchase.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constants';

@ApiTags('采购管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post('orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '创建采购订单' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '采购订单创建成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '供应商或商品不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '无效的采购人员' })
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @Req() req: any) {
    const employeeId = req.user.employeeId; // 从JWT token中获取员工ID
    return this.purchaseService.create(createPurchaseOrderDto, employeeId);
  }

  @Get('orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF, UserRole.FINANCE)
  @ApiOperation({ summary: '获取采购订单列表' })
  @ApiQuery({ name: 'supplierId', required: false, description: '供应商编号' })
  @ApiQuery({ name: 'status', required: false, description: '订单状态' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取采购订单列表成功' })
  findAll(@Query() query: PurchaseQueryDto) {
    return this.purchaseService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取采购统计信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取采购统计成功' })
  getStats() {
    return this.purchaseService.getPurchaseStats();
  }

  @Get('orders/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF, UserRole.FINANCE)
  @ApiOperation({ summary: '根据ID获取采购订单详情' })
  @ApiParam({ name: 'id', description: '采购订单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取采购订单详情成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '采购订单不存在' })
  findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Patch('orders/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '更新采购订单' })
  @ApiParam({ name: 'id', description: '采购订单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '采购订单更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '采购订单不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '只有待处理的订单可以修改' })
  update(@Param('id') id: string, @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return this.purchaseService.update(id, updatePurchaseOrderDto);
  }

  @Patch('orders/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER)
  @ApiOperation({ summary: '更新采购订单状态' })
  @ApiParam({ name: 'id', description: '采购订单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '订单状态更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '采购订单不存在' })
  updateStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.purchaseService.updateStatus(id, updateOrderStatusDto);
  }

  @Delete('orders/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER)
  @ApiOperation({ summary: '删除采购订单' })
  @ApiParam({ name: 'id', description: '采购订单编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '采购订单删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '采购订单不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '只有待处理的订单可以删除' })
  remove(@Param('id') id: string) {
    return this.purchaseService.remove(id);
  }
}