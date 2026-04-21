import request from '../utils/request';

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

export const getOutboundDetail = (id: number) => {
  return request.get(`/outbound/${id}`);
};

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

export const excessOutbound = (data: {
  excessId: number;
  quantity: number;
  destination?: string;
  reason?: string;
  remark?: string;
}) => {
  return request.post('/outbound/excess', data);
};

export const deleteOutbound = (id: number) => {
  return request.delete(`/outbound/${id}`);
};
