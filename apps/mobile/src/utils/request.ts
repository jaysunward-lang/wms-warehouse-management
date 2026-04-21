import axios from 'axios';
import { showToast } from 'vant';

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const { code, message } = response.data;
    
    if (code !== 200 && code !== 201) {
      showToast(message || '请求失败');
      return Promise.reject(new Error(message));
    }
    
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          showToast('登录已过期，请重新登录');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          showToast('没有权限执行此操作');
          break;
        case 404:
          showToast(data?.message || '请求的资源不存在');
          break;
        case 500:
          showToast('服务器内部错误');
          break;
        default:
          showToast(data?.message || '请求失败');
      }
    } else {
      showToast('网络错误，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default request;
