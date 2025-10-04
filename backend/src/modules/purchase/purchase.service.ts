// src/modules/purchase/purchase.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto, employeeId: string) {
    // 检查供应商是否存在
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: createPurchaseOrderDto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    // 检查员工是否存在且是采购人员
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.type !== 'purchase') {
      throw new BadRequestException('无效的采购人员');
    }

    // 检查商品是否存在
    for (const item of createPurchaseOrderDto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`商品 ${item.productId} 不存在`);
      }
    }

    // 生成采购订单编号
    const orderId = await this.generateOrderId();

    // 计算总金额
    const totalAmount = createPurchaseOrderDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice, 
      0
    );

    return this.prisma.$transaction(async (tx) => {
      // 创建采购订单
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          id: orderId,
          employeeId,
          supplierId: createPurchaseOrderDto.supplierId,
          orderDate: new Date(createPurchaseOrderDto.orderDate),
          expectDate: createPurchaseOrderDto.expectDate ? new Date(createPurchaseOrderDto.expectDate) : undefined,
          orderStatus: createPurchaseOrderDto.status || 'pending',
          totalAmount,
          note: createPurchaseOrderDto.note,
        },
      });

      // 创建采购订单明细
      const orderItems = await Promise.all(
        createPurchaseOrderDto.items.map((item, index) =>
          tx.purchaseOrderItem.create({
            data: {
              purchaseOrderId: orderId,
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

      // 更新供应商-商品关系中的最近采购价
      for (const item of createPurchaseOrderDto.items) {
        await tx.supplierProduct.upsert({
          where: {
            supplierId_productId: {
              supplierId: createPurchaseOrderDto.supplierId,
              productId: item.productId,
            },
          },
          update: {
            lastPrice: item.unitPrice,
            supplyStatus: 'active',
          },
          create: {
            supplierId: createPurchaseOrderDto.supplierId,
            productId: item.productId,
            lastPrice: item.unitPrice,
            supplyStatus: 'active',
          },
        });
      }

      return {
        ...purchaseOrder,
        items: orderItems,
      };
    });
  }

  async findAll(query: PurchaseQueryDto) {
    const { supplierId, status, startDate, endDate, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (supplierId) {
      where.supplierId = supplierId;
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
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              contact: true,
              phone: true,
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
        },
        skip,
        take: limit,
        orderBy: {
          orderDate: 'desc',
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
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
    const order = await this.prisma.purchaseOrder.findUnique({
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
        supplier: {
          select: {
            id: true,
            name: true,
            contact: true,
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
        inboundOrders: {
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
      throw new NotFoundException(`采购订单 ${id} 不存在`);
    }

    return order;
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`采购订单 ${id} 不存在`);
    }

    if (order.orderStatus !== 'pending') {
      throw new ConflictException('只有待处理的订单可以修改');
    }

    // 验证供应商
    if (updatePurchaseOrderDto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: updatePurchaseOrderDto.supplierId },
      });

      if (!supplier) {
        throw new NotFoundException('供应商不存在');
      }
    }

    // 验证商品
    if (updatePurchaseOrderDto.items) {
      for (const item of updatePurchaseOrderDto.items) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`商品 ${item.productId} 不存在`);
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 如果更新了商品明细，先删除旧的再创建新的
      if (updatePurchaseOrderDto.items) {
        await tx.purchaseOrderItem.deleteMany({
          where: { purchaseOrderId: id },
        });

        const orderItems = await Promise.all(
          updatePurchaseOrderDto.items.map((item, index) =>
            tx.purchaseOrderItem.create({
              data: {
                purchaseOrderId: id,
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
        const totalAmount = updatePurchaseOrderDto.items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice, 
          0
        );

        // 更新订单
        const updatedOrder = await tx.purchaseOrder.update({
          where: { id },
          data: {
            ...updatePurchaseOrderDto,
            orderDate: updatePurchaseOrderDto.orderDate ? new Date(updatePurchaseOrderDto.orderDate) : undefined,
            expectDate: updatePurchaseOrderDto.expectDate ? new Date(updatePurchaseOrderDto.expectDate) : undefined,
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
      return tx.purchaseOrder.update({
        where: { id },
        data: {
          ...updatePurchaseOrderDto,
          orderDate: updatePurchaseOrderDto.orderDate ? new Date(updatePurchaseOrderDto.orderDate) : undefined,
          expectDate: updatePurchaseOrderDto.expectDate ? new Date(updatePurchaseOrderDto.expectDate) : undefined,
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

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`采购订单 ${id} 不存在`);
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        orderStatus: updateOrderStatusDto.status,
      },
      include: {
        employee: {
          select: {
            name: true,
            phone: true,
          },
        },
        supplier: {
          select: {
            name: true,
            contact: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        inboundOrders: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`采购订单 ${id} 不存在`);
    }

    if (order.orderStatus !== 'pending') {
      throw new ConflictException('只有待处理的订单可以删除');
    }

    if (order.inboundOrders.length > 0) {
      throw new ConflictException('该订单已有入库记录，无法删除');
    }

    return this.prisma.$transaction(async (tx) => {
      // 删除订单明细
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });

      // 删除订单
      return tx.purchaseOrder.delete({
        where: { id },
      });
    });
  }

  async getPurchaseStats() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const [totalOrders, monthlyOrders, yearlyOrders, statusStats, topSuppliers] = await Promise.all([
      // 总订单数
      this.prisma.purchaseOrder.count(),

      // 本月订单数
      this.prisma.purchaseOrder.count({
        where: {
          orderDate: {
            gte: firstDayOfMonth,
          },
        },
      }),

      // 本年订单数
      this.prisma.purchaseOrder.count({
        where: {
          orderDate: {
            gte: firstDayOfYear,
          },
        },
      }),

      // 订单状态统计
      this.prisma.purchaseOrder.groupBy({
        by: ['orderStatus'],
        _count: {
          id: true,
        },
      }),

      // 前5大供应商
      this.prisma.purchaseOrder.groupBy({
        by: ['supplierId'],
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    // 获取供应商详情
    const suppliersWithDetails = await Promise.all(
      topSuppliers.map(async (supplier) => {
        const supplierInfo = await this.prisma.supplier.findUnique({
          where: { id: supplier.supplierId },
          select: { name: true },
        });

        return {
          supplierId: supplier.supplierId,
          supplierName: supplierInfo?.name,
          orderCount: supplier._count.id,
          totalAmount: supplier._sum.totalAmount,
        };
      })
    );

    return {
      summary: {
        totalOrders,
        monthlyOrders,
        yearlyOrders,
      },
      statusStats: statusStats.map(stat => ({
        status: stat.orderStatus,
        count: stat._count.id,
      })),
      topSuppliers: suppliersWithDetails,
    };
  }

  private async generateOrderId(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PO${year}${month}`;

    const lastOrder = await this.prisma.purchaseOrder.findFirst({
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