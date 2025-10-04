// src/common/constants/roles.constants.ts
export enum UserRole {
  SUPER_ADMIN = 'super_admin',     // 超级管理员
  SALES_MANAGER = 'sales_manager', // 销售部经理
  SALES_STAFF = 'sales_staff',     // 销售部员工
  PURCHASE_MANAGER = 'purchase_manager', // 采购部经理
  PURCHASE_STAFF = 'purchase_staff',     // 采购部员工
  WAREHOUSE_MANAGER = 'warehouse_manager', // 仓管部经理
  WAREHOUSE_STAFF = 'warehouse_staff',     // 仓管部员工
  FINANCE = 'finance',             // 财务部
}

export const RolePermissions = {
  [UserRole.SALES_MANAGER]: ['sales:read', 'sales:write', 'customers:read', 'customers:write'],
  [UserRole.SALES_STAFF]: ['sales:read', 'sales:write', 'customers:read'],
  [UserRole.PURCHASE_MANAGER]: ['purchase:read', 'purchase:write', 'suppliers:read', 'suppliers:write'],
  [UserRole.PURCHASE_STAFF]: ['purchase:read', 'purchase:write', 'suppliers:read'],
  [UserRole.WAREHOUSE_MANAGER]: ['warehouse:read', 'warehouse:write', 'inventory:read', 'inventory:write'],
  [UserRole.WAREHOUSE_STAFF]: ['warehouse:read', 'warehouse:write', 'inventory:read'],
  [UserRole.FINANCE]: ['reports:read', 'sales:read', 'purchase:read'],
  [UserRole.SUPER_ADMIN]: ['*'],
};