import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import pool from '../config/postgres';

export class AuthController {
  /**
   * Register handler
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Login handler
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token: result.token,
        data: { user: result.user },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get current user profile handler (Requires authentication)
   */
  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const result = await pool.query(
        'SELECT id, email, name, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1',
        [req.user.id]
      );
      const user = result.rows[0];

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      next(error);
    }
  }
}
