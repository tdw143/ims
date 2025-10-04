// src/modules/inventory/inventory.controller.ts
import { 
  Controller, 
  Get, 
  Patch, 
  Body, 
  Param, 
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam 
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constants';

@ApiTags('库存管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取库存概览' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取库存概览成功' })
  getSummary() {
    return this.inventoryService.getInventorySummary();
  }

  @Get('product/:productId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '根据商品获取库存' })
  @ApiParam({ name: 'productId', description: '商品编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取商品库存成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '商品不存在' })
  getByProduct(@Param('productId') productId: string) {
    return this.inventoryService.getInventoryByProduct(productId);
  }

  @Get('warehouse/:warehouseId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '根据仓库获取库存' })
  @ApiParam({ name: 'warehouseId', description: '仓库编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取仓库库存成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '仓库不存在' })
  getByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.inventoryService.getInventoryByWarehouse(warehouseId);
  }

  @Patch(':productId/:warehouseId/min-stock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.PURCHASE_MANAGER)
  @ApiOperation({ summary: '更新最低库存数量' })
  @ApiParam({ name: 'productId', description: '商品编号' })
  @ApiParam({ name: 'warehouseId', description: '仓库编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新最低库存成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '库存记录不存在' })
  updateMinStock(
    @Param('productId') productId: string,
    @Param('warehouseId') warehouseId: string,
    @Body('minQty') minQty: number
  ) {
    return this.inventoryService.updateMinStock(productId, warehouseId, minQty);
  }
}