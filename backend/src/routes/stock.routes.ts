import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { requireAuth, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { recordStockSchema } from '../validators/stock.validator';

const router = Router();

// Apply authentication globally to all stock routes
router.use(requireAuth);

router.post('/in', restrictTo('ADMIN', 'WAREHOUSE'), validate(recordStockSchema), StockController.stockIn);
router.post('/out', restrictTo('ADMIN', 'WAREHOUSE'), validate(recordStockSchema), StockController.stockOut);

router.get('/movements', StockController.getMovements);
router.get('/movements/:productId', StockController.getMovements);

export default router;
