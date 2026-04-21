import request from '../utils/request';

export const getStats = () => {
  return request.get('/dashboard/stats');
};

export const getActivities = (limit?: number) => {
  return request.get('/dashboard/activities', { params: { limit } });
};
