// src/pages/Sales.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  PieChart as PieChartIcon,
  BarChart2,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format } from 'date-fns';

// 销售订单类型定义
interface SalesOrder {
  id: string;
  orderNo: string;
  customer: {
    id: string;
    name: string;
  };
  orderDate: string;
  deliveryDate: string | null;
  totalAmount: number;
  status: 'draft' | 'pending' | 'delivered' | 'cancelled';
  itemsCount: number;
}

// 图表数据类型
interface ChartData {
  name: string;
  value: number;
}

// 状态标签组件
const StatusBadge: React.FC<{ status: SalesOrder['status'] }> = ({ status }) => {
  const variants = {
    draft: {
      color: 'bg-gray-100 text-gray-800',
      label: '草稿',
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    pending: {
      color: 'bg-blue-100 text-blue-800',
      label: '待发货',
      icon: <TrendingUp className="h-3 w-3 mr-1" />,
    },
    delivered: {
      color: 'bg-green-100 text-green-800',
      label: '已发货',
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

export const Sales: React.FC = () => {
  // 订单状态管理
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [timeRange, setTimeRange] = useState('month');
  
  // 图表数据
  const [salesChartData, setSalesChartData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [chartColors, setChartColors] = useState<string[]>([]);

  // 模拟获取销售订单数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 模拟订单数据
        const mockOrders: SalesOrder[] = Array.from({ length: 15 }, (_, i) => ({
          id: `SO${20240001 + i}`,
          orderNo: `SO${20240001 + i}`,
          customer: {
            id: `CUS${1001 + (i % 7)}`,
            name: [`客户A`, `客户B`, `客户C`, `客户D`, `客户E`, `客户F`, `客户G`][i % 7],
          },
          orderDate: new Date(Date.now() - i * 86400000 * (Math.floor(Math.random() * 30) + 1)).toISOString(),
          deliveryDate: i % 4 !== 0 ? new Date(Date.now() - (i % 5) * 86400000).toISOString() : null,
          totalAmount: 5000 + Math.floor(Math.random() * 150000),
          status: ['draft', 'pending', 'delivered', 'cancelled'][Math.floor(Math.random() * 4)] as SalesOrder['status'],
          itemsCount: Math.floor(Math.random() * 15) + 1,
        }));
        
        setOrders(mockOrders);
        setTotalCount(78); // 模拟总条数

        // 模拟图表数据
        const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
        setSalesChartData(
          months.map(month => ({
            name: month,
            value: 100000 + Math.floor(Math.random() * 300000)
          }))
        );

        // 商品类别销售占比
        const categories = ['男装', '女装', '童装', '鞋类', '配饰'];
        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
        setCategoryData(
          categories.map((category, index) => ({
            name: category,
            value: 10 + Math.floor(Math.random() * 40)
          }))
        );
        setChartColors(colors);

      } catch (error) {
        console.error('Failed to fetch sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

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

  // 刷新数据
  const refreshData = () => {
    setLoading(true);
    // 模拟数据刷新延迟
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">销售管理</h1>
          <p className="text-gray-600 dark:text-gray-400">管理所有销售订单和客户信息</p>
        </div>
        <Button size="md" variant="primary" className="gap-2 group">
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          新建销售订单
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
                placeholder="搜索订单号、客户名称..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="secondary" 
                className="gap-2"
                onClick={refreshData}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
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

      {/* 统计卡片和图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 统计卡片 */}
        <div className="lg:col-span-1 space-y-4">
          <Card hoverable>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">总订单数</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">245</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <span className="mr-1">↑ 18%</span> 较上月
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card hoverable>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">本月销售额</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">¥896,520</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <span className="mr-1">↑ 23.5%</span> 较上月
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">待发货订单</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">32</h3>
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <span className="mr-1">↑ 8%</span> 较上周
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
                  <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">198</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <span className="mr-1">↑ 21%</span> 较上月
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 图表 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader 
              title="销售额趋势" 
              actions={
                <div className="flex space-x-2">
                  <Button 
                    variant={timeRange === 'week' ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setTimeRange('week')}
                  >
                    周
                  </Button>
                  <Button 
                    variant={timeRange === 'month' ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setTimeRange('month')}
                  >
                    月
                  </Button>
                  <Button 
                    variant={timeRange === 'quarter' ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setTimeRange('quarter')}
                  >
                    季度
                  </Button>
                  <Button 
                    variant={timeRange === 'year' ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setTimeRange('year')}
                  >
                    年
                  </Button>
                </div>
              }
            />
            <CardBody>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none'
                      }} 
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#colorGradient)" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader 
              title="商品类别销售占比" 
              actions={
                <Button variant="secondary" size="sm" className="gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  详情
                </Button>
              }
            />
            <CardBody>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                      animationBegin={300}
                      label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, '占比']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 销售订单列表 */}
      <Card>
        <CardHeader
          title="销售订单列表"
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
              <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">暂无销售订单</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">点击"新建销售订单"按钮创建第一个订单</p>
            </div>
          ) : (
            <>
              <Table striped hoverable>
                <TableHeader>
                  <TableRow>
                    <TableCell header>订单编号</TableCell>
                    <TableCell header>客户</TableCell>
                    <TableCell header>订单日期</TableCell>
                    <TableCell header>发货日期</TableCell>
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
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{format(new Date(order.orderDate), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>
                        {order.deliveryDate ? format(new Date(order.deliveryDate), 'yyyy-MM-dd') : '-'}
                      </TableCell>
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
