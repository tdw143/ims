// src/modules/rbac/rbac.controller.ts
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
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constants';

@ApiTags('权限管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ========== 角色管理 ==========
  @Post('roles')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '角色创建成功' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '角色名称已存在' })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  @Get('roles')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取所有角色' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取角色列表成功' })
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Patch('roles/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '更新角色' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '角色更新成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '角色不存在' })
  updateRole(@Param('id') id: string, @Body() updateData: Partial<CreateRoleDto>) {
    return this.rbacService.updateRole(id, updateData);
  }

  @Delete('roles/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '角色删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '角色不存在' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '角色下还有用户，无法删除' })
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  // ========== 权限管理 ==========
  @Post('permissions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '权限创建成功' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '权限名称已存在' })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(createPermissionDto);
  }

  @Get('permissions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取所有权限' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取权限列表成功' })
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Get('permissions/module/:module')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '根据模块获取权限' })
  @ApiParam({ name: 'module', description: '模块名称' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取模块权限成功' })
  getPermissionsByModule(@Param('module') module: string) {
    return this.rbacService.getPermissionsByModule(module);
  }

  // ========== 用户角色管理 ==========
  @Post('users/assign-roles')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiResponse({ status: HttpStatus.OK, description: '角色分配成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '用户或角色不存在' })
  assignRolesToUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.rbacService.assignRolesToUser(assignRoleDto);
  }

  @Get('users/:userId/roles')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取用户角色' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取用户角色成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '用户不存在' })
  getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }

  @Get('users/:userId/permissions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取用户权限' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取用户权限成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '用户不存在' })
  getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }

  // ========== 角色权限管理 ==========
  @Post('roles/:roleId/permissions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '为角色分配权限' })
  @ApiParam({ name: 'roleId', description: '角色ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '权限分配成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '角色或权限不存在' })
  assignPermissionsToRole(
    @Param('roleId') roleId: string,
    @Body('permissionIds') permissionIds: string[]
  ) {
    return this.rbacService.assignPermissionsToRole(roleId, permissionIds);
  }

  @Get('roles/:roleId/permissions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取角色权限' })
  @ApiParam({ name: 'roleId', description: '角色ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取角色权限成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '角色不存在' })
  getRolePermissions(@Param('roleId') roleId: string) {
    return this.rbacService.getRolePermissions(roleId);
  }
}