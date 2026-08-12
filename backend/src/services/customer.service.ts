import prisma from '../config/db';
import { CreateCustomerInput, UpdateCustomerInput, CreateFollowUpInput } from '../validators/customer.validator';
import { CustomerStatus, CustomerType } from '@prisma/client';
import { AppError } from '../utils/app-error';

export class CustomerService {
  /**
   * Create a new customer
   */
  static async create(data: CreateCustomerInput, creatorId: string) {
    const { assignedToId, ...customerData } = data;

    return prisma.customer.create({
      data: {
        ...customerData,
        assignedToId: assignedToId || creatorId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async getAll(filters: { search?: string; status?: CustomerStatus; customerType?: CustomerType; page?: number; limit?: number }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.customerType) {
      where.customerType = filters.customerType;
    }

    if (filters.search) {
      where.OR = [
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { businessName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { gstNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 50, 1), 100);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  /**
   * Get a single customer by ID along with their followUps log history
   */
  static async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        followUps: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  /**
   * Update an existing customer
   */
  static async update(id: string, data: UpdateCustomerInput) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return prisma.customer.update({
      where: { id },
      data,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete a customer by ID
   */
  static async delete(id: string) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return prisma.customer.delete({
      where: { id },
    });
  }

  /**
   * Create a customer follow-up record
   */
  static async createFollowUp(customerId: string, data: CreateFollowUpInput, createdById: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const followUp = await prisma.customerFollowUp.create({
      data: {
        note: data.note,
        followUpDate: data.followUpDate,
        customerId,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Sync next followUpDate to customer profile if provided
    if (data.followUpDate) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          followUpDate: data.followUpDate,
        },
      });
    }

    return followUp;
  }

  /**
   * Get all follow-ups for a customer
   */
  static async getFollowUps(customerId: string) {
    return prisma.customerFollowUp.findMany({
      where: { customerId },
      include: {
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
