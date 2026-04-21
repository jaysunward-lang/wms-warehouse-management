import { Op } from 'sequelize';
import { Material, MaterialStock, ExcessStock } from '../models';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

export interface MaterialQuery {
  keyword?: string;
  category?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateMaterialData {
  materialCode: string;
  materialName: string;
  category?: string;
  spec?: string;
  unit?: string;
  barcode?: string;
  description?: string;
}

export interface UpdateStockData {
  materialId: number;
  quantity?: number;
  location?: string;
  warehouseZone?: string;
  shelfNo?: string;
  minStock?: number;
  maxStock?: number;
}

export class InventoryService {
  // 获取物料库存列表
  async getMaterialStockList(query: MaterialQuery) {
    const { keyword, category, location, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (category) {
      where.category = category;
    }

    const stockWhere: any = {};
    if (location) {
      stockWhere.location = location;
    }

    const materialWhere: any = { ...where };
    if (keyword) {
      materialWhere[Op.or] = [
        { materialCode: { [Op.like]: `%${keyword}%` } },
        { materialName: { [Op.like]: `%${keyword}%` } },
        { barcode: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Material.findAndCountAll({
      where: materialWhere,
      include: [
        {
          model: MaterialStock,
          as: 'stocks',
          where: stockWhere,
          required: false
        }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['materialId', 'DESC']]
    });

    // 格式化返回数据
    const list = rows.map(material => {
      const stocks = material.stocks || [];
      const totalQuantity = stocks.reduce((sum, stock) => sum + parseFloat(stock.quantity.toString()), 0);
      const locations = stocks.map(s => s.location).filter(Boolean);

      return {
        materialId: material.materialId,
        materialCode: material.materialCode,
        materialName: material.materialName,
        category: material.category,
        spec: material.spec,
        unit: material.unit,
        barcode: material.barcode,
        status: material.status,
        totalQuantity,
        locations: locations.length > 0 ? locations : ['未分配'],
        stocks: stocks.map(s => ({
          stockId: s.stockId,
          quantity: parseFloat(s.quantity.toString()),
          location: s.location,
          warehouseZone: s.warehouseZone,
          shelfNo: s.shelfNo,
          minStock: parseFloat(s.minStock.toString()),
          maxStock: parseFloat(s.maxStock.toString())
        }))
      };
    });

    return {
      list,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  // 获取物料详情
  async getMaterialDetail(materialId: number) {
    const material = await Material.findByPk(materialId, {
      include: [
        {
          model: MaterialStock,
          as: 'stocks'
        }
      ]
    });

    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    const stocks = material.stocks || [];
    const totalQuantity = stocks.reduce((sum, stock) => sum + parseFloat(stock.quantity.toString()), 0);

    return {
      materialId: material.materialId,
      materialCode: material.materialCode,
      materialName: material.materialName,
      category: material.category,
      spec: material.spec,
      unit: material.unit,
      barcode: material.barcode,
      description: material.description,
      status: material.status,
      totalQuantity,
      stocks: stocks.map(s => ({
        stockId: s.stockId,
        quantity: parseFloat(s.quantity.toString()),
        location: s.location,
        warehouseZone: s.warehouseZone,
        shelfNo: s.shelfNo,
        minStock: parseFloat(s.minStock.toString()),
        maxStock: parseFloat(s.maxStock.toString()),
        lockedQuantity: parseFloat(s.lockedQuantity.toString())
      })),
      createdAt: material.createdAt,
      updatedAt: material.updatedAt
    };
  }

  // 创建物料
  async createMaterial(data: CreateMaterialData) {
    // 检查物料编码是否已存在
    const existingMaterial = await Material.findOne({
      where: { materialCode: data.materialCode }
    });

    if (existingMaterial) {
      throw new AppError('物料编码已存在', 400, 400);
    }

    const material = await Material.create({
      ...data,
      unit: data.unit || '件',
      status: 1
    });

    logger.info(`创建物料成功: ${data.materialCode}`);

    return {
      materialId: material.materialId,
      materialCode: material.materialCode,
      materialName: material.materialName
    };
  }

  // 更新物料
  async updateMaterial(materialId: number, data: Partial<CreateMaterialData>) {
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    // 如果修改物料编码，检查是否已存在
    if (data.materialCode && data.materialCode !== material.materialCode) {
      const existingMaterial = await Material.findOne({
        where: { materialCode: data.materialCode }
      });
      if (existingMaterial) {
        throw new AppError('物料编码已存在', 400, 400);
      }
    }

    await material.update(data);

    logger.info(`更新物料成功: ${materialId}`);

    return {
      materialId: material.materialId,
      materialCode: material.materialCode,
      materialName: material.materialName
    };
  }

  // 删除物料
  async deleteMaterial(materialId: number) {
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    await material.update({ status: 0 });

    logger.info(`删除物料成功: ${materialId}`);

    return { message: '删除成功' };
  }

  // 获取多余库存列表
  async getExcessStockList(query: MaterialQuery) {
    const { keyword, location, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (location) {
      where.location = location;
    }

    const { count, rows } = await ExcessStock.findAndCountAll({
      where,
      include: [
        {
          model: Material,
          as: 'material',
          where: keyword ? {
            [Op.or]: [
              { materialCode: { [Op.like]: `%${keyword}%` } },
              { materialName: { [Op.like]: `%${keyword}%` } }
            ]
          } : undefined,
          required: true
        }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    const list = rows.map(excess => ({
      excessId: excess.excessId,
      materialId: excess.materialId,
      materialCode: excess.material?.materialCode,
      materialName: excess.material?.materialName,
      category: excess.material?.category,
      spec: excess.material?.spec,
      unit: excess.material?.unit,
      quantity: parseFloat(excess.quantity.toString()),
      location: excess.location,
      reason: excess.reason,
      status: excess.status,
      createdAt: excess.createdAt,
      updatedAt: excess.updatedAt
    }));

    return {
      list,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  // 获取多余库存详情
  async getExcessStockDetail(excessId: number) {
    const excess = await ExcessStock.findByPk(excessId, {
      include: [
        {
          model: Material,
          as: 'material'
        }
      ]
    });

    if (!excess) {
      throw new AppError('多余库存不存在', 404, 404);
    }

    return {
      excessId: excess.excessId,
      materialId: excess.materialId,
      materialCode: excess.material?.materialCode,
      materialName: excess.material?.materialName,
      category: excess.material?.category,
      spec: excess.material?.spec,
      unit: excess.material?.unit,
      quantity: parseFloat(excess.quantity.toString()),
      location: excess.location,
      reason: excess.reason,
      status: excess.status,
      createdAt: excess.createdAt,
      updatedAt: excess.updatedAt
    };
  }

  // 创建多余库存
  async createExcessStock(data: {
    materialId: number;
    quantity: number;
    location?: string;
    reason?: string;
  }) {
    const material = await Material.findByPk(data.materialId);
    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    const excess = await ExcessStock.create({
      ...data,
      status: 'pending'
    });

    logger.info(`创建多余库存成功: ${excess.excessId}`);

    return {
      excessId: excess.excessId,
      materialId: excess.materialId,
      quantity: excess.quantity,
      status: excess.status
    };
  }

  // 更新多余库存
  async updateExcessStock(excessId: number, data: {
    quantity?: number;
    location?: string;
    reason?: string;
    status?: 'pending' | 'stored' | 'cleared';
  }) {
    const excess = await ExcessStock.findByPk(excessId);
    if (!excess) {
      throw new AppError('多余库存不存在', 404, 404);
    }

    await excess.update(data);

    logger.info(`更新多余库存成功: ${excessId}`);

    return {
      excessId: excess.excessId,
      materialId: excess.materialId,
      quantity: excess.quantity,
      status: excess.status
    };
  }

  // 获取低库存预警
  async getLowStockAlerts() {
    const stocks = await MaterialStock.findAll({
      where: {
        quantity: { [Op.lt]: MaterialStock.sequelize!.literal('min_stock') }
      },
      include: [
        {
          model: Material,
          as: 'material'
        }
      ]
    });

    return stocks.map(stock => ({
      stockId: stock.stockId,
      materialId: stock.materialId,
      materialCode: stock.material?.materialCode,
      materialName: stock.material?.materialName,
      currentQuantity: parseFloat(stock.quantity.toString()),
      minStock: parseFloat(stock.minStock.toString()),
      location: stock.location,
      warehouseZone: stock.warehouseZone,
      shelfNo: stock.shelfNo
    }));
  }

  // 搜索库存
  async searchInventory(keyword: string, type: 'material' | 'excess' = 'material') {
    if (type === 'excess') {
      return this.getExcessStockList({ keyword, pageSize: 100 });
    }

    return this.getMaterialStockList({ keyword, pageSize: 100 });
  }
}

export default new InventoryService();
