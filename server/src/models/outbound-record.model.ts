import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

type OutboundType = 'sale' | 'use' | 'transfer' | 'scrap' | 'excess' | 'other';

interface OutboundRecordAttributes {
  outboundId: number;
  recordNo: string;
  materialId: number;
  type: OutboundType;
  quantity: number;
  batchNo?: string;
  destination?: string;
  location?: string;
  operatorId: number;
  operatorName: string;
  reason?: string;
  remark?: string;
  documentUrl?: string;
  createdAt?: Date;
}

interface OutboundRecordCreationAttributes extends Optional<OutboundRecordAttributes, 'outboundId' | 'createdAt'> {}

class OutboundRecord extends Model<OutboundRecordAttributes, OutboundRecordCreationAttributes> implements OutboundRecordAttributes {
  public outboundId!: number;
  public recordNo!: string;
  public materialId!: number;
  public type!: OutboundType;
  public quantity!: number;
  public batchNo?: string;
  public destination?: string;
  public location?: string;
  public operatorId!: number;
  public operatorName!: string;
  public reason?: string;
  public remark?: string;
  public documentUrl?: string;
  public readonly createdAt!: Date;
}

OutboundRecord.init(
  {
    outboundId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'outbound_id'
    },
    recordNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'record_no',
      comment: '出库单号'
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
    type: {
      type: DataTypes.ENUM('sale', 'use', 'transfer', 'scrap', 'excess', 'other'),
      defaultValue: 'use',
      field: 'type',
      comment: '出库类型: sale销售 use领用 transfer调拨 scrap报废 excess多余清理 other其他'
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: false,
      field: 'quantity',
      comment: '出库数量'
    },
    batchNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'batch_no',
      comment: '批次号'
    },
    destination: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'destination',
      comment: '去向/用途'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'location',
      comment: '出库位置'
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
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'reason',
      comment: '出库原因'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'remark',
      comment: '备注'
    },
    documentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'document_url',
      comment: '附件URL'
    }
  },
  {
    sequelize,
    tableName: 'outbound_records',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['record_no'] },
      { fields: ['material_id'] },
      { fields: ['type'] },
      { fields: ['created_at'] },
      { fields: ['operator_id'] }
    ]
  }
);

export default OutboundRecord;
