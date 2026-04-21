import { Op, Sequelize } from 'sequelize';
import dayjs from 'dayjs';
import {
  Material,
  MaterialStock,
  ExcessStock,
  InboundRecord,
  OutboundRecord,
  ShelfRecord
} from '../models';
import logger from '../utils/logger';

export class DashboardService {
  // 获取统计数据
  async getStats() {
    const today = dayjs().startOf('day').toDate();
    const yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();

    // 物料总数
    const materialCount = await Material.count({ where: { status: 1 } });

    // 库存总量
    const stockResult = await MaterialStock.sum('quantity');
    const totalStock = stockResult ? parseFloat(stockResult.toString()) : 0;

    // 多余库存总量
    const excessResult = await ExcessStock.sum('quantity', {
      where: { status: 'stored' }
    });
    const totalExcess = excessResult ? parseFloat(excessResult.toString()) : 0;

    // 今日入库数量
    const todayInbound = await InboundRecord.sum('quantity', {
      where: {
        createdAt: { [Op.gte]: today }
      }
    });

    // 今日出库数量
    const todayOutbound = await OutboundRecord.sum('quantity', {
      where: {
        createdAt: { [Op.gte]: today }
      }
    });

    // 昨日入库数量
    const yesterdayInbound = await InboundRecord.sum('quantity', {
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      }
    });

    // 昨日出库数量
    const yesterdayOutbound = await OutboundRecord.sum('quantity', {
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      }
    });

    // 低库存数量
    const lowStockCount = await MaterialStock.count({
      where: Sequelize.literal('quantity < min_stock')
    });

    return {
      materialCount,
      totalStock,
      totalExcess,
      todayInbound: todayInbound ? parseFloat(todayInbound.toString()) : 0,
      todayOutbound: todayOutbound ? parseFloat(todayOutbound.toString()) : 0,
      yesterdayInbound: yesterdayInbound ? parseFloat(yesterdayInbound.toString()) : 0,
      yesterdayOutbound: yesterdayOutbound ? parseFloat(yesterdayOutbound.toString()) : 0,
      lowStockCount
    };
  }

  // 获取图表数据
  async getCharts() {
    // 最近7天的入库出库趋势
    const days = 7;
    const trendData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const startOfDay = date.startOf('day').toDate();
      const endOfDay = date.endOf('day').toDate();

      const inboundSum = await InboundRecord.sum('quantity', {
        where: {
          createdAt: { [Op.between]: [startOfDay, endOfDay] }
        }
      });

      const outboundSum = await OutboundRecord.sum('quantity', {
        where: {
          createdAt: { [Op.between]: [startOfDay, endOfDay] }
        }
      });

      trendData.push({
        date: date.format('MM-DD'),
        inbound: inboundSum ? parseFloat(inboundSum.toString()) : 0,
        outbound: outboundSum ? parseFloat(outboundSum.toString()) : 0
      });
    }

    // 物料类别分布
    const categoryData = await Material.findAll({
      attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('material_id')), 'count']],
      where: { status: 1 },
      group: ['category'],
      raw: true
    });

    // 库存分布（按仓库区域）
    const zoneData = await MaterialStock.findAll({
      attributes: [
        'warehouseZone',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total']
      ],
      where: { warehouseZone: { [Op.ne]: null } },
      group: ['warehouseZone'],
      raw: true
    });

    return {
      trend: trendData,
      category: categoryData.map((c: any) => ({
        name: c.category || '未分类',
        value: parseInt(c.count)
      })),
      zone: zoneData.map((z: any) => ({
        name: z.warehouseZone,
        value: z.total ? parseFloat(z.total.toString()) : 0
      }))
    };
  }

  // 获取库存预警
  async getAlerts() {
    const lowStockItems = await MaterialStock.findAll({
      where: Sequelize.literal('quantity < min_stock'),
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['materialCode', 'materialName', 'unit']
        }
      ],
      limit: 10
    });

    return lowStockItems.map(item => ({
      materialId: item.materialId,
      materialCode: item.material?.materialCode,
      materialName: item.material?.materialName,
      unit: item.material?.unit,
      currentQuantity: parseFloat(item.quantity.toString()),
      minStock: parseFloat(item.minStock.toString()),
      location: item.location,
      warehouseZone: item.warehouseZone
    }));
  }

  // 获取最近活动
  async getActivities(limit = 10) {
    // 获取最近的入库记录
    const recentInbound = await InboundRecord.findAll({
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['materialCode', 'materialName', 'unit']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit / 2
    });

    // 获取最近的出库记录
    const recentOutbound = await OutboundRecord.findAll({
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['materialCode', 'materialName', 'unit']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit / 2
    });

    // 合并并排序
    const activities = [
      ...recentInbound.map(record => ({
        id: `IN-${record.inboundId}`,
        type: 'inbound',
        recordNo: record.recordNo,
        materialCode: record.material?.materialCode,
        materialName: record.material?.materialName,
        unit: record.material?.unit,
        quantity: parseFloat(record.quantity.toString()),
        operatorName: record.operatorName,
        timestamp: record.createdAt
      })),
      ...recentOutbound.map(record => ({
        id: `OUT-${record.outboundId}`,
        type: 'outbound',
        recordNo: record.recordNo,
        materialCode: record.material?.materialCode,
        materialName: record.material?.materialName,
        unit: record.material?.unit,
        quantity: parseFloat(record.quantity.toString()),
        operatorName: record.operatorName,
        timestamp: record.createdAt
      }))
    ];

    // 按时间排序
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, limit);
  }
}

export default new DashboardService();
