import axios from 'axios';

const API_BASE_URL = 'https://prop-mgmt-api-654390198284.us-central1.run.app';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Property {
  property_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  property_type: string;
  tenant_name: string | null;
  monthly_rent: number;
}

export interface Income {
  income_id: number;
  amount: number;
  date: string;
  description: string | null;
}

export interface Expense {
  expense_id: number;
  amount: number;
  date: string;
  category: string;
  vendor: string | null;
  description: string | null;
}

export interface Tenant {
  tenant_name: string;
  property_name: string;
}

export const propertyService = {
  getAll: () => api.get<Property[]>('/properties'),
  getOne: (id: number | string) => api.get<Property>(`/properties/${id}`),
  create: (data: Property) => api.post('/properties', data),
  delete: (id: number | string) => api.delete(`/properties/${id}`),
};

export const incomeService = {
  getByProperty: (propertyId: number | string) => api.get<Income[]>(`/income/${propertyId}`),
  create: (propertyId: number | string, data: Income) => api.post(`/income/${propertyId}`, data),
  delete: (id: number | string) => api.delete(`/income/${id}`),
};

export const expenseService = {
  getByProperty: (propertyId: number | string) => api.get<Expense[]>(`/expenses/${propertyId}`),
  create: (propertyId: number | string, data: Expense) => api.post(`/expenses/${propertyId}`, data),
  delete: (id: number | string) => api.delete(`/expenses/${id}`),
};

export const tenantService = {
  getAll: () => api.get<Tenant[]>('/tenants'),
};

export default api;
