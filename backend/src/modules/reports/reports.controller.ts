// src/modules/reports/reports.controller.ts
import { 
  Controller, 
  Get, 
  Query, 
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { PurchaseReportQueryDto } from './dto/purchase-report-query.dto';
import { InventoryReportQueryDto } from './dto/inventory-report-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constants';
import { InventoryReportType } from './dto/inventory-report-query.dto';
import { ReportPeriod } from './dto/sales-report-query.dto';

@ApiTags('报表统计')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取销售报表' })
  @ApiQuery({ name: 'period', required: false, description: '报表周期' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'employeeId', required: false, description: '员工编号' })
  @ApiQuery({ name: 'customerId', required: false, description: '客户编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取销售报表成功' })
  getSalesReport(@Query() query: SalesReportQueryDto) {
    return this.reportsService.getSalesReport(query);
  }

  @Get('purchase')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PURCHASE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取采购报表' })
  @ApiQuery({ name: 'period', required: false, description: '报表周期' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'supplierId', required: false, description: '供应商编号' })
  @ApiQuery({ name: 'employeeId', required: false, description: '采购员编号' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取采购报表成功' })
  getPurchaseReport(@Query() query: PurchaseReportQueryDto) {
    return this.reportsService.getPurchaseReport(query);
  }

  @Get('inventory')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取库存报表' })
  @ApiQuery({ name: 'reportType', required: false, description: '报表类型' })
  @ApiQuery({ name: 'warehouseId', required: false, description: '仓库编号' })
  @ApiQuery({ name: 'category', required: false, description: '商品分类' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取库存报表成功' })
  getInventoryReport(@Query() query: InventoryReportQueryDto) {
    return this.reportsService.getInventoryReport(query);
  }

  @Get('business-analysis')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: '获取经营分析报表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取经营分析报表成功' })
  getBusinessAnalysis() {
    return this.reportsService.getBusinessAnalysis();
  }

  @Get('dashboard')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES_MANAGER, UserRole.PURCHASE_MANAGER, UserRole.WAREHOUSE_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: '获取仪表盘数据' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取仪表盘数据成功' })
  async getDashboardData() {
    const [businessAnalysis, inventoryReport, recentSales, recentPurchases] = await Promise.all([
      this.reportsService.getBusinessAnalysis(),
      this.reportsService.getInventoryReport({ reportType: InventoryReportType.STOCK_STATUS }),
      this.reportsService.getSalesReport({ period: ReportPeriod.WEEKLY }),
      this.reportsService.getPurchaseReport({ period: ReportPeriod.WEEKLY }),
    ]);

    return {
      kpi: businessAnalysis.kpi,
      alerts: {
        ...businessAnalysis.alerts,
        lowStockItems: 'alerts' in inventoryReport ? (inventoryReport as any).alerts?.lowStock?.slice(0, 5) || [] : [],
      },
      recentActivity: {
        sales: recentSales.summary,
        purchases: recentPurchases.summary,
      },
      charts: {
        salesTrend: businessAnalysis.monthlyTrend.sales.slice(-6),
        purchaseTrend: businessAnalysis.monthlyTrend.purchases.slice(-6),
      },
    };
  }
}