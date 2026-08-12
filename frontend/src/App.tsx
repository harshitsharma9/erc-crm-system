import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

// Restructured Sub-pages Imports
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerCreate } from './pages/customers/CustomerCreate';
import { CustomerEdit } from './pages/customers/CustomerEdit';
import { CustomerDetails } from './pages/customers/CustomerDetails';

import { ProductList } from './pages/products/ProductList';
import { ProductCreate } from './pages/products/ProductCreate';
import { ProductEdit } from './pages/products/ProductEdit';

import { Inventory } from './pages/inventory/Inventory';

import { ChallanList } from './pages/challans/ChallanList';
import { CreateChallan } from './pages/challans/CreateChallan';
import { ChallanDetails } from './pages/challans/ChallanDetails';

import { Accounts } from './pages/accounts/Accounts';
import { NotFound } from './pages/NotFound';
import { RoleRoute } from './components/RoleRoute';

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Base Redirection */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Auth Layout Wrapper */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Dashboard Layout Wrapper */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<RoleRoute allowedRoles={['ADMIN']}><Register /></RoleRoute>} />
            
            {/* Customer subpages */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/create" element={<RoleRoute allowedRoles={['ADMIN', 'SALES']}><CustomerCreate /></RoleRoute>} />
            <Route path="/customers/edit/:id" element={<RoleRoute allowedRoles={['ADMIN', 'SALES']}><CustomerEdit /></RoleRoute>} />
            <Route path="/customers/details/:id" element={<CustomerDetails />} />
            
            {/* Product subpages */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/create" element={<RoleRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><ProductCreate /></RoleRoute>} />
            <Route path="/products/edit/:id" element={<RoleRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><ProductEdit /></RoleRoute>} />
            
            {/* Inventory subpages */}
            <Route path="/inventory" element={<RoleRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><Inventory /></RoleRoute>} />
            
            {/* Challans subpages */}
            <Route path="/challans" element={<ChallanList />} />
            <Route path="/challans/create" element={<RoleRoute allowedRoles={['ADMIN', 'SALES']}><CreateChallan /></RoleRoute>} />
            <Route path="/challans/details/:id" element={<ChallanDetails />} />

            {/* Accounts Page */}
            <Route path="/accounts" element={<RoleRoute allowedRoles={['ADMIN', 'ACCOUNTS']}><Accounts /></RoleRoute>} />
          </Route>

          {/* Catch-all redirect to NotFound */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
