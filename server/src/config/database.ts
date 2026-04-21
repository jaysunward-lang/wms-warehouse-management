import { Sequelize } from 'sequelize';
import logger from '../utils/logger';
import path from 'path';

// 使用SQLite（无需安装MySQL，适合快速启动）
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../wms_new.db'),
  logging: (msg) => logger.debug(msg),
  define: {
    timestamps: true,
    underscored: true
  }
});

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('SQLite数据库连接成功');
    return sequelize;
  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw error;
  }
};

export default sequelize;
