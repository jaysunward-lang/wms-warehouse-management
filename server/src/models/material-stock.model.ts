import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MaterialStockAttributes {
  stockId: number;
  materialId: number;
  quantity: number;
  location?: string;
  warehouseZone?: string;
  shelfNo?: string;
  minStock: number;
  maxStock: number;
  lockedQuantity: number;
  updatedAt?: Date;
}

interface MaterialStockCreationAttributes extends Optional<MaterialStockAttributes, 'stockId' | 'quantity' | 'minStock' | 'maxStock' | 'lockedQuantity'> {}

class MaterialStock extends Model<MaterialStockAttributes, MaterialStockCreationAttributes> implements MaterialStockAttributes {
  public stockId!: number;
  public materialId!: number;
  public quantity!: number;
  public location?: string;
  public warehouseZone?: string;
  public shelfNo?: string;
  public minStock!: number;
  public maxStock!: number;
  public lockedQuantity!: number;
  public readonly updatedAt!: Date;
}

MaterialStock.init(
  {
    stockId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'stock_id'
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
      comment: '当前库存数量'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'location',
      comment: '存放位置'
    },
    warehouseZone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'warehouse_zone',
      comment: '仓库区域'
    },
    shelfNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'shelf_no',
      comment: '货架编号'
    },
    minStock: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      field: 'min_stock',
      comment: '最低库存预警'
    },
    maxStock: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 999999,
      field: 'max_stock',
      comment: '最高库存限制'
    },
    lockedQuantity: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      field: 'locked_quantity',
      comment: '锁定数量(待出库)'
    }
  },
  {
    sequelize,
    tableName: 'material_stock',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['material_id'] },
      { fields: ['location'] },
      { fields: ['warehouse_zone'] },
      { fields: ['quantity'] },
      { unique: true, fields: ['material_id', 'location'] }
    ]
  }
);

export default MaterialStock;
