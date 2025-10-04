// src/modules/suppliers/suppliers.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    // 检查供应商编号是否已存在
    const existingSupplier = await this.prisma.supplier.findUnique({
      where: { id: createSupplierDto.id },
    });

    if (existingSupplier) {
      throw new ConflictException('供应商编号已存在');
    }

    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll(query: SupplierQueryDto) {
    const { name, category, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive' as any,
      };
    }

    if (category) {
      where.category = category;
    }

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        include: {
          purchaseOrders: {
            select: {
              id: true,
              orderDate: true,
              totalAmount: true,
              orderStatus: true,
            },
            orderBy: {
              orderDate: 'desc',
            },
            take: 5,
          },
          supplierProducts: {
            include: {
              product: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
            take: 10,
          },
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          include: {
            employee: {
              select: {
                name: true,
                phone: true,
              },
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    brand: true,
                  },
                },
              },
            },
          },
          orderBy: {
            orderDate: 'desc',
          },
        },
        supplierProducts: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
                brand: true,
                costPrice: true,
                sellPrice: true,
              },
            },
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`供应商 ${id} 不存在`);
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(`供应商 ${id} 不存在`);
    }

    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: true,
        supplierProducts: true,
      },
    });

    if (!supplier) {
      throw new NotFoundException(`供应商 ${id} 不存在`);
    }

    if (supplier.purchaseOrders.length > 0) {
      throw new ConflictException('该供应商有关联的采购订单，无法删除');
    }

    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  async getSupplierStats(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          select: {
            totalAmount: true,
            orderDate: true,
            orderStatus: true,
          },
        },
        supplierProducts: {
          select: {
            product: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`供应商 ${id} 不存在`);
    }

    const totalOrders = supplier.purchaseOrders.length;
    const totalAmount = supplier.purchaseOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const completedOrders = supplier.purchaseOrders.filter(order => order.orderStatus === 'completed').length;
    const productCount = supplier.supplierProducts.length;

    return {
      supplierId: id,
      supplierName: supplier.name,
      totalOrders,
      totalAmount,
      completedOrders,
      productCount,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
    };
  }

  async searchSuppliers(keyword: string) {
    if (!keyword || keyword.length < 2) {
      throw new Error('搜索关键词至少需要2个字符');
    }

    return this.prisma.supplier.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keyword,
              mode: 'insensitive' as any,
            },
          },
          {
            contact: {
              contains: keyword,
              mode: 'insensitive' as any,
            },
          },
          {
            phone: {
              contains: keyword,
            },
          },
        ],
      },
      take: 20,
    });
  }

  async getSuppliersByCategory(category: string) {
    return this.prisma.supplier.findMany({
      where: { category },
      include: {
        supplierProducts: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}