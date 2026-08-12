import prisma from '../config/db';
import { RecordStockInput } from '../validators/stock.validator';
import { AppError } from '../utils/app-error';

export class StockService {
  /**
   * Add stock (STOCK IN)
   */
  static async stockIn(data: RecordStockInput, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Check product
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // 1. Create StockMovement
      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: 'IN',
          quantity: data.quantity,
          reason: data.reason || 'Manual Stock In',
          createdById: userId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // 2. Increment Product currentStock
      await tx.product.update({
        where: { id: data.productId },
        data: {
          currentStock: {
            increment: data.quantity,
          },
        },
      });

      return movement;
    });
  }

  /**
   * Reduce stock (STOCK OUT)
   */
  static async stockOut(data: RecordStockInput, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Check product
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Check available stock
      if (product.currentStock < data.quantity) {
        throw new AppError('Insufficient stock', 400);
      }

      // Atomically reserve stock so concurrent requests cannot make it negative.
      const stockUpdate = await tx.product.updateMany({
        where: { id: data.productId, currentStock: { gte: data.quantity } },
        data: { currentStock: { decrement: data.quantity } },
      });
      if (stockUpdate.count !== 1) {
        throw new AppError('Insufficient stock', 400);
      }

      // Create stock movement only after the conditional decrement succeeds.
      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: 'OUT',
          quantity: data.quantity,
          reason: data.reason || 'Manual Stock Out',
          createdById: userId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return movement;
    });
  }

  /**
   * Get all movements or movements for a specific product
   */
  static async getMovements(productId?: string) {
    const where: any = {};
    if (productId) {
      where.productId = productId;
    }

    return prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
