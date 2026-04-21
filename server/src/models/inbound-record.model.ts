import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

type InboundType = 'purchase' | 'return' | 'transfer' | 'excess' | 'other';

interface InboundRecordAttributes {
  inboundId: number;
  recordNo: string;
  materialId: number;
  type: InboundType;
  quantity: number;
  batchNo?: string;
  source?: string;
  location?: string;
  operatorId: number;
  operatorName: string;
  remark?: string;
  documentUrl?: string;
  createdAt?: Date;
}

interface InboundRecordCreationAttributes extends Optional<InboundRecordAttributes, 'inboundId' | 'createdAt'> {}

class InboundRecord extends Model<InboundRecordAttributes, InboundRecordCreationAttributes> implements InboundRecordAttributes {
  public inboundId!: number;
  public recordNo!: string;
  public materialId!: number;
  public type!: InboundType;
  public quantity!: number;
  public batchNo?: string;
  public source?: string;
  public location?: string;
  public operatorId!: number;
  public operatorName!: string;
  public remark?: string;
  public documentUrl?: string;
  public readonly createdAt!: Date;
}

InboundRecord.init(
  {
    inboundId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'inbound_id'
    },
    recordNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'record_no',
      comment: '入库单号'
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
      type: DataTypes.ENUM('purchase', 'return', 'transfer', 'excess', 'other'),
      defaultValue: 'purchase',
      field: 'type',
      comment: '入库类型: purchase采购 return退货 transfer调拨 excess多余库存 other其他'
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: false,
      field: 'quantity',
      comment: '入库数量'
    },
    batchNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'batch_no',
      comment: '批次号'
    },
    source: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'source',
      comment: '来源/供应商'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'location',
      comment: '入库位置'
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
    tableName: 'inbound_records',
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

export default InboundRecord;
