// src/modules/employees/employees.controller.ts
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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constants';

@ApiTags('员工管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '创建员工' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '员工创建成功' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '员工编号已存在' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '部门不存在' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.WAREHOUSE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取员工列表' })
  @ApiQuery({ name: 'name', required: false, description: '员工姓名' })
  @ApiQuery({ name: 'type', required: false, description: '员工类型' })
  @ApiQuery({ name: 'departmentId', required: false, description: '部门编号' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取员工列表成功' })
  findAll(@Query() query: EmployeeQueryDto) {
    return this.employeesService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取员工统计信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取员工统计成功' })
  getStats() {
    return this.employeesService.getEmployeeStats();
  }

  @Get('search')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: '搜索员工' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词' })
  @ApiResponse({ status: HttpStatus.OK, description: '搜索成功' })
  search(@Query('keyword') keyword: string) {
    return this.employeesService.searchEmployees(keyword);
  }

  @Get('department/:departmentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: '根据部门获取员工列表' })
  @ApiParam({ name: 'departmentId', description: '部门编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取部门员工成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '部门不存在' })
  getByDepartment(@Param('departmentId') departmentId: string) {
    return this.employeesService.getEmployeesByDepartment(departmentId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.WAREHOUSE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '根据ID获取员工详情' })
  @ApiParam({ name: 'id', description: '员工编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取员工详情成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '员工不存在' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '更新员工信息' })
  @ApiParam({ name: 'id', description: '员工编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '员工更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '员工不存在' })
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '删除员工' })
  @ApiParam({ name: 'id', description: '员工编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '员工删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '员工不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '员工是部门经理或有关联用户账号，无法删除' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}