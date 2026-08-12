import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, { message: 'Category name must be at least 2 characters long' }),
  description: z.string().optional().nullable().or(z.literal('')),
});

export const createProductSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters long' }),
  sku: z.string().min(2, { message: 'SKU must be at least 2 characters long' }),
  description: z.string().optional().nullable().or(z.literal('')),
  unitPrice: z.number().positive({ message: 'Unit price must be a positive number' }),
  minimumStock: z.number().int().nonnegative().optional(),
  warehouseLocation: z.string().optional().nullable().or(z.literal('')),
  categoryId: z.string().uuid({ message: 'Invalid category ID' }),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
