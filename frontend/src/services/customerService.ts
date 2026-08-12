import api from './api';
import { Customer } from '../types';

export interface CustomerFilters {
  search?: string;
  status?: string;
  customerType?: string;
}

export const customerService = {
  /**
   * Get all customers with optional search & status filters
   */
  getCustomers: async (filters?: CustomerFilters) => {
    const response = await api.get<{ success: boolean; data: Customer[] }>(
      '/customers',
      { params: filters }
    );
    return response.data.data;
  },

  /**
   * Get a single customer by ID (includes activities history)
   */
  getCustomerById: async (id: string) => {
    const response = await api.get<{ status: string; data: { customer: Customer } }>(`/customers/${id}`);
    return response.data.data.customer;
  },

  /**
   * Create a new customer
   */
  createCustomer: async (customerData: Omit<Partial<Customer>, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<{ status: string; data: { customer: Customer } }>('/customers', customerData);
    return response.data.data.customer;
  },

  /**
   * Update an existing customer
   */
  updateCustomer: async (id: string, customerData: Partial<Customer>) => {
    const response = await api.put<{ status: string; data: { customer: Customer } }>(`/customers/${id}`, customerData);
    return response.data.data.customer;
  },

  /**
   * Delete a customer (restricted to Admin/Manager)
   */
  deleteCustomer: async (id: string) => {
    const response = await api.delete<{ status: string; data: null }>(`/customers/${id}`);
    return response.data;
  },

  /**
   * Create a customer follow-up record
   */
  createFollowUp: async (id: string, followUpData: { note: string; followUpDate?: string | null }) => {
    const response = await api.post<{ status: string; data: { followUp: any } }>(
      `/customers/${id}/followups`,
      followUpData
    );
    return response.data.data.followUp;
  },
};
