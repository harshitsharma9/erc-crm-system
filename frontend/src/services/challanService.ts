import api from './api';
import { SalesChallan } from '../types';

export interface CreateChallanInput {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export const challanService = {
  /**
   * List all Sales Challans
   */
  getChallans: async () => {
    const response = await api.get<{ success: boolean; results: number; data: { challans: SalesChallan[] } }>(
      '/challans'
    );
    return response.data.data.challans;
  },

  /**
   * Get Challan details (and snapshot line items) by ID
   */
  getChallanById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: { challan: SalesChallan } }>(
      `/challans/${id}`
    );
    return response.data.data.challan;
  },

  /**
   * Create a new Challan (status DRAFT by default)
   */
  createChallan: async (data: CreateChallanInput) => {
    const response = await api.post<{ success: boolean; data: { challan: SalesChallan } }>(
      '/challans',
      data
    );
    return response.data.data.challan;
  },

  /**
   * Confirm a Challan (Atomic stock adjustment check)
   */
  confirmChallan: async (id: string) => {
    const response = await api.post<{ success: boolean; message: string; data: { challan: SalesChallan } }>(
      `/challans/${id}/confirm`
    );
    return response.data;
  },

  /**
   * Cancel a draft Challan record
   */
  cancelChallan: async (id: string) => {
    const response = await api.post<{ success: boolean; message: string; data: { challan: SalesChallan } }>(
      `/challans/${id}/cancel`
    );
    return response.data;
  },
};
