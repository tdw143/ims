// src/modules/customers/customers.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    // 检查客户编号是否已存在
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id: createCustomerDto.id },
    });

    if (existingCustomer) {
      throw new ConflictException('客户编号已存在');
    }

    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  async findAll(query: CustomerQueryDto) {
    const { name, phone, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive' as any,
      };
    }

    if (phone) {
      where.phone = {
        contains: phone,
      };
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          salesOrders: {
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
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        salesOrders: {
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
        outboundOrders: {
          include: {
            employee: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            outboundDate: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`客户 ${id} 不存在`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`客户 ${id} 不存在`);
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        salesOrders: true,
        outboundOrders: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`客户 ${id} 不存在`);
    }

    if (customer.salesOrders.length > 0 || customer.outboundOrders.length > 0) {
      throw new ConflictException('该客户有关联的销售订单或出库记录，无法删除');
    }

    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async getCustomerStats(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        salesOrders: {
          select: {
            totalAmount: true,
            orderDate: true,
            orderStatus: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`客户 ${id} 不存在`);
    }

    const totalOrders = customer.salesOrders.length;
    const totalAmount = customer.salesOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const completedOrders = customer.salesOrders.filter(order => order.orderStatus === 'completed').length;

    return {
      customerId: id,
      customerName: customer.name,
      totalOrders,
      totalAmount,
      completedOrders,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
    };
  }

  async searchCustomers(keyword: string) {
    if (!keyword || keyword.length < 2) {
      throw new Error('搜索关键词至少需要2个字符');
    }

    return this.prisma.customer.findMany({
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
      take: 20,
    });
  }
}