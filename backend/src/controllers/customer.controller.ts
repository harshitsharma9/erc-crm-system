import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
  /**
   * Create customer
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'fail', message: 'Not authenticated' });
        return;
      }
      
      const customer = await CustomerService.create(req.body, req.user.id);
      res.status(201).json({
        success: true,
        data: { customer },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get all customers
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status, customerType, page, limit } = req.query;
      
      const parsedPage = page ? parseInt(page as string) : undefined;
      const parsedLimit = limit ? parseInt(limit as string) : undefined;

      const result = await CustomerService.getAll({
        search: search as string,
        status: status as any,
        customerType: customerType as any,
        page: parsedPage,
        limit: parsedLimit,
      });

      res.status(200).json({
        success: true,
        data: result.items,
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
   * Get customer by ID
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: { customer },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update customer
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: { customer },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete customer
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CustomerService.delete(req.params.id);
      res.status(204).json({
        success: true,
        data: null,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Create customer follow-up interaction note
   */
  static async createFollowUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'fail', message: 'Not authenticated' });
        return;
      }

      const followUp = await CustomerService.createFollowUp(req.params.id, req.body, req.user.id);
      res.status(201).json({
        success: true,
        data: { followUp },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get all follow-ups for a customer
   */
  static async getFollowUps(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const followUps = await CustomerService.getFollowUps(req.params.id);
      res.status(200).json({
        status: 'success',
        results: followUps.length,
        data: { followUps },
      });
    } catch (error: any) {
      next(error);
    }
  }
}
