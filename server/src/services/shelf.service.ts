import dayjs from 'dayjs';
import { Op } from 'sequelize';
import { ShelfRecord, Material, MaterialStock } from '../models';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import websocketService from './websocket.service';

export interface ShelfQuery {
  materialId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface ShelfUpData {
  materialId: number;
  quantity: number;
  toLocation: string;
  warehouseZone?: string;
  shelfNo?: string;
  relatedType?: 'inbound' | 'adjust';
  relatedId?: number;
  remark?: string;
}

export interface ShelfDownData {
  materialId: number;
  quantity: number;
  fromLocation: string;
  relatedType?: 'outbound' | 'adjust';
  relatedId?: number;
  remark?: string;
}

export interface ShelfTransferData {
  materialId: number;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  warehouseZone?: string;
  shelfNo?: string;
  remark?: string;
}

export interface ShelfAdjustData {
  materialId: number;
  quantity: number;
  location: string;
  reason: string;
  remark?: string;
}

export class ShelfService {
  // 生成上下架记录单号
  private generateRecordNo(): string {
    const date = dayjs().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SH${date}${random}`;
  }

  // 获取上下架记录列表
  async getShelfRecordList(query: ShelfQuery) {
    const { materialId, action, startDate, endDate, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (materialId) {
      where.materialId = materialId;
    }
    if (action) {
      where.action = action;
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate + ' 23:59:59')
      };
    }

    const { count, rows } = await ShelfRecord.findAndCountAll({
      where,
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['materialCode', 'materialName', 'unit']
        }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    const list = rows.map(record => ({
      recordId: record.recordId,
      recordNo: record.recordNo,
      materialId: record.materialId,
      materialCode: record.material?.materialCode,
      materialName: record.material?.materialName,
      unit: record.material?.unit,
      action: record.action,
      quantity: parseFloat(record.quantity.toString()),
      fromLocation: record.fromLocation,
      toLocation: record.toLocation,
      operatorId: record.operatorId,
      operatorName: record.operatorName,
      relatedType: record.relatedType,
      relatedId: record.relatedId,
      reason: record.reason,
      remark: record.remark,
      createdAt: record.createdAt
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

  // 获取上下架记录详情
  async getShelfRecordDetail(recordId: number) {
    const record = await ShelfRecord.findByPk(recordId, {
      include: [
        {
          model: Material,
          as: 'material'
        }
      ]
    });

    if (!record) {
      throw new AppError('上下架记录不存在', 404, 404);
    }

    return {
      recordId: record.recordId,
      recordNo: record.recordNo,
      materialId: record.materialId,
      materialCode: record.material?.materialCode,
      materialName: record.material?.materialName,
      category: record.material?.category,
      spec: record.material?.spec,
      unit: record.material?.unit,
      action: record.action,
      quantity: parseFloat(record.quantity.toString()),
      fromLocation: record.fromLocation,
      toLocation: record.toLocation,
      operatorId: record.operatorId,
      operatorName: record.operatorName,
      relatedType: record.relatedType,
      relatedId: record.relatedId,
      reason: record.reason,
      remark: record.remark,
      createdAt: record.createdAt
    };
  }

  // 上架操作
  async shelfUp(data: ShelfUpData, operator: { userId: number; realName: string }) {
    const { materialId, quantity, toLocation, warehouseZone, shelfNo, relatedType, relatedId, remark } = data;

    // 检查物料是否存在
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    // 更新或创建库存记录
    let stock = await MaterialStock.findOne({
      where: { materialId, location: toLocation }
    });

    if (stock) {
      const newQuantity = parseFloat(stock.quantity.toString()) + quantity;
      await stock.update({
        quantity: newQuantity,
        warehouseZone,
        shelfNo,
        updatedAt: new Date()
      });
    } else {
      stock = await MaterialStock.create({
        materialId,
        quantity,
        location: toLocation,
        warehouseZone,
        shelfNo,
        minStock: 0,
        maxStock: 999999,
        lockedQuantity: 0
      });
    }

    // 创建上架记录
    const shelfRecord = await ShelfRecord.create({
      recordNo: this.generateRecordNo(),
      materialId,
      action: 'up',
      quantity,
      toLocation,
      operatorId: operator.userId,
      operatorName: operator.realName,
      relatedType,
      relatedId,
      remark
    });

    // WebSocket推送
    websocketService.broadcastShelfChange({
      materialId,
      action: 'up',
      quantity,
      location: toLocation,
      operatorName: operator.realName,
      timestamp: new Date()
    });

    logger.info(`上架成功: ${shelfRecord.recordNo}, 物料: ${material.materialCode}, 位置: ${toLocation}`);

    return {
      recordId: shelfRecord.recordId,
      recordNo: shelfRecord.recordNo,
      materialId,
      quantity,
      location: toLocation,
      operatorName: operator.realName,
      createdAt: shelfRecord.createdAt
    };
  }

  // 下架操作
  async shelfDown(data: ShelfDownData, operator: { userId: number; realName: string }) {
    const { materialId, quantity, fromLocation, relatedType, relatedId, remark } = data;

    // 检查物料是否存在
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    // 检查库存
    const stock = await MaterialStock.findOne({
      where: { materialId, location: fromLocation }
    });

    if (!stock) {
      throw new AppError('该位置无此物料库存', 400, 400);
    }

    const currentQuantity = parseFloat(stock.quantity.toString());
    if (currentQuantity < quantity) {
      throw new AppError(`库存不足，当前库存: ${currentQuantity}`, 400, 400);
    }

    // 更新库存
    const newQuantity = currentQuantity - quantity;
    await stock.update({
      quantity: newQuantity,
      updatedAt: new Date()
    });

    // 创建下架记录
    const shelfRecord = await ShelfRecord.create({
      recordNo: this.generateRecordNo(),
      materialId,
      action: 'down',
      quantity,
      fromLocation,
      operatorId: operator.userId,
      operatorName: operator.realName,
      relatedType,
      relatedId,
      remark
    });

    // WebSocket推送
    websocketService.broadcastShelfChange({
      materialId,
      action: 'down',
      quantity,
      location: fromLocation,
      operatorName: operator.realName,
      timestamp: new Date()
    });

    logger.info(`下架成功: ${shelfRecord.recordNo}, 物料: ${material.materialCode}, 位置: ${fromLocation}`);

    return {
      recordId: shelfRecord.recordId,
      recordNo: shelfRecord.recordNo,
      materialId,
      quantity,
      location: fromLocation,
      operatorName: operator.realName,
      createdAt: shelfRecord.createdAt
    };
  }

  // 库位转移
  async shelfTransfer(data: ShelfTransferData, operator: { userId: number; realName: string }) {
    const { materialId, quantity, fromLocation, toLocation, warehouseZone, shelfNo, remark } = data;

    // 检查物料是否存在
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    // 检查源位置库存
    const fromStock = await MaterialStock.findOne({
      where: { materialId, location: fromLocation }
    });

    if (!fromStock) {
      throw new AppError('源位置无此物料库存', 400, 400);
    }

    const currentQuantity = parseFloat(fromStock.quantity.toString());
    if (currentQuantity < quantity) {
      throw new AppError(`源位置库存不足，当前库存: ${currentQuantity}`, 400, 400);
    }

    // 更新源位置库存
    const newFromQuantity = currentQuantity - quantity;
    await fromStock.update({
      quantity: newFromQuantity,
      updatedAt: new Date()
    });

    // 更新或创建目标位置库存
    let toStock = await MaterialStock.findOne({
      where: { materialId, location: toLocation }
    });

    if (toStock) {
      const newToQuantity = parseFloat(toStock.quantity.toString()) + quantity;
      await toStock.update({
        quantity: newToQuantity,
        warehouseZone,
        shelfNo,
        updatedAt: new Date()
      });
    } else {
      toStock = await MaterialStock.create({
        materialId,
        quantity,
        location: toLocation,
        warehouseZone,
        shelfNo,
        minStock: 0,
        maxStock: 999999,
        lockedQuantity: 0
      });
    }

    // 创建转移记录
    const shelfRecord = await ShelfRecord.create({
      recordNo: this.generateRecordNo(),
      materialId,
      action: 'transfer',
      quantity,
      fromLocation,
      toLocation,
      operatorId: operator.userId,
      operatorName: operator.realName,
      remark
    });

    // WebSocket推送
    websocketService.broadcastShelfChange({
      materialId,
      action: 'transfer',
      quantity,
      fromLocation,
      toLocation,
      operatorName: operator.realName,
      timestamp: new Date()
    });

    logger.info(`库位转移成功: ${shelfRecord.recordNo}, 物料: ${material.materialCode}, ${fromLocation} -> ${toLocation}`);

    return {
      recordId: shelfRecord.recordId,
      recordNo: shelfRecord.recordNo,
      materialId,
      quantity,
      fromLocation,
      toLocation,
      operatorName: operator.realName,
      createdAt: shelfRecord.createdAt
    };
  }

  // 盘点调整
  async shelfAdjust(data: ShelfAdjustData, operator: { userId: number; realName: string }) {
    const { materialId, quantity, location, reason, remark } = data;

    // 检查物料是否存在
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    // 更新或创建库存记录
    let stock = await MaterialStock.findOne({
      where: { materialId, location }
    });

    const oldQuantity = stock ? parseFloat(stock.quantity.toString()) : 0;

    if (stock) {
      await stock.update({
        quantity,
        updatedAt: new Date()
      });
    } else {
      stock = await MaterialStock.create({
        materialId,
        quantity,
        location,
        minStock: 0,
        maxStock: 999999,
        lockedQuantity: 0
      });
    }

    // 创建调整记录
    const shelfRecord = await ShelfRecord.create({
      recordNo: this.generateRecordNo(),
      materialId,
      action: 'adjust',
      quantity: Math.abs(quantity - oldQuantity),
      toLocation: location,
      operatorId: operator.userId,
      operatorName: operator.realName,
      relatedType: 'adjust',
      reason,
      remark: `盘点调整: ${oldQuantity} -> ${quantity}, ${remark || ''}`
    });

    // WebSocket推送
    websocketService.broadcastShelfChange({
      materialId,
      action: 'adjust',
      quantity,
      oldQuantity,
      location,
      operatorName: operator.realName,
      timestamp: new Date()
    });

    logger.info(`盘点调整成功: ${shelfRecord.recordNo}, 物料: ${material.materialCode}, 位置: ${location}`);

    return {
      recordId: shelfRecord.recordId,
      recordNo: shelfRecord.recordNo,
      materialId,
      quantity,
      oldQuantity,
      location,
      operatorName: operator.realName,
      createdAt: shelfRecord.createdAt
    };
  }

  // 获取库位信息
  async getLocations() {
    const stocks = await MaterialStock.findAll({
      attributes: ['location', 'warehouseZone', 'shelfNo'],
      group: ['location', 'warehouseZone', 'shelfNo'],
      raw: true
    });

    return stocks.map(s => ({
      location: s.location,
      warehouseZone: s.warehouseZone,
      shelfNo: s.shelfNo
    })).filter(s => s.location);
  }
}

export default new ShelfService();
