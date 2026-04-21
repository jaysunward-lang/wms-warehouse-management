import request from '../utils/request';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  realName: string;
  phone?: string;
}

export const login = (data: LoginData) => {
  return request.post('/auth/login', data);
};

export const register = (data: RegisterData) => {
  return request.post('/auth/register', data);
};

export const getProfile = () => {
  return request.get('/auth/profile');
};
