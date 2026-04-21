import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

type ShelfAction = 'up' | 'down' | 'transfer' | 'adjust';
type RelatedType = 'inbound' | 'outbound' | 'adjust';

interface ShelfRecordAttributes {
  recordId: number;
  recordNo: string;
  materialId: number;
  action: ShelfAction;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  operatorId: number;
  operatorName: string;
  relatedType?: RelatedType;
  relatedId?: number;
  reason?: string;
  remark?: string;
  createdAt?: Date;
}

interface ShelfRecordCreationAttributes extends Optional<ShelfRecordAttributes, 'recordId' | 'createdAt'> {}

class ShelfRecord extends Model<ShelfRecordAttributes, ShelfRecordCreationAttributes> implements ShelfRecordAttributes {
  public recordId!: number;
  public recordNo!: string;
  public materialId!: number;
  public action!: ShelfAction;
  public quantity!: number;
  public fromLocation?: string;
  public toLocation?: string;
  public operatorId!: number;
  public operatorName!: string;
  public relatedType?: RelatedType;
  public relatedId?: number;
  public reason?: string;
  public remark?: string;
  public readonly createdAt!: Date;
}

ShelfRecord.init(
  {
    recordId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'record_id'
    },
    recordNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'record_no',
      comment: '记录单号'
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
    action: {
      type: DataTypes.ENUM('up', 'down', 'transfer', 'adjust'),
      allowNull: false,
      field: 'action',
      comment: '操作: up上架 down下架 transfer移库 adjust盘点调整'
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: false,
      field: 'quantity',
      comment: '数量'
    },
    fromLocation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'from_location',
      comment: '原位置'
    },
    toLocation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'to_location',
      comment: '目标位置'
    },
    operatorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'operator_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    operatorName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'operator_name',
      comment: '操作员名字'
    },
    relatedType: {
      type: DataTypes.ENUM('inbound', 'outbound', 'adjust'),
      allowNull: true,
      field: 'related_type',
      comment: '关联类型'
    },
    relatedId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'related_id',
      comment: '关联记录ID'
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'reason',
      comment: '操作原因'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'remark',
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'shelf_records',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['record_no'] },
      { fields: ['material_id'] },
      { fields: ['action'] },
      { fields: ['created_at'] },
      { fields: ['operator_id'] },
      { fields: ['related_type', 'related_id'] }
    ]
  }
);

export default ShelfRecord;
