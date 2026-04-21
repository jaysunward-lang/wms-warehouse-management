import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ExcessStockAttributes {
  excessId: number;
  materialId: number;
  quantity: number;
  location?: string;
  reason?: string;
  status: 'pending' | 'stored' | 'cleared';
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExcessStockCreationAttributes extends Optional<ExcessStockAttributes, 'excessId' | 'quantity' | 'status' | 'createdAt' | 'updatedAt'> {}

class ExcessStock extends Model<ExcessStockAttributes, ExcessStockCreationAttributes> implements ExcessStockAttributes {
  public excessId!: number;
  public materialId!: number;
  public quantity!: number;
  public location?: string;
  public reason?: string;
  public status!: 'pending' | 'stored' | 'cleared';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExcessStock.init(
  {
    excessId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'excess_id'
    },
    materialId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'material_id',
      references: {
        model: 'materials',
        key: 'material_id'
      }
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      field: 'quantity',
      comment: '多余库存数量'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'location',
      comment: '存放位置'
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'reason',
      comment: '产生原因'
    },
    status: {
      type: DataTypes.ENUM('pending', 'stored', 'cleared'),
      defaultValue: 'pending',
      field: 'status',
      comment: '状态: pending待处理 stored已入库 cleared已清理'
    }
  },
  {
    sequelize,
    tableName: 'excess_stock',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['material_id'] },
      { fields: ['status'] },
      { fields: ['location'] }
    ]
  }
);

export default ExcessStock;
