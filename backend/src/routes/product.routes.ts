import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { requireAuth, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { 
  createCategorySchema, 
  createProductSchema, 
  updateProductSchema 
} from '../validators/product.validator';

const router = Router();

// Apply authentication globally to all product & category routes
router.use(requireAuth);

// Categories Endpoints
router.route('/categories')
  .post(restrictTo('ADMIN', 'WAREHOUSE'), validate(createCategorySchema), ProductController.createCategory)
  .get(ProductController.getCategories);

// Base Products Endpoints
router.route('/')
  .post(restrictTo('ADMIN', 'WAREHOUSE'), validate(createProductSchema), ProductController.createProduct)
  .get(ProductController.getProducts);

// Low Stock Products
router.get('/low-stock', ProductController.getLowStock);

// ID Specific Product Endpoints
router.route('/:id')
  .get(ProductController.getProductById)
  .put(restrictTo('ADMIN', 'WAREHOUSE'), validate(updateProductSchema), ProductController.updateProduct)
  .delete(restrictTo('ADMIN'), ProductController.deleteProduct);

export default router;
