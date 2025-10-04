import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Truck, 
  Package, 
  TrendingUp, 
  Users,
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';
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

// 统计卡片数据
const stats = [
  { 
    name: '今日销售额', 
    value: '¥12,468', 
    change: '+12%', 
    changeType: 'positive',
    icon: DollarSign 
  },
  { 
    name: '今日订单数', 
    value: '89', 
    change: '+8%', 
    changeType: 'positive',
    icon: ShoppingCart 
  },
  { 
    name: '库存商品', 
    value: '1,234', 
    change: '-2%', 
    changeType: 'negative',
    icon: Package 
  },
  { 
    name: '活跃客户', 
    value: '567', 
    change: '+5%', 
    changeType: 'positive',
    icon: Users 
  },
];

// 最近活动数据
const recentActivities = [
  { id: 1, type: 'sale', description: '新销售订单 #SO202401001', time: '2分钟前' },
  { id: 2, type: 'purchase', description: '采购订单 #PO202401001 已确认', time: '5分钟前' },
  { id: 3, type: 'inbound', description: '商品入库完成', time: '1小时前' },
  { id: 4, type: 'sale', description: '销售订单 #SO202312315 已完成', time: '2小时前' },
];

// 采购部门数据（近6个月采购额）
const purchaseData = [
  { month: '1月', 采购额: 35000, 订单数量: 45 },
  { month: '2月', 采购额: 42000, 订单数量: 52 },
  { month: '3月', 采购额: 38000, 订单数量: 48 },
  { month: '4月', 采购额: 50000, 订单数量: 65 },
  { month: '5月', 采购额: 46000, 订单数量: 58 },
  { month: '6月', 采购额: 55000, 订单数量: 72 },
];

// 销售部门数据（近6个月销售额）
const salesData = [
  { month: '1月', 销售额: 42000, 订单数量: 85 },
  { month: '2月', 销售额: 48000, 订单数量: 92 },
  { month: '3月', 销售额: 52000, 订单数量: 105 },
  { month: '4月', 销售额: 65000, 订单数量: 128 },
  { month: '5月', 销售额: 60000, 订单数量: 115 },
  { month: '6月', 销售额: 72000, 订单数量: 140 },
];

// 仓储部门数据（库存分类占比）
const warehouseData = [
  { name: '服装类', value: 45, color: '#0088FE' },
  { name: '鞋类', value: 25, color: '#00C49F' },
  { name: '配饰类', value: 20, color: '#FFBB28' },
  { name: '其他', value: 10, color: '#FF8042' },
];

// 时间范围选项
const timeRangeOptions = [
  { value: '6months', label: '近6个月' },
  { value: '3months', label: '近3个月' },
  { value: '1month', label: '近1个月' },
  { value: '1week', label: '近1周' },
];

// 图表数据筛选函数
const filterChartData = (data: any[], range: string) => {
  switch (range) {
    case '3months':
      return data.slice(-3);
    case '1month':
      return data.slice(-1);
    case '1week':
      // 模拟周数据
      return [
        { month: '周一', 采购额: data[data.length - 1].采购额 * 0.2, 订单数量: Math.floor(data[data.length - 1].订单数量 * 0.2) },
        { month: '周二', 采购额: data[data.length - 1].采购额 * 0.15, 订单数量: Math.floor(data[data.length - 1].订单数量 * 0.15) },
        { month: '周三', 采购额: data[data.length - 1].采购额 * 0.25, 订单数量: Math.floor(data[data.length - 1].订单数量 * 0.25) },
        { month: '周四', 采购额: data[data.length - 1].采购额 * 0.2, 订单数量: Math.floor(data[data.length - 1].订单数量 * 0.2) },
        { month: '周五', 采购额: data[data.length - 1].采购额 * 0.2, 订单数量: Math.floor(data[data.length - 1].订单数量 * 0.2) },
      ];
    default:
      return data;
  }
};

export const Dashboard: React.FC = () => {
  // 状态管理
  const [purchaseTimeRange, setPurchaseTimeRange] = useState('6months');
  const [salesTimeRange, setSalesTimeRange] = useState('6months');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // 筛选后的数据
  const filteredPurchaseData = filterChartData(purchaseData, purchaseTimeRange);
  const filteredSalesData = filterChartData(salesData, salesTimeRange);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-600">欢迎回来，这里是您的业务概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 最近活动和快速操作 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 最近活动 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近活动</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.type === 'sale'
                                ? 'bg-green-500'
                                : activity.type === 'purchase'
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                            }`}
                          >
                            {activity.type === 'sale' && (
                              <Truck className="h-5 w-5 text-white" />
                            )}
                            {activity.type === 'purchase' && (
                              <ShoppingCart className="h-5 w-5 text-white" />
                            )}
                            {activity.type === 'inbound' && (
                              <Package className="h-5 w-5 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-700">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{activity.time}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                <ShoppingCart className="h-6 w-6 text-blue-500 mb-2" />
                <h4 className="font-medium text-gray-900">新建采购</h4>
                <p className="text-sm text-gray-500">创建采购订单</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                <Truck className="h-6 w-6 text-green-500 mb-2" />
                <h4 className="font-medium text-gray-900">新建销售</h4>
                <p className="text-sm text-gray-500">创建销售订单</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                <Package className="h-6 w-6 text-yellow-500 mb-2" />
                <h4 className="font-medium text-gray-900">商品入库</h4>
                <p className="text-sm text-gray-500">处理入库单</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-500 mb-2" />
                <h4 className="font-medium text-gray-900">查看报表</h4>
                <p className="text-sm text-gray-500">业务数据分析</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 部门图表区域 - 每个部门图表独占一排 */}
      
      {/* 采购部门图表 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
            采购部门数据
          </h3>
          
          {/* 筛选控件 */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={purchaseTimeRange}
              onChange={(e) => setPurchaseTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredPurchaseData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none'
                }} 
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="采购额" 
                name="采购额(元)" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
              <Bar 
                yAxisId="right" 
                dataKey="订单数量" 
                name="订单数量" 
                fill="#82ca9d" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 销售部门图表 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Truck className="h-5 w-5 mr-2 text-green-500" />
            销售部门数据
          </h3>
          
          {/* 筛选控件 */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={salesTimeRange}
              onChange={(e) => setSalesTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredSalesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#00C49F" />
              <YAxis yAxisId="right" orientation="right" stroke="#FFBB28" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none'
                }} 
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="销售额" 
                name="销售额(元)" 
                fill="#00C49F" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
              <Bar 
                yAxisId="right" 
                dataKey="订单数量" 
                name="订单数量" 
                fill="#FFBB28" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 仓储部门图表 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2 text-yellow-500" />
            仓储部门数据
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={warehouseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent as number * 100).toFixed(0)}%`}
                onMouseEnter={(_, index) => index !== undefined && setActivePieIndex(index)}
                onMouseLeave={() => setActivePieIndex(null)}
                animationDuration={300}
                isAnimationActive={true}
              >
                {warehouseData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="white"
                    strokeWidth={2}
                    style={{
                      transform: activePieIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'transform 0.3s ease, opacity 0.3s ease',
                      opacity: activePieIndex === index ? 1 : 0.8
                    }}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value}%`, `${name}占比`]}
                contentStyle={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none'
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};