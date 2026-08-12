import prisma from '../config/db';
import { CreateCategoryInput, CreateProductInput, UpdateProductInput } from '../validators/product.validator';
import { AppError } from '../utils/app-error';

export class ProductService {
  /**
   * Create a product category
   */
  static async createCategory(data: CreateCategoryInput) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new AppError('Category name already exists', 409);
    }

    return prisma.category.create({
      data,
    });
  }

  /**
   * Get all product categories
   */
  static async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductInput) {
    // Check if SKU is unique
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku.toUpperCase() },
    });

    if (existingProduct) {
      throw new AppError('Product SKU already exists', 409);
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError('Associated category not found', 404);
    }

    return prisma.product.create({
      data: {
        ...data,
        sku: data.sku.toUpperCase(),
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Get all products with search and category filters
   */
  static async getProducts(filters: { search?: string; categoryId?: string; lowStock?: boolean; page?: number; limit?: number }) {
    const where: any = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const filtered = filters.lowStock ? products.filter((product) => product.currentStock <= product.minimumStock) : products;
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 50, 1), 100);
    const total = filtered.length;
    return {
      items: filtered.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, data: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (data.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku.toUpperCase() },
      });
      if (existingSku && existingSku.id !== id) {
        throw new AppError('Product SKU already exists', 409);
      }
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new AppError('Associated category not found', 404);
      }
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        sku: data.sku ? data.sku.toUpperCase() : undefined,
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Get all products with low stock counts (currentStock <= minimumStock)
   */
  static async getLowStock() {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return products.filter(p => p.currentStock <= p.minimumStock);
  }
}
