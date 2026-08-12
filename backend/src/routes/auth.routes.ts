import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { requireAuth, restrictTo } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), AuthController.login);

// Admin-only routes
router.post('/register', requireAuth, restrictTo('ADMIN'), validate(registerSchema), AuthController.register);

// Private authenticated routes
router.get('/me', requireAuth, AuthController.me);

export default router;
