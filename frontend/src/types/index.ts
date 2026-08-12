export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';

export interface CustomerFollowUp {
  id: string;
  note: string;
  followUpDate: string | null;
  customerId: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobile: string | null;
  email: string | null;
  businessName: string | null;
  gstNumber: string | null;
  customerType: CustomerType;
  address: string | null;
  status: CustomerStatus;
  followUpDate: string | null;
  notes: string | null;
  assignedToId: string | null;
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  followUps?: CustomerFollowUp[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string | null;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface ProductStockSummary {
  id: string;
  name: string;
  sku: string;
  price: number;
  categoryName: string;
  totalIn: number;
  totalOut: number;
  currentStock: number;
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  totalQuantity: number;
  status: ChallanStatus;
  customerId: string;
  customer?: Customer;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
  items?: SalesChallanItem[];
  createdAt: string;
  updatedAt: string;
}
