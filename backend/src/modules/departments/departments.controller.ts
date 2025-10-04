// src/modules/departments/departments.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
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
  ApiParam 
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constants';

@ApiTags('部门管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '创建部门' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '部门创建成功' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '部门编号已存在' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.WAREHOUSE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取所有部门列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取部门列表成功' })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取部门统计信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取部门统计成功' })
  getStats() {
    return this.departmentsService.getDepartmentStats();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.WAREHOUSE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '根据ID获取部门详情' })
  @ApiParam({ name: 'id', description: '部门编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取部门详情成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '部门不存在' })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '更新部门信息' })
  @ApiParam({ name: 'id', description: '部门编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '部门更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '部门不存在' })
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '删除部门' })
  @ApiParam({ name: 'id', description: '部门编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '部门删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '部门不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '部门下还有员工，无法删除' })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}