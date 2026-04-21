import dayjs from 'dayjs';
import { OutboundRecord, Material, MaterialStock, ExcessStock, ShelfRecord } from '../models';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import websocketService from './websocket.service';

export interface OutboundQuery {
  materialId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface MaterialOutboundData {
  materialId: number;
  quantity: number;
  location: string;
  batchNo?: string;
  destination?: string;
  type?: 'sale' | 'use' | 'transfer' | 'scrap' | 'other';
  reason?: string;
  remark?: string;
}

export interface ExcessOutboundData {
  excessId: number;
  quantity: number;
  destination?: string;
  reason?: string;
  remark?: string;
}

export class OutboundService {
  // 生成出库单号
  private generateRecordNo(): string {
    const date = dayjs().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `OUT${date}${random}`;
  }

  // 生成上下架记录单号
  private generateShelfRecordNo(): string {
    const date = dayjs().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SH${date}${random}`;
  }

  // 获取出库记录列表
  async getOutboundList(query: OutboundQuery, operatorId?: number) {
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

    const { count, rows } = await OutboundRecord.findAndCountAll({
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
      outboundId: record.outboundId,
      recordNo: record.recordNo,
      materialId: record.materialId,
      materialCode: record.material?.materialCode,
      materialName: record.material?.materialName,
      unit: record.material?.unit,
      type: record.type,
      quantity: parseFloat(record.quantity.toString()),
      batchNo: record.batchNo,
      destination: record.destination,
      location: record.location,
      operatorId: record.operatorId,
      operatorName: record.operatorName,
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

  // 获取出库记录详情
  async getOutboundDetail(outboundId: number) {
    const record = await OutboundRecord.findByPk(outboundId, {
      include: [
        {
          model: Material,
          as: 'material'
        }
      ]
    });

    if (!record) {
      throw new AppError('出库记录不存在', 404, 404);
    }

    return {
      outboundId: record.outboundId,
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
      destination: record.destination,
      location: record.location,
      operatorId: record.operatorId,
      operatorName: record.operatorName,
      reason: record.reason,
      remark: record.remark,
      documentUrl: record.documentUrl,
      createdAt: record.createdAt
    };
  }

  // 物料出库
  async materialOutbound(data: MaterialOutboundData, operator: { userId: number; realName: string }) {
    const { materialId, quantity, location, batchNo, destination, type = 'use', reason, remark } = data;

    // 检查物料是否存在
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new AppError('物料不存在', 404, 404);
    }

    // 检查库存是否充足
    const stock = await MaterialStock.findOne({
      where: { materialId, location }
    });

    if (!stock) {
      throw new AppError('该位置无此物料库存', 400, 400);
    }

    const currentQuantity = parseFloat(stock.quantity.toString());
    if (currentQuantity < quantity) {
      throw new AppError(`库存不足，当前库存: ${currentQuantity}`, 400, 400);
    }

    // 生成出库单号
    const recordNo = this.generateRecordNo();

    // 创建出库记录
    const outboundRecord = await OutboundRecord.create({
      recordNo,
      materialId,
      type,
      quantity,
      batchNo,
      destination,
      location,
      operatorId: operator.userId,
      operatorName: operator.realName,
      reason,
      remark
    });

    // 更新库存
    const newQuantity = currentQuantity - quantity;
    await stock.update({
      quantity: newQuantity,
      updatedAt: new Date()
    });

    // 创建下架记录
    await ShelfRecord.create({
      recordNo: this.generateShelfRecordNo(),
      materialId,
      action: 'down',
      quantity,
      fromLocation: location,
      operatorId: operator.userId,
      operatorName: operator.realName,
      relatedType: 'outbound',
      relatedId: outboundRecord.outboundId,
      remark: `出库下架: ${recordNo}`
    });

    // WebSocket推送更新
    websocketService.broadcastInventoryUpdate({
      materialId,
      quantity: newQuantity,
      location,
      type: 'outbound',
      recordNo,
      operatorName: operator.realName,
      timestamp: new Date()
    });

    logger.info(`物料出库成功: ${recordNo}, 物料: ${material.materialCode}, 数量: ${quantity}`);

    return {
      outboundId: outboundRecord.outboundId,
      recordNo: outboundRecord.recordNo,
      materialId,
      quantity,
      location,
      remainingQuantity: newQuantity,
      operatorName: operator.realName,
      createdAt: outboundRecord.createdAt
    };
  }

  // 多余库存出库
  async excessOutbound(data: ExcessOutboundData, operator: { userId: number; realName: string }) {
    const { excessId, quantity, destination, reason, remark } = data;

    // 检查多余库存是否存在
    const excess = await ExcessStock.findByPk(excessId, {
      include: [{ model: Material, as: 'material' }]
    });

    if (!excess) {
      throw new AppError('多余库存不存在', 404, 404);
    }

    if (excess.status !== 'stored') {
      throw new AppError('该多余库存未入库，无法出库', 400, 400);
    }

    const currentQuantity = parseFloat(excess.quantity.toString());
    if (currentQuantity < quantity) {
      throw new AppError(`多余库存不足，当前数量: ${currentQuantity}`, 400, 400);
    }

    const materialId = excess.materialId;
    const location = excess.location || '';

    // 生成出库单号
    const recordNo = this.generateRecordNo();

    // 创建出库记录
    const outboundRecord = await OutboundRecord.create({
      recordNo,
      materialId,
      type: 'excess',
      quantity,
      destination,
      location,
      operatorId: operator.userId,
      operatorName: operator.realName,
      reason,
      remark: `多余库存出库: ${remark || ''}`
    });

    // 更新多余库存
    const newQuantity = currentQuantity - quantity;
    if (newQuantity <= 0) {
      await excess.update({
        quantity: 0,
        status: 'cleared'
      });
    } else {
      await excess.update({
        quantity: newQuantity
      });
    }

    // 创建下架记录
    await ShelfRecord.create({
      recordNo: this.generateShelfRecordNo(),
      materialId,
      action: 'down',
      quantity,
      fromLocation: location,
      operatorId: operator.userId,
      operatorName: operator.realName,
      relatedType: 'outbound',
      relatedId: outboundRecord.outboundId,
      remark: `多余库存下架: ${recordNo}`
    });

    // WebSocket推送更新
    websocketService.broadcastInventoryUpdate({
      materialId,
      excessId,
      quantity: newQuantity,
      location,
      type: 'excess_outbound',
      recordNo,
      operatorName: operator.realName,
      timestamp: new Date()
    });

    logger.info(`多余库存出库成功: ${recordNo}, 物料: ${excess.material?.materialCode}`);

    return {
      outboundId: outboundRecord.outboundId,
      recordNo: outboundRecord.recordNo,
      excessId,
      materialId,
      quantity,
      location,
      remainingQuantity: newQuantity,
      operatorName: operator.realName,
      createdAt: outboundRecord.createdAt
    };
  }

  // 删除出库记录
  async deleteOutbound(outboundId: number) {
    const record = await OutboundRecord.findByPk(outboundId);
    if (!record) {
      throw new AppError('出库记录不存在', 404, 404);
    }

    // 回滚库存
    const stock = await MaterialStock.findOne({
      where: { materialId: record.materialId, location: record.location }
    });

    if (stock) {
      const newQuantity = parseFloat(stock.quantity.toString()) + parseFloat(record.quantity.toString());
      await stock.update({ quantity: newQuantity });
    }

    // 删除关联的上下架记录
    await ShelfRecord.destroy({
      where: {
        relatedType: 'outbound',
        relatedId: outboundId
      }
    });

    await record.destroy();

    logger.info(`删除出库记录成功: ${outboundId}`);

    return { message: '删除成功' };
  }
}

export default new OutboundService();
