import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import logger from '../utils/logger';

interface InventoryUpdateData {
  materialId: number;
  excessId?: number;
  quantity: number;
  location?: string;
  type: string;
  recordNo?: string;
  operatorName: string;
  timestamp: Date;
}

interface ShelfChangeData {
  materialId: number;
  action: string;
  quantity: number;
  oldQuantity?: number;
  location?: string;
  fromLocation?: string;
  toLocation?: string;
  operatorName: string;
  timestamp: Date;
}

interface TransactionData {
  type: 'inbound' | 'outbound';
  recordNo: string;
  materialId: number;
  materialName?: string;
  quantity: number;
  operatorName: string;
  timestamp: Date;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedClients: Map<string, Socket> = new Map();

  // 初始化WebSocket服务器
  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    logger.info('WebSocket服务器已初始化');
  }

  // 设置事件处理器
  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      logger.info(`客户端连接: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      // 认证事件
      socket.on('auth:login', (data: { token: string }) => {
        // 这里可以验证token并将socket加入用户房间
        socket.join('authenticated');
        socket.emit('auth:success', { message: '认证成功' });
      });

      // 加入库存房间
      socket.on('inventory:subscribe', (data: { materialId?: number }) => {
        if (data.materialId) {
          socket.join(`inventory:${data.materialId}`);
        } else {
          socket.join('inventory:all');
        }
        socket.emit('inventory:subscribed', { materialId: data.materialId });
      });

      // 取消订阅库存
      socket.on('inventory:unsubscribe', (data: { materialId?: number }) => {
        if (data.materialId) {
          socket.leave(`inventory:${data.materialId}`);
        } else {
          socket.leave('inventory:all');
        }
        socket.emit('inventory:unsubscribed', { materialId: data.materialId });
      });

      // 加入仪表板房间
      socket.on('dashboard:subscribe', () => {
        socket.join('dashboard');
        socket.emit('dashboard:subscribed');
      });

      // 断开连接
      socket.on('disconnect', () => {
        logger.info(`客户端断开连接: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  // 广播库存更新
  broadcastInventoryUpdate(data: InventoryUpdateData) {
    if (!this.io) return;

    // 广播到所有订阅该物料的客户端
    this.io.to(`inventory:${data.materialId}`).emit('inventory:updated', data);
    this.io.to('inventory:all').emit('inventory:updated', data);

    // 广播到仪表板
    this.io.to('dashboard').emit('inventory:updated', data);

    logger.debug(`广播库存更新: 物料${data.materialId}, 数量${data.quantity}`);
  }

  // 广播上下架变更
  broadcastShelfChange(data: ShelfChangeData) {
    if (!this.io) return;

    this.io.to('inventory:all').emit('shelf:changed', data);
    this.io.to(`inventory:${data.materialId}`).emit('shelf:changed', data);
    this.io.to('dashboard').emit('shelf:changed', data);

    logger.debug(`广播上下架变更: 物料${data.materialId}, 动作${data.action}`);
  }

  // 广播新交易记录
  broadcastTransaction(data: TransactionData) {
    if (!this.io) return;

    this.io.to('inventory:all').emit('transaction:new', data);
    this.io.to(`inventory:${data.materialId}`).emit('transaction:new', data);
    this.io.to('dashboard').emit('transaction:new', data);

    logger.debug(`广播交易记录: ${data.type}, 单号${data.recordNo}`);
  }

  // 广播系统通知
  broadcastNotification(data: { type: string; message: string; data?: any }) {
    if (!this.io) return;

    this.io.emit('system:notification', data);
    logger.debug(`广播系统通知: ${data.type}`);
  }

  // 发送给特定用户
  sendToUser(userId: number, event: string, data: any) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit(event, data);
  }

  // 获取连接数
  getConnectionCount(): number {
    return this.connectedClients.size;
  }
}

export default new WebSocketService();
