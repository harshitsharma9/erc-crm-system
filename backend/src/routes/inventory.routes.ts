import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { requireAuth, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createStockMovementSchema } from '../validators/inventory.validator';

const router = Router();

// Apply authentication globally to all inventory endpoints
router.use(requireAuth);

// Summary count lists
router.get('/summary', InventoryController.getInventorySummary);

// Stock movements routes
router.route('/movements')
  .post(restrictTo('ADMIN', 'WAREHOUSE'), validate(createStockMovementSchema), InventoryController.createStockMovement)
  .get(InventoryController.getStockMovements);

export default router;
