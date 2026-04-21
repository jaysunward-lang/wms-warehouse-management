import request from '../utils/request';

export const materialOutbound = (data: {
  materialId: number;
  quantity: number;
  location: string;
  batchNo?: string;
  destination?: string;
  type?: 'sale' | 'use' | 'transfer' | 'scrap' | 'other';
  reason?: string;
  remark?: string;
}) => {
  return request.post('/outbound/material', data);
};

export const getOutboundList = (params?: {
  materialId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get('/outbound', { params });
};
