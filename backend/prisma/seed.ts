// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
  console.log('开始填充数据...')

  // 1. 创建部门
  const departments = await prisma.department.createMany({
    data: [
      { id: 'D01', name: '销售部', contact: '张经理', phone: '13800138001', email: 'sales@ttfashion.com', note: '负责客户销售' },
      { id: 'D02', name: '采购部', contact: '李经理', phone: '13800138002', email: 'purchase@ttfashion.com', note: '负责供应商采购' },
      { id: 'D03', name: '仓管部', contact: '王经理', phone: '13800138003', email: 'warehouse@ttfashion.com', note: '负责库存管理' },
      { id: 'D04', name: '财务部', contact: '赵经理', phone: '13800138008', email: 'finance@ttfashion.com', note: '负责财务管理' },
    ],
    skipDuplicates: true,
  });

  // 2. 创建员工
  const employees = await prisma.employee.createMany({
    data: [
      // 销售部员工
      { id: 'E001', name: '张经理', gender: 'M', phone: '13800138001', email: 'zhang@ttfashion.com', entryDate: new Date('2020-01-15'), type: 'sales', departmentId: 'D01', note: '销售部经理' },
      { id: 'E002', name: '李销售', gender: 'F', phone: '13800138004', email: 'li@ttfashion.com', entryDate: new Date('2021-03-20'), type: 'sales', departmentId: 'D01', note: '销售专员' },
      { id: 'E003', name: '王销售', gender: 'M', phone: '13800138005', email: 'wang@ttfashion.com', entryDate: new Date('2021-06-10'), type: 'sales', departmentId: 'D01', note: '销售专员' },
      
      // 采购部员工
      { id: 'E004', name: '李经理', gender: 'M', phone: '13800138002', email: 'li_purchase@ttfashion.com', entryDate: new Date('2019-11-08'), type: 'purchase', departmentId: 'D02', note: '采购部经理' },
      { id: 'E005', name: '赵采购', gender: 'F', phone: '13800138006', email: 'zhao@ttfashion.com', entryDate: new Date('2022-02-14'), type: 'purchase', departmentId: 'D02', note: '采购专员' },
      
      // 仓管部员工
      { id: 'E006', name: '王经理', gender: 'M', phone: '13800138003', email: 'wang_warehouse@ttfashion.com', entryDate: new Date('2020-05-20'), type: 'warehouse', departmentId: 'D03', note: '仓管部经理' },
      { id: 'E007', name: '刘仓管', gender: 'F', phone: '13800138007', email: 'liu@ttfashion.com', entryDate: new Date('2022-08-15'), type: 'warehouse', departmentId: 'D03', note: '仓管员' },
      
      // 财务部员工
      { id: 'E008', name: '赵经理', gender: 'F', phone: '13800138008', email: 'zhao_finance@ttfashion.com', entryDate: new Date('2020-03-10'), type: 'finance', departmentId: 'D04', note: '财务部经理' },
    ],
    skipDuplicates: true,
  });
  const moreEmployees = await prisma.employee.createMany({
    data: [
      // 更多销售部员工
      { id: 'E009', name: '陈销售', gender: 'F', phone: '13800138009', email: 'chen@ttfashion.com', entryDate: new Date('2023-01-15'), type: 'sales', departmentId: 'D01', note: '新销售员工' },
      { id: 'E010', name: '林销售', gender: 'M', phone: '13800138010', email: 'lin@ttfashion.com', entryDate: new Date('2023-03-20'), type: 'sales', departmentId: 'D01', note: '销售助理' },
      
      // 更多采购部员工
      { id: 'E011', name: '吴采购', gender: 'F', phone: '13800138011', email: 'wu@ttfashion.com', entryDate: new Date('2023-02-10'), type: 'purchase', departmentId: 'D02', note: '采购助理' },
      { id: 'E012', name: '郑采购', gender: 'M', phone: '13800138012', email: 'zheng@ttfashion.com', entryDate: new Date('2023-04-05'), type: 'purchase', departmentId: 'D02', note: '采购专员' },
      
      // 更多仓管部员工
      { id: 'E013', name: '周仓管', gender: 'M', phone: '13800138013', email: 'zhou@ttfashion.com', entryDate: new Date('2023-01-20'), type: 'warehouse', departmentId: 'D03', note: '仓库管理员' },
      { id: 'E014', name: '孙仓管', gender: 'F', phone: '13800138014', email: 'sun@ttfashion.com', entryDate: new Date('2023-05-15'), type: 'warehouse', departmentId: 'D03', note: '库存管理员' },
      
      // 更多财务部员工
      { id: 'E015', name: '钱会计', gender: 'F', phone: '13800138015', email: 'qian@ttfashion.com', entryDate: new Date('2023-03-01'), type: 'finance', departmentId: 'D04', note: '财务会计' },
      { id: 'E016', name: '李出纳', gender: 'M', phone: '13800138016', email: 'li_account@ttfashion.com', entryDate: new Date('2023-06-10'), type: 'finance', departmentId: 'D04', note: '出纳员' },
    ],
    skipDuplicates: true,
  });

  // 更新部门经理
  await prisma.department.update({
    where: { id: 'D01' },
    data: { managerId: 'E001' }
  });
  await prisma.department.update({
    where: { id: 'D02' },
    data: { managerId: 'E004' }
  });
  await prisma.department.update({
    where: { id: 'D03' },
    data: { managerId: 'E006' }
  });
  await prisma.department.update({
    where: { id: 'D04' },
    data: { managerId: 'E008' }
  });

  // 创建用户和角色（认证数据）
  const roles = await prisma.role.createMany({
    data: [
      { id: 'R001', name: 'super_admin', description: '超级管理员' },
      { id: 'R002', name: 'sales_manager', description: '销售部经理' },
      { id: 'R003', name: 'sales_staff', description: '销售部员工' },
      { id: 'R004', name: 'purchase_manager', description: '采购部经理' },
      { id: 'R005', name: 'purchase_staff', description: '采购部员工' },
      { id: 'R006', name: 'warehouse_manager', description: '仓管部经理' },
      { id: 'R007', name: 'warehouse_staff', description: '仓管部员工' },
      { id: 'R008', name: 'finance', description: '财务部' },
    ],
    skipDuplicates: true,
  });

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@ttfashion.com',
      employeeId: 'E001',
    },
  });

  // 分配管理员角色
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: 'R001', // super_admin
    },
  });

  // 3. 创建客户
  const customers = await prisma.customer.createMany({
    data: [
      { id: 'C0001', name: '时尚精品店', gender: 'F', phone: '13900139001', email: 'fashion@example.com', address: '上海市南京东路100号', note: '长期合作客户' },
      { id: 'C0002', name: '潮流服饰连锁', gender: 'M', phone: '13900139002', email: 'trend@example.com', address: '北京市朝阳区建国路200号', note: 'VIP客户' },
      { id: 'C0003', name: '美丽女人馆', gender: 'F', phone: '13900139003', email: 'beauty@example.com', address: '广州市天河区体育西路300号', note: '新开发客户' },
      { id: 'C0004', name: '都市丽人', gender: 'F', phone: '13900139004', email: 'citylady@example.com', address: '深圳市福田区华强北400号', note: '批发客户' },
    ],
    skipDuplicates: true,
  })

  // 4. 创建供应商
  const suppliers = await prisma.supplier.createMany({
    data: [
      { id: 'S0001', name: '浙江纺织厂', category: '面料供应商', address: '浙江省杭州市萧山区', contact: '陈经理', phone: '13700137001', email: 'chen@textile.com', note: '主要面料供应商' },
      { id: 'S0002', name: '广州服装厂', category: '成品供应商', address: '广东省广州市海珠区', contact: '黄总', phone: '13700137002', email: 'huang@garment.com', note: 'ODM合作厂商' },
      { id: 'S0003', name: '苏州丝绸', category: '特种面料', address: '江苏省苏州市吴江区', contact: '吴经理', phone: '13700137003', email: 'wu@silk.com', note: '丝绸专供' },
    ],
    skipDuplicates: true,
  })

  // 5. 创建商品
  const products = await prisma.product.createMany({
    data: [
      { id: 'P00001', name: '女士连衣裙', category: '连衣裙', brand: '跳跳', size: 'M', unit: '件', color: '红色', material: '棉', costPrice: 89.5, sellPrice: 199.0, note: '夏季热销款' },
      { id: 'P00002', name: '女士连衣裙', category: '连衣裙', brand: '跳跳', size: 'L', unit: '件', color: '蓝色', material: '棉', costPrice: 89.5, sellPrice: 199.0, note: '夏季热销款' },
      { id: 'P00003', name: '女士衬衫', category: '上衣', brand: '跳跳', size: 'M', unit: '件', color: '白色', material: '棉', costPrice: 65.0, sellPrice: 149.0, note: '商务休闲' },
      { id: 'P00004', name: '女士牛仔裤', category: '裤子', brand: '跳跳', size: '28', unit: '条', color: '蓝色', material: '牛仔布', costPrice: 78.0, sellPrice: 179.0, note: '修身款' },
      { id: 'P00005', name: '女士针织衫', category: '上衣', brand: '跳跳', size: 'L', unit: '件', color: '粉色', material: '羊毛', costPrice: 95.0, sellPrice: 229.0, note: '秋冬款' },
      { id: 'P00006', name: '女士半身裙', category: '裙子', brand: '跳跳', size: 'M', unit: '件', color: '黑色', material: '聚酯纤维', costPrice: 55.0, sellPrice: 129.0, note: '百搭款' },
    ],
    skipDuplicates: true,
  })

  // 6. 创建仓库
  const warehouses = await prisma.warehouse.createMany({
    data: [
      { id: 'W1', name: '主仓库', address: '上海市浦东新区物流园区', phone: '021-12345678', note: '主要存储仓库' },
      { id: 'W2', name: '备用仓库', address: '上海市松江区工业园', phone: '021-87654321', note: '备用存储仓库' },
    ],
    skipDuplicates: true,
  })

  // 7. 创建供应商-商品关系
  const supplierProducts = await prisma.supplierProduct.createMany({
    data: [
      { supplierId: 'S0001', productId: 'P00001', lastPrice: 89.5, supplyStatus: 'active' },
      { supplierId: 'S0001', productId: 'P00002', lastPrice: 89.5, supplyStatus: 'active' },
      { supplierId: 'S0002', productId: 'P00003', lastPrice: 65.0, supplyStatus: 'active' },
      { supplierId: 'S0002', productId: 'P00004', lastPrice: 78.0, supplyStatus: 'active' },
      { supplierId: 'S0003', productId: 'P00005', lastPrice: 95.0, supplyStatus: 'active' },
      { supplierId: 'S0002', productId: 'P00006', lastPrice: 55.0, supplyStatus: 'active' },
    ],
    skipDuplicates: true,
  })

  // 8. 创建库存
  const inventory = await prisma.inventory.createMany({
    data: [
      { productId: 'P00001', warehouseId: 'W1', currentQty: 150, minQty: 50 },
      { productId: 'P00002', warehouseId: 'W1', currentQty: 120, minQty: 40 },
      { productId: 'P00003', warehouseId: 'W1', currentQty: 200, minQty: 60 },
      { productId: 'P00004', warehouseId: 'W1', currentQty: 180, minQty: 50 },
      { productId: 'P00005', warehouseId: 'W2', currentQty: 80, minQty: 30 },
      { productId: 'P00006', warehouseId: 'W2', currentQty: 100, minQty: 40 },
    ],
    skipDuplicates: true,
  })


  // 添加采购订单测试数据
  const purchaseOrders = await Promise.all([
    // 第一个采购订单
    prisma.purchaseOrder.create({
      data: {
        id: 'PO202401001',
        employeeId: 'E004', // 采购经理
        supplierId: 'S0001', // 浙江纺织厂
        orderDate: new Date('2024-01-10'),
        expectDate: new Date('2024-01-20'),
        orderStatus: 'completed',
        totalAmount: 17900,
        note: '春季新品面料采购',
        orderItems: {
          create: [
            {
              itemNo: 1,
              productId: 'P00001',
              quantity: 100,
              unitPrice: 89.5,
              note: '红色连衣裙面料',
            },
            {
              itemNo: 2,
              productId: 'P00002',
              quantity: 80,
              unitPrice: 89.5,
              note: '蓝色连衣裙面料',
            },
          ],
        },
      },
    }),

    // 第二个采购订单
    prisma.purchaseOrder.create({
      data: {
        id: 'PO202401002',
        employeeId: 'E005', // 采购专员
        supplierId: 'S0002', // 广州服装厂
        orderDate: new Date('2024-01-15'),
        expectDate: new Date('2024-01-25'),
        orderStatus: 'confirmed',
        totalAmount: 28600,
        note: '商务系列采购',
        orderItems: {
          create: [
            {
              itemNo: 1,
              productId: 'P00003',
              quantity: 150,
              unitPrice: 65.0,
              note: '白色衬衫',
            },
            {
              itemNo: 2,
              productId: 'P00004',
              quantity: 100,
              unitPrice: 78.0,
              note: '牛仔裤',
            },
            {
              itemNo: 3,
              productId: 'P00006',
              quantity: 200,
              unitPrice: 55.0,
              note: '半身裙',
            },
          ],
        },
      },
    }),

    // 第三个采购订单（待处理）
    prisma.purchaseOrder.create({
      data: {
        id: 'PO202401003',
        employeeId: 'E004',
        supplierId: 'S0003', // 苏州丝绸
        orderDate: new Date('2024-01-20'),
        expectDate: new Date('2024-02-05'),
        orderStatus: 'pending',
        totalAmount: 19000,
        note: '丝绸面料采购',
        orderItems: {
          create: [
            {
              itemNo: 1,
              productId: 'P00005',
              quantity: 200,
              unitPrice: 95.0,
              note: '羊毛针织衫',
            },
          ],
        },
      },
    }),
  ]);

  console.log('数据填充完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })