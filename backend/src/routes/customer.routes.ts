import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { requireAuth, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCustomerSchema, updateCustomerSchema, createFollowUpSchema } from '../validators/customer.validator';

const router = Router();

// Apply authentication middleware globally to all customer routes
router.use(requireAuth);

router.route('/')
  .post(restrictTo('ADMIN', 'SALES'), validate(createCustomerSchema), CustomerController.create)
  .get(CustomerController.getAll);

router.route('/:id')
  .get(CustomerController.getById)
  .put(restrictTo('ADMIN', 'SALES'), validate(updateCustomerSchema), CustomerController.update)
  .delete(restrictTo('ADMIN'), CustomerController.delete);

router.route('/:id/followups')
  .post(restrictTo('ADMIN', 'SALES'), validate(createFollowUpSchema), CustomerController.createFollowUp)
  .get(CustomerController.getFollowUps);

export default router;
