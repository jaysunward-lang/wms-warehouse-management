import request from '../utils/request';

export const getShelfRecordList = (params?: {
  materialId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get('/shelf', { params });
};

export const getShelfRecordDetail = (id: number) => {
  return request.get(`/shelf/${id}`);
};

export const shelfUp = (data: {
  materialId: number;
  quantity: number;
  toLocation: string;
  warehouseZone?: string;
  shelfNo?: string;
  relatedType?: 'inbound' | 'adjust';
  relatedId?: number;
  remark?: string;
}) => {
  return request.post('/shelf/up', data);
};

export const shelfDown = (data: {
  materialId: number;
  quantity: number;
  fromLocation: string;
  relatedType?: 'outbound' | 'adjust';
  relatedId?: number;
  remark?: string;
}) => {
  return request.post('/shelf/down', data);
};

export const shelfTransfer = (data: {
  materialId: number;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  warehouseZone?: string;
  shelfNo?: string;
  remark?: string;
}) => {
  return request.post('/shelf/transfer', data);
};

export const shelfAdjust = (data: {
  materialId: number;
  quantity: number;
  location: string;
  reason: string;
  remark?: string;
}) => {
  return request.post('/shelf/adjust', data);
};

export const getLocations = () => {
  return request.get('/shelf/locations');
};
