// src/modules/departments/departments.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    // 检查部门编号是否已存在
    const existingDepartment = await this.prisma.department.findUnique({
      where: { id: createDepartmentDto.id },
    });

    if (existingDepartment) {
      throw new ConflictException('部门编号已存在');
    }

    // 如果提供了经理ID，检查员工是否存在
    if (createDepartmentDto.managerId) {
      const manager = await this.prisma.employee.findUnique({
        where: { id: createDepartmentDto.managerId },
      });

      if (!manager) {
        throw new NotFoundException('指定的经理不存在');
      }
    }

    return this.prisma.department.create({
      data: createDepartmentDto,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            type: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            type: true,
            phone: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            type: true,
            phone: true,
            email: true,
            entryDate: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`部门 ${id} 不存在`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    // 检查部门是否存在
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`部门 ${id} 不存在`);
    }

    // 如果提供了经理ID，检查员工是否存在
    if (updateDepartmentDto.managerId) {
      const manager = await this.prisma.employee.findUnique({
        where: { id: updateDepartmentDto.managerId },
      });

      if (!manager) {
        throw new NotFoundException('指定的经理不存在');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            type: true,
            phone: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // 检查部门是否存在
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    if (!department) {
      throw new NotFoundException(`部门 ${id} 不存在`);
    }

    // 检查部门下是否有员工
    if (department.employees.length > 0) {
      throw new ConflictException('该部门下还有员工，无法删除');
    }

    return this.prisma.department.delete({
      where: { id },
    });
  }

  async getDepartmentStats() {
    const departments = await this.prisma.department.findMany({
      include: {
        employees: true,
      },
    });

    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      employeeCount: dept.employees.length,
    }));
  }
}