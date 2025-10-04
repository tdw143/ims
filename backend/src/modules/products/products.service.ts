// src/modules/products/products.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // 检查商品编号是否已存在
    const existingProduct = await this.prisma.product.findUnique({
      where: { id: createProductDto.id },
    });

    if (existingProduct) {
      throw new ConflictException('商品编号已存在');
    }

    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(query: ProductQueryDto) {
    const { name, category, brand, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive' as any,
      };
    }

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          inventory: {
            include: {
              warehouse: {
                select: {
                  name: true,
                },
              },
            },
          },
          supplierProducts: {
            include: {
              supplier: {
                select: {
                  name: true,
                  contact: true,
                },
              },
            },
            take: 5,
          },
        },
        skip,
        take: limit,
        orderBy: {
          id: 'asc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            warehouse: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
        supplierProducts: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                contact: true,
                phone: true,
              },
            },
          },
        },
        purchaseOrderItems: {
          include: {
            purchaseOrder: {
              select: {
                id: true,
                orderDate: true,
                supplier: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            purchaseOrder: {
              orderDate: 'desc',
            },
          },
          take: 10,
        },
        salesOrderItems: {
          include: {
            salesOrder: {
              select: {
                id: true,
                orderDate: true,
                customer: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            salesOrder: {
              orderDate: 'desc',
            },
          },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`商品 ${id} 不存在`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`商品 ${id} 不存在`);
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
        supplierProducts: true,
        purchaseOrderItems: true,
        salesOrderItems: true,
        inboundOrderItems: true,
        outboundOrderItems: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`商品 ${id} 不存在`);
    }

    if (product.inventory.length > 0 || 
        product.purchaseOrderItems.length > 0 || 
        product.salesOrderItems.length > 0) {
      throw new ConflictException('该商品有关联的库存或订单记录，无法删除');
    }

    return this.prisma.$transaction(async (tx) => {
      // 删除供应商-商品关系
      if (product.supplierProducts.length > 0) {
        await tx.supplierProduct.deleteMany({
          where: { productId: id },
        });
      }

      // 删除商品
      return tx.product.delete({
        where: { id },
      });
    });
  }

  async getProductStats(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
        purchaseOrderItems: {
          select: {
            quantity: true,
            unitPrice: true,
            purchaseOrder: {
              select: {
                orderDate: true,
              },
            },
          },
        },
        salesOrderItems: {
          select: {
            quantity: true,
            unitPrice: true,
            salesOrder: {
              select: {
                orderDate: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`商品 ${id} 不存在`);
    }

    const totalStock = product.inventory.reduce((sum, item) => sum + item.currentQty, 0);
    const totalPurchased = product.purchaseOrderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalSold = product.salesOrderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPurchaseAmount = product.purchaseOrderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalSalesAmount = product.salesOrderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    return {
      productId: id,
      productName: product.name,
      totalStock,
      totalPurchased,
      totalSold,
      totalPurchaseAmount,
      totalSalesAmount,
      grossProfit: totalSalesAmount - totalPurchaseAmount,
      stockValue: totalStock * (product.costPrice || 0),
    };
  }

  async searchProducts(keyword: string) {
    if (!keyword || keyword.length < 2) {
      throw new Error('搜索关键词至少需要2个字符');
    }

    return this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keyword,
              mode: 'insensitive' as any,
            },
          },
          {
            brand: {
              contains: keyword,
              mode: 'insensitive' as any,
            },
          },
          {
            category: {
              contains: keyword,
              mode: 'insensitive' as any,
            },
          },
        ],
      },
      take: 20,
    });
  }

  async getProductsByCategory(category: string) {
    return this.prisma.product.findMany({
      where: { category },
      include: {
        inventory: {
          include: {
            warehouse: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getCategories() {
    const categories = await this.prisma.product.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    return categories.map(item => ({
      category: item.category,
      productCount: item._count.id,
    }));
  }
}