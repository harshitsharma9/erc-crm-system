import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  /**
   * Create product category
   */
  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await ProductService.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: { category },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get all product categories
   */
  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await ProductService.getCategories();
      res.status(200).json({
        success: true,
        results: categories.length,
        data: { categories },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Create product
   */
  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: { product },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get all products with search and category filters
   */
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, categoryId, lowStock, page, limit } = req.query;

      const result = await ProductService.getProducts({
        search: search as string,
        categoryId: categoryId as string,
        lowStock: lowStock === 'true',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json({
        success: true,
        results: result.items.length,
        data: { products: result.items },
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.status(200).json({
        success: true,
        data: { product },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update product
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: { product },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ProductService.deleteProduct(req.params.id);
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get low stock products
   */
  static async getLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await ProductService.getLowStock();
      res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products },
      });
    } catch (error: any) {
      next(error);
    }
  }
}
