// src/modules/rbac/rbac.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  // ========== 角色管理 ==========
  async createRole(createRoleDto: CreateRoleDto) {
    // 检查角色是否已存在
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('角色名称已存在');
    }

    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
      },
    });
  }

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async updateRole(id: string, updateData: Partial<CreateRoleDto>) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return this.prisma.role.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    if (role.userRoles.length > 0) {
      throw new ConflictException('该角色下还有用户，无法删除');
    }

    return this.prisma.role.delete({
      where: { id },
    });
  }

  // ========== 权限管理 ==========
  async createPermission(createPermissionDto: CreatePermissionDto) {
    // 检查权限是否已存在
    const existingPermission = await this.prisma.permission.findUnique({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      throw new ConflictException('权限名称已存在');
    }

    return this.prisma.permission.create({
      data: createPermissionDto,
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        module: 'asc',
      },
    });
  }

  async getPermissionsByModule(module: string) {
    return this.prisma.permission.findMany({
      where: { module },
      orderBy: {
        action: 'asc',
      },
    });
  }

  // ========== 用户角色管理 ==========
  async assignRolesToUser(assignRoleDto: AssignRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: assignRoleDto.userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证所有角色是否存在
    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          in: assignRoleDto.roleNames,
        },
      },
    });

    if (roles.length !== assignRoleDto.roleNames.length) {
      const foundRoleNames = roles.map(role => role.name);
      const missingRoles = assignRoleDto.roleNames.filter(name => !foundRoleNames.includes(name));
      throw new NotFoundException(`以下角色不存在: ${missingRoles.join(', ')}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 删除用户现有角色
      await tx.userRole.deleteMany({
        where: { userId: assignRoleDto.userId },
      });

      // 分配新角色
      const userRoles = await Promise.all(
        roles.map(role =>
          tx.userRole.create({
            data: {
              userId: assignRoleDto.userId,
              roleId: role.id,
            },
            include: {
              role: true,
            },
          })
        )
      );

      return userRoles;
    });
  }

  async getUserRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user.userRoles.map(ur => ur.role);
  }

  async getUserPermissions(userId: string) {
    const userRoles = await this.getUserRoles(userId);
    
    const permissions = userRoles.flatMap(role =>
      role.rolePermissions.map(rp => rp.permission)
    );

    // 去重
    const uniquePermissions = Array.from(
      new Map(permissions.map(p => [p.id, p])).values()
    );

    return uniquePermissions;
  }

  // ========== 角色权限管理 ==========
  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 验证所有权限是否存在
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
    });

    if (permissions.length !== permissionIds.length) {
      const foundPermissionIds = permissions.map(p => p.id);
      const missingPermissions = permissionIds.filter(id => !foundPermissionIds.includes(id));
      throw new NotFoundException(`以下权限不存在: ${missingPermissions.join(', ')}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 删除角色现有权限
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // 分配新权限
      const rolePermissions = await Promise.all(
        permissionIds.map(permissionId =>
          tx.rolePermission.create({
            data: {
              roleId,
              permissionId,
            },
            include: {
              permission: true,
            },
          })
        )
      );

      return rolePermissions;
    });
  }

  async getRolePermissions(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role.rolePermissions.map(rp => rp.permission);
  }
}