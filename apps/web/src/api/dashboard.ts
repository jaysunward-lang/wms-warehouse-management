import request from '../utils/request';

export const getStats = () => {
  return request.get('/dashboard/stats');
};

export const getCharts = () => {
  return request.get('/dashboard/charts');
};

export const getAlerts = () => {
  return request.get('/dashboard/alerts');
};

export const getActivities = (limit?: number) => {
  return request.get('/dashboard/activities', { params: { limit } });
};
