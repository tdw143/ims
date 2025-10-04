// src/modules/employees/employees.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    // 检查员工编号是否已存在
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { id: createEmployeeDto.id },
    });

    if (existingEmployee) {
      throw new ConflictException('员工编号已存在');
    }

    // 检查部门是否存在
    const department = await this.prisma.department.findUnique({
      where: { id: createEmployeeDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException('指定的部门不存在');
    }

    // 转换日期字符串为Date对象
    const data = {
      ...createEmployeeDto,
      birthDate: createEmployeeDto.birthDate ? new Date(createEmployeeDto.birthDate) : undefined,
      entryDate: new Date(createEmployeeDto.entryDate),
    };

    return this.prisma.employee.create({
      data,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            contact: true,
          },
        },
      },
    });
  }

  async findAll(query: EmployeeQueryDto) {
    const { name, type, departmentId, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive' as any,
      };
    }

    if (type) {
      where.type = type;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              name: true,
              contact: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          entryDate: 'desc',
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            contact: true,
            phone: true,
            email: true,
          },
        },
        managedDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`员工 ${id} 不存在`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    // 检查员工是否存在
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`员工 ${id} 不存在`);
    }

    // 如果提供了部门ID，检查部门是否存在
    if (updateEmployeeDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updateEmployeeDto.departmentId },
      });

      if (!department) {
        throw new NotFoundException('指定的部门不存在');
      }
    }

    // 转换日期字符串为Date对象
    const data: any = { ...updateEmployeeDto };
    if (updateEmployeeDto.birthDate) {
      data.birthDate = new Date(updateEmployeeDto.birthDate);
    }
    if (updateEmployeeDto.entryDate) {
      data.entryDate = new Date(updateEmployeeDto.entryDate);
    }

    return this.prisma.employee.update({
      where: { id },
      data,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            contact: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // 检查员工是否存在
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        managedDepartment: true,
        user: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`员工 ${id} 不存在`);
    }

    // 检查员工是否是部门经理
    if (employee.managedDepartment) {
      throw new ConflictException('该员工是部门经理，无法删除');
    }

    // 检查员工是否有关联的用户账号
    if (employee.user) {
      throw new ConflictException('该员工有关联的用户账号，请先删除用户账号');
    }

    return this.prisma.employee.delete({
      where: { id },
    });
  }

  async getEmployeesByDepartment(departmentId: string) {
    // 检查部门是否存在
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('部门不存在');
    }

    return this.prisma.employee.findMany({
      where: { departmentId },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        entryDate: 'desc',
      },
    });
  }

  async getEmployeeStats() {
    const stats = await this.prisma.employee.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    const total = await this.prisma.employee.count();

    return {
      total,
      byType: stats.map(stat => ({
        type: stat.type,
        count: stat._count.id,
      })),
    };
  }

  async searchEmployees(keyword: string) {
    if (!keyword || keyword.length < 2) {
      throw new BadRequestException('搜索关键词至少需要2个字符');
    }

    return this.prisma.employee.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keyword,
              mode: 'insensitive' as any,
            },
          },
          {
            phone: {
              contains: keyword,
            },
          },
          {
            email: {
              contains: keyword,
              mode: 'insensitive' as any,
            },
          },
        ],
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 20,
    });
  }
}