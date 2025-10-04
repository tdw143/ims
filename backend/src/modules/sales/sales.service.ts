// src/modules/sales/sales.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesQueryDto } from './dto/sales-query.dto';
import { UpdateSalesStatusDto } from './dto/update-sales-status.dto';
import { SalesTrendData } from '../reports/reports.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSalesOrderDto: CreateSalesOrderDto, employeeId: string) {
    // 检查客户是否存在
    const customer = await this.prisma.customer.findUnique({
      where: { id: createSalesOrderDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 检查员工是否存在且是销售人员
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.type !== 'sales') {
      throw new BadRequestException('无效的销售人员');
    }

    // 检查商品库存和存在性
    for (const item of createSalesOrderDto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`商品 ${item.productId} 不存在`);
      }

      // 检查库存
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          productId: item.productId,
          currentQty: {
            gte: item.quantity,
          },
        },
      });

      if (!inventory) {
        throw new ConflictException(`商品 ${product.name} 库存不足`);
      }
    }

    // 生成销售订单编号
    const orderId = await this.generateOrderId();

    // 计算总金额
    const totalAmount = createSalesOrderDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice, 
      0
    );

    return this.prisma.$transaction(async (tx) => {
      // 创建销售订单
      const salesOrder = await tx.salesOrder.create({
        data: {
          id: orderId,
          employeeId,
          customerId: createSalesOrderDto.customerId,
          orderDate: new Date(createSalesOrderDto.orderDate),
          expectDate: createSalesOrderDto.expectDate ? new Date(createSalesOrderDto.expectDate) : undefined,
          orderStatus: createSalesOrderDto.status || 'pending',
          totalAmount,
          note: createSalesOrderDto.note,
        },
      });

      // 创建销售订单明细
      const orderItems = await Promise.all(
        createSalesOrderDto.items.map((item, index) =>
          tx.salesOrderItem.create({
            data: {
              salesOrderId: orderId,
              itemNo: index + 1,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              note: item.note,
            },
            include: {
              product: {
                select: {
                  name: true,
                  brand: true,
                  size: true,
                  color: true,
                },
              },
            },
          })
        )
      );

      return {
        ...salesOrder,
        items: orderItems,
      };
    });
  }

  async findAll(query: SalesQueryDto) {
    const { customerId, status, startDate, endDate, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.orderStatus = status;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.orderDate.lte = new Date(endDate);
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  brand: true,
                  size: true,
                  color: true,
                },
              },
            },
          },
          outboundOrders: {
            select: {
              id: true,
              outboundDate: true,
              trackingNo: true,
              operateStatus: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          orderDate: 'desc',
        },
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                size: true,
                color: true,
                material: true,
                unit: true,
              },
            },
          },
          orderBy: {
            itemNo: 'asc',
          },
        },
        outboundOrders: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
                warehouse: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`销售订单 ${id} 不存在`);
    }

    return order;
  }

  async update(id: string, updateSalesOrderDto: UpdateSalesOrderDto) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`销售订单 ${id} 不存在`);
    }

    if (order.orderStatus !== 'pending') {
      throw new ConflictException('只有待处理的订单可以修改');
    }

    // 验证客户
    if (updateSalesOrderDto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: updateSalesOrderDto.customerId },
      });

      if (!customer) {
        throw new NotFoundException('客户不存在');
      }
    }

    // 验证商品和库存
    if (updateSalesOrderDto.items) {
      for (const item of updateSalesOrderDto.items) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`商品 ${item.productId} 不存在`);
        }

        // 检查库存
        const inventory = await this.prisma.inventory.findFirst({
          where: {
            productId: item.productId,
            currentQty: {
              gte: item.quantity,
            },
          },
        });

        if (!inventory) {
          throw new ConflictException(`商品 ${product.name} 库存不足`);
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 如果更新了商品明细，先删除旧的再创建新的
      if (updateSalesOrderDto.items) {
        await tx.salesOrderItem.deleteMany({
          where: { salesOrderId: id },
        });

        const orderItems = await Promise.all(
          updateSalesOrderDto.items.map((item, index) =>
            tx.salesOrderItem.create({
              data: {
                salesOrderId: id,
                itemNo: index + 1,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                note: item.note,
              },
            })
          )
        );

        // 重新计算总金额
        const totalAmount = updateSalesOrderDto.items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice, 
          0
        );

        // 更新订单
        const updatedOrder = await tx.salesOrder.update({
          where: { id },
          data: {
            ...updateSalesOrderDto,
            orderDate: updateSalesOrderDto.orderDate ? new Date(updateSalesOrderDto.orderDate) : undefined,
            expectDate: updateSalesOrderDto.expectDate ? new Date(updateSalesOrderDto.expectDate) : undefined,
            totalAmount,
          },
          include: {
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
        });

        return updatedOrder;
      }

      // 只更新订单基本信息
      return tx.salesOrder.update({
        where: { id },
        data: {
          ...updateSalesOrderDto,
          orderDate: updateSalesOrderDto.orderDate ? new Date(updateSalesOrderDto.orderDate) : undefined,
          expectDate: updateSalesOrderDto.expectDate ? new Date(updateSalesOrderDto.expectDate) : undefined,
        },
        include: {
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
      });
    });
  }

  async updateStatus(id: string, updateSalesStatusDto: UpdateSalesStatusDto) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`销售订单 ${id} 不存在`);
    }

    // 状态流转验证
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['completed'],
      completed: [],
      cancelled: [],
    };

    const currentStatus = order.orderStatus;
    const newStatus = updateSalesStatusDto.status;

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new ConflictException(`无法从 ${currentStatus} 状态转换为 ${newStatus} 状态`);
    }

    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        orderStatus: newStatus,
      },
      include: {
        employee: {
          select: {
            name: true,
            phone: true,
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        outboundOrders: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`销售订单 ${id} 不存在`);
    }

    if (order.orderStatus !== 'pending') {
      throw new ConflictException('只有待处理的订单可以删除');
    }

    if (order.outboundOrders.length > 0) {
      throw new ConflictException('该订单已有出库记录，无法删除');
    }

    return this.prisma.$transaction(async (tx) => {
      // 删除订单明细
      await tx.salesOrderItem.deleteMany({
        where: { salesOrderId: id },
      });

      // 删除订单
      return tx.salesOrder.delete({
        where: { id },
      });
    });
  }

  async getSalesStats() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const [totalOrders, monthlyOrders, yearlyOrders, statusStats, topCustomers, salesTrend] = await Promise.all([
      // 总订单数
      this.prisma.salesOrder.count(),

      // 本月订单数
      this.prisma.salesOrder.count({
        where: {
          orderDate: {
            gte: firstDayOfMonth,
          },
        },
      }),

      // 本年订单数
      this.prisma.salesOrder.count({
        where: {
          orderDate: {
            gte: firstDayOfYear,
          },
        },
      }),

      // 订单状态统计
      this.prisma.salesOrder.groupBy({
        by: ['orderStatus'],
        _count: {
          id: true,
        },
      }),

      // 前5大客户
      this.prisma.salesOrder.groupBy({
        by: ['customerId'],
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
        orderBy: {
          _sum: {
            totalAmount: 'desc',
          },
        },
        take: 5,
      }),

      // 月度销售趋势（最近6个月）
      this.getMonthlySalesTrend(6),
    ]);

    // 获取客户详情
    const customersWithDetails = await Promise.all(
      topCustomers.map(async (customer) => {
        const customerInfo = await this.prisma.customer.findUnique({
          where: { id: customer.customerId },
          select: { name: true, phone: true },
        });

        return {
          customerId: customer.customerId,
          customerName: customerInfo?.name,
          phone: customerInfo?.phone,
          orderCount: customer._count.id,
          totalAmount: customer._sum.totalAmount,
        };
      })
    );

    // 计算销售总额
    const totalSales = await this.prisma.salesOrder.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    return {
      summary: {
        totalOrders,
        monthlyOrders,
        yearlyOrders,
        totalSales: totalSales._sum.totalAmount || 0,
      },
      statusStats: statusStats.map(stat => ({
        status: stat.orderStatus,
        count: stat._count.id,
      })),
      topCustomers: customersWithDetails,
      salesTrend,
    };
  }

  async getMonthlySalesTrend(months: number = 6): Promise<SalesTrendData[]> {
    const result: SalesTrendData[] = [];
    const today = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const monthlySales = await this.prisma.salesOrder.aggregate({
        where: {
          orderDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      });

      result.push({
        month: monthKey,
        salesAmount: monthlySales._sum.totalAmount || 0,
        orderCount: monthlySales._count.id,
      });
    }

    return result;
  }

  async getTopSellingProducts(limit: number = 10) {
    const productSales = await this.prisma.salesOrderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        unitPrice: true,
      },
      _count: {
        salesOrderId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // 获取商品详情
    const productsWithDetails = await Promise.all(
      productSales.map(async (product) => {
        const productInfo = await this.prisma.product.findUnique({
          where: { id: product.productId },
          select: { 
            name: true, 
            brand: true, 
            category: true,
            sellPrice: true 
          },
        });

        const totalRevenue = (product._sum.quantity || 0) * (product._sum.unitPrice || 0);

        return {
          productId: product.productId,
          productName: productInfo?.name,
          brand: productInfo?.brand,
          category: productInfo?.category,
          totalQuantity: product._sum.quantity || 0,
          totalRevenue,
          orderCount: product._count.salesOrderId,
          avgPrice: productInfo?.sellPrice,
        };
      })
    );

    return productsWithDetails;
  }

  private async generateOrderId(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SO${year}${month}`;

    const lastOrder = await this.prisma.salesOrder.findFirst({
      where: {
        id: {
          startsWith: prefix,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.id.slice(-3), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(3, '0')}`;
  }
}