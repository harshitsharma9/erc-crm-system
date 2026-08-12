import prisma from '../config/db';
import { CreateStockMovementInput } from '../validators/inventory.validator';
import { AppError } from '../utils/app-error';

export class InventoryService {
  /**
   * Record a new stock movement (safeguards against negative inventory counts using transactions)
   */
  static async createStockMovement(data: CreateStockMovementInput, userId: string) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError('Product not found in catalog', 404);
    }

    // Safeguard check for OUT transactions
    if (data.type === 'OUT' && product.currentStock < data.quantity) {
      throw new AppError(`Insufficient stock. Available stock count is only ${product.currentStock} units.`, 400);
    }

    // Perform inside a Prisma transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      if (data.type === 'OUT') {
        const stockUpdate = await tx.product.updateMany({
          where: { id: data.productId, currentStock: { gte: data.quantity } },
          data: { currentStock: { decrement: data.quantity } },
        });
        if (stockUpdate.count !== 1) {
          throw new AppError('Insufficient stock', 400);
        }
      } else {
        await tx.product.update({
          where: { id: data.productId },
          data: { currentStock: { increment: data.quantity } },
        });
      }

      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason || null,
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
   * Get stock movement history list with filters
   */
  static async getStockMovements(filters: { productId?: string; type?: any }) {
    const where: any = {};

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.type) {
      where.type = filters.type;
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

  /**
   * Compile dynamic stock levels summary count for all products
   */
  static async getInventorySummary() {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
        stockMovements: {
          select: {
            type: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return products.map(product => {
      let totalIn = 0;
      let totalOut = 0;

      product.stockMovements.forEach(movement => {
        if (movement.type === 'IN') {
          totalIn += movement.quantity;
        } else {
          totalOut += movement.quantity;
        }
      });

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.unitPrice,
        categoryName: product.category?.name || 'Uncategorized',
        totalIn,
        totalOut,
        currentStock: product.currentStock,
      };
    });
  }
}
