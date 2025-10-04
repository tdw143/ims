export interface User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
  employee?: {
    id: string;
    name: string;
    department?: {
      id: string;
      name: string;
    };
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 部门相关类型
export interface Department {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  manager?: Employee;
  employees: Employee[];
}

// 员工相关类型
export interface Employee {
  id: string;
  name: string;
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  type: 'sales' | 'purchase' | 'warehouse' | 'finance';
  department: Department;
  entryDate: string;
}

// 客户相关类型
export interface Customer {
  id: string;
  name: string;
  gender?: 'M' | 'F';
  phone: string;
  email?: string;
  address?: string;
}

// 供应商相关类型
export interface Supplier {
  id: string;
  name: string;
  category?: string;
  contact?: string;
  phone: string;
  email?: string;
  address?: string;
}

// 商品相关类型
export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  size?: string;
  unit: string;
  color?: string;
  material?: string;
  costPrice?: number;
  sellPrice?: number;
}

// 采购订单相关类型
export interface PurchaseOrder {
  id: string;
  employee: Employee;
  supplier: Supplier;
  orderDate: string;
  expectDate?: string;
  orderStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount?: number;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  note?: string;
}

// 销售订单相关类型
export interface SalesOrder {
  id: string;
  employee: Employee;
  customer: Customer;
  orderDate: string;
  expectDate?: string;
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  totalAmount?: number;
  items: SalesOrderItem[];
}

export interface SalesOrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  note?: string;
}

// 库存相关类型
export interface Inventory {
  product: Product;
  warehouse: Warehouse;
  currentQty: number;
  minQty: number;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}