import { z } from 'zod';

export const createChallanSchema = z.object({
  customerId: z.string().uuid({ message: 'Invalid customer ID' }),
  items: z.array(
    z.object({
      productId: z.string().uuid({ message: 'Invalid product ID' }),
      quantity: z.number().int({ message: 'Quantity must be an integer' }).positive({ message: 'Quantity must be greater than zero' }),
    })
  ).min(1, { message: 'Sales Challan must contain at least one item' }),
}).superRefine((data, context) => {
  const productIds = new Set<string>();
  data.items.forEach((item, index) => {
    if (productIds.has(item.productId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items', index, 'productId'],
        message: 'Each product can appear only once in a sales challan',
      });
    }
    productIds.add(item.productId);
  });
});

export const updateChallanSchema = z.object({
  customerId: z.string().uuid().optional(),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;
