import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { requireAuth, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createChallanSchema, updateChallanSchema } from '../validators/challan.validator';

const router = Router();

// Apply authentication globally to all challan routes
router.use(requireAuth);

router.route('/')
  .post(restrictTo('ADMIN', 'SALES'), validate(createChallanSchema), ChallanController.createChallan)
  .get(ChallanController.getChallans);

router.route('/:id')
  .get(ChallanController.getChallanById)
  .put(restrictTo('ADMIN', 'SALES'), validate(updateChallanSchema), ChallanController.updateChallan);

router.post('/:id/confirm', restrictTo('ADMIN', 'SALES'), ChallanController.confirmChallan);
router.post('/:id/cancel', restrictTo('ADMIN', 'SALES'), ChallanController.cancelChallan);

export default router;
