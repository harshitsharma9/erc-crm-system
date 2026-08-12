import prisma from '../config/db';
import { CreateChallanInput, UpdateChallanInput } from '../validators/challan.validator';
import { AppError } from '../utils/app-error';

export class ChallanService {
  /**
   * Create a new sales challan (as DRAFT) with product snapshots
   */
  static async createChallan(data: CreateChallanInput, userId: string) {
    // Generate serialized challan number (CH-000001, CH-000002...)
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      const lastChallan = await tx.salesChallan.findFirst({
        orderBy: { challanNumber: 'desc' },
      });

      let nextNum = 1;
      if (lastChallan) {
        const parts = lastChallan.challanNumber.split('-');
        if (parts.length === 2) {
          const parsed = parseInt(parts[1]);
          if (!isNaN(parsed)) {
            nextNum = parsed + 1;
          }
        }
      }

      const challanNumber = `CH-${String(nextNum).padStart(6, '0')}`;

      // Build items with snapshots
      let totalQuantity = 0;
      const itemsToCreate = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(`Product not found: ${item.productId}`, 404);
        }

        const totalPrice = product.unitPrice * item.quantity;
        totalQuantity += item.quantity;

        itemsToCreate.push({
          productId: item.productId,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
          totalPrice,
        });
      }

      // Create Challan & Nested items
      return tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: data.customerId,
          totalQuantity,
          status: 'DRAFT',
          createdById: userId,
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          customer: {
            select: {
              customerName: true,
              businessName: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          items: true,
        },
      });
    });
  }

  /**
   * Get all challans list
   */
  static async getChallans(filters: {
    search?: string;
    status?: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
    customerId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.search) {
      where.OR = [
        { challanNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { customerName: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { businessName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 50, 1), 100);
    const [total, items] = await Promise.all([prisma.salesChallan.count({ where }), prisma.salesChallan.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: {
          select: {
            customerName: true,
            businessName: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get a single challan by ID with nested snapshot items
   */
  static async getChallanById(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        items: true,
      },
    });

    if (!challan) {
      throw new AppError('Sales Challan not found', 404);
    }

    return challan;
  }

  /**
   * Update details of a draft challan
   */
  static async updateChallan(id: string, data: UpdateChallanInput) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
    });

    if (!challan) {
      throw new AppError('Sales Challan not found', 404);
    }

    if (challan.status !== 'DRAFT') {
      throw new AppError('Cannot update confirmed or cancelled challan records', 400);
    }

    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) throw new AppError('Customer not found', 404);
    }

    return prisma.salesChallan.update({
      where: { id },
      data,
      include: {
        items: true,
      },
    });
  }

  /**
   * Confirm a challan (Atomic Stock reduction transaction)
   */
  static async confirmChallan(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw new AppError('Sales Challan not found', 404);
      }

      if (challan.status !== 'DRAFT') {
        throw new AppError(`Cannot confirm challan with status ${challan.status}`, 400);
      }

      // Check stock levels and reduce inventory
      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(`Product ${item.productName} no longer exists in catalog`, 404);
        }

        if (product.currentStock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`,
            400,
          );
        }

        // 1. Atomically decrement only when the current database value remains sufficient.
        const stockUpdate = await tx.product.updateMany({
          where: { id: item.productId, currentStock: { gte: item.quantity } },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new AppError(`Insufficient stock for product ${product.name}`, 400);
        }

        // 2. Create audit OUT movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Sales Challan ${challan.challanNumber}`,
            createdById: userId,
          },
        });
      }

      // 3. Confirm Challan status
      return tx.salesChallan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          customer: true,
          items: true,
        },
      });
    });
  }

  /**
   * Cancel a draft challan
   */
  static async cancelChallan(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
    });

    if (!challan) {
      throw new AppError('Sales Challan not found', 404);
    }

    if (challan.status !== 'DRAFT') {
      throw new AppError('Only draft challan records can be cancelled', 400);
    }

    return prisma.salesChallan.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        customer: true,
      },
    });
  }
}
