import api from './api';
import { StockMovement, ProductStockSummary } from '../types';

export interface StockMovementFilters {
  productId?: string;
  type?: 'IN' | 'OUT';
}

export const inventoryService = {
  /**
   * Get dynamic inventory levels summary counts
   */
  getInventorySummary: async () => {
    const response = await api.get<{ status: string; results: number; data: { summary: ProductStockSummary[] } }>(
      '/inventory/summary'
    );
    return response.data.data.summary;
  },

  /**
   * Get stock transaction ledger history
   */
  getStockMovements: async (filters?: StockMovementFilters) => {
    const response = await api.get<{ status: string; results: number; data: { movements: StockMovement[] } }>(
      '/inventory/movements',
      { params: filters }
    );
    return response.data.data.movements;
  },

  /**
   * Record a new stock movement (restricted to Admin/Warehouse)
   */
  createStockMovement: async (movementData: { productId: string; type: 'IN' | 'OUT'; quantity: number; reason?: string }) => {
    const response = await api.post<{ status: string; data: { movement: StockMovement } }>(
      '/inventory/movements',
      movementData
    );
    return response.data.data.movement;
  },
};
