import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  userId: number;
  username: string;
  password: string;
  realName: string;
  phone?: string;
  status: number;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'userId' | 'status' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public userId!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public phone?: string;
  public status!: number;
  public lastLoginAt?: Date;
  public lastLoginIp?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'user_id'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'username'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password'
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'real_name',
      comment: '操作员名字'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'phone'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      field: 'status',
      comment: '状态: 1启用 0禁用'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at'
    },
    lastLoginIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'last_login_ip'
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['username'] },
      { fields: ['real_name'] },
      { fields: ['status'] }
    ]
  }
);

export default User;
