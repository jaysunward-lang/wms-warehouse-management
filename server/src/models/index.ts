import sequelize from '../config/database';
import User from './user.model';
import Material from './material.model';
import MaterialStock from './material-stock.model';
import ExcessStock from './excess-stock.model';
import InboundRecord from './inbound-record.model';
import OutboundRecord from './outbound-record.model';
import ShelfRecord from './shelf-record.model';
import OperationLog from './operation-log.model';

// 定义模型关联关系

// Material - MaterialStock (1:N)
Material.hasMany(MaterialStock, { foreignKey: 'materialId', as: 'stocks' });
MaterialStock.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

// Material - ExcessStock (1:N)
Material.hasMany(ExcessStock, { foreignKey: 'materialId', as: 'excessStocks' });
ExcessStock.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

// Material - InboundRecord (1:N)
Material.hasMany(InboundRecord, { foreignKey: 'materialId', as: 'inboundRecords' });
InboundRecord.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

// Material - OutboundRecord (1:N)
Material.hasMany(OutboundRecord, { foreignKey: 'materialId', as: 'outboundRecords' });
OutboundRecord.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

// Material - ShelfRecord (1:N)
Material.hasMany(ShelfRecord, { foreignKey: 'materialId', as: 'shelfRecords' });
ShelfRecord.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

// User - InboundRecord (1:N)
User.hasMany(InboundRecord, { foreignKey: 'operatorId', as: 'inboundOperations' });
InboundRecord.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

// User - OutboundRecord (1:N)
User.hasMany(OutboundRecord, { foreignKey: 'operatorId', as: 'outboundOperations' });
OutboundRecord.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

// User - ShelfRecord (1:N)
User.hasMany(ShelfRecord, { foreignKey: 'operatorId', as: 'shelfOperations' });
ShelfRecord.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

// User - OperationLog (1:N)
User.hasMany(OperationLog, { foreignKey: 'userId', as: 'operationLogs' });
OperationLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  sequelize,
  User,
  Material,
  MaterialStock,
  ExcessStock,
  InboundRecord,
  OutboundRecord,
  ShelfRecord,
  OperationLog
};

export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('数据库同步完成');
  } catch (error) {
    console.error('数据库同步失败:', error);
    throw error;
  }
};
