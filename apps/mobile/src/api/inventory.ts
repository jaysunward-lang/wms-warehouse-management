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

export const searchInventory = (keyword: string) => {
  return request.get('/inventory/search', { params: { keyword } });
};

export const getExcessStockList = (params?: {
  keyword?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get('/inventory/excess', { params });
};
