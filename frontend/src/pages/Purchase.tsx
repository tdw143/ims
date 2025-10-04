// src/pages/Purchase.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import axios from 'axios';
import { format } from 'date-fns';

// 采购订单类型定义
interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplier: {
    id: string;
    name: string;
  };
  orderDate: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  status: 'draft' | 'pending' | 'received' | 'cancelled';
  itemsCount: number;
}

// 状态标签组件
const StatusBadge: React.FC<{ status: PurchaseOrder['status'] }> = ({ status }) => {
  const variants = {
    draft: {
      color: 'bg-gray-100 text-gray-800',
      label: '草稿',
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    pending: {
      color: 'bg-blue-100 text-blue-800',
      label: '待收货',
      icon: <Truck className="h-3 w-3 mr-1" />,
    },
    received: {
      color: 'bg-green-100 text-green-800',
      label: '已收货',
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    },
    cancelled: {
      color: 'bg-red-100 text-red-800',
      label: '已取消',
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
  };

  const { color, label, icon } = variants[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};

export const Purchase: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // 模拟获取采购订单数据
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // 实际项目中替换为真实API调用
        // const response = await axios.get('/api/purchase-orders', {
        //   params: { page: currentPage, limit: itemsPerPage, query: searchQuery }
        // });
        
        // 模拟数据
        const mockData: PurchaseOrder[] = Array.from({ length: 15 }, (_, i) => ({
          id: `PO${20240001 + i}`,
          orderNo: `PO${20240001 + i}`,
          supplier: {
            id: `SUP${1001 + (i % 5)}`,
            name: [`供应商A`, `供应商B`, `供应商C`, `供应商D`, `供应商E`][i % 5],
          },
          orderDate: new Date(Date.now() - i * 86400000 * (Math.floor(Math.random() * 30) + 1)).toISOString(),
          expectedDeliveryDate: new Date(Date.now() + (5 - i % 10) * 86400000).toISOString(),
          totalAmount: 10000 + Math.floor(Math.random() * 90000),
          status: ['draft', 'pending', 'received', 'cancelled'][Math.floor(Math.random() * 4)] as PurchaseOrder['status'],
          itemsCount: Math.floor(Math.random() * 20) + 1,
        }));
        
        setOrders(mockData);
        setTotalCount(50); // 模拟总条数
      } catch (error) {
        console.error('Failed to fetch purchase orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, searchQuery]);

  // 计算分页
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // 重置到第一页
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">采购管理</h1>
          <p className="text-gray-600 dark:text-gray-400">管理所有采购订单和供应商信息</p>
        </div>
        <Button size="md" variant="primary" className="gap-2 group">
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          新建采购订单
        </Button>
      </div>

      {/* 搜索和筛选区域 */}
      <Card elevation="sm">
        <CardBody>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索订单号、供应商名称..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="gap-2">
                <Filter className="h-4 w-4" />
                筛选
              </Button>
              <Button type="button" variant="secondary" className="gap-2">
                <Calendar className="h-4 w-4" />
                日期
              </Button>
              <Button type="submit" variant="primary">
                搜索
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">总订单数</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">128</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <span className="mr-1">↑ 12%</span> 较上月
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card hoverable>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">本月采购额</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">¥356,890</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <span className="mr-1">↑ 8.5%</span> 较上月
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card hoverable>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">待收货订单</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">24</h3>
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <span className="mr-1">↑ 5%</span> 较上周
                </p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card hoverable>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">已完成订单</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">86</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <span className="mr-1">↑ 15%</span> 较上月
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 采购订单列表 */}
      <Card>
        <CardHeader
          title="采购订单列表"
          actions={
            <Button variant="secondary" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              导出
            </Button>
          }
        />
        <CardBody>
          {loading ? (
            // 加载状态
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : orders.length === 0 ? (
            // 空状态
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">暂无采购订单</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">点击"新建采购订单"按钮创建第一个订单</p>
            </div>
          ) : (
            <>
              <Table striped hoverable>
                <TableHeader>
                  <TableRow>
                    <TableCell header>订单编号</TableCell>
                    <TableCell header>供应商</TableCell>
                    <TableCell header>订单日期</TableCell>
                    <TableCell header>预计到货</TableCell>
                    <TableCell header align="right">总金额</TableCell>
                    <TableCell header>状态</TableCell>
                    <TableCell header>商品数量</TableCell>
                    <TableCell header align="center">操作</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrders.map((order, index) => (
                    <TableRow key={order.id} index={index} hoverable>
                      <TableCell className="font-medium">{order.orderNo}</TableCell>
                      <TableCell>{order.supplier.name}</TableCell>
                      <TableCell>{format(new Date(order.orderDate), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{format(new Date(order.expectedDeliveryDate), 'yyyy-MM-dd')}</TableCell>
                      <TableCell align="right">¥{order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>{order.itemsCount}</TableCell>
                      <TableCell align="center">
                        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  显示 {indexOfFirstItem + 1} 到 {Math.min(indexOfLastItem, totalCount)} 条，共 {totalCount} 条
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // 计算显示的页码（当前页居中）
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-9 h-9 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

// 引入缺失的DollarSign图标
import { DollarSign } from 'lucide-react';