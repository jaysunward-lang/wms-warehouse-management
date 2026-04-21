import sequelize from '../src/config/database';
import { syncDatabase } from '../src/models';
import { User, Material, MaterialStock } from '../src/models';
import bcrypt from 'bcryptjs';

async function initDatabase() {
  try {
    console.log('同步数据库...');
    await syncDatabase(true);
    
    console.log('创建默认用户...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      realName: '系统管理员',
      status: 1
    });
    
    console.log('创建示例物料...');
    const materials = await Material.bulkCreate([
      { materialCode: 'MAT001', materialName: '螺丝钉 M4x20', category: '原材料', spec: 'M4x20 不锈钢', unit: '个', barcode: '6901234567890' },
      { materialCode: 'MAT002', materialName: '螺母 M4', category: '原材料', spec: 'M4 不锈钢', unit: '个', barcode: '6901234567891' },
      { materialCode: 'MAT003', materialName: '垫片 M4', category: '原材料', spec: 'M4 不锈钢', unit: '个', barcode: '6901234567892' },
      { materialCode: 'MAT004', materialName: '电机 220V', category: '半成品', spec: '220V 50W', unit: '台', barcode: '6901234567893' },
      { materialCode: 'MAT005', materialName: '控制器主板', category: '成品', spec: 'V2.0', unit: '块', barcode: '6901234567894' }
    ]);
    
    console.log('创建示例库存...');
    await MaterialStock.bulkCreate([
      { materialId: 1, quantity: 5000, location: 'A-01-01', warehouseZone: 'A区', shelfNo: '01', minStock: 1000, maxStock: 10000 },
      { materialId: 2, quantity: 3000, location: 'A-01-02', warehouseZone: 'A区', shelfNo: '01', minStock: 500, maxStock: 5000 },
      { materialId: 3, quantity: 2000, location: 'A-01-03', warehouseZone: 'A区', shelfNo: '01', minStock: 300, maxStock: 3000 },
      { materialId: 4, quantity: 50, location: 'B-02-01', warehouseZone: 'B区', shelfNo: '02', minStock: 10, maxStock: 100 },
      { materialId: 5, quantity: 30, location: 'B-02-02', warehouseZone: 'B区', shelfNo: '02', minStock: 5, maxStock: 50 }
    ]);
    
    console.log('数据库初始化完成！');
    console.log('默认账号: admin / admin123');
    
    await sequelize.close();
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
