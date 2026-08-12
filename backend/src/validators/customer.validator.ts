import { z } from 'zod';
import { CustomerStatus, CustomerType } from '@prisma/client';

export const createCustomerSchema = z.object({
  customerName: z.string().min(2, { message: 'Customer name must be at least 2 characters long' }),
  mobile: z.string().optional().nullable().or(z.literal('')),
  email: z.string().email({ message: 'Invalid email address' }).optional().nullable().or(z.literal('')),
  businessName: z.string().optional().nullable().or(z.literal('')),
  gstNumber: z.string().optional().nullable().or(z.literal('')),
  customerType: z.nativeEnum(CustomerType).optional(),
  address: z.string().optional().nullable().or(z.literal('')),
  status: z.nativeEnum(CustomerStatus).optional(),
  followUpDate: z.preprocess(
    (arg) => (typeof arg === 'string' && arg !== '' ? new Date(arg) : arg),
    z.date().optional().nullable()
  ),
  notes: z.string().optional().nullable().or(z.literal('')),
  assignedToId: z.string().uuid({ message: 'Invalid representative user ID' }).optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  note: z.string().min(1, { message: 'Note content is required' }),
  followUpDate: z.preprocess(
    (arg) => (typeof arg === 'string' && arg !== '' ? new Date(arg) : arg),
    z.date().optional().nullable()
  ),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
