import request from '../utils/request';

export const getInboundList = (params?: {
  materialId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get('/inbound', { params });
};

export const getInboundDetail = (id: number) => {
  return request.get(`/inbound/${id}`);
};

export const materialInbound = (data: {
  materialId: number;
  quantity: number;
  location: string;
  warehouseZone?: string;
  shelfNo?: string;
  batchNo?: string;
  source?: string;
  type?: 'purchase' | 'return' | 'transfer' | 'other';
  remark?: string;
}) => {
  return request.post('/inbound/material', data);
};

export const excessInbound = (data: {
  excessId: number;
  location: string;
  warehouseZone?: string;
  shelfNo?: string;
  remark?: string;
}) => {
  return request.post('/inbound/excess', data);
};

export const deleteInbound = (id: number) => {
  return request.delete(`/inbound/${id}`);
};
