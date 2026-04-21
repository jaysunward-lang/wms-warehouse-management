import request from '../utils/request';

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
