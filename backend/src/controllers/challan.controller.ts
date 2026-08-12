import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';

export class ChallanController {
  /**
   * Create a new Sales Challan (DRAFT by default)
   */
  static async createChallan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const challan = await ChallanService.createChallan(req.body, req.user.id);
      res.status(201).json({
        success: true,
        data: { challan },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * List all challans
   */
  static async getChallans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status, customerId, dateFrom, dateTo, page, limit } = req.query;
      const result = await ChallanService.getChallans({
        search: search as string,
        status: status as 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | undefined,
        customerId: customerId as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.status(200).json({
        success: true,
        results: result.items.length,
        data: { challans: result.items },
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
   * Get challan details by ID
   */
  static async getChallanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await ChallanService.getChallanById(req.params.id);
      res.status(200).json({
        success: true,
        data: { challan },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update draft challan details
   */
  static async updateChallan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await ChallanService.updateChallan(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: { challan },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Confirm a challan (Perform stock deductions)
   */
  static async confirmChallan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const challan = await ChallanService.confirmChallan(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Sales Challan confirmed and inventory updated successfully.',
        data: { challan },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Cancel a draft challan
   */
  static async cancelChallan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await ChallanService.cancelChallan(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Sales Challan cancelled successfully.',
        data: { challan },
      });
    } catch (error: any) {
      next(error);
    }
  }
}
