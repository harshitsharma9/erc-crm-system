import { Request, Response, NextFunction } from 'express';
import { StockService } from '../services/stock.service';

export class StockController {
  /**
   * Add stock (STOCK IN)
   */
  static async stockIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const movement = await StockService.stockIn(req.body, req.user.id);
      res.status(201).json({
        success: true,
        data: { movement },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Reduce stock (STOCK OUT)
   */
  static async stockOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const movement = await StockService.stockOut(req.body, req.user.id);
      res.status(201).json({
        success: true,
        data: { movement },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get movements (all or by productId)
   */
  static async getMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const movements = await StockService.getMovements(productId);
      
      res.status(200).json({
        success: true,
        results: movements.length,
        data: { movements },
      });
    } catch (error: any) {
      next(error);
    }
  }
}
