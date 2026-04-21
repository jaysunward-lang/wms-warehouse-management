import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export const successResponse = <T>(res: Response, data: T, message = 'success', code = 200) => {
  return res.status(code).json({
    code,
    message,
    data,
    timestamp: Date.now()
  });
};

export const errorResponse = (res: Response, message: string, code = 500, statusCode = 500) => {
  return res.status(statusCode).json({
    code,
    message,
    data: null,
    timestamp: Date.now()
  });
};

export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  },
  message = 'success'
) => {
  return res.status(200).json({
    code: 200,
    message,
    data: {
      list: data,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.pageSize)
      }
    },
    timestamp: Date.now()
  });
};
