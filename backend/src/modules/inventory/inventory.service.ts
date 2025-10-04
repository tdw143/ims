// src/modules/inventory/inventory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventoryByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`商品 ${productId} 不存在`);
    }

    const inventory = await this.prisma.inventory.findMany({
      where: { productId },
      include: {
        warehouse: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        warehouseId: 'asc',
      },
    });

    const totalStock = inventory.reduce((sum, item) => sum + item.currentQty, 0);

    return {
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
      },
      inventory,
      totalStock,
    };
  }

  async getInventoryByWarehouse(warehouseId: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException(`仓库 ${warehouseId} 不存在`);
    }

    const inventory = await this.prisma.inventory.findMany({
      where: { warehouseId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            brand: true,
            costPrice: true,
            sellPrice: true,
          },
        },
      },
      orderBy: {
        productId: 'asc',
      },
    });

    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.currentQty * (item.product.costPrice || 0)), 0
    );

    return {
      warehouse: {
        id: warehouse.id,
        name: warehouse.name,
        address: warehouse.address,
      },
      inventory,
      summary: {
        totalProducts: inventory.length,
        totalValue: Math.round(totalValue * 100) / 100,
        totalQuantity: inventory.reduce((sum, item) => sum + item.currentQty, 0),
      },
    };
  }

  async updateMinStock(productId: string, warehouseId: string, minQty: number) {
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
        minQty,
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

  async getInventorySummary() {
    const [totalProducts, totalWarehouses, lowStockCount, outOfStockCount, inventoryValue] = await Promise.all([
      this.prisma.inventory.groupBy({
        by: ['productId'],
        _count: {
          productId: true,
        },
      }).then(result => result.length),

      this.prisma.warehouse.count(),

      this.prisma.inventory.count({
        where: {
          currentQty: {
            lte: this.prisma.inventory.fields.minQty,
            gt: 0,
          },
        },
      }),

      this.prisma.inventory.count({
        where: {
          currentQty: 0,
        },
      }),

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
}