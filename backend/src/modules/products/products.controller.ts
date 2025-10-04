// src/modules/products/products.controller.ts
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constants';

@ApiTags('商品管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '商品创建成功' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '商品编号已存在' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF, UserRole.WAREHOUSE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取商品列表' })
  @ApiQuery({ name: 'name', required: false, description: '商品名称' })
  @ApiQuery({ name: 'category', required: false, description: '商品类别' })
  @ApiQuery({ name: 'brand', required: false, description: '商品品牌' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取商品列表成功' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('categories')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取商品分类列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取分类列表成功' })
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('search')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '搜索商品' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词' })
  @ApiResponse({ status: HttpStatus.OK, description: '搜索成功' })
  search(@Query('keyword') keyword: string) {
    return this.productsService.searchProducts(keyword);
  }

  @Get('category/:category')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '根据类别获取商品' })
  @ApiParam({ name: 'category', description: '商品类别' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取商品成功' })
  getByCategory(@Param('category') category: string) {
    return this.productsService.getProductsByCategory(category);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF, UserRole.WAREHOUSE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '根据ID获取商品详情' })
  @ApiParam({ name: 'id', description: '商品编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取商品详情成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '商品不存在' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取商品统计信息' })
  @ApiParam({ name: 'id', description: '商品编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取商品统计成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '商品不存在' })
  getStats(@Param('id') id: string) {
    return this.productsService.getProductStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.PURCHASE_STAFF)
  @ApiOperation({ summary: '更新商品信息' })
  @ApiParam({ name: 'id', description: '商品编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '商品更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '商品不存在' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER)
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '商品删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '商品不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '商品有关联记录，无法删除' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}