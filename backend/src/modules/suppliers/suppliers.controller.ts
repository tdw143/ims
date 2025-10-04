// src/modules/suppliers/suppliers.controller.ts
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
  Query
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constants';

@ApiTags('供应商管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '创建供应商' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '供应商创建成功' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '供应商编号已存在' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF, UserRole.FINANCE)
  @ApiOperation({ summary: '获取供应商列表' })
  @ApiQuery({ name: 'name', required: false, description: '供应商名称' })
  @ApiQuery({ name: 'category', required: false, description: '供应商类别' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取供应商列表成功' })
  findAll(@Query() query: SupplierQueryDto) {
    return this.suppliersService.findAll(query);
  }

  @Get('search')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '搜索供应商' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词' })
  @ApiResponse({ status: HttpStatus.OK, description: '搜索成功' })
  search(@Query('keyword') keyword: string) {
    return this.suppliersService.searchSuppliers(keyword);
  }

  @Get('category/:category')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '根据类别获取供应商' })
  @ApiParam({ name: 'category', description: '供应商类别' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取供应商成功' })
  getByCategory(@Param('category') category: string) {
    return this.suppliersService.getSuppliersByCategory(category);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF, UserRole.FINANCE)
  @ApiOperation({ summary: '根据ID获取供应商详情' })
  @ApiParam({ name: 'id', description: '供应商编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取供应商详情成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '供应商不存在' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取供应商统计信息' })
  @ApiParam({ name: 'id', description: '供应商编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取供应商统计成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '供应商不存在' })
  getStats(@Param('id') id: string) {
    return this.suppliersService.getSupplierStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '更新供应商信息' })
  @ApiParam({ name: 'id', description: '供应商编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '供应商更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '供应商不存在' })
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER)
  @ApiOperation({ summary: '删除供应商' })
  @ApiParam({ name: 'id', description: '供应商编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '供应商删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '供应商不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '供应商有关联订单，无法删除' })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}