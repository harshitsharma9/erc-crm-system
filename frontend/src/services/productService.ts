import api from './api';
import { Product, Category } from '../types';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  lowStock?: boolean;
}

export const productService = {
  /**
   * Get all product categories
   */
  getCategories: async () => {
    const response = await api.get<{ status: string; results: number; data: { categories: Category[] } }>(
      '/products/categories'
    );
    return response.data.data.categories;
  },

  /**
   * Create a new product category
   */
  createCategory: async (categoryData: { name: string; description?: string }) => {
    const response = await api.post<{ status: string; data: { category: Category } }>(
      '/products/categories',
      categoryData
    );
    return response.data.data.category;
  },

  /**
   * Get all products with optional filters
   */
  getProducts: async (filters?: ProductFilters) => {
    const response = await api.get<{ status: string; results: number; data: { products: Product[] } }>(
      '/products',
      { params: filters }
    );
    return response.data.data.products;
  },

  /**
   * Get a single product by ID
   */
  getProductById: async (id: string) => {
    const response = await api.get<{ status: string; data: { product: Product } }>(`/products/${id}`);
    return response.data.data.product;
  },

  /**
   * Create a new product (restricted to Admin/Warehouse)
   */
  createProduct: async (productData: Omit<Partial<Product>, 'id' | 'createdAt' | 'updatedAt' | 'category'>) => {
    const response = await api.post<{ status: string; data: { product: Product } }>('/products', productData);
    return response.data.data.product;
  },

  /**
   * Update an existing product (restricted to Admin/Warehouse)
   */
  updateProduct: async (id: string, productData: Partial<Product>) => {
    const response = await api.put<{ status: string; data: { product: Product } }>(`/products/${id}`, productData);
    return response.data.data.product;
  },

  /**
   * Delete a product (restricted to Admin only)
   */
  deleteProduct: async (id: string) => {
    const response = await api.delete<{ status: string; data: null }>(`/products/${id}`);
    return response.data;
  },

  /**
   * Get all products with low stock counts
   */
  getLowStock: async () => {
    const response = await api.get<{ status: string; results: number; data: { products: Product[] } }>(
      '/products/low-stock'
    );
    return response.data.data.products;
  },
};
