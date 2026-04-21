import request from '../utils/request';

export const getMaterialStockList = (params?: {
  keyword?: string;
  category?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get('/inventory/materials', { params });
};

export const getMaterialDetail = (id: number) => {
  return request.get(`/inventory/materials/${id}`);
};

export const createMaterial = (data: {
  materialCode: string;
  materialName: string;
  category?: string;
  spec?: string;
  unit?: string;
  barcode?: string;
  description?: string;
}) => {
  return request.post('/inventory/materials', data);
};

export const updateMaterial = (id: number, data: Partial<{
  materialCode: string;
  materialName: string;
  category?: string;
  spec?: string;
  unit?: string;
  barcode?: string;
  description?: string;
}>) => {
  return request.put(`/inventory/materials/${id}`, data);
};

export const deleteMaterial = (id: number) => {
  return request.delete(`/inventory/materials/${id}`);
};

export const getExcessStockList = (params?: {
  keyword?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get('/inventory/excess', { params });
};

export const getExcessStockDetail = (id: number) => {
  return request.get(`/inventory/excess/${id}`);
};

export const createExcessStock = (data: {
  materialId: number;
  quantity: number;
  location?: string;
  reason?: string;
}) => {
  return request.post('/inventory/excess', data);
};

export const updateExcessStock = (id: number, data: {
  quantity?: number;
  location?: string;
  reason?: string;
  status?: 'pending' | 'stored' | 'cleared';
}) => {
  return request.put(`/inventory/excess/${id}`, data);
};

export const searchInventory = (keyword: string, type: 'material' | 'excess' = 'material') => {
  return request.get('/inventory/search', { params: { keyword, type } });
};

export const getLowStockAlerts = () => {
  return request.get('/inventory/low-stock');
};
