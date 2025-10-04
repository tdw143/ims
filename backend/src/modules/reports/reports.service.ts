// src/modules/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { PurchaseReportQueryDto } from './dto/purchase-report-query.dto';
import { InventoryReportQueryDto } from './dto/inventory-report-query.dto';

export interface MonthlySalesData {
  month: string;
  salesAmount: number;
  orderCount: number;
}

export interface MonthlyPurchaseData {
  month: string;
  purchaseAmount: number;
  orderCount: number;
}

export interface SalesTrendData {
  month: string;
  salesAmount: number;
  orderCount: number;
}

export interface PurchaseTrendData {
  month: string;
  purchaseAmount: number;
  orderCount: number;
}

export interface StockByCategory {
  category: string;
  totalValue: number;
  totalQuantity: number;
  productCount: number;
}

export interface TopValuableItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
}

export interface StockStatusReport {
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  inventory: any[];
  alerts: {
    lowStock: any[];
    outOfStock: any[];
  };
}

export interface StockMovementReport {
  inbound: any[];
  outbound: any[];
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface StockValueReport {
  summary: {
    totalValue: number;
    totalProducts: number;
    totalQuantity: number;
  };
  byCategory: any[];
  topValuableItems: any[];
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ========== 销售报表 ==========
  async getSalesReport(query: SalesReportQueryDto) {
    const { period, startDate, endDate, employeeId, customerId } = query;
    
    // 设置日期范围
    const dateRange = this.getDateRange(period, startDate, endDate);
    
    const where: any = {
      orderDate: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [
      totalSales,
      totalOrders,
      averageOrderValue,
      salesByStatus,
      topProducts,
      salesByEmployee,
      salesByCustomer,
      monthlyTrend
    ] = await Promise.all([
      // 总销售额
      this.prisma.salesOrder.aggregate({
        where,
        _sum: {
          totalAmount: true,
        },
      }),

      // 总订单数
      this.prisma.salesOrder.count({ where }),

      // 平均订单金额
      this.prisma.salesOrder.aggregate({
        where,
        _avg: {
          totalAmount: true,
        },
      }),

      // 按状态统计
      this.prisma.salesOrder.groupBy({
        by: ['orderStatus'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // 热销商品TOP 10
      this.getTopSellingProducts(where),

      // 销售员业绩排行
      this.getSalesByEmployee(where),

      // 客户消费排行
      this.getSalesByCustomer(where),

      // 月度销售趋势
      this.getMonthlySalesTrend(dateRange.startDate, dateRange.endDate),
    ]);

    return {
      summary: {
        totalSales: totalSales._sum.totalAmount || 0,
        totalOrders,
        averageOrderValue: Math.round((averageOrderValue._avg.totalAmount || 0) * 100) / 100,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      },
      salesByStatus: salesByStatus.map(item => ({
        status: item.orderStatus,
        orderCount: item._count.id,
        totalAmount: item._sum.totalAmount || 0,
      })),
      topProducts,
      salesByEmployee,
      salesByCustomer,
      monthlyTrend,
    };
  }

  // ========== 采购报表 ==========
  async getPurchaseReport(query: PurchaseReportQueryDto) {
    const { period, startDate, endDate, supplierId, employeeId } = query;
    
    // 设置日期范围
    const dateRange = this.getDateRange(period, startDate, endDate);
    
    const where: any = {
      orderDate: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    };

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const [
      totalPurchase,
      totalOrders,
      averageOrderValue,
      purchasesByStatus,
      topSuppliers,
      purchasesByEmployee,
      monthlyTrend
    ] = await Promise.all([
      // 总采购额
      this.prisma.purchaseOrder.aggregate({
        where,
        _sum: {
          totalAmount: true,
        },
      }),

      // 总订单数
      this.prisma.purchaseOrder.count({ where }),

      // 平均订单金额
      this.prisma.purchaseOrder.aggregate({
        where,
        _avg: {
          totalAmount: true,
        },
      }),

      // 按状态统计
      this.prisma.purchaseOrder.groupBy({
        by: ['orderStatus'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // 供应商采购排行
      this.getTopSuppliers(where),

      // 采购员采购排行
      this.getPurchasesByEmployee(where),

      // 月度采购趋势
      this.getMonthlyPurchaseTrend(dateRange.startDate, dateRange.endDate),
    ]);

    return {
      summary: {
        totalPurchase: totalPurchase._sum.totalAmount || 0,
        totalOrders,
        averageOrderValue: Math.round((averageOrderValue._avg.totalAmount || 0) * 100) / 100,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      },
      purchasesByStatus: purchasesByStatus.map(item => ({
        status: item.orderStatus,
        orderCount: item._count.id,
        totalAmount: item._sum.totalAmount || 0,
      })),
      topSuppliers,
      purchasesByEmployee,
      monthlyTrend,
    };
  }

  // ========== 库存报表 ==========
  async getInventoryReport(query: InventoryReportQueryDto): Promise<StockStatusReport | StockMovementReport | StockValueReport> {
    const { reportType, warehouseId, category } = query;

    switch (reportType) {
      case 'stock_status':
        return this.getStockStatusReport(warehouseId, category);
      case 'stock_movement':
        return this.getStockMovementReport(warehouseId, category);
      case 'stock_value':
        return this.getStockValueReport(warehouseId, category);
      default:
        return this.getStockStatusReport(warehouseId, category);
    }
  }

  // ========== 经营分析报表 ==========
  async getBusinessAnalysis() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      salesData,
      purchaseData,
      inventoryValue,
      customerCount,
      supplierCount,
      employeeCount,
      lowStockCount,
      pendingOrders
    ] = await Promise.all([
      // 销售数据
      this.prisma.salesOrder.aggregate({
        where: {
          orderDate: {
            gte: firstDayOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      }),

      // 采购数据
      this.prisma.purchaseOrder.aggregate({
        where: {
          orderDate: {
            gte: firstDayOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      }),

      // 库存价值
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

      // 客户数量
      this.prisma.customer.count(),

      // 供应商数量
      this.prisma.supplier.count(),

      // 员工数量
      this.prisma.employee.count(),

      // 低库存数量
      this.prisma.inventory.count({
        where: {
          currentQty: {
            lte: this.prisma.inventory.fields.minQty,
          },
        },
      }),

      // 待处理订单
      Promise.all([
        this.prisma.salesOrder.count({
          where: {
            orderStatus: 'pending',
          },
        }),
        this.prisma.purchaseOrder.count({
          where: {
            orderStatus: 'pending',
          },
        }),
      ]),
    ]);

    const grossProfit = (salesData._sum.totalAmount || 0) - (purchaseData._sum.totalAmount || 0);

    return {
      kpi: {
        monthlySales: salesData._sum.totalAmount || 0,
        monthlyPurchases: purchaseData._sum.totalAmount || 0,
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossProfitMargin: salesData._sum.totalAmount ? 
          Math.round((grossProfit / salesData._sum.totalAmount) * 100 * 100) / 100 : 0,
        inventoryValue: Math.round(inventoryValue * 100) / 100,
        customerCount,
        supplierCount,
        employeeCount,
      },
      alerts: {
        lowStockCount,
        pendingSalesOrders: pendingOrders[0],
        pendingPurchaseOrders: pendingOrders[1],
      },
      monthlyTrend: {
        sales: await this.getMonthlySalesTrend(firstDayOfYear, today),
        purchases: await this.getMonthlyPurchaseTrend(firstDayOfYear, today),
      },
    };
  }

  // ========== 私有方法 ==========
  private async getTopSellingProducts(where: any) {
    const productSales = await this.prisma.salesOrderItem.groupBy({
      by: ['productId'],
      where: {
        salesOrder: where,
      },
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
      take: 10,
    });

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
        };
      })
    );

    return productsWithDetails;
  }

  private async getSalesByEmployee(where: any) {
    const employeeSales = await this.prisma.salesOrder.groupBy({
      by: ['employeeId'],
      where,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 10,
    });

    const employeesWithDetails = await Promise.all(
      employeeSales.map(async (employee) => {
        const employeeInfo = await this.prisma.employee.findUnique({
          where: { id: employee.employeeId },
          select: { name: true, phone: true },
        });

        return {
          employeeId: employee.employeeId,
          employeeName: employeeInfo?.name,
          phone: employeeInfo?.phone,
          totalSales: employee._sum.totalAmount || 0,
          orderCount: employee._count.id,
        };
      })
    );

    return employeesWithDetails;
  }

  private async getSalesByCustomer(where: any) {
    const customerSales = await this.prisma.salesOrder.groupBy({
      by: ['customerId'],
      where,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 10,
    });

    const customersWithDetails = await Promise.all(
      customerSales.map(async (customer) => {
        const customerInfo = await this.prisma.customer.findUnique({
          where: { id: customer.customerId },
          select: { name: true, phone: true },
        });

        return {
          customerId: customer.customerId,
          customerName: customerInfo?.name,
          phone: customerInfo?.phone,
          totalPurchases: customer._sum.totalAmount || 0,
          orderCount: customer._count.id,
        };
      })
    );

    return customersWithDetails;
  }

  private async getTopSuppliers(where: any) {
    const supplierPurchases = await this.prisma.purchaseOrder.groupBy({
      by: ['supplierId'],
      where,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 10,
    });

    const suppliersWithDetails = await Promise.all(
      supplierPurchases.map(async (supplier) => {
        const supplierInfo = await this.prisma.supplier.findUnique({
          where: { id: supplier.supplierId },
          select: { name: true, contact: true, phone: true },
        });

        return {
          supplierId: supplier.supplierId,
          supplierName: supplierInfo?.name,
          contact: supplierInfo?.contact,
          phone: supplierInfo?.phone,
          totalPurchases: supplier._sum.totalAmount || 0,
          orderCount: supplier._count.id,
        };
      })
    );

    return suppliersWithDetails;
  }

  private async getPurchasesByEmployee(where: any) {
    const employeePurchases = await this.prisma.purchaseOrder.groupBy({
      by: ['employeeId'],
      where,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 10,
    });

    const employeesWithDetails = await Promise.all(
      employeePurchases.map(async (employee) => {
        const employeeInfo = await this.prisma.employee.findUnique({
          where: { id: employee.employeeId },
          select: { name: true, phone: true },
        });

        return {
          employeeId: employee.employeeId,
          employeeName: employeeInfo?.name,
          phone: employeeInfo?.phone,
          totalPurchases: employee._sum.totalAmount || 0,
          orderCount: employee._count.id,
        };
      })
    );

    return employeesWithDetails;
  }

  private async getMonthlySalesTrend(startDate: Date, endDate: Date): Promise<SalesTrendData[]> {
    const result: SalesTrendData[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      const monthlyData = await this.prisma.salesOrder.aggregate({
        where: {
          orderDate: {
            gte: monthStart,
            lte: monthEnd,
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
        salesAmount: monthlyData._sum.totalAmount || 0,
        orderCount: monthlyData._count.id,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return result;
  }

  private async getMonthlyPurchaseTrend(startDate: Date, endDate: Date): Promise<PurchaseTrendData[]> {
    const result: PurchaseTrendData[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      const monthlyData = await this.prisma.purchaseOrder.aggregate({
        where: {
          orderDate: {
            gte: monthStart,
            lte: monthEnd,
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
        purchaseAmount: monthlyData._sum.totalAmount || 0,
        orderCount: monthlyData._count.id,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return result;
  }

  private async getStockStatusReport(warehouseId?: string, category?: string): Promise<StockStatusReport> {
    const where: any = {};

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (category) {
      where.product = {
        category: category,
      };
    }

    const inventory = await this.prisma.inventory.findMany({
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
            costPrice: true,
            sellPrice: true,
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

    const stockValue = inventory.reduce((sum, item) => 
      sum + (item.currentQty * (item.product.costPrice || 0)), 0
    );

    const lowStockItems = inventory.filter(item => item.currentQty <= item.minQty);
    const outOfStockItems = inventory.filter(item => item.currentQty === 0);

    return {
      summary: {
        totalProducts: inventory.length,
        totalValue: Math.round(stockValue * 100) / 100,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
      },
      inventory,
      alerts: {
        lowStock: lowStockItems,
        outOfStock: outOfStockItems,
      },
    };
  }

  private async getStockMovementReport(warehouseId?: string, category?: string): Promise<StockMovementReport> {
    // 获取最近30天的入库和出库记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [inboundData, outboundData] = await Promise.all([
      this.prisma.inboundOrderItem.findMany({
        where: {
          inboundOrder: {
            inboundDate: {
              gte: thirtyDaysAgo,
            },
          },
          ...(warehouseId && { warehouseId }),
          ...(category && {
            product: {
              category: category,
            },
          }),
        },
        include: {
          product: {
            select: {
              name: true,
              category: true,
            },
          },
          warehouse: {
            select: {
              name: true,
            },
          },
          inboundOrder: {
            select: {
              inboundDate: true,
            },
          },
        },
        orderBy: {
          inboundOrder: {
            inboundDate: 'desc',
          },
        },
        take: 100,
      }),
      this.prisma.outboundOrderItem.findMany({
        where: {
          outboundOrder: {
            outboundDate: {
              gte: thirtyDaysAgo,
            },
          },
          ...(warehouseId && { warehouseId }),
          ...(category && {
            product: {
              category: category,
            },
          }),
        },
        include: {
          product: {
            select: {
              name: true,
              category: true,
            },
          },
          warehouse: {
            select: {
              name: true,
            },
          },
          outboundOrder: {
            select: {
              outboundDate: true,
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          outboundOrder: {
            outboundDate: 'desc',
          },
        },
        take: 100,
      }),
    ]);

    return {
      inbound: inboundData,
      outbound: outboundData,
      period: {
        startDate: thirtyDaysAgo,
        endDate: new Date(),
      },
    };
  }

  private async getStockValueReport(warehouseId?: string, category?: string): Promise<StockValueReport> {
    const where: any = {};

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (category) {
      where.product = {
        category: category,
      };
    }

    const inventory = await this.prisma.inventory.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            category: true,
            costPrice: true,
            sellPrice: true,
          },
        },
        warehouse: {
          select: {
            name: true,
          },
        },
      },
    });

    const stockByCategory = inventory.reduce((acc: Record<string, StockByCategory>, item) => {
      const category = item.product.category;
      const value = item.currentQty * (item.product.costPrice || 0);
      
      if (!acc[category]) {
        acc[category] = {
          category,
          totalValue: 0,
          totalQuantity: 0,
          productCount: 0,
        };
      }
      
      acc[category].totalValue += value;
      acc[category].totalQuantity += item.currentQty;
      acc[category].productCount += 1;
      
      return acc;
    }, {});

    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.currentQty * (item.product.costPrice || 0)), 0
    );

    const topValuableItems: TopValuableItem[] = inventory
    .map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      category: item.product.category,
      quantity: item.currentQty,
      unitCost: item.product.costPrice || 0,
      totalValue: item.currentQty * (item.product.costPrice || 0),
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 20);

    return {
      summary: {
        totalValue: Math.round(totalValue * 100) / 100,
        totalProducts: inventory.length,
        totalQuantity: inventory.reduce((sum, item) => sum + item.currentQty, 0),
      },
      byCategory: Object.values(stockByCategory).map((item: any) => ({
        ...item,
        totalValue: Math.round(item.totalValue * 100) / 100,
        percentage: Math.round((item.totalValue / totalValue) * 100 * 100) / 100,
      })),
      topValuableItems,
    };
  }

  private getDateRange(period: string, startDate?: string, endDate?: string) {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case 'daily':
          start = new Date(today);
          start.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          start = new Date(today);
          start.setDate(today.getDate() - 7);
          break;
        case 'monthly':
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'yearly':
          start = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(today.getFullYear(), today.getMonth(), 1);
      }
    }

    return { startDate: start, endDate: end };
  }
}