// src/modules/warehouse/warehouse.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { CreateInboundOrderDto } from './dto/create-inbound-order.dto';
import { CreateOutboundOrderDto } from './dto/create-outbound-order.dto';
import { UpdateOperateStatusDto } from './dto/update-operate-status.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';

export interface InventoryStats {
  totalProducts: number;
  totalWarehouses: number;
  lowStockCount: number;
  outOfStockCount: number;
  inventoryValue: number;
}

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  // ========== 入库管理 ==========
  async createInboundOrder(createInboundOrderDto: CreateInboundOrderDto, employeeId: string) {
    // 检查员工是否存在且是仓管人员
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.type !== 'warehouse') {
      throw new BadRequestException('无效的仓管人员');
    }

    // 如果关联采购订单，检查采购订单是否存在
    if (createInboundOrderDto.purchaseOrderId) {
      const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
        where: { id: createInboundOrderDto.purchaseOrderId },
      });

      if (!purchaseOrder) {
        throw new NotFoundException('采购订单不存在');
      }
    }

    // 检查商品和仓库
    for (const item of createInboundOrderDto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`商品 ${item.productId} 不存在`);
      }

      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: item.warehouseId },
      });

      if (!warehouse) {
        throw new NotFoundException(`仓库 ${item.warehouseId} 不存在`);
      }
    }

    // 生成入库单编号
    const orderId = await this.generateInboundOrderId();

    return this.prisma.$transaction(async (tx) => {
      // 创建入库单
      const inboundOrder = await tx.inboundOrder.create({
        data: {
          id: orderId,
          purchaseOrderId: createInboundOrderDto.purchaseOrderId,
          employeeId,
          inboundDate: new Date(createInboundOrderDto.inboundDate),
          operateStatus: createInboundOrderDto.operateStatus || 'processing',
          note: createInboundOrderDto.note,
        },
      });

      // 创建入库单明细
      const orderItems = await Promise.all(
        createInboundOrderDto.items.map((item, index) =>
          tx.inboundOrderItem.create({
            data: {
              inboundOrderId: orderId,
              itemNo: index + 1,
              productId: item.productId,
              warehouseId: item.warehouseId,
              quantity: item.quantity,
              batchNo: item.batchNo,
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
              warehouse: {
                select: {
                  name: true,
                },
              },
            },
          })
        )
      );

      // 如果入库完成，更新库存
      if (createInboundOrderDto.operateStatus === 'completed') {
        await this.updateInventoryAfterInbound(tx, createInboundOrderDto.items);
      }

      return {
        ...inboundOrder,
        items: orderItems,
      };
    });
  }

  async updateInboundStatus(id: string, updateOperateStatusDto: UpdateOperateStatusDto) {
    const inboundOrder = await this.prisma.inboundOrder.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!inboundOrder) {
      throw new NotFoundException(`入库单 ${id} 不存在`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 更新入库单状态
      const updatedOrder = await tx.inboundOrder.update({
        where: { id },
        data: {
          operateStatus: updateOperateStatusDto.operateStatus,
        },
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
      });

      // 如果状态变为完成，更新库存
      if (updateOperateStatusDto.operateStatus === 'completed' && inboundOrder.operateStatus !== 'completed') {
        const items = inboundOrder.orderItems.map(item => ({
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
        }));

        await this.updateInventoryAfterInbound(tx, items);
      }

      return updatedOrder;
    });
  }

  // ========== 出库管理 ==========
  async createOutboundOrder(createOutboundOrderDto: CreateOutboundOrderDto, employeeId: string) {
    // 检查员工是否存在且是仓管人员
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.type !== 'warehouse') {
      throw new BadRequestException('无效的仓管人员');
    }

    // 检查客户是否存在
    const customer = await this.prisma.customer.findUnique({
      where: { id: createOutboundOrderDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 如果关联销售订单，检查销售订单是否存在
    if (createOutboundOrderDto.salesOrderId) {
      const salesOrder = await this.prisma.salesOrder.findUnique({
        where: { id: createOutboundOrderDto.salesOrderId },
      });

      if (!salesOrder) {
        throw new NotFoundException('销售订单不存在');
      }
    }

    // 检查商品、仓库和库存
    for (const item of createOutboundOrderDto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`商品 ${item.productId} 不存在`);
      }

      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: item.warehouseId },
      });

      if (!warehouse) {
        throw new NotFoundException(`仓库 ${item.warehouseId} 不存在`);
      }

      // 检查库存是否充足
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          productId: item.productId,
          warehouseId: item.warehouseId,
          currentQty: {
            gte: item.quantity,
          },
        },
      });

      if (!inventory) {
        throw new ConflictException(`商品 ${product.name} 在仓库 ${warehouse.name} 中库存不足`);
      }
    }

    // 生成出库单编号
    const orderId = await this.generateOutboundOrderId();

    return this.prisma.$transaction(async (tx) => {
      // 创建出库单
      const outboundOrder = await tx.outboundOrder.create({
        data: {
          id: orderId,
          salesOrderId: createOutboundOrderDto.salesOrderId,
          employeeId,
          customerId: createOutboundOrderDto.customerId,
          outboundDate: new Date(createOutboundOrderDto.outboundDate),
          trackingNo: createOutboundOrderDto.trackingNo,
          operateStatus: createOutboundOrderDto.operateStatus || 'processing',
          note: createOutboundOrderDto.note,
        },
      });

      // 创建出库单明细
      const orderItems = await Promise.all(
        createOutboundOrderDto.items.map((item, index) =>
          tx.outboundOrderItem.create({
            data: {
              outboundOrderId: orderId,
              itemNo: index + 1,
              productId: item.productId,
              warehouseId: item.warehouseId,
              quantity: item.quantity,
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
              warehouse: {
                select: {
                  name: true,
                },
              },
            },
          })
        )
      );

      // 如果出库完成，更新库存
      if (createOutboundOrderDto.operateStatus === 'completed') {
        await this.updateInventoryAfterOutbound(tx, createOutboundOrderDto.items);
      }

      return {
        ...outboundOrder,
        items: orderItems,
      };
    });
  }

  async updateOutboundStatus(id: string, updateOperateStatusDto: UpdateOperateStatusDto) {
    const outboundOrder = await this.prisma.outboundOrder.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!outboundOrder) {
      throw new NotFoundException(`出库单 ${id} 不存在`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 更新出库单状态
      const updatedOrder = await tx.outboundOrder.update({
        where: { id },
        data: {
          operateStatus: updateOperateStatusDto.operateStatus,
        },
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
      });

      // 如果状态变为完成，更新库存
      if (updateOperateStatusDto.operateStatus === 'completed' && outboundOrder.operateStatus !== 'completed') {
        const items = outboundOrder.orderItems.map(item => ({
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
        }));

        await this.updateInventoryAfterOutbound(tx, items);
      }

      return updatedOrder;
    });
  }

  // ========== 库存管理 ==========
  async getInventory(query: InventoryQueryDto) {
    const { productId, warehouseId, productName, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (productName) {
      where.product = {
        name: {
          contains: productName,
          mode: 'insensitive' as any,
        },
      };
    }

    const [inventory, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              category: true,
              size: true,
              color: true,
              unit: true,
              costPrice: true,
              sellPrice: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          productId: 'asc',
        },
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return {
      data: inventory,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLowStockAlerts() {
    const lowStockItems = await this.prisma.inventory.findMany({
      where: {
        currentQty: {
          lte: this.prisma.inventory.fields.minQty,
        },
      },
      include: {
        product: {
          select: {
            name: true,
            brand: true,
            category: true,
          },
        },
        warehouse: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        currentQty: 'asc',
      },
    });

    return lowStockItems.map(item => ({
      ...item,
      stockStatus: item.currentQty === 0 ? '缺货' : '库存不足',
    }));
  }

  async updateInventory(productId: string, warehouseId: string, quantity: number, note?: string) {
    // 检查库存记录是否存在
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException('库存记录不存在');
    }

    return this.prisma.inventory.update({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      data: {
        currentQty: quantity,
      },
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
    });
  }

  async getInventoryStats(): Promise<InventoryStats> {
    const [totalProducts, totalWarehouses, lowStockCount, outOfStockCount, inventoryValue] = await Promise.all([
      // 总商品种类数
      this.prisma.inventory.groupBy({
        by: ['productId'],
        _count: {
          productId: true,
        },
      }).then(result => result.length),

      // 总仓库数
      this.prisma.warehouse.count(),

      // 库存不足商品数
      this.prisma.inventory.count({
        where: {
          currentQty: {
            lte: this.prisma.inventory.fields.minQty,
            gt: 0,
          },
        },
      }),

      // 缺货商品数
      this.prisma.inventory.count({
        where: {
          currentQty: 0,
        },
      }),

      // 库存总价值（估算）
      this.prisma.inventory.findMany({
        include: {
          product: {
            select: {
              costPrice: true,
            },
          },
        },
      }).then(items => 
        items.reduce((sum, item) => 
          sum + (item.currentQty * (item.product.costPrice || 0)), 0
        )
      ),
    ]);

    return {
      totalProducts,
      totalWarehouses,
      lowStockCount,
      outOfStockCount,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
    };
  }

  // ========== 私有方法 ==========
  private async updateInventoryAfterInbound(tx: any, items: any[]) {
    for (const item of items) {
      await tx.inventory.upsert({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: item.warehouseId,
          },
        },
        update: {
          currentQty: {
            increment: item.quantity,
          },
        },
        create: {
          productId: item.productId,
          warehouseId: item.warehouseId,
          currentQty: item.quantity,
          minQty: 10, // 默认最低库存
        },
      });
    }
  }

  private async updateInventoryAfterOutbound(tx: any, items: any[]) {
    for (const item of items) {
      await tx.inventory.update({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: item.warehouseId,
          },
        },
        data: {
          currentQty: {
            decrement: item.quantity,
          },
        },
      });
    }
  }

  private async generateInboundOrderId(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `IN${year}${month}`;

    const lastOrder = await this.prisma.inboundOrder.findFirst({
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

  private async generateOutboundOrderId(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `OUT${year}${month}`;

    const lastOrder = await this.prisma.outboundOrder.findFirst({
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