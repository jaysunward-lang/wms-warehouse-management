import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MaterialAttributes {
  materialId: number;
  materialCode: string;
  materialName: string;
  category?: string;
  spec?: string;
  unit: string;
  barcode?: string;
  description?: string;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MaterialCreationAttributes extends Optional<MaterialAttributes, 'materialId' | 'unit' | 'status' | 'createdAt' | 'updatedAt'> {}

class Material extends Model<MaterialAttributes, MaterialCreationAttributes> implements MaterialAttributes {
  public materialId!: number;
  public materialCode!: string;
  public materialName!: string;
  public category?: string;
  public spec?: string;
  public unit!: string;
  public barcode?: string;
  public description?: string;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Material.init(
  {
    materialId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'material_id'
    },
    materialCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'material_code',
      comment: '物料编码'
    },
    materialName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'material_name',
      comment: '物料名称'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'category',
      comment: '物料类别'
    },
    spec: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'spec',
      comment: '规格型号'
    },
    unit: {
      type: DataTypes.STRING(20),
      defaultValue: '件',
      field: 'unit',
      comment: '计量单位'
    },
    barcode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'barcode',
      comment: '条形码'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
      comment: '物料描述'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      field: 'status',
      comment: '状态: 1启用 0禁用'
    }
  },
  {
    sequelize,
    tableName: 'materials',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['material_code'] },
      { fields: ['category'] },
      { fields: ['barcode'] },
      { fields: ['status'] }
    ]
  }
);

export default Material;
