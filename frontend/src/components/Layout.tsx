import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Truck, 
  Warehouse, 
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: '仪表盘', href: '/', icon: BarChart3 },
  { name: '采购管理', href: '/purchase', icon: ShoppingCart },
  { name: '销售管理', href: '/sales', icon: Truck },
  { name: '仓储管理', href: '/warehouse', icon: Warehouse },
  { name: '商品管理', href: '/products', icon: Package },
  { name: '客户管理', href: '/customers', icon: Users },
  { name: '供应商管理', href: '/suppliers', icon: Users },
];

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端侧边栏 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
            {/* 侧边栏内容 */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0 px-4">
                <Package className="w-8 h-8 text-primary-500" />
                <span className="ml-2 text-lg font-semibold">跳跳服饰</span>
              </div>

              {/* 导航菜单 */}
              <nav className="mt-8 flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* 桌面端侧边栏 */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Package className="w-8 h-8 text-primary-500" />
            <span className="ml-2 text-lg font-semibold">跳跳服饰</span>
          </div>

          {/* 导航菜单 */}
          <nav className="mt-8 flex-1 flex flex-col px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* 用户信息 */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.employee?.name || user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.employee?.department?.name || user?.roles.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* 顶部导航栏 */}
        <div className="flex-shrink-0 flex border-b border-gray-200 bg-white lg:border-none">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex"></div>
            <div className="ml-4 flex items-center lg:ml-6">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                退出
              </button>
            </div>
          </div>
        </div>

        {/* 页面内容 */}
        <main className="flex-1 pb-8">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};