/*
  Warnings:

  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Storage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Purchase";

-- DropTable
DROP TABLE "public"."Sale";

-- DropTable
DROP TABLE "public"."Storage";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Departments" (
    "Did" TEXT NOT NULL,
    "DName" TEXT NOT NULL,
    "DContact" TEXT,
    "Mid" TEXT,
    "DTel" TEXT,
    "DEmail" TEXT,
    "DNote" TEXT,

    CONSTRAINT "Departments_pkey" PRIMARY KEY ("Did")
);

-- CreateTable
CREATE TABLE "public"."Employees" (
    "EId" TEXT NOT NULL,
    "EName" TEXT NOT NULL,
    "EGender" TEXT NOT NULL,
    "EBirth" TIMESTAMP(3),
    "EResidence" TEXT,
    "EIdCard" TEXT,
    "EEducation" TEXT,
    "EPhone" TEXT,
    "EEmail" TEXT,
    "EEntryDate" TIMESTAMP(3) NOT NULL,
    "EType" TEXT NOT NULL,
    "DId" TEXT NOT NULL,
    "ENote" TEXT,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("EId")
);

-- CreateTable
CREATE TABLE "public"."Customers" (
    "CId" TEXT NOT NULL,
    "CName" TEXT NOT NULL,
    "CGender" TEXT,
    "CTel" TEXT NOT NULL,
    "CEmail" TEXT,
    "CAddress" TEXT,
    "CNote" TEXT,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("CId")
);

-- CreateTable
CREATE TABLE "public"."Suppliers" (
    "SId" TEXT NOT NULL,
    "SName" TEXT NOT NULL,
    "SCategory" TEXT,
    "SAddress" TEXT,
    "SContact" TEXT,
    "STel" TEXT NOT NULL,
    "SEmail" TEXT,
    "SNote" TEXT,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("SId")
);

-- CreateTable
CREATE TABLE "public"."Products" (
    "PId" TEXT NOT NULL,
    "PName" TEXT NOT NULL,
    "PCategory" TEXT NOT NULL,
    "PBrand" TEXT,
    "PSize" TEXT,
    "PUnit" TEXT NOT NULL,
    "PColor" TEXT,
    "PMaterial" TEXT,
    "PCostPrice" DOUBLE PRECISION,
    "PSellPrice" DOUBLE PRECISION,
    "PNote" TEXT,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("PId")
);

-- CreateTable
CREATE TABLE "public"."Warehouses" (
    "WId" TEXT NOT NULL,
    "WName" TEXT NOT NULL,
    "WAddress" TEXT,
    "WTel" TEXT,
    "WNote" TEXT,

    CONSTRAINT "Warehouses_pkey" PRIMARY KEY ("WId")
);

-- CreateTable
CREATE TABLE "public"."Inventory" (
    "PId" TEXT NOT NULL,
    "WId" TEXT NOT NULL,
    "CurrentQty" INTEGER NOT NULL,
    "MinQty" INTEGER NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("PId","WId")
);

-- CreateTable
CREATE TABLE "public"."Supplier_products" (
    "SId" TEXT NOT NULL,
    "PId" TEXT NOT NULL,
    "LastPrice" DOUBLE PRECISION,
    "SupplyStatus" TEXT NOT NULL,

    CONSTRAINT "Supplier_products_pkey" PRIMARY KEY ("SId","PId")
);

-- CreateTable
CREATE TABLE "public"."Purchase_orders" (
    "POId" TEXT NOT NULL,
    "EId" TEXT NOT NULL,
    "SId" TEXT NOT NULL,
    "OrderDate" TIMESTAMP(3) NOT NULL,
    "ExpectDate" TIMESTAMP(3),
    "OrderStatus" TEXT NOT NULL,
    "TotalAmount" DOUBLE PRECISION,
    "PONote" TEXT,

    CONSTRAINT "Purchase_orders_pkey" PRIMARY KEY ("POId")
);

-- CreateTable
CREATE TABLE "public"."Purchase_order_items" (
    "POId" TEXT NOT NULL,
    "ItemNo" INTEGER NOT NULL,
    "PId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "UnitPrice" DOUBLE PRECISION NOT NULL,
    "ItemNote" TEXT,

    CONSTRAINT "Purchase_order_items_pkey" PRIMARY KEY ("POId","ItemNo")
);

-- CreateTable
CREATE TABLE "public"."Sales_orders" (
    "SOId" TEXT NOT NULL,
    "EId" TEXT NOT NULL,
    "CId" TEXT NOT NULL,
    "OrderDate" TIMESTAMP(3) NOT NULL,
    "ExpectDate" TIMESTAMP(3),
    "OrderStatus" TEXT NOT NULL,
    "TotalAmount" DOUBLE PRECISION,
    "SONote" TEXT,

    CONSTRAINT "Sales_orders_pkey" PRIMARY KEY ("SOId")
);

-- CreateTable
CREATE TABLE "public"."Sales_order_items" (
    "SOId" TEXT NOT NULL,
    "ItemNo" INTEGER NOT NULL,
    "PId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "UnitPrice" DOUBLE PRECISION NOT NULL,
    "ItemNote" TEXT,

    CONSTRAINT "Sales_order_items_pkey" PRIMARY KEY ("SOId","ItemNo")
);

-- CreateTable
CREATE TABLE "public"."Inbound_orders" (
    "IOId" TEXT NOT NULL,
    "POId" TEXT,
    "EId" TEXT NOT NULL,
    "InboundDate" TIMESTAMP(3) NOT NULL,
    "OperateStatus" TEXT NOT NULL,
    "IONote" TEXT,

    CONSTRAINT "Inbound_orders_pkey" PRIMARY KEY ("IOId")
);

-- CreateTable
CREATE TABLE "public"."Inbound_order_items" (
    "IOId" TEXT NOT NULL,
    "ItemNo" INTEGER NOT NULL,
    "PId" TEXT NOT NULL,
    "WId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "BatchNo" TEXT,
    "ItemNote" TEXT,

    CONSTRAINT "Inbound_order_items_pkey" PRIMARY KEY ("IOId","ItemNo")
);

-- CreateTable
CREATE TABLE "public"."Outbound_orders" (
    "OOId" TEXT NOT NULL,
    "SOId" TEXT,
    "EId" TEXT NOT NULL,
    "CId" TEXT NOT NULL,
    "OutboundDate" TIMESTAMP(3) NOT NULL,
    "TrackingNo" TEXT,
    "OperateStatus" TEXT NOT NULL,
    "OONote" TEXT,

    CONSTRAINT "Outbound_orders_pkey" PRIMARY KEY ("OOId")
);

-- CreateTable
CREATE TABLE "public"."Outbound_order_items" (
    "OOId" TEXT NOT NULL,
    "ItemNo" INTEGER NOT NULL,
    "PId" TEXT NOT NULL,
    "WId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "ItemNote" TEXT,

    CONSTRAINT "Outbound_order_items_pkey" PRIMARY KEY ("OOId","ItemNo")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "employeeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "public"."system_logs" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "requestData" JSONB,
    "responseData" JSONB,
    "errorStack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departments_Mid_key" ON "public"."Departments"("Mid");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "public"."users"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE INDEX "system_logs_level_idx" ON "public"."system_logs"("level");

-- CreateIndex
CREATE INDEX "system_logs_module_idx" ON "public"."system_logs"("module");

-- CreateIndex
CREATE INDEX "system_logs_createdAt_idx" ON "public"."system_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Departments" ADD CONSTRAINT "Departments_Mid_fkey" FOREIGN KEY ("Mid") REFERENCES "public"."Employees"("EId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employees" ADD CONSTRAINT "Employees_DId_fkey" FOREIGN KEY ("DId") REFERENCES "public"."Departments"("Did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inventory" ADD CONSTRAINT "Inventory_PId_fkey" FOREIGN KEY ("PId") REFERENCES "public"."Products"("PId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inventory" ADD CONSTRAINT "Inventory_WId_fkey" FOREIGN KEY ("WId") REFERENCES "public"."Warehouses"("WId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Supplier_products" ADD CONSTRAINT "Supplier_products_SId_fkey" FOREIGN KEY ("SId") REFERENCES "public"."Suppliers"("SId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Supplier_products" ADD CONSTRAINT "Supplier_products_PId_fkey" FOREIGN KEY ("PId") REFERENCES "public"."Products"("PId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase_orders" ADD CONSTRAINT "Purchase_orders_EId_fkey" FOREIGN KEY ("EId") REFERENCES "public"."Employees"("EId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase_orders" ADD CONSTRAINT "Purchase_orders_SId_fkey" FOREIGN KEY ("SId") REFERENCES "public"."Suppliers"("SId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase_order_items" ADD CONSTRAINT "Purchase_order_items_POId_fkey" FOREIGN KEY ("POId") REFERENCES "public"."Purchase_orders"("POId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase_order_items" ADD CONSTRAINT "Purchase_order_items_PId_fkey" FOREIGN KEY ("PId") REFERENCES "public"."Products"("PId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sales_orders" ADD CONSTRAINT "Sales_orders_EId_fkey" FOREIGN KEY ("EId") REFERENCES "public"."Employees"("EId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sales_orders" ADD CONSTRAINT "Sales_orders_CId_fkey" FOREIGN KEY ("CId") REFERENCES "public"."Customers"("CId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sales_order_items" ADD CONSTRAINT "Sales_order_items_SOId_fkey" FOREIGN KEY ("SOId") REFERENCES "public"."Sales_orders"("SOId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sales_order_items" ADD CONSTRAINT "Sales_order_items_PId_fkey" FOREIGN KEY ("PId") REFERENCES "public"."Products"("PId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inbound_orders" ADD CONSTRAINT "Inbound_orders_POId_fkey" FOREIGN KEY ("POId") REFERENCES "public"."Purchase_orders"("POId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inbound_orders" ADD CONSTRAINT "Inbound_orders_EId_fkey" FOREIGN KEY ("EId") REFERENCES "public"."Employees"("EId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inbound_order_items" ADD CONSTRAINT "Inbound_order_items_IOId_fkey" FOREIGN KEY ("IOId") REFERENCES "public"."Inbound_orders"("IOId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inbound_order_items" ADD CONSTRAINT "Inbound_order_items_PId_fkey" FOREIGN KEY ("PId") REFERENCES "public"."Products"("PId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inbound_order_items" ADD CONSTRAINT "Inbound_order_items_WId_fkey" FOREIGN KEY ("WId") REFERENCES "public"."Warehouses"("WId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outbound_orders" ADD CONSTRAINT "Outbound_orders_SOId_fkey" FOREIGN KEY ("SOId") REFERENCES "public"."Sales_orders"("SOId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outbound_orders" ADD CONSTRAINT "Outbound_orders_EId_fkey" FOREIGN KEY ("EId") REFERENCES "public"."Employees"("EId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outbound_orders" ADD CONSTRAINT "Outbound_orders_CId_fkey" FOREIGN KEY ("CId") REFERENCES "public"."Customers"("CId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outbound_order_items" ADD CONSTRAINT "Outbound_order_items_OOId_fkey" FOREIGN KEY ("OOId") REFERENCES "public"."Outbound_orders"("OOId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outbound_order_items" ADD CONSTRAINT "Outbound_order_items_PId_fkey" FOREIGN KEY ("PId") REFERENCES "public"."Products"("PId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outbound_order_items" ADD CONSTRAINT "Outbound_order_items_WId_fkey" FOREIGN KEY ("WId") REFERENCES "public"."Warehouses"("WId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employees"("EId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_logs" ADD CONSTRAINT "system_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
