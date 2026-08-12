import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  /**
   * Create stock movement record
   */
  static async createStockMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'fail', message: 'Not authenticated' });
        return;
      }

      const movement = await InventoryService.createStockMovement(req.body, req.user.id);
      res.status(201).json({
        success: true,
        data: { movement },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get stock movements history ledger
   */
  static async getStockMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, type } = req.query;

      const movements = await InventoryService.getStockMovements({
        productId: productId as string,
        type: type as any,
      });

      res.status(200).json({
        success: true,
        results: movements.length,
        data: { movements },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get current stock counts summary
   */
  static async getInventorySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await InventoryService.getInventorySummary();
      res.status(200).json({
        success: true,
        results: summary.length,
        data: { summary },
      });
    } catch (error: any) {
      next(error);
    }
  }
}
