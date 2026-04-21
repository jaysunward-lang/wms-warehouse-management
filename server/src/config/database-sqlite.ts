import { Sequelize } from 'sequelize';
import logger from '../utils/logger';
import path from 'path';

// 使用SQLite（无需安装MySQL）
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../wms.db'),
  logging: (msg) => logger.debug(msg),
  define: {
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
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
