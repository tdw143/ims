// src/modules/customers/customers.controller.ts
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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constants';

@ApiTags('客户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF)
  @ApiOperation({ summary: '创建客户' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '客户创建成功' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '客户编号已存在' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF, UserRole.FINANCE)
  @ApiOperation({ summary: '获取客户列表' })
  @ApiQuery({ name: 'name', required: false, description: '客户名称' })
  @ApiQuery({ name: 'phone', required: false, description: '联系电话' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取客户列表成功' })
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get('search')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF)
  @ApiOperation({ summary: '搜索客户' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词' })
  @ApiResponse({ status: HttpStatus.OK, description: '搜索成功' })
  search(@Query('keyword') keyword: string) {
    return this.customersService.searchCustomers(keyword);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF, UserRole.FINANCE)
  @ApiOperation({ summary: '根据ID获取客户详情' })
  @ApiParam({ name: 'id', description: '客户编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取客户详情成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '客户不存在' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取客户统计信息' })
  @ApiParam({ name: 'id', description: '客户编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取客户统计成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '客户不存在' })
  getStats(@Param('id') id: string) {
    return this.customersService.getCustomerStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_STAFF)
  @ApiOperation({ summary: '更新客户信息' })
  @ApiParam({ name: 'id', description: '客户编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '客户更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '客户不存在' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: '删除客户' })
  @ApiParam({ name: 'id', description: '客户编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '客户删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '客户不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '客户有关联订单，无法删除' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}