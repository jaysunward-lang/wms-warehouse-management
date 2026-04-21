import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OperationLogAttributes {
  logId: number;
  userId?: number;
  action: string;
  module: string;
  description?: string;
  requestData?: object;
  responseData?: object;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'logId' | 'createdAt'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public logId!: number;
  public userId?: number;
  public action!: string;
  public module!: string;
  public description?: string;
  public requestData?: object;
  public responseData?: object;
  public ipAddress?: string;
  public userAgent?: string;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    logId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'log_id'
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'action',
      comment: '操作动作'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'module',
      comment: '操作模块'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
      comment: '操作描述'
    },
    requestData: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'request_data',
      comment: '请求数据'
    },
    responseData: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'response_data',
      comment: '响应数据'
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
      comment: 'IP地址'
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'user_agent',
      comment: '用户代理'
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['module'] },
      { fields: ['created_at'] }
    ]
  }
);

export default OperationLog;
