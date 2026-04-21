import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { InboundRecord, Material, MaterialStock, ExcessStock, ShelfRecord } from '../models';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import websocketService from './websocket.service';

export interface InboundQuery {
  materialId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface MaterialInboundData {
  materialId: number;
  quantity: number;
  location: string;
  warehouseZone?: string;
  shelfNo?: string;
  batchNo?: string;
  source?: string;
  type?: 'purchase' | 'return' | 'transfer' | 'other';
  remark?: string;
}

export interface ExcessInboundData {
  excessId: number;
  location: string;
  warehouseZone?: string;
  shelfNo?: string;
  remark?: string;
}

export class InboundService {
  // 生成入库单号
  private generateRecordNo(): string {
    const date = dayjs().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `IN${date}${random}`;
  }

  // 生成上下架记录单号
  private generateShelfRecordNo(): string {
    const date = dayjs().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SH${date}${random}`;
  }

  // 获取入库记录列表
  async getInboundList(query: InboundQuery, operatorId?: number) {
    const { materialId, type, startDate, endDate, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (materialId) {
      where.materialId = materialId;
    }
    if (type) {
      where.type = type;
    }
    if (startDate && endDate) {
      where.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + ' 23:59:59')
      };
    }

    const { count, rows } = await InboundRecord.findAndCountAll({
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
      inboundId: record.inboundId,
      recordNo: record.recordNo,
      materialId: record.materialId,
      materialCode: record.material?.materialCode,
      materialName: record.material?.materialName,
      unit: record.material?.unit,
      type: record.type,
      quantity: parseFloat(record.quantity.toString()),
      batchNo: record.batchNo,
      source: record.source,
      location: record.location,
      operatorId: record.operatorId,
      operatorName: record.operatorName,
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

  // 获取入库记录详情
  async getInboundDetail(inboundId: number) {
    const record = await InboundRecord.findByPk(inboundId, {
      include: [
        {
          model: Material,
          as: 'material'
        }
      ]
    });

    if (!record) {
      throw new AppError('入库记录不存在', 404, 404);
    }

    return {
      inboundId: record.inboundId,
      recordNo: record.recordNo,
      materialId: record.materialId,
      materialCode: record.material?.materialCode,
      materialName: record.material?.materialName,
      category: record.material?.category,
      spec: record.material?.spec,
      unit: record.material?.unit,
      type: record.type,
      quantity: parseFloat(record.quantity.toString()),
      batchNo: record.batchNo,
      source: record.source,
      location: record.location,
      operatorId: record.operatorId,
      operatorName: record.operatorName,
      remark: record.remark,
      documentUrl: record.documentUrl,
      createdAt: record.createdAt
    };
  }

  // 物料入库
  async materialInbound(data: MaterialInboundData, operator: { userId: number; realName: string }) {
    const { materialId, quantity, location, warehouseZone, shelfNo, batchNo, source, type = 'purchase', remark } = data;

    // 检查物料是否存在
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    // 生成入库单号
    const recordNo = this.generateRecordNo();

    // 创建入库记录
    const inboundRecord = await InboundRecord.create({
      recordNo,
      materialId,
      type,
      quantity,
      batchNo,
      source,
      location,
      operatorId: operator.userId,
      operatorName: operator.realName,
      remark
    });

    // 更新或创建库存记录
    let stock = await MaterialStock.findOne({
      where: { materialId, location }
    });

    if (stock) {
      // 更新现有库存
      const newQuantity = parseFloat(stock.quantity.toString()) + quantity;
      await stock.update({
        quantity: newQuantity,
        warehouseZone,
        shelfNo,
        updatedAt: new Date()
      });
    } else {
      // 创建新库存记录
      stock = await MaterialStock.create({
        materialId,
        quantity,
        location,
        warehouseZone,
        shelfNo,
        minStock: 0,
        maxStock: 999999,
        lockedQuantity: 0
      });
    }

    // 创建上架记录
    const shelfRecord = await ShelfRecord.create({
      recordNo: this.generateShelfRecordNo(),
      materialId,
      action: 'up',
      quantity,
      toLocation: location,
      operatorId: operator.userId,
      operatorName: operator.realName,
      relatedType: 'inbound',
      relatedId: inboundRecord.inboundId,
      remark: `入库上架: ${recordNo}`
    });

    // WebSocket推送更新
    websocketService.broadcastInventoryUpdate({
      materialId,
      quantity: stock.quantity,
      location,
      type: 'inbound',
      recordNo,
      operatorName: operator.realName,
      timestamp: new Date()
    });

    logger.info(`物料入库成功: ${recordNo}, 物料: ${material.materialCode}, 数量: ${quantity}`);

    return {
      inboundId: inboundRecord.inboundId,
      recordNo: inboundRecord.recordNo,
      materialId,
      quantity,
      location,
      operatorName: operator.realName,
      createdAt: inboundRecord.createdAt
    };
  }

  // 多余库存入库
  async excessInbound(data: ExcessInboundData, operator: { userId: number; realName: string }) {
    const { excessId, location, warehouseZone, shelfNo, remark } = data;

    // 检查多余库存是否存在
    const excess = await ExcessStock.findByPk(excessId, {
      include: [{ model: Material, as: 'material' }]
    });

    if (!excess) {
      throw new AppError('多余库存不存在', 404, 404);
    }

    if (excess.status !== 'pending') {
      throw new AppError('该多余库存已处理', 400, 400);
    }

    const materialId = excess.materialId;
    const quantity = parseFloat(excess.quantity.toString());

    // 生成入库单号
    const recordNo = this.generateRecordNo();

    // 创建入库记录
    const inboundRecord = await InboundRecord.create({
      recordNo,
      materialId,
      type: 'excess',
      quantity,
      location,
      operatorId: operator.userId,
      operatorName: operator.realName,
      remark: `多余库存入库: ${remark || ''}`
    });

    // 更新或创建库存记录
    let stock = await MaterialStock.findOne({
      where: { materialId, location }
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
        location,
        warehouseZone,
        shelfNo,
        minStock: 0,
        maxStock: 999999,
        lockedQuantity: 0
      });
    }

    // 更新多余库存状态
    await excess.update({
      status: 'stored',
      location
    });

    // 创建上架记录
    await ShelfRecord.create({
      recordNo: this.generateShelfRecordNo(),
      materialId,
      action: 'up',
      quantity,
      toLocation: location,
      operatorId: operator.userId,
      operatorName: operator.realName,
      relatedType: 'inbound',
      relatedId: inboundRecord.inboundId,
      remark: `多余库存上架: ${recordNo}`
    });

    // WebSocket推送更新
    websocketService.broadcastInventoryUpdate({
      materialId,
      quantity: stock.quantity,
      location,
      type: 'excess_inbound',
      recordNo,
      operatorName: operator.realName,
      timestamp: new Date()
    });

    logger.info(`多余库存入库成功: ${recordNo}, 物料: ${excess.material?.materialCode}`);

    return {
      inboundId: inboundRecord.inboundId,
      recordNo: inboundRecord.recordNo,
      excessId,
      materialId,
      quantity,
      location,
      operatorName: operator.realName,
      createdAt: inboundRecord.createdAt
    };
  }

  // 删除入库记录
  async deleteInbound(inboundId: number) {
    const record = await InboundRecord.findByPk(inboundId);
    if (!record) {
      throw new AppError('入库记录不存在', 404, 404);
    }

    // 回滚库存
    const stock = await MaterialStock.findOne({
      where: { materialId: record.materialId, location: record.location }
    });

    if (stock) {
      const newQuantity = parseFloat(stock.quantity.toString()) - parseFloat(record.quantity.toString());
      if (newQuantity < 0) {
        throw new AppError('库存不足，无法删除入库记录', 400, 400);
      }
      await stock.update({ quantity: newQuantity });
    }

    // 删除关联的上下架记录
    await ShelfRecord.destroy({
      where: {
        relatedType: 'inbound',
        relatedId: inboundId
      }
    });

    // 如果是多余库存入库，恢复多余库存状态
    if (record.type === 'excess') {
      // 这里需要根据业务逻辑处理多余库存回滚
    }

    await record.destroy();

    logger.info(`删除入库记录成功: ${inboundId}`);

    return { message: '删除成功' };
  }
}

export default new InboundService();
